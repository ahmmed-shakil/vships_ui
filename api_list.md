# API Implementation — Changes from Spec

> Differences between the original API requirements document and the actual Go implementation, driven by the real database schema and data availability.

---

## 1. Data Source Mapping

### Engine Data Fields

| Spec Field          | DB Source                        | Notes                                                                                                                                                          |
| ------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `engine_rpm`        | `sensor_data.rpm`                | Direct mapping                                                                                                                                                 |
| `engine_load`       | `sensor_data.fpi`                | FPI = Fuel rack position (%). The spec treats this as "engine load %". Semantically close; true load% may differ if calculated differently on the vessel side. |
| `fuel_cons`         | `fo_flow_inlet - fo_flow_outlet` | Computed. Spec shows this as L/H.                                                                                                                              |
| `fm_in`             | `sensor_data.fo_flow_inlet`      | Direct                                                                                                                                                         |
| `fm_out`            | `sensor_data.fo_flow_outlet`     | Direct                                                                                                                                                         |
| `fm_cons`           | `fo_flow_inlet - fo_flow_outlet` | Same as `fuel_cons`                                                                                                                                            |
| `lubeoil_press`     | `sensor_data.lo_press`           | Direct (bar in DB, spec shows kPa — frontend should convert if needed)                                                                                         |
| `lubeoil_temp`      | `sensor_data.lo_temp`            | Direct (°C)                                                                                                                                                    |
| `coolant_press`     | `sensor_data.ht_cw_press`        | HT cooling water inlet pressure                                                                                                                                |
| `coolant_temp`      | `sensor_data.ht_cw_temp`         | HT cooling water outlet temp                                                                                                                                   |
| `batt_volt`         | `sensor_data.gen_voltage`        | Generator voltage used as proxy. True battery voltage may not be collected via AMS. WebSocket data from the vessel may carry the actual `Batt_volt`.           |
| `exhgas_temp_left`  | `AVG(eg_temp_1..4)`              | Average of cylinders 1–4 (left bank)                                                                                                                           |
| `exhgas_temp_right` | `AVG(eg_temp_5..8)`              | Average of cylinders 5–8 (right bank)                                                                                                                          |
| `total_fuel`        | **0** (placeholder)              | Cumulative fuel counter comes from engine controller. Not stored as a column in `sensor_data`. Provided via WebSocket `total_fuel` field at runtime.           |
| `running_hours`     | **0** (placeholder)              | Same — cumulative running hours from engine controller. Provided via WebSocket `run_hrs_counter`.                                                              |

### Engine Labels

| Spec Label  | DB Label (assets.asset_label) | Notes                                                                                                       |
| ----------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `ME PORT`   | `ME Port`                     | Case difference. The API returns values from `assets.asset_label` as stored.                                |
| `ME STBD`   | `ME Starboard`                | Full word vs abbreviation. The alarm formatter maps raw_code to spec labels (ME1→"ME PORT", ME2→"ME STBD"). |
| `ME CENTER` | `ME Center`                   | Case difference only                                                                                        |

### Asset ID Mapping

| Spec Value | DB `assets.raw_code` | Notes                                                                                         |
| ---------- | -------------------- | --------------------------------------------------------------------------------------------- |
| `me1`      | `ME1`                | API returns lowercase in JSON keys. DB stores uppercase.                                      |
| `me2`      | `ME2`                |                                                                                               |
| `me3`      | `ME3`                |                                                                                               |
| `ae1`      | `AE1` (or `DG1`)     | Ocean Pact uses AE prefix. Other clients may use DG. API normalizes DG→AE in chart responses. |
| `ae2`      | `AE2` (or `DG2`)     |                                                                                               |

---

## 2. Position Data

| Spec Field           | DB Source                    | Notes                                                                                                        |
| -------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `position.lat`       | `nmea_data.latitude`         | Latest NMEA message per vessel                                                                               |
| `position.long`      | `nmea_data.longitude`        |                                                                                                              |
| `position.direction` | `nmea_data.vessel_heading`   |                                                                                                              |
| `position.timestamp` | `nmea_data.created_datetime` | Converted to Unix seconds                                                                                    |
| `position_status`    | `noon_report.activity`       | Falls back to `"Operation"` if no noon report exists. Spec lists values like "Producing", "Supply Run", etc. |

---

## 3. Pressure Units

The database stores pressures in **bar** (as received from the AMS devices). The spec uses **kPa**.

**Conversion**: `1 bar = 100 kPa`

The API returns values **as stored in the DB (bar)**. The frontend should multiply by 100 if it needs kPa display, or update the gauge ranges accordingly:

| Gauge             | Spec Range (kPa) | Equivalent (bar) |
| ----------------- | ---------------- | ---------------- |
| Lube Oil Pressure | 0–1250           | 0–12.5           |
| Coolant Pressure  | 0–500            | 0–5.0            |

---

## 4. Alarm Mapping

| Spec Field      | DB Source                                 | Notes                                              |
| --------------- | ----------------------------------------- | -------------------------------------------------- |
| `id`            | `alarms.id`                               | Formatted as `"a{id}"` string                      |
| `timestamp`     | `alarms.create_datetime`                  | Unix milliseconds                                  |
| `alarm_text`    | `alarms.message`                          |                                                    |
| `engine`        | `devices.asset_id` → label mapping        | ME1→"ME PORT", etc.                                |
| `value`         | `alarms.value`                            |                                                    |
| `threshold_min` | `parameter_operations.minimum_safe_value` |                                                    |
| `threshold_max` | `parameter_operations.maximum_safe_value` |                                                    |
| `severity`      | Derived from `priorities.id`              | 3,4 → severity 1 (High); 1,2 → severity 2 (Normal) |
| `status`        | `alarms.acknowledged`                     | false → "active", true → "resolved"                |
| `category`      | Derived from `priorities.id`              | 4→"critical", 3→"warning", 2→"notice", 1→"info"    |

---

## 5. Machinery Scores

The spec shows health scores like `"37/100"`. The API computes a simple score:

```
score = 100
score -= (critical_alarm_count × 25)
score -= (other_alarm_count × 10)
score = max(score, 0)
```

If no sensor data received in the last hour → `status: "inactive"`, `value: "0/100"`.

This is a baseline algorithm. Refine with actual condition monitoring metrics as needed.

---

## 6. Chart Data

### Consumption vs Speed (`GET /api/vessels/{id}/charts/consumption-vs-speed`)

- **Consumption**: Hourly average of `fo_flow_inlet - fo_flow_outlet` per engine, from raw `sensor_data`.
- **Speed**: Hourly average of `nmea_data.speed_over_ground` (knots).
- **Default date**: Today (UTC). Override with `?date=2026-03-25`.
- **Time format**: `"HH:MM"` (24h).

### Engine Consumption (`GET /api/vessels/{id}/charts/engine-consumption`)

- Same approach but filtered to genset assets (AE1/AE2/DG1/DG2).
- `DG1`/`DG2` are normalized to `ae1`/`ae2` in the response for spec compatibility.

---

## 7. Authentication

### Implementation

- Frontend users are **customer users** managed in the **master DB** (`customer_users` table).
- Login is proxied: client API calls `POST /api/v1/auth/customer/login` on the master API.
- The master issues **JWT (HS256)** tokens via `golang-jwt/jwt/v5`.
- Access token: TTL configured in master (`JWT_ACCESS_EXPIRE_MINUTES`, default 15 min).
- Refresh token: TTL configured in master (`JWT_REFRESH_EXPIRE_DAYS`, default 7 days).
- The client API validates the master-issued JWT using the **same `JWT_SECRET`**.
- **No local `customer_users` table** in the client DB — users live exclusively in master.
- New users are created via the master API: `POST /api/v1/master/customers/:id/users`.

### User Management (Master API)

| Method | Endpoint                                     | Auth       | Description             |
| ------ | -------------------------------------------- | ---------- | ----------------------- |
| POST   | `/api/v1/auth/customer/login`                | None       | Customer user login     |
| POST   | `/api/v1/master/customers/:id/users`         | Master JWT | Create customer user    |
| GET    | `/api/v1/master/customers/:id/users`         | Master JWT | List customer users     |
| GET    | `/api/v1/master/customer-users/:id`          | Master JWT | Get customer user by ID |
| PUT    | `/api/v1/master/customer-users/:id`          | Master JWT | Update customer user    |
| PUT    | `/api/v1/master/customer-users/:id/password` | Master JWT | Reset password          |
| DELETE | `/api/v1/master/customer-users/:id`          | Master JWT | Delete customer user    |

### Differences from Spec

| Spec                                  | Implementation  | Notes                                                                                                                            |
| ------------------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `POST /api/auth/callback/credentials` | Not implemented | This is NextAuth's internal endpoint. The frontend's NextAuth `authorize()` function should call `POST /api/auth/login` instead. |
| `POST /api/auth/login`                | ✅ Implemented  | Proxies to master API. Returns `accessToken` + `refreshToken` + user info                                                        |
| `GET /api/auth/session`               | Not implemented | Handled by NextAuth on the frontend side using the JWT from login                                                                |
| `POST /api/auth/signout`              | Not implemented | Stateless JWT — frontend just discards the token                                                                                 |
| `user.id` format                      | `"usr_{id}"`    | String format as spec requires                                                                                                   |

---

## 8. Notifications

`GET /api/notifications` currently returns an empty array. The spec marks this as "currently commented out" in the frontend. When ready, this can be populated from the `alarms` table or a dedicated notifications system.

---

## 9. Emission Zones

Emission zones (`GET /api/fleet/emission-zones`) return **static/hardcoded** ECA zone polygons:

1. North American ECA
2. Gulf of Mexico ECA
3. Baltic Sea SECA
4. North Sea SECA

These are well-known IMO-designated areas. If custom zones are needed per client, add a `emission_zones` DB table.

---

## 10. New Environment Variables

Add to `configs/analytics.env`:

```env
# Must match the master API's JWT_SECRET for token validation
JWT_SECRET=change-this-to-a-secure-random-string

# Master API URL — used for frontend user authentication
MASTER_API_URL=http://localhost:8080

# This client's customer_id in master
CUSTOMER_ID=1
```

---

## 11. Migration

No client-side migration is needed for authentication. The `customer_users` table already exists in the **master DB** (created by `server/migrations/master/000001_init_schema.up.sql`).

To create the first customer user, use the master API:

```bash
# 1. Login as master admin
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username": "admin", "password": "Admin@123"}'

# 2. Create a customer user (use the access_token from step 1)
curl -X POST http://localhost:8080/api/v1/master/customers/1/users \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <access_token>' \
  -d '{"email": "admin@oceanpact.com", "password": "Perfomax@2026", "full_name": "John Doe"}'
```

---

## 12. Complete Endpoint Reference

| #   | Method | Endpoint                                       | Auth    | Status                                  |
| --- | ------ | ---------------------------------------------- | ------- | --------------------------------------- |
| 1   | POST   | `/api/auth/login`                              | None    | ✅ Implemented                          |
| 2   | GET    | `/api/user/profile`                            | JWT     | ✅ Implemented                          |
| 3   | GET    | `/api/notifications`                           | JWT     | ✅ Stub (empty)                         |
| 4   | GET    | `/api/vessels`                                 | JWT     | ✅ Implemented                          |
| 5   | GET    | `/api/engines`                                 | JWT     | ✅ Implemented (supports `?vessel_id=`) |
| 6   | GET    | `/api/fleet/vessels`                           | JWT     | ✅ Implemented                          |
| 7   | GET    | `/api/fleet/vessels/:id/alarms`                | JWT     | ✅ Implemented                          |
| 8   | GET    | `/api/fleet/emission-zones`                    | JWT     | ✅ Implemented (static)                 |
| 9   | GET    | `/api/vessels/:id/engines`                     | JWT     | ✅ Implemented                          |
| 10  | GET    | `/api/vessels/:id/charts/consumption-vs-speed` | JWT     | ✅ Implemented                          |
| 11  | GET    | `/api/vessels/:id/charts/engine-consumption`   | JWT     | ✅ Implemented                          |
| 12  | GET    | `/api/vessels/:id/position`                    | JWT     | ✅ Implemented                          |
| 13  | GET    | `/api/vessels/:id/alarms`                      | JWT     | ✅ Implemented (supports `?engine=`)    |
| 14  | GET    | `/api/vessels/:id/machinery-scores`            | JWT     | ✅ Implemented                          |
| 15  | GET    | `/api/v1/analytics/sensor`                     | API Key | Existing (unchanged)                    |
