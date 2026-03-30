# Engines Status API Documentation

## Overview

This API endpoint returns the latest sensor readings and status for all engines (main engines and gensets) on a vessel. It provides real-time data including fuel flow meters, running hours, gauges, and detailed sensor parameters.

## Endpoint


GET /api/vessels/:id/engines


## Authentication

Requires JWT Bearer Token in the Authorization header.


Authorization: Bearer <your_jwt_token>


## Request Parameters

### Path Parameters

| Parameter | Type    | Required | Description   |
| --------- | ------- | -------- | ------------- |
| id        | integer | Yes      | The vessel ID |

### Example Request URL


GET https://vship-api.perfomax.tech/api/vessels/4/engines


## Response Format

### Success Response (200 OK)

json
{
  "main_engines": [
    {
      "id": "me1",
      "label": "Main Engine 1",
      "flowMeter": {
        "fm_in": 245.6,
        "fm_cons": 15.2,
        "fm_out": 230.4
      },
      "gauge": {
        "engine_rpm": 1800.5,
        "engine_load": 98.5,
        "fuel_cons": 15.2
      },
      "totals": {
        "total_fuel": 0,
        "running_hours": 5995.5
      },
      "detail": {
        "lubeoil_press": 4.2,
        "lubeoil_temp": 65.5,
        "coolant_press": 2.1,
        "coolant_temp": 82.3,
        "batt_volt": 440.2,
        "exhgas_temp_left": 388.5,
        "exhgas_temp_right": 389.8
      }
    }
  ],
  "gensets": [
    {
      "id": "dg1",
      "label": "DG1",
      "flowMeter": {
        "fm_in": 185.3,
        "fm_cons": 12.8,
        "fm_out": 172.5
      },
      "gauge": {
        "engine_rpm": 1500.0,
        "engine_load": 75.2,
        "fuel_cons": 12.8
      },
      "totals": {
        "total_fuel": 0,
        "running_hours": 8234.2
      },
      "detail": {
        "lubeoil_press": 3.8,
        "lubeoil_temp": 62.3,
        "coolant_press": 1.9,
        "coolant_temp": 78.5,
        "batt_volt": 440.5,
        "exhgas_temp_left": 385.2,
        "exhgas_temp_right": 387.1
      }
    },
    {
      "id": "dg2",
      "label": "DG2",
      "...": "... (similar structure)"
    }
  ]
}


### Error Responses

#### 400 Bad Request - Invalid Vessel ID

json
{
  "error": "invalid vessel ID"
}


#### 401 Unauthorized - Missing or Invalid Token

json
{
  "error": "unauthorized"
}


#### 500 Internal Server Error

json
{
  "error": "failed to load engine data"
}


## Response Fields Description

### Top-Level Structure

| Field        | Type  | Description                                        |
| ------------ | ----- | -------------------------------------------------- |
| main_engines | array | Array of main engine objects (ME1, ME2, etc.)      |
| gensets      | array | Array of diesel generator objects (DG1, DG2, etc.) |

### Engine/Genset Object

Each engine object contains the following properties:

| Field     | Type   | Description                                        |
| --------- | ------ | -------------------------------------------------- |
| id        | string | Engine identifier (lowercase: "dg1", "me1")        |
| label     | string | Engine display name (e.g., "DG1", "Main Engine 1") |
| flowMeter | object | Fuel flow meter readings                           |
| gauge     | object | Primary gauge values (RPM, load, consumption)      |
| totals    | object | Cumulative totals (fuel, running hours)            |
| detail    | object | Detailed sensor readings (optional)                |

### flowMeter Object

Fuel flow meter readings in *kg/h* (kilograms per hour):

| Field   | Type  | Unit | Description                                   |
| ------- | ----- | ---- | --------------------------------------------- |
| fm_in   | float | kg/h | Fuel flow inlet (from fo_flow_inlet sensor)   |
| fm_cons | float | kg/h | Fuel consumption (calculated: fm_in - fm_out) |
| fm_out  | float | kg/h | Fuel flow outlet/return (from fo_flow_outlet) |

*Note:* If sensor data is unavailable, all values will be 0.

### gauge Object

Primary engine status gauges:

| Field       | Type  | Unit | Description                                 |
| ----------- | ----- | ---- | ------------------------------------------- |
| engine_rpm  | float | rpm  | Engine speed (from rpm sensor)              |
| engine_load | float | bar  | Engine load/fuel pressure (from fpi sensor) |
| fuel_cons   | float | kg/h | Current fuel consumption (same as fm_cons)  |

### totals Object

Cumulative engine totals:

| Field         | Type  | Unit  | Description                                       |
| ------------- | ----- | ----- | ------------------------------------------------- |
| total_fuel    | float | m³    | Total fuel consumed (currently 0, future feature) |
| running_hours | float | hours | Total engine running hours (from rh sensor)       |

*Note:* total_fuel is currently 0 and requires historical data aggregation.

### detail Object (Optional)

Detailed sensor parameters. Only included if sensor readings are available:

| Field             | Type  | Unit | Description                              |
| ----------------- | ----- | ---- | ---------------------------------------- |
| lubeoil_press     | float | bar  | Lube oil pressure                        |
| lubeoil_temp      | float | °C   | Lube oil temperature                     |
| coolant_press     | float | bar  | Coolant pressure (HT cooling water)      |
| coolant_temp      | float | °C   | Coolant temperature (HT cooling water)   |
| batt_volt         | float | V    | Generator/battery voltage                |
| exhgas_temp_left  | float | °C   | Average exhaust gas temp (cylinders 1-4) |
| exhgas_temp_right | float | °C   | Average exhaust gas temp (cylinders 5-8) |

*Note:* If an engine has no sensor readings, the detail field will be null or omitted.

## Data Availability

- *Active engines with sensors:* Full data including flowMeter, gauge, totals, and detail
- *Active engines without current data:* Returns zeros for flowMeter and gauge, null for detail
- *Inactive engines:* Not included in the response

## How to Call the API

### Using cURL

bash
# Replace <your_jwt_token> with your actual JWT token
# Replace 4 with your vessel ID

curl -X GET \
  'https://vship-api.perfomax.tech/api/vessels/4/engines' \
  -H 'Authorization: Bearer <your_jwt_token>' \
  -H 'Content-Type: application/json'


### Using JavaScript (Fetch API)

javascript
const vesselId = 4;
const jwtToken = "your_jwt_token_here";

fetch(`https://vship-api.perfomax.tech/api/vessels/${vesselId}/engines`, {
  method: "GET",
  headers: {
    Authorization: `Bearer ${jwtToken}`,
    "Content-Type": "application/json",
  },
})
  .then((response) => response.json())
  .then((data) => {
    console.log("Main Engines:", data.main_engines);
    console.log("Gensets:", data.gensets);

    // Display genset fuel consumption
    data.gensets.forEach((genset) => {
      console.log(`${genset.label}:`);
      console.log(`  Fuel In: ${genset.flowMeter.fm_in} kg/h`);
      console.log(`  Fuel Consumption: ${genset.flowMeter.fm_cons} kg/h`);
      console.log(`  Running Hours: ${genset.totals.running_hours} h`);
      console.log(`  RPM: ${genset.gauge.engine_rpm}`);
    });
  })
  .catch((error) => console.error("Error:", error));


### Using React Hook Example

javascript
import { useState, useEffect } from "react";

function EngineStatus({ vesselId, jwtToken }) {
  const [engines, setEngines] = useState({ main_engines: [], gensets: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEngines = async () => {
      try {
        const response = await fetch(
          `https://vship-api.perfomax.tech/api/vessels/${vesselId}/engines`,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch engine data");
        }

        const data = await response.json();
        setEngines(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEngines();

    // Refresh every 30 seconds
    const interval = setInterval(fetchEngines, 30000);
    return () => clearInterval(interval);
  }, [vesselId, jwtToken]);

  if (loading) return <div>Loading engines...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Gensets</h2>
      {engines.gensets.map((genset) => (
        <div key={genset.id} className="engine-card">
          <h3>{genset.label}</h3>

          <div className="flow-meter">
            <h4>Fuel Flow</h4>
            <p>In: {genset.flowMeter.fm_in} kg/h</p>
            <p>Consumption: {genset.flowMeter.fm_cons} kg/h</p>
            <p>Out: {genset.flowMeter.fm_out} kg/h</p>
          </div>

          <div className="gauge">
            <h4>Status</h4>
            <p>RPM: {genset.gauge.engine_rpm}</p>
            <p>Load: {genset.gauge.engine_load} bar</p>
          </div>

          <div className="totals">
            <h4>Totals</h4>
            <p>Running Hours: {genset.totals.running_hours.toFixed(1)} h</p>
          </div>

          {genset.detail && (
            <div className="details">
              <h4>Details</h4>
              <p>
                Lube Oil: {genset.detail.lubeoil_press} bar,{" "}
                {genset.detail.lubeoil_temp}°C
              </p>
              <p>
                Coolant: {genset.detail.coolant_press} bar,{" "}
                {genset.detail.coolant_temp}°C
              </p>
              <p>
                Exhaust: L={genset.detail.exhgas_temp_left}°C, R=
                {genset.detail.exhgas_temp_right}°C
              </p>
            </div>
          )}
        </div>
      ))}

      <h2>Main Engines</h2>
      {engines.main_engines.map((engine) => (
        <div key={engine.id} className="engine-card">
          {/* Similar structure as gensets */}
        </div>
      ))}
    </div>
  );
}

export default EngineStatus;


### Using Python (requests library)

python
import requests
import json

vessel_id = 4
jwt_token = 'your_jwt_token_here'

url = f'https://vship-api.perfomax.tech/api/vessels/{vessel_id}/engines'
headers = {
    'Authorization': f'Bearer {jwt_token}',
    'Content-Type': 'application/json'
}

response = requests.get(url, headers=headers)

if response.status_code == 200:
    data = response.json()

    print("=== GENSETS ===")
    for genset in data['gensets']:
        print(f"\n{genset['label']}:")
        print(f"  Fuel In: {genset['flowMeter']['fm_in']} kg/h")
        print(f"  Fuel Consumption: {genset['flowMeter']['fm_cons']} kg/h")
        print(f"  Fuel Out: {genset['flowMeter']['fm_out']} kg/h")
        print(f"  Running Hours: {genset['totals']['running_hours']} h")
        print(f"  RPM: {genset['gauge']['engine_rpm']}")
        print(f"  Load: {genset['gauge']['engine_load']} bar")

        if genset.get('detail'):
            print(f"  Lube Oil: {genset['detail']['lubeoil_press']} bar, {genset['detail']['lubeoil_temp']}°C")
            print(f"  Exhaust: L={genset['detail']['exhgas_temp_left']}°C, R={genset['detail']['exhgas_temp_right']}°C")

    print("\n=== MAIN ENGINES ===")
    for engine in data['main_engines']:
        print(f"\n{engine['label']}:")
        print(f"  Fuel Consumption: {engine['flowMeter']['fm_cons']} kg/h")
        print(f"  Running Hours: {engine['totals']['running_hours']} h")
        print(f"  RPM: {engine['gauge']['engine_rpm']}")
else:
    print(f"Error: {response.status_code}")
    print(response.json())


### Using Postman

1. Create a new GET request
2. Enter URL: https://vship-api.perfomax.tech/api/vessels/4/engines
3. Go to *Headers* tab
4. Add header:
   - Key: Authorization
   - Value: Bearer <your_jwt_token>
5. Click *Send*

## Real-Time Updates

For real-time updates in your frontend:

javascript
// Polling approach (recommended for REST API)
const EngineMonitor = ({ vesselId, jwtToken }) => {
  const [engines, setEngines] = useState(null);

  useEffect(() => {
    const fetchEngines = async () => {
      const response = await fetch(
        `https://vship-api.perfomax.tech/api/vessels/${vesselId}/engines`,
        { headers: { Authorization: `Bearer ${jwtToken}` } },
      );
      const data = await response.json();
      setEngines(data);
    };

    // Initial fetch
    fetchEngines();

    // Poll every 30 seconds
    const interval = setInterval(fetchEngines, 30000);

    return () => clearInterval(interval);
  }, [vesselId, jwtToken]);

  return engines ? <EngineDisplay data={engines} /> : <Loading />;
};


## Display Components Example

### Fuel Flow Meter Component

jsx
function FuelFlowMeter({ flowMeter }) {
  return (
    <div className="fuel-flow-meter">
      <div className="flow-bar">
        <div className="flow-in" style={{ width: `${flowMeter.fm_in}px` }}>
          <span>IN: {flowMeter.fm_in} kg/h</span>
        </div>
      </div>
      <div className="flow-consumption">
        <strong>Consumption: {flowMeter.fm_cons} kg/h</strong>
      </div>
      <div className="flow-bar">
        <div className="flow-out" style={{ width: `${flowMeter.fm_out}px` }}>
          <span>OUT: {flowMeter.fm_out} kg/h</span>
        </div>
      </div>
    </div>
  );
}


### Running Hours Display

jsx
function RunningHours({ hours }) {
  const formatHours = (h) => {
    const wholeHours = Math.floor(h);
    const minutes = Math.round((h - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  return (
    <div className="running-hours">
      <span className="hours-value">{hours.toFixed(1)}</span>
      <span className="hours-label">hours</span>
      <span className="hours-formatted">{formatHours(hours)}</span>
    </div>
  );
}


## Unit Conversions

### Fuel Flow (kg/h to L/h)

To convert fuel flow from kg/h to L/h, divide by fuel density:

javascript
// Assuming diesel density ≈ 0.85 kg/L
const fuelFlowLitersPerHour = fuelFlowKgPerHour / 0.85;

// Example:
const fm_cons_kg = 185.3; // kg/h
const fm_cons_liters = fm_cons_kg / 0.85; // ≈ 218 L/h


### Running Hours Display

javascript
function formatRunningHours(hours) {
  if (hours < 24) {
    return `${hours.toFixed(1)} hours`;
  } else if (hours < 8760) {
    const days = (hours / 24).toFixed(1);
    return `${days} days`;
  } else {
    const years = (hours / 8760).toFixed(2);
    return `${years} years`;
  }
}


## Caching

- The API response is cached for *30 seconds* for near real-time performance
- Cache key is based on vessel ID
- Poll the API every 30-60 seconds for updates

## Data Validation

When consuming this API in your frontend, validate the data:

javascript
function validateEngineData(engine) {
  // Check for sensor availability
  const hasSensorData =
    engine.flowMeter.fm_in !== 0 || engine.gauge.engine_rpm !== 0;

  // Validate running hours (should be positive)
  const runningHours = engine.totals.running_hours;
  const isValidRH = runningHours >= 0 && runningHours < 1000000;

  // Validate fuel consumption (should be reasonable)
  const fuelCons = engine.flowMeter.fm_cons;
  const isValidFC = fuelCons >= 0 && fuelCons < 10000;

  return {
    hasSensorData,
    isValidRH,
    isValidFC,
    isValid: hasSensorData && isValidRH && isValidFC,
  };
}


## Error Handling Best Practices

javascript
async function fetchEngineData(vesselId, jwtToken) {
  try {
    const response = await fetch(
      `https://vship-api.perfomax.tech/api/vessels/${vesselId}/engines`,
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (response.status === 401) {
      // Token expired - redirect to login
      window.location.href = "/login";
      return null;
    }

    if (response.status === 400) {
      throw new Error("Invalid vessel ID");
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Validate data structure
    if (!data.gensets || !data.main_engines) {
      throw new Error("Invalid response format");
    }

    return data;
  } catch (error) {
    console.error("Failed to fetch engine data:", error);
    // Show user-friendly error message
    return null;
  }
}


## Notes

- All null values indicate sensors that are not installed or not reporting
- The API returns data for all active engines configured for the vessel
- If an engine has no sensor data, it will still appear in the response with zero/null values
- total_fuel is currently always 0 - this is a planned feature for historical aggregation
- Running hours (rh) may be null if the sensor is not installed on that engine
- Fuel flow values are in *kg/h* (kilograms per hour), not liters
- Times are relative to the latest sensor reading for each engine

## Related APIs

- *[Latest Sensor Values API](./LATEST_SENSOR_VALUES_API.md)* - Detailed sensor values for all engines
- *Consumption vs Speed API* - Fuel consumption correlation with vessel speed
- *Machinery Status WebSocket* - Real-time streaming updates

## Support

For API access issues or questions, contact: support@perfomax.tech