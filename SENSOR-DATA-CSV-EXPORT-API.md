# Sensor Data CSV Export API

## Overview

The frontend needs an API endpoint to export raw `sensor_data` table rows as a CSV file. The frontend calls this endpoint with the same parameters used by the existing `/api/vessels/{vessel_id}/sensor-data` endpoint (date range + engine filter).

## Endpoint

```
GET /api/vessels/{vessel_id}/sensor-data/export
```

### Query Parameters

| Parameter | Type   | Required | Description                                                  |
| --------- | ------ | -------- | ------------------------------------------------------------ |
| `from`    | string | Yes      | ISO 8601 datetime string — start of the date range           |
| `to`      | string | Yes      | ISO 8601 datetime string — end of the date range             |
| `engine`  | string | No       | Engine identifier (e.g. `me1`, `ae1`). Omit for all engines. |

### Response

- **Content-Type**: `text/csv`
- **Content-Disposition**: `attachment; filename="sensor-data-{vessel_id}-{from}-{to}.csv"`
- **Status**: `200 OK`
- **Auth**: Bearer token (same as all other API endpoints)

The response body is a CSV file with headers on the first row, followed by data rows. **Include ALL columns from the `sensor_data` table.**

## CSV Columns

The CSV must include all columns from the `sensor_data` table. Based on the current schema, these are:

```
timestamp, asset_id, device_id, rpm, max_rpm, min_rpm, tc_rpm, fpi,
eg_temp_1, eg_temp_2, eg_temp_3, eg_temp_4, eg_temp_5, eg_temp_6,
eg_temp_7, eg_temp_8, eg_temp_9, eg_temp_mean, max_eg_temp_mean,
eg_temp_compensator, eg_temp_out_turbo, eg_temp_tc_in, eg_temp_tc_out,
eg_temp_dev_1, eg_temp_dev_2, eg_temp_dev_3, eg_temp_dev_4,
eg_temp_dev_5, eg_temp_dev_6, eg_temp_dev_7, eg_temp_dev_8,
exh_gas_limit, exh_gas_temp, exhaust_gas_temp_diff,
fo_press_inlet, fo_press_filter_in, fo_temp_in, fo_flow_inlet, fo_flow_outlet,
lo_press, lo_press_in, lo_press_filter_in, lo_press_tc,
lo_temp, lo_temp_in, lo_tc_temp,
ht_cw_press, ht_cw_temp, ht_cw_inlet_temp, ht_cw_temp_out,
lt_cw_press, lt_cw_temp, lt_cw_temp_in,
startair_press, startair_temp_out,
chargeair_press, chargeair_temp, chargeair_press_ac_out, chargeair_temp_ac_out,
air_temp, rh,
gen_voltage, gen_freq, bus_voltage, bus_freq, phase_diff, cos_phi,
load_kw, kva, kvar,
i_u, i_v, i_w,
v_uv, v_vw, v_uw,
wind_u_temp_diff, wind_v_temp_diff, wind_w_temp_diff,
fo_srv_tk17_ps, fo_srv_tk17_sb,
fo_tk3_ps, fo_tk3_sb, fo_tk5_ps, fo_tk5_sb,
fo_tk6_ps, fo_tk6_sb, fo_tk7_ps, fo_tk7_sb,
fo_tk8_ps, fo_tk8_sb,
pw_flow, cargo_fo_flow,
thrust_current, thrust_servo_press, cpp_servo_press,
gearbox_servo_temp, gearbox_servo_press,
d_bear_temp, n_bear_temp,
nu, standby_sequence, sample_count, fuel_consumption
```

> **Note**: If the table has additional columns not listed here, include them as well. Use `SELECT *` from the `sensor_data` table.

## SQL Query (Reference)

```sql
SELECT *
FROM sensor_data
WHERE vessel_id = :vessel_id
  AND timestamp >= :from
  AND timestamp <= :to
  AND (:engine IS NULL OR asset_id = :engine)
ORDER BY timestamp ASC;
```

## Implementation Notes

1. **Stream the CSV response** — do not load all rows into memory. Use cursor-based streaming (e.g. `cursor.itersize` in psycopg, or `ResultProxy.yield_per()` in SQLAlchemy) to handle large date ranges.

2. **CSV generation** — use Python's `csv.writer` writing to a `StreamingResponse` (FastAPI) or equivalent streaming mechanism. Write the header row first, then stream data rows.

3. **Null handling** — null/None values should be written as empty strings in the CSV (standard CSV behavior).

4. **Timestamp format** — format timestamps as ISO 8601 strings (`YYYY-MM-DDTHH:MM:SS.sssZ`).

5. **Filename** — set the `Content-Disposition` header with a descriptive filename:

   ```
   Content-Disposition: attachment; filename="sensor-data-{vessel_id}-{date}.csv"
   ```

6. **Authorization** — use the same JWT Bearer token authentication as all other endpoints.

7. **Row limit** — consider adding a safeguard max row limit (e.g. 500,000 rows) to prevent accidental massive exports. Return `413` if exceeded.

8. **`ERR_INCOMPLETE_CHUNKED_ENCODING` fix** — The frontend is currently receiving this error, meaning the streaming response breaks mid-transfer. Common causes and fixes:
   - **Unhandled exception inside the generator** — wrap the entire `generate()` body in `try/except`. Any uncaught DB error, type-conversion error (e.g. `datetime` not serialised), or `None` handling bug will kill the stream silently.
   - **Database cursor closed prematurely** — make sure the DB session/connection stays open for the full duration of the generator. If using a dependency-injected session (`Depends(get_db)`), the session may close before the generator finishes. Use `background_tasks` or manage the connection manually inside `generate()`.
   - **Proxy / reverse-proxy timeout** — if behind Nginx, ensure `proxy_read_timeout` and `proxy_send_timeout` are large enough (e.g. `300s`).
   - **Missing `yield` for empty results** — if the query returns 0 rows, make sure the generator still yields the header row and terminates cleanly.
   - **Test with a small date range first** (e.g. 1 hour) to isolate whether it's a data-volume issue vs. a code bug.

## FastAPI Example

```python
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from datetime import datetime
import csv
import io
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/api/vessels/{vessel_id}/sensor-data/export")
async def export_sensor_data_csv(
    vessel_id: int,
    from_dt: datetime = Query(..., alias="from"),
    to_dt: datetime = Query(..., alias="to"),
    engine: str | None = Query(None),
    current_user=Depends(get_current_user),
):
    async def generate():
        # IMPORTANT: manage DB connection inside the generator so it stays
        # open for the full stream lifetime (not closed by DI after response starts).
        async with get_async_session() as session:
            try:
                output = io.StringIO()
                writer = csv.writer(output)

                # Get column names from the table
                columns = [...]  # All sensor_data columns
                writer.writerow(columns)
                yield output.getvalue()
                output.seek(0)
                output.truncate(0)

                # Stream rows using server-side cursor
                result = await session.execute(query)
                async for row in result:
                    # Convert None → '' and datetime → ISO string
                    clean_row = [
                        v.isoformat() if isinstance(v, datetime) else ('' if v is None else v)
                        for v in row
                    ]
                    writer.writerow(clean_row)
                    yield output.getvalue()
                    output.seek(0)
                    output.truncate(0)

            except Exception:
                logger.exception(
                    "CSV export failed for vessel=%s from=%s to=%s engine=%s",
                    vessel_id, from_dt, to_dt, engine,
                )
                # Can't change HTTP status mid-stream, but at least log it.
                # The client will see ERR_INCOMPLETE_CHUNKED_ENCODING.
                raise

    filename = f"sensor-data-{vessel_id}-{from_dt.date()}-{to_dt.date()}.csv"
    return StreamingResponse(
        generate(),
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
        },
    )
```

## Frontend Integration

The frontend already has the API call implemented:

```typescript
// src/services/api.ts
export async function exportSensorDataCSV(
  vesselId: number,
  from: string, // ISO datetime
  to: string, // ISO datetime
  engine?: string // e.g. 'me1', 'ae1'
): Promise<void>;
```

This function:

- Calls `GET /api/vessels/{vesselId}/sensor-data/export?from=...&to=...&engine=...`
- Downloads the response blob as a `.csv` file
- Reads filename from `Content-Disposition` header if available
