# WebSocket Telemetry Fields Mapping Guide

## Overview

This guide shows all fields available in the WebSocket telemetry payload and how to map them to UI components for diesel generators (DG1-DG6).

## WebSocket Event

Listen to the *"DG"* event for diesel generators:

javascript
socket.on("DG", (data) => {
  // data contains all fields below
  console.log(data);
});


## Available Fields & UI Mapping

### Complete Payload Structure

javascript
{
  "engineId": "DG1",           // Engine identifier
  "vessel_id": 4,              // Vessel ID
  "engine_rpm": 750.5,         // Engine speed in RPM
  "engine_load": 43.2,         // Fuel pressure / Load in bar
  "fuel_cons": 301.5,          // Fuel consumption in L/h
  "run_hrs_counter": 0,        // Running hours (currently 0 - future feature)
  "total_fuel": 0,             // Total fuel consumed (currently 0 - future feature)
  "lubeoil_press": 4.2,        // Lube oil pressure in bar
  "lubeoil_temp": 65.5,        // Lube oil temperature in °C
  "coolant_press": 2.1,        // Coolant pressure in bar
  "coolant_temp": 82.3,        // Coolant temperature in °C
  "Batt_volt": 440.2,          // Generator/battery voltage in V
  "exhgas_temp_left": 354.2,   // Avg exhaust temp cylinders 1-4 in °C
  "exhgas_temp_right": 358.1   // Avg exhaust temp cylinders 5-8 in °C
}


## Field-by-Field Mapping

### 1. Engine Identification

| Field       | Type   | Description       | UI Label          | Example             |
| ----------- | ------ | ----------------- | ----------------- | ------------------- |
| engineId  | string | Engine identifier | "Engine", "DG ID" | "DG1", "DG2", "DG6" |
| vessel_id | number | Vessel ID         | (hidden/internal) | 4                   |

*UI Usage:*

javascript
<h3>{data.engineId}</h3>
// or
<div className="engine-name">Diesel Generator {data.engineId}</div>


---

### 2. Primary Gauges (Main Dashboard)

| Field         | Type   | Unit | Description         | UI Label                        | Display Range | Color Coding                            |
| ------------- | ------ | ---- | ------------------- | ------------------------------- | ------------- | --------------------------------------- |
| engine_rpm  | number | rpm  | Engine speed        | "RPM", "Engine Speed"           | 0-2000        | Green: >600, Yellow: 300-600, Red: <300 |
| engine_load | number | bar  | Fuel pressure (FPI) | "Load", "Fuel Pressure"         | 0-100         | Green: <80, Yellow: 80-90, Red: >90     |
| fuel_cons   | number | L/h  | Fuel consumption    | "Fuel Consumption", "Fuel Rate" | 0-500         | Normal display                          |

*UI Usage:*

javascript
// Gauge Component
<Gauge
  value={data.engine_rpm}
  max={2000}
  unit="RPM"
  label="Engine Speed"
/>

<Gauge
  value={data.engine_load}
  max={100}
  unit="bar"
  label="Fuel Pressure"
/>

<Gauge
  value={data.fuel_cons.toFixed(1)}
  max={500}
  unit="L/h"
  label="Fuel Consumption"
/>


---

### 3. Lube Oil System

| Field           | Type   | Unit | Description          | UI Label                        | Normal Range | Alert Threshold       |
| --------------- | ------ | ---- | -------------------- | ------------------------------- | ------------ | --------------------- |
| lubeoil_press | number | bar  | Lube oil pressure    | "Lube Oil Pressure", "LO Press" | 3-5 bar      | <2.5 (low), >6 (high) |
| lubeoil_temp  | number | °C   | Lube oil temperature | "Lube Oil Temp", "LO Temp"      | 60-75°C      | <50 (low), >85 (high) |

*UI Usage:*

javascript
// Status Card
<div className="lube-oil-system">
  <h4>Lube Oil System</h4>
  <StatusItem
    label="Pressure"
    value={data.lubeoil_press.toFixed(1)}
    unit="bar"
    status={getLubeOilPressStatus(data.lubeoil_press)}
  />
  <StatusItem
    label="Temperature"
    value={data.lubeoil_temp.toFixed(1)}
    unit="°C"
    status={getLubeOilTempStatus(data.lubeoil_temp)}
  />
</div>;

// Helper functions
function getLubeOilPressStatus(pressure) {
  if (pressure < 2.5) return "critical";
  if (pressure < 3.0 || pressure > 6.0) return "warning";
  return "normal";
}

function getLubeOilTempStatus(temp) {
  if (temp < 50 || temp > 85) return "critical";
  if (temp < 55 || temp > 80) return "warning";
  return "normal";
}


---

### 4. Cooling System

| Field           | Type   | Unit | Description               | UI Label                          | Normal Range | Alert Threshold         |
| --------------- | ------ | ---- | ------------------------- | --------------------------------- | ------------ | ----------------------- |
| coolant_press | number | bar  | HT cooling water pressure | "Coolant Pressure", "HT CW Press" | 1.5-2.5 bar  | <1.0 (low), >3.0 (high) |
| coolant_temp  | number | °C   | HT cooling water temp     | "Coolant Temp", "HT CW Temp"      | 75-85°C      | <65 (low), >90 (high)   |

*UI Usage:*

javascript
// Cooling System Display
<div className="cooling-system">
  <h4>Cooling System</h4>
  <div className="cooling-gauge">
    <CircularGauge
      value={data.coolant_temp}
      min={0}
      max={110}
      zones={[
        { from: 0, to: 65, color: "#3498db" }, // Too cold - blue
        { from: 65, to: 75, color: "#2ecc71" }, // Normal - green
        { from: 75, to: 90, color: "#2ecc71" }, // Normal - green
        { from: 90, to: 110, color: "#e74c3c" }, // Too hot - red
      ]}
    />
    <p>{data.coolant_temp.toFixed(1)}°C</p>
  </div>
  <p>Pressure: {data.coolant_press.toFixed(2)} bar</p>
</div>


---

### 5. Electrical System

| Field       | Type   | Unit | Description       | UI Label                 | Normal Range | Display Format  |
| ----------- | ------ | ---- | ----------------- | ------------------------ | ------------ | --------------- |
| Batt_volt | number | V    | Generator voltage | "Voltage", "Gen Voltage" | 400-480V     | 1 decimal place |

*UI Usage:*

javascript
// Voltage Display
<div className="electrical">
  <h4>Electrical</h4>
  <div className="voltage-display">
    <span className="voltage-value">{data.Batt_volt.toFixed(1)}</span>
    <span className="voltage-unit">V</span>
  </div>
  <div className={`voltage-status ${getVoltageStatus(data.Batt_volt)}`}>
    {getVoltageStatusText(data.Batt_volt)}
  </div>
</div>;

function getVoltageStatus(volt) {
  if (volt < 380 || volt > 500) return "critical";
  if (volt < 400 || volt > 480) return "warning";
  return "normal";
}

function getVoltageStatusText(volt) {
  if (volt < 380) return "Voltage Too Low";
  if (volt > 500) return "Voltage Too High";
  if (volt >= 400 && volt <= 480) return "Normal";
  return "Check Voltage";
}


---

### 6. Exhaust Gas Temperature

| Field               | Type   | Unit | Description                | UI Label                       | Normal Range | Alert Threshold         |
| ------------------- | ------ | ---- | -------------------------- | ------------------------------ | ------------ | ----------------------- |
| exhgas_temp_left  | number | °C   | Average temp cylinders 1-4 | "EG Temp Left", "Bank A Temp"  | 300-420°C    | <250 (low), >450 (high) |
| exhgas_temp_right | number | °C   | Average temp cylinders 5-8 | "EG Temp Right", "Bank B Temp" | 300-420°C    | <250 (low), >450 (high) |

*UI Usage:*

javascript
// Exhaust Temperature Banks
<div className="exhaust-temps">
  <h4>Exhaust Gas Temperature</h4>

  <div className="temp-bank">
    <label>Bank A (Cyl 1-4)</label>
    <TempBar
      value={data.exhgas_temp_left}
      max={500}
      label="Left"
      color={getExhaustTempColor(data.exhgas_temp_left)}
    />
    <span>{data.exhgas_temp_left.toFixed(0)}°C</span>
  </div>

  <div className="temp-bank">
    <label>Bank B (Cyl 5-8)</label>
    <TempBar
      value={data.exhgas_temp_right}
      max={500}
      label="Right"
      color={getExhaustTempColor(data.exhgas_temp_right)}
    />
    <span>{data.exhgas_temp_right.toFixed(0)}°C</span>
  </div>

  <div className="temp-difference">
    <label>Difference:</label>
    <span>
      {Math.abs(data.exhgas_temp_left - data.exhgas_temp_right).toFixed(1)}°C
    </span>
  </div>
</div>;

function getExhaustTempColor(temp) {
  if (temp < 250 || temp > 450) return "#e74c3c"; // Red - critical
  if (temp < 280 || temp > 420) return "#f39c12"; // Orange - warning
  return "#2ecc71"; // Green - normal
}


---

### 7. Counters (Future Features)

| Field             | Type   | Unit  | Description         | UI Label                        | Current Value | Notes                     |
| ----------------- | ------ | ----- | ------------------- | ------------------------------- | ------------- | ------------------------- |
| run_hrs_counter | number | hours | Running hours       | "Running Hours", "Op Hours"     | Always 0      | Will be implemented later |
| total_fuel      | number | m³    | Total fuel consumed | "Total Fuel", "Cumulative Fuel" | Always 0      | Will be implemented later |

*UI Usage (Placeholder):*

javascript
// Show as "Not Available" for now
<div className="counters">
  <div className="counter">
    <label>Running Hours:</label>
    <span className="not-available">N/A</span>
    <span className="note">Coming soon</span>
  </div>
  <div className="counter">
    <label>Total Fuel:</label>
    <span className="not-available">N/A</span>
    <span className="note">Coming soon</span>
  </div>
</div>


---

## Complete React Component Example

javascript
import React from "react";
import "./EngineCard.css";

function EngineCard({ data }) {
  // Status helper functions
  const getRpmStatus = (rpm) => {
    if (rpm < 300) return "critical";
    if (rpm < 600) return "warning";
    return "normal";
  };

  const getLoadStatus = (load) => {
    if (load > 90) return "critical";
    if (load > 80) return "warning";
    return "normal";
  };

  return (
    <div className="engine-card">
      {/* Header */}
      <div className="engine-header">
        <h3>{data.engineId}</h3>
        <span className={`status-badge ${getRpmStatus(data.engine_rpm)}`}>
          {data.engine_rpm > 600 ? "Running" : "Idle"}
        </span>
      </div>

      {/* Main Gauges */}
      <div className="main-gauges">
        <div className="gauge">
          <div className="gauge-label">RPM</div>
          <div className={`gauge-value ${getRpmStatus(data.engine_rpm)}`}>
            {data.engine_rpm.toFixed(0)}
          </div>
          <div className="gauge-unit">rpm</div>
        </div>

        <div className="gauge">
          <div className="gauge-label">Load</div>
          <div className={`gauge-value ${getLoadStatus(data.engine_load)}`}>
            {data.engine_load.toFixed(1)}
          </div>
          <div className="gauge-unit">bar</div>
        </div>

        <div className="gauge">
          <div className="gauge-label">Fuel Consumption</div>
          <div className="gauge-value">{data.fuel_cons.toFixed(1)}</div>
          <div className="gauge-unit">L/h</div>
        </div>
      </div>

      {/* Systems Overview */}
      <div className="systems-grid">
        {/* Lube Oil */}
        <div className="system-card">
          <h4>Lube Oil</h4>
          <div className="system-row">
            <span>Pressure:</span>
            <span>{data.lubeoil_press.toFixed(2)} bar</span>
          </div>
          <div className="system-row">
            <span>Temperature:</span>
            <span>{data.lubeoil_temp.toFixed(1)} °C</span>
          </div>
        </div>

        {/* Cooling */}
        <div className="system-card">
          <h4>Cooling</h4>
          <div className="system-row">
            <span>Pressure:</span>
            <span>{data.coolant_press.toFixed(2)} bar</span>
          </div>
          <div className="system-row">
            <span>Temperature:</span>
            <span>{data.coolant_temp.toFixed(1)} °C</span>
          </div>
        </div>

        {/* Electrical */}
        <div className="system-card">
          <h4>Electrical</h4>
          <div className="system-row">
            <span>Voltage:</span>
            <span>{data.Batt_volt.toFixed(1)} V</span>
          </div>
        </div>

        {/* Exhaust */}
        <div className="system-card">
          <h4>Exhaust Temp</h4>
          <div className="system-row">
            <span>Bank A (1-4):</span>
            <span>{data.exhgas_temp_left.toFixed(0)} °C</span>
          </div>
          <div className="system-row">
            <span>Bank B (5-8):</span>
            <span>{data.exhgas_temp_right.toFixed(0)} °C</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EngineCard;


---

## Complete Dashboard Example

javascript
import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import EngineCard from "./EngineCard";

function EngineDashboard({ vesselId, jwtToken }) {
  const [engines, setEngines] = useState({});
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Connect to WebSocket
    const socket = io("wss://vship-api.perfomax.tech", {
      transports: ["websocket"],
      query: {
        token: jwtToken,
        vessel_id: vesselId,
      },
    });

    socket.on("connect", () => {
      setConnected(true);
      console.log("WebSocket connected");
    });

    socket.on("disconnect", () => {
      setConnected(false);
      console.log("WebSocket disconnected");
    });

    // Listen for DG events (DG1-DG6)
    socket.on("DG", (data) => {
      console.log("Received engine data:", data);
      setEngines((prev) => ({
        ...prev,
        [data.engineId]: data,
      }));
    });

    // Cleanup on unmount
    return () => {
      socket.close();
    };
  }, [vesselId, jwtToken]);

  return (
    <div className="engine-dashboard">
      <div className="dashboard-header">
        <h1>Diesel Generators - Vessel {vesselId}</h1>
        <div
          className={`connection-status ${connected ? "connected" : "disconnected"}`}
        >
          {connected ? "🟢 Connected" : "🔴 Disconnected"}
        </div>
      </div>

      <div className="engines-grid">
        {Object.values(engines).map((engineData) => (
          <EngineCard key={engineData.engineId} data={engineData} />
        ))}
      </div>

      {Object.keys(engines).length === 0 && (
        <div className="no-data">
          <p>Waiting for engine data...</p>
        </div>
      )}
    </div>
  );
}

export default EngineDashboard;


---

## Sample CSS Styling

css
.engine-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.engine-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 2px solid #ecf0f1;
  padding-bottom: 10px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.status-badge.normal {
  background: #2ecc71;
  color: white;
}

.status-badge.warning {
  background: #f39c12;
  color: white;
}

.status-badge.critical {
  background: #e74c3c;
  color: white;
}

.main-gauges {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.gauge {
  text-align: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.gauge-label {
  font-size: 12px;
  color: #7f8c8d;
  margin-bottom: 5px;
}

.gauge-value {
  font-size: 32px;
  font-weight: bold;
  color: #2c3e50;
}

.gauge-value.normal {
  color: #2ecc71;
}

.gauge-value.warning {
  color: #f39c12;
}

.gauge-value.critical {
  color: #e74c3c;
}

.gauge-unit {
  font-size: 14px;
  color: #95a5a6;
}

.systems-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.system-card {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
}

.system-card h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #7f8c8d;
}

.system-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 13px;
}

.system-row span:first-child {
  color: #7f8c8d;
}

.system-row span:last-child {
  font-weight: bold;
  color: #2c3e50;
}


---

## Data Update Frequency

- *WebSocket broadcasts:* Every *3 seconds*
- *Data freshness:* Only engines with data in the last *10 minutes*
- *Real-time:* True push-based updates

---

## Null/Zero Value Handling

javascript
function safeDisplay(value, decimals = 1, defaultText = "N/A") {
  if (value === null || value === undefined || value === 0) {
    return defaultText;
  }
  return value.toFixed(decimals);
}

// Usage
<span>{safeDisplay(data.lubeoil_press, 2, "--")}</span>;


---

## Related Documentation

- *[ENGINES_STATUS_API.md](./ENGINES_STATUS_API.md)* - REST API for engine status
- *[LATEST_SENSOR_VALUES_API.md](./LATEST_SENSOR_VALUES_API.md)* - Detailed sensor values