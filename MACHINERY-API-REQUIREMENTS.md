# Machinery Pages — API Requirements

Backend developer prompt: build the following REST APIs for the three Machinery pages. All endpoints use **JWT Bearer** authentication (same as existing `/api/auth/login` flow). Base URL: `https://ocean-pact-api.perfomax.tech`.

---

## Table of Contents

1. [Shared / Global State APIs](#1-shared--global-state-apis)
2. [Machinery Overview APIs](#2-machinery-overview-page)
3. [Condition Monitoring APIs](#3-condition-monitoring-page)
4. [Alarm Overview APIs](#4-alarm-overview-page)
5. [DB Column Reference](#5-db-column-reference)

---

## 1. Shared / Global State APIs

These APIs are **already implemented** and shared across all three machinery pages via the Helium header dropdowns. Listed here for reference — **no new work needed**.

### 1.1 Vessel List (existing)

```
GET /api/vessels
Authorization: Bearer <token>
```

Response:

```json
{
  "vessels": [
    {
      "label": "Ocean Voyager",
      "value": "ocean-voyager",
      "id": 7,
      "engines": ["ME PORT", "ME STBD", "ME CENTER"],
      "position": {
        "lat": 1.29,
        "long": 103.85,
        "direction": 45,
        "timestamp": 1711234567
      }
    }
  ]
}
```

### 1.2 Engine Options (existing)

```
GET /api/engines?vessel_id=7
Authorization: Bearer <token>
```

Response:

```json
{
  "engines": [
    { "label": "All Engine", "value": "all" },
    { "label": "Genset 1", "value": "ae1" },
    { "label": "Genset 2", "value": "ae2" },
    { "label": "ME Port", "value": "me1" },
    { "label": "ME Center", "value": "me2" },
    { "label": "ME Starboard", "value": "me3" }
  ]
}
```

---

## 2. Machinery Overview Page

**URL:** `/machinery/machinery-overview`

**Header selectors:** Vessel dropdown + Time range dropdown (24h / 7d / 30d / 90d)

This page shows **one card per engine** with: health score, running status, alarm counts, 6 metric rows with sparklines.

### 2.1 Engine Overview Cards

```
GET /api/vessels/{vessel_id}/machinery-overview?period=7d
Authorization: Bearer <token>
```

**Query params:**

| Param    | Type   | Required | Values                    | Description                                                       |
| -------- | ------ | -------- | ------------------------- | ----------------------------------------------------------------- |
| `period` | string | No       | `24h`, `7d`, `30d`, `90d` | Time window for sparkline data + aggregated metrics. Default `7d` |

**Response:**

```json
{
  "engines": [
    {
      "engine_id": "me1",
      "label": "ME Port",
      "health_score": 80,
      "status": "running",
      "metrics": {
        "rpm": 1270,
        "exhaust_temp": 356,
        "oil_pressure": 465,
        "oil_temp": 76,
        "coolant_temp": 84,
        "fuel_consumption": 11.23
      },
      "alarms": {
        "critical": 1,
        "warning": 2,
        "notice": 0,
        "info": 1
      },
      "sparklines": {
        "rpm": [
          0, 10, 20, 30, 56, 82, 70, 65, 30, 5, 20, 69, 77, 83, 67, 79, 100, 73,
          64, 75, 81, 70, 40, 20
        ],
        "exhaust_temp": [
          40, 42, 45, 48, 50, 55, 60, 58, 52, 48, 45, 65, 72, 78, 82, 85, 90,
          88, 80, 75, 70, 68, 65, 62
        ],
        "oil_pressure": [
          60, 62, 64, 66, 65, 63, 61, 60, 58, 55, 57, 59, 61, 63, 65, 67, 68,
          66, 64, 62, 60, 58, 56, 55
        ],
        "oil_temp": [
          30, 32, 35, 38, 40, 45, 50, 52, 55, 58, 60, 62, 64, 66, 68, 70, 72,
          70, 68, 65, 62, 60, 58, 56
        ],
        "coolant_temp": [
          20, 22, 25, 28, 30, 35, 40, 42, 45, 50, 52, 55, 58, 60, 62, 64, 66,
          68, 70, 72, 75, 78, 80, 78
        ],
        "fuel_consumption": [
          10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42,
          44, 46, 48, 50, 52, 54, 56
        ]
      }
    },
    {
      "engine_id": "me2",
      "label": "ME Stbd",
      "health_score": 98,
      "status": "running",
      "metrics": { "...": "..." },
      "alarms": { "critical": 0, "warning": 0, "notice": 1, "info": 0 },
      "sparklines": { "...": "..." }
    },
    {
      "engine_id": "ae1",
      "label": "Genset 1",
      "health_score": 80,
      "status": "off",
      "metrics": {
        "rpm": 0,
        "exhaust_temp": null,
        "oil_pressure": null,
        "oil_temp": null,
        "coolant_temp": null,
        "fuel_consumption": null
      },
      "alarms": { "critical": 0, "warning": 0, "notice": 0, "info": 0 },
      "sparklines": {
        "rpm": [],
        "exhaust_temp": [],
        "oil_pressure": [],
        "oil_temp": [],
        "coolant_temp": [],
        "fuel_consumption": []
      }
    }
  ]
}
```

**Field details:**

| Field                                 | Type         | Unit  | Source                           | Notes                                                                                            |
| ------------------------------------- | ------------ | ----- | -------------------------------- | ------------------------------------------------------------------------------------------------ |
| `engine_id`                           | string       | —     | `asset_id` lowercased            | `"me1"`, `"me2"`, `"me3"`, `"ae1"`, `"ae2"`                                                      |
| `label`                               | string       | —     | Engine name                      | Same as `/api/engines` label                                                                     |
| `health_score`                        | number       | 0–100 | Computed                         | Algorithm TBD — could be based on deviation from normal ranges                                   |
| `status`                              | string       | —     | Derived                          | `"running"` (RPM > 0 + recent data), `"standby"` (connected but RPM=0), `"off"` (no recent data) |
| `metrics.rpm`                         | number       | RPM   | `sensor_data.rpm`                | Latest value. `0` if engine off                                                                  |
| `metrics.exhaust_temp`                | number\|null | °C    | AVG(`eg_temp_1`..`eg_temp_8`)    | `null` if no data                                                                                |
| `metrics.oil_pressure`                | number\|null | kPa   | `sensor_data.lo_press × 100`     | Convert bar → kPa                                                                                |
| `metrics.oil_temp`                    | number\|null | °C    | `sensor_data.lo_temp`            |                                                                                                  |
| `metrics.coolant_temp`                | number\|null | °C    | `sensor_data.ht_cw_temp`         |                                                                                                  |
| `metrics.fuel_consumption`            | number\|null | kg/h  | `fo_flow_inlet − fo_flow_outlet` | Clamped ≥ 0                                                                                      |
| `alarms.critical/warning/notice/info` | number       | —     | Alarm counts                     | Only **active** alarms for this engine                                                           |
| `sparklines.*`                        | number[]     | —     | Historical samples               | ~24 evenly-spaced data points across the `period` window. Empty array `[]` if no data            |

**Sparkline generation:**

- Divide the requested `period` into 24 equal buckets
- For each bucket, take the average value of that metric
- Return as a flat number array (24 elements)
- If engine has no data for the period → return empty array `[]`

### 2.2 Alarm Tooltip Data (per engine)

When the user hovers over an alarm badge (critical/warning/notice/info) on a machinery card, a tooltip shows the top alarms for that severity.

```
GET /api/vessels/{vessel_id}/alarms?engine={engine_id}&status=active&category={category}&limit=10
Authorization: Bearer <token>
```

**This endpoint already exists partially as `/api/vessels/{vessel_id}/alarms?engine={engine_id}`. It needs to support additional filters:**

| Param      | Type   | Required | Description                                           |
| ---------- | ------ | -------- | ----------------------------------------------------- |
| `engine`   | string | No       | Engine ID: `me1`, `ae2`, etc. Omit for all            |
| `status`   | string | No       | `active` or `resolved`. Omit for all                  |
| `category` | string | No       | `critical`, `warning`, `notice`, `info`. Omit for all |
| `limit`    | number | No       | Max results. Default: all                             |

Response format — same as existing alarm response:

```json
{
  "alarms": [
    {
      "id": "a1-01",
      "timestamp": 1711234567000,
      "alarm_text": "High coolant temperature",
      "engine": "ME PORT",
      "value": 95.2,
      "threshold_min": null,
      "threshold_max": 90.0,
      "severity": 1,
      "status": "active",
      "category": "critical",
      "unit": "°C"
    }
  ]
}
```

**New field needed in alarm response:**

| Field  | Type   | Description                                                          |
| ------ | ------ | -------------------------------------------------------------------- |
| `unit` | string | Unit of the alarm value: `°C`, `kPa`, `V`, `RPM`, `bar`, `L/H`, etc. |

---

## 3. Condition Monitoring Page

**URL:** `/machinery/condition-monitoring`

**Header selectors:** Vessel dropdown, Engine dropdown, Time preset buttons (`1h`, `1d`, `7d`, `1m`, `3m`, `Custom Time`), Date range picker (for Custom Time)

This page shows sensor time-series charts, delta deviation analysis, scatter plots, SFOC analysis, a fuel consumption rate chart, and a condition-based analysis table. **Currently, sensor data comes from an API-key-authenticated endpoint `/api/v1/analytics/sensor`. All endpoints below should use JWT auth instead.**

### 3.1 Sensor Time-Series Data

**Replaces:** `GET /api/v1/analytics/sensor` (API-key auth)

```
GET /api/vessels/{vessel_id}/sensor-data?engine={engine_id}&from={ISO}&to={ISO}
Authorization: Bearer <token>
```

**Query params:**

| Param    | Type   | Required | Description                                             |
| -------- | ------ | -------- | ------------------------------------------------------- |
| `engine` | string | No       | `me1`, `me2`, `me3`, `ae1`, `ae2`. Omit for all engines |
| `from`   | string | Yes      | ISO 8601 timestamp (e.g., `2025-01-01T00:00:00.000Z`)   |
| `to`     | string | Yes      | ISO 8601 timestamp                                      |

**Response:**

```json
{
  "count": 1250,
  "from": "2025-01-01T00:00:00.000Z",
  "to": "2025-01-04T00:00:00.000Z",
  "resolution": "auto",
  "vessel": {
    "id": 7,
    "name": "Ocean Voyager"
  },
  "data": [
    {
      "timestamp": "2025-01-01T00:05:00.000Z",
      "asset_id": "ME1",
      "device_id": 101,
      "rpm": 1167.5,
      "max_rpm": 1200.0,
      "min_rpm": 1150.0,
      "tc_rpm": 8500.0,
      "fpi": 11.52,
      "fo_flow_inlet": 35.05,
      "fo_flow_outlet": 6.7,
      "eg_temp_1": 340.0,
      "eg_temp_2": 342.0,
      "eg_temp_3": 338.0,
      "eg_temp_4": 341.0,
      "eg_temp_5": 345.0,
      "eg_temp_6": 343.0,
      "eg_temp_7": 346.0,
      "eg_temp_8": 344.0,
      "eg_temp_mean": 342.4,
      "max_eg_temp_mean": 350.0,
      "exh_gas_temp": 356.0,
      "eg_temp_out_turbo": 280.0,
      "fo_press_inlet": 4.5,
      "lo_press": 4.2,
      "ht_cw_press": 1.85,
      "lt_cw_press": 1.2,
      "startair_press": 28.5,
      "chargeair_press": 2.1,
      "lo_temp": 78.0,
      "ht_cw_temp": 82.0,
      "ht_cw_inlet_temp": 36.0,
      "lt_cw_temp": 38.0,
      "chargeair_temp": 45.0,
      "gen_voltage": 440.0,
      "bus_freq": 60.0,
      "cos_phi": 0.85,
      "sample_count": 12
    }
  ]
}
```

**Field reference (from `sensor_data` table):**

| Response Field           | DB Column                | Unit      | Notes                                |
| ------------------------ | ------------------------ | --------- | ------------------------------------ |
| `timestamp`              | `create_datetime`        | ISO 8601  | Bucket timestamp (aggregated)        |
| `asset_id`               | `asset_id`               | string    | UPPERCASE: `"ME1"`, `"ME2"`, `"AE1"` |
| `device_id`              | `device_id`              | integer   |                                      |
| `rpm`                    | `rpm`                    | RPM       | Average in bucket                    |
| `max_rpm`                | `rpm`                    | RPM       | Max in bucket                        |
| `min_rpm`                | `rpm`                    | RPM       | Min in bucket                        |
| `tc_rpm`                 | `tc_rpm`                 | RPM       | Turbocharger RPM                     |
| `fpi`                    | `fpi`                    | % (0–100) | Fuel Performance Index / Load        |
| `fo_flow_inlet`          | `fo_flow_inlet`          | L/H       | Fuel oil flow inlet                  |
| `fo_flow_outlet`         | `fo_flow_outlet`         | L/H       | Fuel oil flow outlet                 |
| `eg_temp_1`..`eg_temp_8` | `eg_temp_1`..`eg_temp_8` | °C        | Per-cylinder exhaust gas temp        |
| `eg_temp_mean`           | `eg_temp_mean`           | °C        | Average of all cylinders             |
| `max_eg_temp_mean`       | `eg_temp_mean`           | °C        | Max mean in bucket                   |
| `exh_gas_temp`           | `exh_gas_temp`           | °C        | Overall exhaust gas temp             |
| `eg_temp_out_turbo`      | `eg_temp_out_turbo`      | °C        | Exhaust gas temp turbo outlet        |
| `fo_press_inlet`         | `fo_press_inlet`         | bar       | Fuel oil pressure inlet              |
| `lo_press`               | `lo_press`               | bar       | Lube oil pressure                    |
| `ht_cw_press`            | `ht_cw_press`            | bar       | HT cooling water pressure            |
| `lt_cw_press`            | `lt_cw_press`            | bar       | LT cooling water pressure            |
| `startair_press`         | `startair_press`         | bar       | Start air pressure                   |
| `chargeair_press`        | `chargeair_press`        | bar       | Charge air pressure                  |
| `lo_temp`                | `lo_temp`                | °C        | Lube oil temperature                 |
| `ht_cw_temp`             | `ht_cw_temp`             | °C        | HT cooling water outlet temp         |
| `ht_cw_inlet_temp`       | `ht_cw_inlet_temp`       | °C        | HT cooling water inlet temp          |
| `lt_cw_temp`             | `lt_cw_temp`             | °C        | LT cooling water temp                |
| `chargeair_temp`         | `chargeair_temp`         | °C        | Charge air temp                      |
| `gen_voltage`            | `gen_voltage`            | V         | Generator voltage                    |
| `bus_freq`               | `bus_freq`               | Hz        | Bus frequency                        |
| `cos_phi`                | `cos_phi`                | —         | Power factor                         |
| `sample_count`           | —                        | integer   | Number of raw samples aggregated     |

**Resolution/Aggregation:**

- The server should auto-aggregate based on the time range:
  - `1h` → no aggregation (raw data, ~1 reading per 3 seconds)
  - `1d` → 1-minute buckets
  - `7d` → 5-minute buckets
  - `1m` → 30-minute buckets
  - `3m` → 1-hour buckets
- Each bucket: `AVG` for all numeric fields, `MAX` for `max_rpm`/`max_eg_temp_mean`, `MIN` for `min_rpm`, `COUNT` for `sample_count`
- Return the `resolution` string in the response (e.g., `"1min"`, `"5min"`, `"30min"`, `"1hour"`, `"raw"`)

**Frontend uses this data for 8 line charts:**

| Chart                                   | Y-axis | Series (data keys)                                         |
| --------------------------------------- | ------ | ---------------------------------------------------------- |
| Turbocharger RPM                        | RPM    | `tc_rpm`                                                   |
| Engine RPM                              | RPM    | `rpm`                                                      |
| Fuel Performance Index                  | %      | `fpi`                                                      |
| Exhaust Gas Temps (Cylinders)           | °C     | `eg_temp_1` through `eg_temp_8`, `eg_temp_mean` (9 series) |
| Exhaust Gas Temp (Turbo Out / Manifold) | °C     | `eg_temp_out_turbo`, `exh_gas_temp` (2 series)             |
| Charge Air Pressure                     | bar    | `chargeair_press`                                          |
| HT Cooling Water Temp                   | °C     | `ht_cw_temp`, `ht_cw_inlet_temp` (2 series)                |
| Lube Oil Temp                           | °C     | `lo_temp`                                                  |

### 3.2 Delta Deviation Trendline

Shows how 7 parameters deviate from their baseline over time.

```
GET /api/vessels/{vessel_id}/condition-monitoring/delta-deviation?engine={engine_id}&from={ISO}&to={ISO}
Authorization: Bearer <token>
```

**Response:**

```json
{
  "data": [
    {
      "timestamp": "2025-05-01T11:00:00Z",
      "charge_air_temp": 0.5,
      "lube_oil_temp": 1.2,
      "exh_temp": -0.3,
      "ht_cooling_water_temp": 0.8,
      "fuel_oil_pressure": -1.5,
      "lube_oil_pressure": 0.2,
      "charge_air_pressure": -0.8
    }
  ],
  "reference_band": {
    "upper": 12,
    "lower": -12
  }
}
```

**Field details:**

| Field                        | Type   | Unit     | Description                                        |
| ---------------------------- | ------ | -------- | -------------------------------------------------- |
| `timestamp`                  | string | ISO 8601 | Data point timestamp                               |
| `charge_air_temp`            | number | delta %  | Deviation from baseline for charge air temp        |
| `lube_oil_temp`              | number | delta %  | Deviation from baseline for lube oil temp          |
| `exh_temp`                   | number | delta %  | Deviation from baseline for exhaust temp           |
| `ht_cooling_water_temp`      | number | delta %  | Deviation from baseline for HT cooling water temp  |
| `fuel_oil_pressure`          | number | delta %  | Deviation from baseline for fuel oil pressure      |
| `lube_oil_pressure`          | number | delta %  | Deviation from baseline for lube oil pressure      |
| `charge_air_pressure`        | number | delta %  | Deviation from baseline for charge air pressure    |
| `reference_band.upper/lower` | number | delta %  | Acceptable deviation bounds (orange band on chart) |

**Baseline calculation:** Use first N hours of data (or a defined normal operating window) as the reference. Each subsequent data point shows % deviation from baseline.

### 3.3 Parameter Scatter Data

Scatter chart allowing the user to select any two parameters for X-axis and Y-axis comparison.

```
GET /api/vessels/{vessel_id}/condition-monitoring/parameter-scatter?engine={engine_id}&from={ISO}&to={ISO}
Authorization: Bearer <token>
```

**Response:**

```json
{
  "data": [
    {
      "timestamp": "2025-05-01T11:00:00Z",
      "fuel_consumption": 28.35,
      "engine_rpm": 1167.5,
      "engine_load": 11.52,
      "exhaust_temp": 342.0,
      "lube_oil_pressure": 4.2,
      "coolant_temp": 82.0,
      "charge_air_pressure": 2.1
    }
  ],
  "operating_modes": {
    "normal": [0, 1, 2, 5, 8, 10],
    "abnormal": [3, 4, 6, 7, 9]
  }
}
```

**Field details:**

| Field                 | Type   | Unit | DB Source                        |
| --------------------- | ------ | ---- | -------------------------------- |
| `fuel_consumption`    | number | L/H  | `fo_flow_inlet - fo_flow_outlet` |
| `engine_rpm`          | number | RPM  | `rpm`                            |
| `engine_load`         | number | %    | `fpi`                            |
| `exhaust_temp`        | number | °C   | `eg_temp_mean`                   |
| `lube_oil_pressure`   | number | bar  | `lo_press`                       |
| `coolant_temp`        | number | °C   | `ht_cw_temp`                     |
| `charge_air_pressure` | number | bar  | `chargeair_press`                |

**`operating_modes`** — indices into the `data` array classifying each point as normal/abnormal. Frontend renders normal points in green and abnormal in purple.

**Dropdown options** the frontend offers:

- Fuel Consumption
- Engine RPM
- Engine Load
- Exhaust Temp
- Lube Oil Pressure
- Coolant Temp
- Charge Air Pressure

The user picks any two as X-axis and Y-axis. The API returns ALL parameters and the frontend picks the appropriate pair.

### 3.4 Parameter vs Charge Air Pressure Scatter

This chart is always shown next to each sensor line chart row. It shows one sensor parameter on the Y-axis vs charge air pressure on the X-axis.

**This can be derived from the same scatter data endpoint (3.3).** No separate API needed — the frontend will filter the `data` array from the scatter response.

If you prefer a dedicated endpoint:

```
GET /api/vessels/{vessel_id}/condition-monitoring/param-vs-pcharge?engine={engine_id}&param={sensor_key}&from={ISO}&to={ISO}
Authorization: Bearer <token>
```

Response:

```json
{
  "line": [
    { "x": 0.5, "y": 120.0 },
    { "x": 1.0, "y": 180.0 },
    { "x": 1.5, "y": 230.0 },
    { "x": 2.0, "y": 280.0 }
  ],
  "scatter": [
    { "x": 0.7, "y": 135.0 },
    { "x": 1.2, "y": 200.0 }
  ]
}
```

Where `param` can be: `tc_rpm`, `rpm`, `fpi`, `eg_temp_mean`, `exh_gas_temp`, `eg_temp_out_turbo`, `chargeair_press`, `ht_cw_temp`, `lo_temp`.

### 3.5 SFOC Scatter Data

Specific Fuel Oil Consumption scatter chart grouped by operational mode.

```
GET /api/vessels/{vessel_id}/condition-monitoring/sfoc?engine={engine_id}&from={ISO}&to={ISO}
Authorization: Bearer <token>
```

**Response:**

```json
{
  "modes": [
    {
      "mode": "Harbour/Hotel Load (Engine On, SG Disengaged)",
      "color": "#22C55E",
      "shape": "circle",
      "data": [
        { "x": -0.569, "y": 216.73 },
        { "x": 0.767, "y": 212.08 },
        { "x": 2.387, "y": 229.6 }
      ]
    },
    {
      "mode": "Dynamic Positioning 1 (DP1)",
      "color": "#3B82F6",
      "shape": "square",
      "data": [
        { "x": 15.5, "y": 198.3 },
        { "x": 22.1, "y": 195.7 }
      ]
    },
    {
      "mode": "Dynamic Positioning 2 (DP2)",
      "color": "#EF4444",
      "shape": "diamond",
      "data": [{ "x": 25.0, "y": 201.2 }]
    },
    {
      "mode": "Slow Steaming",
      "color": "#A855F7",
      "shape": "star",
      "data": [{ "x": 50.0, "y": 188.5 }]
    },
    {
      "mode": "Full Load",
      "color": "#F97316",
      "shape": "cross",
      "data": [{ "x": 80.0, "y": 175.0 }]
    }
  ]
}
```

**Field details:**

| Field      | Type   | Unit    | Description                                                   |
| ---------- | ------ | ------- | ------------------------------------------------------------- |
| `mode`     | string | —       | Operational mode name                                         |
| `color`    | string | hex     | Recommended chart color                                       |
| `shape`    | string | —       | `circle`, `diamond`, `square`, `triangle`, `star`, `cross`    |
| `data[].x` | number | minutes | Time in operational mode (can be negative for pre-engagement) |
| `data[].y` | number | g/kWh   | Specific Fuel Oil Consumption                                 |

**SFOC calculation:** `SFOC (g/kWh) = (fuel_consumption_in_g/h) / (engine_power_in_kW)`. Operational mode classification should be based on engine load ranges or vessel operational state if available.

### 3.6 Fuel Consumption Rate (replaces CSV data)

Line chart with within-range / out-of-range visualization.

```
GET /api/vessels/{vessel_id}/condition-monitoring/fuel-rate?engine={engine_id}&from={ISO}&to={ISO}
Authorization: Bearer <token>
```

**Response:**

```json
{
  "data": [
    {
      "timestamp": "2025-05-05T08:40:00Z",
      "fuel_cons_rate": 28.5,
      "within_range": true
    },
    {
      "timestamp": "2025-05-05T08:45:00Z",
      "fuel_cons_rate": 65.2,
      "within_range": false
    }
  ],
  "limits": {
    "upper": 60,
    "lower": 0
  }
}
```

**Field details:**

| Field            | Type    | Unit     | Description                                |
| ---------------- | ------- | -------- | ------------------------------------------ |
| `timestamp`      | string  | ISO 8601 |                                            |
| `fuel_cons_rate` | number  | L/H      | `fo_flow_inlet - fo_flow_outlet`           |
| `within_range`   | boolean | —        | `true` if `lower ≤ fuel_cons_rate ≤ upper` |
| `limits.upper`   | number  | L/H      | Upper acceptable limit                     |
| `limits.lower`   | number  | L/H      | Lower acceptable limit                     |

### 3.7 Health Score per Chart Row

Each of the 8 sensor chart rows has a health score card next to it.

```
GET /api/vessels/{vessel_id}/condition-monitoring/health-scores?engine={engine_id}
Authorization: Bearer <token>
```

**Response:**

```json
{
  "scores": [
    {
      "parameter": "tc_rpm",
      "label": "Turbocharger RPM",
      "score": 85,
      "delta": 3,
      "alarm_count": 0,
      "peak_value": 9200,
      "peak_unit": "RPM"
    },
    {
      "parameter": "rpm",
      "label": "Engine RPM",
      "score": 92,
      "delta": -1,
      "alarm_count": 1,
      "peak_value": 1350,
      "peak_unit": "RPM"
    },
    {
      "parameter": "fpi",
      "label": "Fuel Performance Index",
      "score": 78,
      "delta": 5,
      "alarm_count": 0,
      "peak_value": 45.2,
      "peak_unit": "%"
    },
    {
      "parameter": "eg_temp",
      "label": "Exhaust Gas Temperatures",
      "score": 70,
      "delta": 8,
      "alarm_count": 2,
      "peak_value": 410,
      "peak_unit": "°C"
    },
    {
      "parameter": "eg_temp_turbo",
      "label": "Exhaust Gas Temp Turbo",
      "score": 88,
      "delta": -2,
      "alarm_count": 0,
      "peak_value": 320,
      "peak_unit": "°C"
    },
    {
      "parameter": "chargeair_press",
      "label": "Charge Air Pressure",
      "score": 90,
      "delta": 1,
      "alarm_count": 0,
      "peak_value": 2.8,
      "peak_unit": "bar"
    },
    {
      "parameter": "ht_cw_temp",
      "label": "HT Cooling Water Temp",
      "score": 75,
      "delta": 4,
      "alarm_count": 1,
      "peak_value": 92,
      "peak_unit": "°C"
    },
    {
      "parameter": "lo_temp",
      "label": "Lube Oil Temperature",
      "score": 82,
      "delta": 2,
      "alarm_count": 0,
      "peak_value": 88,
      "peak_unit": "°C"
    }
  ]
}
```

**Field details:**

| Field         | Type   | Description                                                              |
| ------------- | ------ | ------------------------------------------------------------------------ |
| `parameter`   | string | Matches the sensor chart row key                                         |
| `label`       | string | Human-readable name                                                      |
| `score`       | number | 0–100 health percentage                                                  |
| `delta`       | number | Change from previous period (positive = worsening, negative = improving) |
| `alarm_count` | number | Active alarms related to this parameter                                  |
| `peak_value`  | number | Peak/max value observed in current period                                |
| `peak_unit`   | string | Unit of the peak value                                                   |

### 3.8 Condition Based Analysis Table

Spare parts lifecycle tracking table shown below the charts.

```
GET /api/vessels/{vessel_id}/condition-monitoring/spare-parts?engine={engine_id}
Authorization: Bearer <token>
```

**Response:**

```json
{
  "parts": [
    {
      "id": "cba-01",
      "spare": "Cylinder Head Assembly",
      "design_life_hrs": 15000,
      "effective_life": 13500,
      "hours_since_oh": 5100,
      "remaining_life": 8400,
      "condition": 62,
      "pms_link": "PMS-01",
      "status": "ok",
      "remarks": "Replaced at overhaul"
    },
    {
      "id": "cba-08",
      "spare": "Sea Water Pump",
      "design_life_hrs": 8000,
      "effective_life": 6500,
      "hours_since_oh": 9200,
      "remaining_life": -2700,
      "condition": 0,
      "pms_link": "PMS-08",
      "status": "critical",
      "remarks": "Inspect impeller - cavitation risk"
    }
  ]
}
```

**Field details:**

| Field             | Type   | Description                                                   |
| ----------------- | ------ | ------------------------------------------------------------- |
| `id`              | string | Unique part ID                                                |
| `spare`           | string | Component/spare part name                                     |
| `design_life_hrs` | number | Manufacturer's rated life in hours                            |
| `effective_life`  | number | Adjusted life based on operating conditions                   |
| `hours_since_oh`  | number | Hours since last overhaul                                     |
| `remaining_life`  | number | `effective_life - hours_since_oh` (can be negative = overdue) |
| `condition`       | number | 0–100 percentage                                              |
| `pms_link`        | string | Planned Maintenance System schedule reference                 |
| `status`          | string | `"critical"`, `"urgent"`, `"caution"`, `"ok"`                 |
| `remarks`         | string | Free-text notes                                               |

**Status derivation:**

- `condition ≤ 5` or `remaining_life < 0` → `"critical"`
- `condition ≤ 20` → `"urgent"`
- `condition ≤ 50` → `"caution"`
- `condition > 50` → `"ok"`

---

## 4. Alarm Overview Page

**URL:** `/machinery/alarm-overview`

**Header selectors:** Vessel dropdown + Engine dropdown

This page shows: 7 alarm summary cards (critical, warning, notice, info, active, resolved, total) + a full alarm table.

### 4.1 Alarm Data with Counts

**Uses existing endpoint with new filters (see 2.2 above):**

```
GET /api/vessels/{vessel_id}/alarms?engine={engine_id}
Authorization: Bearer <token>
```

**Response (extended):**

```json
{
  "alarms": [
    {
      "id": "a1-01",
      "timestamp": 1711234567000,
      "alarm_text": "High coolant temperature",
      "engine": "ME PORT",
      "value": 95.2,
      "threshold_min": null,
      "threshold_max": 90.0,
      "severity": 1,
      "status": "active",
      "category": "critical",
      "unit": "°C"
    },
    {
      "id": "a1-02",
      "timestamp": 1711230000000,
      "alarm_text": "Low lube oil pressure",
      "engine": "ME STBD",
      "value": 280.0,
      "threshold_min": 350.0,
      "threshold_max": null,
      "severity": 1,
      "status": "resolved",
      "category": "warning",
      "unit": "kPa"
    }
  ],
  "summary": {
    "critical": 3,
    "warning": 5,
    "notice": 2,
    "info": 1,
    "active": 6,
    "resolved": 5,
    "total": 11
  }
}
```

**Alarm fields:**

| Field           | Type         | Description                                                                    |
| --------------- | ------------ | ------------------------------------------------------------------------------ |
| `id`            | string       | Unique alarm ID                                                                |
| `timestamp`     | number       | Unix milliseconds                                                              |
| `alarm_text`    | string       | Human-readable alarm description                                               |
| `engine`        | string       | Engine display name: `"ME PORT"`, `"ME STBD"`, `"ME CENTER"`, `"AE1"`, `"AE2"` |
| `value`         | number\|null | Current measured value at time of alarm                                        |
| `threshold_min` | number\|null | Lower threshold (format: `≥ X`)                                                |
| `threshold_max` | number\|null | Upper threshold (format: `≤ X`)                                                |
| `severity`      | 1\|2         | 1 = High, 2 = Normal                                                           |
| `status`        | string       | `"active"` or `"resolved"`                                                     |
| `category`      | string       | `"critical"`, `"warning"`, `"notice"`, `"info"`                                |
| `unit`          | string       | `"°C"`, `"kPa"`, `"V"`, `"RPM"`, `"bar"`, `"L/H"`                              |

**Summary counts:**

- `critical/warning/notice/info` — count only **active** alarms per category
- `active` — total active alarms
- `resolved` — total resolved alarms
- `total` — all alarms

**Table columns rendered by frontend:**

| Column     | Source Field                     | Format                                    |
| ---------- | -------------------------------- | ----------------------------------------- |
| Date       | `timestamp`                      | `MM/DD/YYYY`                              |
| Time       | `timestamp`                      | `HH:MM` (24-hour)                         |
| Alarm Text | `alarm_text`                     | Plain text                                |
| Engine     | `engine`                         | Badge (AE1→"Genset 1", AE2→"Genset 2")    |
| Value      | `value`                          | Number or "N/A"                           |
| Range      | `threshold_min`, `threshold_max` | "≥X", "≤X", or "X–Y"                      |
| Unit       | `unit`                           | String                                    |
| Severity   | `severity`                       | 1→"High" (red), 2→"Normal" (gray)         |
| Status     | `status`                         | Badge: "active" (green), "resolved" (red) |

---

## 5. DB Column Reference

Available columns in `sensor_data` and `nmea_data` tables for mapping API responses:

### sensor_data

| Column                           | Type             | Used In                                   |
| -------------------------------- | ---------------- | ----------------------------------------- |
| `rpm`                            | DOUBLE PRECISION | Engine RPM charts, machinery overview     |
| `tc_rpm`                         | DOUBLE PRECISION | Turbocharger RPM chart                    |
| `fpi`                            | DOUBLE PRECISION | Fuel Performance Index chart, engine load |
| `eg_temp_1`..`eg_temp_8`         | DOUBLE PRECISION | Per-cylinder exhaust gas charts           |
| `eg_temp_mean`                   | DOUBLE PRECISION | Mean exhaust temp chart                   |
| `eg_temp_out_turbo`              | DOUBLE PRECISION | Turbo outlet temp chart                   |
| `eg_temp_compensator`            | DOUBLE PRECISION | Available for analysis                    |
| `eg_temp_dev_1`..`eg_temp_dev_8` | DOUBLE PRECISION | Cylinder deviation analysis               |
| `exh_gas_limit`                  | DOUBLE PRECISION | Alarm threshold reference                 |
| `exh_gas_temp`                   | DOUBLE PRECISION | Overall exhaust gas temp                  |
| `fo_press_inlet`                 | DOUBLE PRECISION | Fuel oil pressure                         |
| `lo_press`                       | DOUBLE PRECISION | Lube oil pressure (bar)                   |
| `ht_cw_press`                    | DOUBLE PRECISION | HT cooling water pressure (bar)           |
| `lt_cw_press`                    | DOUBLE PRECISION | LT cooling water pressure (bar)           |
| `startair_press`                 | DOUBLE PRECISION | Start air pressure                        |
| `chargeair_press`                | DOUBLE PRECISION | Charge air pressure chart                 |
| `lo_temp`                        | DOUBLE PRECISION | Lube oil temperature chart                |
| `ht_cw_temp`                     | DOUBLE PRECISION | HT cooling water temp chart               |
| `ht_cw_inlet_temp`               | DOUBLE PRECISION | HT cooling water inlet temp chart         |
| `lt_cw_temp`                     | DOUBLE PRECISION | LT cooling water temp                     |
| `chargeair_temp`                 | DOUBLE PRECISION | Charge air temperature                    |
| `fo_flow_inlet`                  | DOUBLE PRECISION | Fuel flow in (for consumption calc)       |
| `fo_flow_outlet`                 | DOUBLE PRECISION | Fuel flow out (for consumption calc)      |
| `gen_voltage`                    | DOUBLE PRECISION | Generator voltage                         |
| `bus_voltage`                    | DOUBLE PRECISION | Bus voltage                               |
| `bus_freq`                       | DOUBLE PRECISION | Bus frequency                             |
| `gen_freq`                       | DOUBLE PRECISION | Generator frequency                       |
| `phase_diff`                     | DOUBLE PRECISION | Phase difference                          |
| `cos_phi`                        | DOUBLE PRECISION | Power factor                              |
| `exhaust_gas_temp_diff`          | DOUBLE PRECISION | Exhaust temp differential                 |
| `wind_u/v/w_temp_diff`           | DOUBLE PRECISION | Winding temperature differentials         |
| `fo_srv_tk17_ps/sb`              | DOUBLE PRECISION | Fuel service tank levels                  |
| `fo_tk3/5/6/7/8_ps/sb`           | DOUBLE PRECISION | Fuel tank levels                          |
| `pw_flow`                        | DOUBLE PRECISION | Process water flow                        |
| `cargo_fo_flow`                  | DOUBLE PRECISION | Cargo fuel flow                           |
| `thrust_current`                 | DOUBLE PRECISION | Thrust current                            |
| `thrust_servo_press`             | DOUBLE PRECISION | Thrust servo pressure                     |
| `cpp_servo_press`                | DOUBLE PRECISION | CPP servo pressure                        |
| `gearbox_servo_temp`             | DOUBLE PRECISION | Gearbox servo temperature                 |
| `gearbox_servo_press`            | DOUBLE PRECISION | Gearbox servo pressure                    |
| `vessel_id`                      | INTEGER          | Filter by vessel                          |
| `asset_id`                       | VARCHAR(20)      | Filter by engine (ME1, ME2, AE1, etc.)    |
| `create_datetime`                | TIMESTAMPTZ      | Timestamp for time-range queries          |

### nmea_data

| Column                | Type             | Used In          |
| --------------------- | ---------------- | ---------------- |
| `latitude`            | DOUBLE PRECISION | Vessel position  |
| `longitude`           | DOUBLE PRECISION | Vessel position  |
| `vessel_heading`      | DOUBLE PRECISION | Map direction    |
| `speed_over_ground`   | DOUBLE PRECISION | Speed charts     |
| `speed_through_water` | DOUBLE PRECISION | Speed comparison |
| `depth_meters`        | DOUBLE PRECISION | Depth display    |
| `wind_angle`          | DOUBLE PRECISION | Wind overlay     |
| `wind_speed`          | DOUBLE PRECISION | Wind overlay     |

---

## Summary — All New Endpoints

| #   | Method | Endpoint                                                                     | Page                 | Description                                                   |
| --- | ------ | ---------------------------------------------------------------------------- | -------------------- | ------------------------------------------------------------- |
| 1   | GET    | `/api/vessels/{id}/machinery-overview?period=7d`                             | Machinery Overview   | Engine cards with health, status, metrics, sparklines, alarms |
| 2   | GET    | `/api/vessels/{id}/alarms?engine=&status=&category=&limit=`                  | All 3 pages          | Alarm data with summary counts (extend existing)              |
| 3   | GET    | `/api/vessels/{id}/sensor-data?engine=&from=&to=`                            | Condition Monitoring | Sensor time-series (replaces API-key endpoint)                |
| 4   | GET    | `/api/vessels/{id}/condition-monitoring/delta-deviation?engine=&from=&to=`   | Condition Monitoring | Delta deviation trendline                                     |
| 5   | GET    | `/api/vessels/{id}/condition-monitoring/parameter-scatter?engine=&from=&to=` | Condition Monitoring | Parameter scatter data                                        |
| 6   | GET    | `/api/vessels/{id}/condition-monitoring/sfoc?engine=&from=&to=`              | Condition Monitoring | SFOC scatter by operational mode                              |
| 7   | GET    | `/api/vessels/{id}/condition-monitoring/fuel-rate?engine=&from=&to=`         | Condition Monitoring | Fuel consumption rate with limits                             |
| 8   | GET    | `/api/vessels/{id}/condition-monitoring/health-scores?engine=`               | Condition Monitoring | Health score per sensor parameter                             |
| 9   | GET    | `/api/vessels/{id}/condition-monitoring/spare-parts?engine=`                 | Condition Monitoring | Condition based analysis table                                |

**Authentication:** All endpoints use `Authorization: Bearer <JWT>` (same token from `POST /api/auth/login`).

**Existing endpoints reused (no changes needed):**

- `GET /api/vessels` — vessel list
- `GET /api/engines?vessel_id={id}` — engine options dropdown
