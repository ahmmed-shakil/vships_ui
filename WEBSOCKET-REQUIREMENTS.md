# WebSocket Server Requirements

## Overview

The frontend needs a **Socket.IO** WebSocket server to stream real-time engine telemetry data for the **Operation Overview** and **Real-Time Data** pages. The WebSocket should be served from the same Go backend (`ocean-pact-api.perfomax.tech`) that handles the REST APIs.

The frontend uses **Socket.IO v4** client (`socket.io-client@4.8.3`).

---

## Connection

| Property           | Value                                                           |
| ------------------ | --------------------------------------------------------------- |
| **URL**            | `wss://ocean-pact-api.perfomax.tech` (or a sub-path like `/ws`) |
| **Protocol**       | Socket.IO v4 (not raw WebSocket)                                |
| **Transport**      | WebSocket only (`transports: ['websocket']`)                    |
| **Authentication** | Send JWT access token on connection (see below)                 |
| **Reconnection**   | Client retries up to 5 times automatically                      |

### Authentication

The client will send the JWT access token (same one used for REST APIs) in the `auth` object on connection:

```js
io(SOCKET_URL, {
  transports: ['websocket'],
  reconnectionAttempts: 5,
  auth: {
    token: '<JWT access token>',
  },
});
```

The server should:

1. Validate the JWT on the `connection` event
2. Reject invalid/expired tokens with a `connect_error`
3. Optionally accept a `vessel_id` param to filter which vessel's engines to stream

---

## Events

The server should emit **two event types**: `ME` (Main Engine) and `AE` (Auxiliary Engine / Genset).

### Event: `ME` — Main Engine Telemetry

Emitted periodically (every 1–5 seconds) for each main engine of the connected vessel.

```jsonc
// Event name: "ME"
// One event per engine, per tick
{
  "engineId": "ME1", // UPPERCASE — "ME1", "ME2", "ME3" etc.
  "vessel_id": 7, // Which vessel this engine belongs to

  // Gauge data (required)
  "engine_rpm": 1167.5, // RPM (0–2400 range)
  "engine_load": 11.52, // Load percentage (0–100), aka FPI
  "fuel_cons": 28.35, // Fuel consumption in L/H (fo_flow_inlet - fo_flow_outlet)

  // Totals (required)
  "run_hrs_counter": 5077.1, // Cumulative running hours
  "total_fuel": 66.46, // Cumulative total fuel in M³

  // Detail / sensor data (required for engine detail view)
  "lubeoil_press": 4.2, // Lube oil pressure in **bar** (frontend converts to kPa ×100)
  "lubeoil_temp": 78.0, // Lube oil temperature in °C
  "coolant_press": 1.85, // Coolant pressure in **bar** (frontend converts to kPa ×100)
  "coolant_temp": 82.0, // Coolant temperature in °C
  "Batt_volt": 24.8, // Battery voltage in VDC (NOTE: capital "B")
  "exhgas_temp_left": 340.0, // Exhaust gas temp left bank in °C (avg of cylinders 1–4)
  "exhgas_temp_right": 345.0, // Exhaust gas temp right bank in °C (avg of cylinders 5–8)
}
```

### Event: `AE` — Auxiliary Engine (Genset) Telemetry

Same structure, emitted for each genset.

```jsonc
// Event name: "AE"
{
  "engineId": "AE1", // UPPERCASE — "AE1", "AE2" etc.
  "vessel_id": 7,

  "engine_rpm": 1800.0,
  "engine_load": 45.2,
  "fuel_cons": 12.5,

  "run_hrs_counter": 3200.5,
  "total_fuel": 42.1,

  "lubeoil_press": 3.8,
  "lubeoil_temp": 72.0,
  "coolant_press": 1.5,
  "coolant_temp": 78.0,
  "Batt_volt": 24.6,
  "exhgas_temp_left": 310.0,
  "exhgas_temp_right": 315.0,
}
```

---

## Field Reference

| Field               | Unit      | Source (DB column)               | Notes                                           |
| ------------------- | --------- | -------------------------------- | ----------------------------------------------- |
| `engineId`          | string    | `asset_id` mapping               | **UPPERCASE**: `me1` → `"ME1"`, `ae2` → `"AE2"` |
| `vessel_id`         | integer   | `vessel_id`                      | Vessel this engine belongs to                   |
| `engine_rpm`        | RPM       | `sensor_data.rpm`                | Direct reading                                  |
| `engine_load`       | % (0–100) | `sensor_data.fpi`                | Fuel rack position                              |
| `fuel_cons`         | L/H       | `fo_flow_inlet - fo_flow_outlet` | Computed                                        |
| `run_hrs_counter`   | hours     | `sensor_data.run_hrs_counter`    | Cumulative                                      |
| `total_fuel`        | M³        | `sensor_data.total_fuel`         | Cumulative                                      |
| `lubeoil_press`     | **bar**   | `sensor_data.lo_press`           | Frontend multiplies ×100 for kPa                |
| `lubeoil_temp`      | °C        | `sensor_data.lo_temp`            | Direct                                          |
| `coolant_press`     | **bar**   | `sensor_data.coolant_press`      | Frontend multiplies ×100 for kPa                |
| `coolant_temp`      | °C        | `sensor_data.coolant_temp`       | Direct                                          |
| `Batt_volt`         | VDC       | `sensor_data.batt_volt`          | **Capital "B"** — field name must match         |
| `exhgas_temp_left`  | °C        | AVG(`eg_temp_1`..`eg_temp_4`)    | Left bank average                               |
| `exhgas_temp_right` | °C        | AVG(`eg_temp_5`..`eg_temp_8`)    | Right bank average                              |

---

## Emission Frequency

| Scenario                   | Recommended Interval                    |
| -------------------------- | --------------------------------------- |
| Normal operation           | Every **2–3 seconds** per engine        |
| All engines for one vessel | All ME + AE events within the same tick |

Example for a vessel with 3 main engines + 2 gensets → 5 events per tick (every 2–3 seconds).

---

## Engine ID Mapping

The engine IDs must match what the `GET /api/engines?vessel_id={id}` endpoint returns, but **UPPERCASED**:

| API `value` | Socket `engineId` | Type        |
| ----------- | ----------------- | ----------- |
| `me1`       | `"ME1"`           | Main Engine |
| `me2`       | `"ME2"`           | Main Engine |
| `me3`       | `"ME3"`           | Main Engine |
| `ae1`       | `"AE1"`           | Genset      |
| `ae2`       | `"AE2"`           | Genset      |

---

## Go Socket.IO Libraries

Recommended Go Socket.IO server libraries:

1. **[googollee/go-socket.io](https://github.com/googollee/go-socket.io)** — Most popular, supports Socket.IO v4
2. **[zishang520/socket.io](https://github.com/zishang520/engine.io)** — Newer, closer to official Node.js API

### Minimal Server Pseudocode (Go)

```go
server := socketio.NewServer(nil)

server.OnConnect("/", func(s socketio.Conn) error {
    // Validate JWT from s.RemoteHeader() or auth payload
    // Get vessel_id from query or auth
    // Join room for that vessel
    s.Join(fmt.Sprintf("vessel_%d", vesselID))
    return nil
})

// Background goroutine: poll sensor_data table every 2-3 seconds
go func() {
    for {
        // Query latest sensor readings for active vessels
        // For each engine reading:
        server.BroadcastToRoom("/", roomName, "ME", engineData)
        // or "AE" for gensets

        time.Sleep(2 * time.Second)
    }
}()
```

---

## Summary

- **Protocol**: Socket.IO v4 over WebSocket
- **Events**: `ME` (main engines) and `AE` (gensets)
- **Key field**: `engineId` must be **UPPERCASE** (e.g., `"ME1"`, `"AE1"`)
- **Pressures**: Send in **bar** (frontend converts to kPa)
- **Frequency**: ~2–3 second intervals
- **Auth**: JWT token via Socket.IO `auth` object
