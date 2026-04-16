# Single-Parameter Stats — Implementation Guide

## Decision: No New API Required (for current implementation)

All three stats displayed in the **Stats** column of the Condition Monitoring
sensor cards are computed **entirely on the frontend** from the sensor data that
is already returned by the existing endpoint:

```
GET /api/vessels/{vesselId}/sensor-data?from=…&to=…&engine=…
```

The backend does **not** need to build any new endpoint for these calculations
under the current behaviour.

---

## Stats Definitions

| Stat | Definition | Scope |
|------|-----------|-------|
| **Average** | Arithmetic mean of all non-null values of the primary parameter | Full selected date range |
| **Moving Average** | Arithmetic mean of all non-null values whose timestamp falls within the **last 24 h of the selected range** | Last 24 h window relative to the last data-point in the response |
| **Deviation** | Sample standard deviation (divided by `n − 1`) of all non-null values | Full selected date range |

> **Null handling**: any `null` or `NaN` data points are silently excluded from
> every calculation. A result of `N/A` is shown when there are too few
> points (fewer than 1 for avg/movAvg; fewer than 2 for deviation).

---

## Fallback Key Behaviour

For the **Exhaust Gas Temperatures (Cylinders)** row, the primary stat key is
`eg_temp_mean`. If the API returns all-null values for `eg_temp_mean` (vessel
does not populate this field), the frontend automatically falls back to
`eg_temp_1` for stats and sparkline calculations.

This is configured via the optional `fallbackDataKey` field in
`SENSOR_CHART_ROWS` inside `index.tsx`.

---

## Moving Average — Edge Cases

### Selected range shorter than 24 h (e.g. "1h" preset)
The cutoff window (`lastTs − 24 h`) covers the entire dataset, so
`movAvg === avg`. This is correct and expected.

### Custom date range that does **not** include today
Example: user selects Jan 1 – Jan 7.

The moving average is computed as the **mean of the last 24 h of that period**
(Jan 6 – Jan 7). This is consistent with the "trailing 24 h of the selected
window" definition and requires no backend change.

### "True current" moving average for historical views (⚠ needs backend)
If the product requirement is that the **Moving Average should always reflect
the live last-24 h from now**, regardless of what date range the user has
selected (e.g. user is viewing January data but wants today's MA), the frontend
**cannot** satisfy this because the API response only covers the selected range.

In this case the backend should expose:

```
GET /api/vessels/{vesselId}/sensor-stats/moving-average
  ?keys=rpm,tc_rpm,eg_temp_mean,...
  &engine=<engineId>
  &window=24h          ← size of the MA window; defaults to 24h
```

**Response shape:**
```json
{
  "vessel_id": 8,
  "engine": "me2",
  "window": "24h",
  "computed_at": "2026-04-16T10:00:00Z",
  "stats": {
    "rpm":          { "mov_avg": 418.2,  "count": 47 },
    "tc_rpm":       { "mov_avg": 27.5,   "count": 47 },
    "eg_temp_mean": { "mov_avg": 312.1,  "count": 46 },
    "fpi":          { "mov_avg": 18.3,   "count": 47 }
  }
}
```

This endpoint would:
- Always query `NOW − 24 h → NOW` on the server side.
- Be called once on page load (not per date-range change).
- Supplement the full-range stats already computed on the frontend.

> **Status**: not implemented. Only build this if the product explicitly
> requires "current MA" regardless of date selection.

---

## Mini Sparkline Chart

The red chart above each Stats card is a live `LineChart` (Recharts) that:
- Plots every non-null value in the selected range for the row's `primaryDataKey`
  (with automatic fallback to `fallbackDataKey` if needed).
- Draws a dashed horizontal `ReferenceLine` at the computed **average**.

This gives the engineer an instant visual of the data distribution and where
the average sits within the range.

---

## Frontend Implementation Summary

### Utility — `src/utils/sensor-stats.ts`

| Export | Purpose |
|--------|---------|
| `computeParameterStats(data, key, fallback?)` | Returns `{ avg, movAvg, dev }` |
| `extractParameterValues(data, key, fallback?)` | Returns `number[]` for sparkline |
| `fmtStat(value)` | Formats to 2 d.p. or `'N/A'` |

### Primary keys per sensor row

| Chart title | Primary key | Fallback key |
|-------------|-------------|--------------|
| Turbocharger RPM | `tc_rpm` | — |
| Engine RPM | `rpm` | — |
| Fuel Rack Position | `fpi` | — |
| Exhaust Gas Temperatures (Cylinders) | `eg_temp_mean` | `eg_temp_1` |
| Exhaust Gas Temp (Turbo Out / Manifold) | `eg_temp_out_turbo` | — |
| Charge Air Pressure | `chargeair_press` | — |
| HT Cooling Water Temperature | `ht_cw_temp` | — |
| Lube Oil Temperature | `lo_temp` | — |
