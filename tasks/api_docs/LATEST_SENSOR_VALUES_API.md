# Latest Sensor Values API Documentation

## Overview

This API endpoint returns the most recent sensor data for all assets (engines) of a vessel. It fetches the latest data point for each asset_id (e.g., DG1, DG2, DG3, DG4, DG5, DG6) from the sensor_data table with timestamps.

## Endpoint

```
GET /api/vessels/:id/latest-sensor-values
```

## Authentication

Requires JWT Bearer Token in the Authorization header.

```
Authorization: Bearer <your_jwt_token>
```

## Request Parameters

### Path Parameters

| Parameter | Type    | Required | Description   |
| --------- | ------- | -------- | ------------- |
| id        | integer | Yes      | The vessel ID |

### Example Request URL

```
GET https://vship-api.perfomax.tech/api/vessels/4/latest-sensor-values
```

## Response Format

### Success Response (200 OK)

```json
{
  "vessel": {
    "id": 4,
    "name": "MV Pacific Star"
  },
  "count": 6,
  "data": [
    {
      "timestamp": "2026-03-29T10:30:15Z",
      "asset_id": "DG1",
      "device_id": 1,
      "rpm": 1800.5,
      "max_rpm": 1800.5,
      "min_rpm": 1800.5,
      "tc_rpm": 15234.8,
      "fpi": 98.5,
      "eg_temp_1": 385.2,
      "eg_temp_2": 390.1,
      "eg_temp_3": 388.5,
      "eg_temp_4": 392.3,
      "eg_temp_5": 387.9,
      "eg_temp_6": 391.2,
      "eg_temp_7": 389.4,
      "eg_temp_8": 390.8,
      "eg_temp_9": 388.1,
      "eg_temp_mean": 389.3,
      "max_eg_temp_mean": 389.3,
      "eg_temp_compensator": 15.2,
      "eg_temp_out_turbo": 275.5,
      "eg_temp_tc_in": 380.2,
      "eg_temp_tc_out": 275.5,
      "eg_temp_dev_1": -4.1,
      "eg_temp_dev_2": 0.8,
      "eg_temp_dev_3": -0.8,
      "eg_temp_dev_4": 3.0,
      "eg_temp_dev_5": -1.4,
      "eg_temp_dev_6": 1.9,
      "eg_temp_dev_7": 0.1,
      "eg_temp_dev_8": 1.5,
      "exh_gas_limit": 450.0,
      "exh_gas_temp": 389.3,
      "exhaust_gas_temp_diff": 7.1,
      "fo_press_inlet": 8.5,
      "fo_press_filter_in": 8.2,
      "fo_temp_in": 138.5,
      "fo_flow_inlet": 245.6,
      "fo_flow_outlet": 230.4,
      "lo_press": 4.2,
      "lo_press_in": 4.5,
      "lo_press_filter_in": 4.3,
      "lo_press_tc": 3.8,
      "lo_temp": 65.5,
      "lo_temp_in": 58.2,
      "lo_tc_temp": 68.4,
      "ht_cw_press": 2.1,
      "ht_cw_temp": 82.3,
      "ht_cw_inlet_temp": 78.5,
      "ht_cw_temp_out": 85.6,
      "lt_cw_press": 1.8,
      "lt_cw_temp": 38.2,
      "lt_cw_temp_in": 35.5,
      "startair_press": 28.5,
      "startair_temp_out": 45.2,
      "chargeair_press": 2.8,
      "chargeair_temp": 45.5,
      "chargeair_press_ac_out": 2.6,
      "chargeair_temp_ac_out": 42.3,
      "air_temp": 32.5,
      "rh": 5995,
      "gen_voltage": 440.2,
      "gen_freq": 60.02,
      "bus_voltage": 440.5,
      "bus_freq": 60.01,
      "phase_diff": 0.5,
      "cos_phi": 0.85,
      "load_kw": 850.5,
      "kva": 1000.6,
      "kvar": 526.8,
      "i_u": 1312.5,
      "i_v": 1308.2,
      "i_w": 1315.8,
      "v_uv": 440.3,
      "v_vw": 440.1,
      "v_uw": 440.6,
      "wind_u_temp_diff": 2.5,
      "wind_v_temp_diff": 2.3,
      "wind_w_temp_diff": 2.7,
      "fo_srv_tk17_ps": 1250.5,
      "fo_srv_tk17_sb": 1248.3,
      "fo_tk3_ps": 3520.8,
      "fo_tk3_sb": 3518.2,
      "fo_tk5_ps": 2850.4,
      "fo_tk5_sb": 2848.9,
      "fo_tk6_ps": 1920.5,
      "fo_tk6_sb": 1918.7,
      "fo_tk7_ps": 4125.8,
      "fo_tk7_sb": 4123.2,
      "fo_tk8_ps": 3680.5,
      "fo_tk8_sb": 3678.9,
      "pw_flow": 125.5,
      "cargo_fo_flow": 0,
      "thrust_current": 0,
      "thrust_servo_press": 0,
      "cpp_servo_press": 0,
      "gearbox_servo_temp": 0,
      "gearbox_servo_press": 0,
      "d_bear_temp": 68.5,
      "n_bear_temp": 72.3,
      "nu": null,
      "standby_sequence": null
    },
    {
      "timestamp": "2026-03-29T10:30:15Z",
      "asset_id": "DG2",
      "device_id": 2,
      "...": "... (similar structure for DG2)"
    },
    {
      "...": "... (DG3, DG4, DG5, DG6 follow same pattern)"
    }
  ]
}
```

### Error Responses

#### 400 Bad Request - Invalid Vessel ID

```json
{
  "error": "invalid vessel ID"
}
```

#### 401 Unauthorized - Missing or Invalid Token

```json
{
  "error": "unauthorized"
}
```

#### 500 Internal Server Error

```json
{
  "error": "failed to load latest sensor values"
}
```

## Response Fields Description

### Vessel Information

| Field       | Type    | Description                        |
| ----------- | ------- | ---------------------------------- |
| vessel.id   | integer | Vessel ID                          |
| vessel.name | string  | Vessel name                        |
| count       | integer | Number of assets/engines with data |

### Sensor Data Fields (per asset)

Each data object contains the following sensor parameters:

#### Core Engine Parameters

| Field     | Type              | Unit | Description                        |
| --------- | ----------------- | ---- | ---------------------------------- |
| timestamp | string (ISO 8601) | -    | Timestamp of the reading           |
| asset_id  | string            | -    | Engine identifier (DG1, DG2, etc.) |
| device_id | integer           | -    | Device ID                          |
| rpm       | float             | rpm  | Engine speed                       |
| tc_rpm    | float             | rpm  | Turbocharger speed                 |
| fpi       | float             | bar  | Fuel pressure injection            |

#### Exhaust Gas Temperatures

| Field                          | Type  | Unit | Description                                  |
| ------------------------------ | ----- | ---- | -------------------------------------------- |
| eg_temp_1 to eg_temp_9         | float | °C   | Individual cylinder exhaust gas temperatures |
| eg_temp_mean                   | float | °C   | Average exhaust gas temperature              |
| max_eg_temp_mean               | float | °C   | Maximum average EG temp                      |
| eg_temp_compensator            | float | °C   | EG temperature compensator value             |
| eg_temp_out_turbo              | float | °C   | Temperature after turbocharger               |
| eg_temp_tc_in                  | float | °C   | Turbocharger inlet temperature               |
| eg_temp_tc_out                 | float | °C   | Turbocharger outlet temperature              |
| eg_temp_dev_1 to eg_temp_dev_8 | float | °C   | Temperature deviation per cylinder           |
| exh_gas_limit                  | float | °C   | Exhaust gas temperature limit                |
| exh_gas_temp                   | float | °C   | Overall exhaust gas temperature              |
| exhaust_gas_temp_diff          | float | °C   | Temperature differential                     |

#### Fuel Oil System

| Field                        | Type  | Unit | Description                             |
| ---------------------------- | ----- | ---- | --------------------------------------- |
| fo_press_inlet               | float | bar  | Fuel oil inlet pressure                 |
| fo_press_filter_in           | float | bar  | Fuel filter inlet pressure              |
| fo_temp_in                   | float | °C   | Fuel oil inlet temperature              |
| fo_flow_inlet                | float | L/h  | Fuel flow inlet                         |
| fo_flow_outlet               | float | L/h  | Fuel flow outlet                        |
| fo_srv_tk17_ps/sb            | float | L    | Fuel service tank 17 (port/starboard)   |
| fo_tk3_ps/sb to fo_tk8_ps/sb | float | L    | Fuel storage tanks 3-8 (port/starboard) |

#### Lube Oil System

| Field              | Type  | Unit | Description                       |
| ------------------ | ----- | ---- | --------------------------------- |
| lo_press           | float | bar  | Lube oil pressure                 |
| lo_press_in        | float | bar  | Lube oil inlet pressure           |
| lo_press_filter_in | float | bar  | Lube oil filter inlet pressure    |
| lo_press_tc        | float | bar  | Turbocharger lube oil pressure    |
| lo_temp            | float | °C   | Lube oil temperature              |
| lo_temp_in         | float | °C   | Lube oil inlet temperature        |
| lo_tc_temp         | float | °C   | Turbocharger lube oil temperature |

#### Cooling Water System

| Field            | Type  | Unit | Description                             |
| ---------------- | ----- | ---- | --------------------------------------- |
| ht_cw_press      | float | bar  | High temperature cooling water pressure |
| ht_cw_temp       | float | °C   | HT cooling water temperature            |
| ht_cw_inlet_temp | float | °C   | HT cooling water inlet temperature      |
| ht_cw_temp_out   | float | °C   | HT cooling water outlet temperature     |
| lt_cw_press      | float | bar  | Low temperature cooling water pressure  |
| lt_cw_temp       | float | °C   | LT cooling water temperature            |
| lt_cw_temp_in    | float | °C   | LT cooling water inlet temperature      |

#### Air System

| Field                  | Type  | Unit    | Description                       |
| ---------------------- | ----- | ------- | --------------------------------- |
| startair_press         | float | bar     | Starting air pressure             |
| startair_temp_out      | float | °C      | Starting air outlet temperature   |
| chargeair_press        | float | bar     | Charge air pressure               |
| chargeair_temp         | float | °C      | Charge air temperature            |
| chargeair_press_ac_out | float | bar     | Charge air pressure after cooler  |
| chargeair_temp_ac_out  | float | °C      | Charge air temp after cooler      |
| air_temp               | float | °C      | Ambient air temperature           |
| rh                     | float | % × 100 | Relative humidity (5995 = 59.95%) |

#### Electrical System

| Field                                                | Type  | Unit    | Description                       |
| ---------------------------------------------------- | ----- | ------- | --------------------------------- |
| gen_voltage                                          | float | V       | Generator voltage                 |
| gen_freq                                             | float | Hz      | Generator frequency               |
| bus_voltage                                          | float | V       | Bus voltage                       |
| bus_freq                                             | float | Hz      | Bus frequency                     |
| phase_diff                                           | float | degrees | Phase difference                  |
| cos_phi                                              | float | -       | Power factor                      |
| load_kw                                              | float | kW      | Active power                      |
| kva                                                  | float | kVA     | Apparent power                    |
| kvar                                                 | float | kVAR    | Reactive power                    |
| i_u, i_v, i_w                                        | float | A       | Phase currents U, V, W            |
| v_uv, v_vw, v_uw                                     | float | V       | Line voltages                     |
| wind_u_temp_diff, wind_v_temp_diff, wind_w_temp_diff | float | °C      | Winding temperature differentials |

#### Other Systems

| Field               | Type    | Unit | Description                                       |
| ------------------- | ------- | ---- | ------------------------------------------------- |
| pw_flow             | float   | L/h  | Potable water flow                                |
| cargo_fo_flow       | float   | L/h  | Cargo fuel oil flow                               |
| thrust_current      | float   | A    | Thruster current                                  |
| thrust_servo_press  | float   | bar  | Thruster servo pressure                           |
| cpp_servo_press     | float   | bar  | CPP (Controllable Pitch Propeller) servo pressure |
| gearbox_servo_temp  | float   | °C   | Gearbox servo temperature                         |
| gearbox_servo_press | float   | bar  | Gearbox servo pressure                            |
| d_bear_temp         | float   | °C   | Drive end bearing temperature                     |
| n_bear_temp         | float   | °C   | Non-drive end bearing temperature                 |
| nu                  | integer | -    | Number of units                                   |
| standby_sequence    | integer | -    | Standby sequence number                           |

## How to Call the API

### Using cURL

```bash
# Replace <your_jwt_token> with your actual JWT token
# Replace 4 with your vessel ID

curl -X GET \
  'https://vship-api.perfomax.tech/api/vessels/4/latest-sensor-values' \
  -H 'Authorization: Bearer <your_jwt_token>' \
  -H 'Content-Type: application/json'
```

### Using JavaScript (Fetch API)

```javascript
const vesselId = 4;
const jwtToken = "your_jwt_token_here";

fetch(
  `https://vship-api.perfomax.tech/api/vessels/${vesselId}/latest-sensor-values`,
  {
    method: "GET",
    headers: {
      Authorization: `Bearer ${jwtToken}`,
      "Content-Type": "application/json",
    },
  },
)
  .then((response) => response.json())
  .then((data) => {
    console.log("Vessel:", data.vessel);
    console.log("Number of engines:", data.count);
    console.log("Latest sensor data:", data.data);

    // Access specific engine data
    data.data.forEach((engine) => {
      console.log(
        `${engine.asset_id}: RPM=${engine.rpm}, Load=${engine.load_kw}kW`,
      );
    });
  })
  .catch((error) => console.error("Error:", error));
```

### Using Python (requests library)

```python
import requests
import json

vessel_id = 4
jwt_token = 'your_jwt_token_here'

url = f'https://vship-api.perfomax.tech/api/vessels/{vessel_id}/latest-sensor-values'
headers = {
    'Authorization': f'Bearer {jwt_token}',
    'Content-Type': 'application/json'
}

response = requests.get(url, headers=headers)

if response.status_code == 200:
    data = response.json()
    print(f"Vessel: {data['vessel']['name']}")
    print(f"Number of engines: {data['count']}")

    for engine_data in data['data']:
        print(f"\n{engine_data['asset_id']}:")
        print(f"  Timestamp: {engine_data['timestamp']}")
        print(f"  RPM: {engine_data['rpm']}")
        print(f"  Load: {engine_data['load_kw']} kW")
        print(f"  EG Temp Mean: {engine_data['eg_temp_mean']} °C")
else:
    print(f"Error: {response.status_code}")
    print(response.json())
```

### Using Postman

1. Create a new GET request
2. Enter URL: `https://vship-api.perfomax.tech/api/vessels/4/latest-sensor-values`
3. Go to **Headers** tab
4. Add header:
   - Key: `Authorization`
   - Value: `Bearer <your_jwt_token>`
5. Click **Send**

## Caching

- The API response is cached for **30 seconds** to ensure near real-time data
- Cache key is based on vessel ID
- Cached responses include `X-Cache: HIT` header

## Rate Limiting

Standard API rate limits apply. Contact your administrator for specific limits.

## Notes

- All null values indicate sensors that are not installed or not reporting
- Timestamps are in ISO 8601 format (UTC)
- The API returns data for all assets (engines) that have reported data
- If a vessel has no sensor data, the `data` array will be empty with `count: 0`

## Support

For API access issues or questions, contact: support@perfomax.tech
