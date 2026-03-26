# Perfomax — API Requirements & Response Structures

> This document covers **every API endpoint** required for the **Login**, **Fleet Overview**, **Operation Overview**, and **Real Time Data** pages, including **global state** managed in the **Helium header**.

---

## Table of Contents

1. [Global State (Helium Header)](#1-global-state-helium-header)
2. [Login / Authentication](#2-login--authentication)
3. [Fleet Overview](#3-fleet-overview)
4. [Operation Overview](#4-operation-overview)
5. [Real Time Data](#5-real-time-data)
6. [WebSocket — Live Engine Telemetry](#6-websocket--live-engine-telemetry)

---

## 1. Global State (Helium Header)

The Helium layout header (`src/layouts/helium/helium-header.tsx`) renders **page-specific selectors** based on the current route and manages global Jotai atoms consumed by all pages.

### 1.1 Header Components

| Component                          | Route(s)                          | Selectors Rendered                                                                                 |
| ---------------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------- |
| Breadcrumb                         | All pages                         | Auto-generated from URL path                                                                       |
| ProfileMenu                        | All pages                         | User avatar, name, email, sign-out                                                                 |
| OperationOverviewHeaderSelectors   | `/operation-overview`             | Vessel selector                                                                                    |
| RealTimeDataHeaderSelectors        | `/real-time-data`                 | Vessel selector, Engine selector                                                                   |
| ConditionMonitoringHeaderSelectors | `/machinery/condition-monitoring` | Vessel selector (disabled), Engine selector, Time range (1h/1d/7d/1m/3m/Custom), Date range picker |
| MachineryOverviewHeaderSelectors   | `/machinery/machinery-overview`   | Vessel selector, Time range selector (24h/7d/30d/90d)                                              |
| AlarmOverviewHeaderSelectors       | `/machinery/alarm-overview`       | Vessel selector, Engine selector                                                                   |

### 1.2 Global Jotai Atoms (Shared State)

These atoms are set in the header and consumed by page components:

| Atom                          | Type                           | Default                                 | Used By                                              |
| ----------------------------- | ------------------------------ | --------------------------------------- | ---------------------------------------------------- |
| `selectedShipAtom`            | `Ship`                         | `shipData[0]` (Ocean Voyager)           | All pages (vessel selection)                         |
| `selectedEngineAtom`          | `{ label, value }`             | `{ label: 'All Engine', value: 'all' }` | Real Time Data, Alarm Overview, Condition Monitoring |
| `selectedTimeAtom`            | `string`                       | `'3m'`                                  | Condition Monitoring                                 |
| `dateRangeAtom`               | `[Date \| null, Date \| null]` | `[null, null]`                          | Condition Monitoring (custom time)                   |
| `selectedMachineryShipAtom`   | `Ship` (persisted)             | `shipData[0]`                           | Machinery Overview                                   |
| `selectedMachineryEngineAtom` | `{label, value}` (persisted)   | `engineData[0]`                         | Machinery Overview                                   |

### 1.3 APIs Required for Header

#### `GET /api/vessels` — Vessel List (for all dropdowns)

Populates the vessel selector dropdown across all pages.

**Response:**

```json
{
  "vessels": [
    {
      "id": 1,
      "label": "Ocean Voyager",
      "value": "ocean-voyager",
      "engines": ["ME PORT", "ME STBD", "ME CENTER"],
      "position": {
        "lat": 25.5,
        "long": -93.0,
        "direction": 45,
        "timestamp": 1742900400
      }
    },
    {
      "id": 2,
      "label": "Sea Explorer",
      "value": "sea-explorer",
      "engines": ["ME PORT", "ME STBD"],
      "position": {
        "lat": 36.0,
        "long": 20.0,
        "direction": 120,
        "timestamp": 1742899620
      }
    }
  ]
}
```

**TypeScript Interface:**

```ts
interface ShipPosition {
  lat: number;
  long: number;
  direction: number; // Heading in degrees (0–360)
  timestamp: number; // Unix timestamp in SECONDS
}

interface Ship {
  id: number;
  label: string; // Display name
  value: string; // URL-friendly slug
  engines: string[]; // Engine labels: "ME PORT", "ME STBD", "ME CENTER", "AUX 1", etc.
  position: ShipPosition;
}
```

#### `GET /api/engines` — Engine Options List

Populates the engine selector dropdown.

**Response:**

```json
{
  "engines": [
    { "label": "All Engine", "value": "all" },
    { "label": "ME Port", "value": "me1" },
    { "label": "ME Stbd", "value": "me2" },
    { "label": "ME Center", "value": "me3" },
    { "label": "Genset 1", "value": "ae1" },
    { "label": "Genset 2", "value": "ae2" }
  ]
}
```

#### `GET /api/user/profile` — Current User Profile (ProfileMenu)

Used by the ProfileMenu dropdown in the header.

**Response:**

```json
{
  "id": "1",
  "name": "John Doe",
  "email": "john@perfomax.com",
  "avatar": "/user.jpg",
  "role": "Administrator"
}
```

#### `GET /api/notifications` — Notifications List (NotificationDropdown — currently commented out)

**Response:**

```json
{
  "notifications": [
    {
      "id": "1",
      "name": "High exhaust gas temperature",
      "icon": "warning",
      "unRead": true,
      "sendTime": "2026-03-25T10:30:00Z"
    },
    {
      "id": "2",
      "name": "Maintenance completed",
      "icon": "success",
      "unRead": false,
      "sendTime": "2026-03-24T08:00:00Z"
    }
  ]
}
```

---

## 2. Login / Authentication

### 2.1 Page Components

| Component        | Description                              |
| ---------------- | ---------------------------------------- |
| `SignInForm`     | Email + Password form with "Remember Me" |
| `AuthWrapperOne` | Layout wrapper with branding image       |

### 2.2 APIs Required

#### `POST /api/auth/callback/credentials` — NextAuth Credentials Sign-In

This is the NextAuth built-in endpoint. The sign-in form calls `signIn('credentials', { email, password, redirect: false })`.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "redirect": false,
  "csrfToken": "<auto-generated>"
}
```

**Success Response (NextAuth internal):**

```json
{
  "error": null,
  "status": 200,
  "ok": true,
  "url": "http://localhost:3000"
}
```

**Error Response:**

```json
{
  "error": "CredentialsSignin",
  "status": 401,
  "ok": false,
  "url": null
}
```

#### `POST /api/auth/login` — Custom Login API (Recommended Replacement)

Replace the hardcoded UAT credentials in `auth-options.ts` with a real API call.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Success Response:**

```json
{
  "success": true,
  "user": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "Administrator",
    "avatar": "/user.jpg"
  },
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "dGhpcyBpcyBh..."
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

**Validation Schema (Zod — `src/validators/login.schema.ts`):**

```ts
interface LoginSchema {
  email: string; // Required, valid email format
  password: string; // Required
  rememberMe: boolean; // Optional
}
```

#### `GET /api/auth/session` — Session Check (NextAuth built-in)

Used by middleware and `SessionProvider` to check authentication status.

**Response (Authenticated):**

```json
{
  "user": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "image": null
  },
  "expires": "2026-04-24T10:00:00.000Z"
}
```

**Response (Unauthenticated):**

```json
{}
```

#### `POST /api/auth/signout` — Sign Out (NextAuth built-in)

Invalidates the session/JWT.

### 2.3 Middleware Auth Flow

| Condition                             | Action                                       |
| ------------------------------------- | -------------------------------------------- |
| Unauthenticated + any protected route | Redirect to `/signin?callbackUrl=<original>` |
| Authenticated + `/signin`             | Redirect to `/fleet-overview`                |
| Authenticated + `/`                   | Redirect to `/fleet-overview`                |
| Authenticated + protected route       | Allow through                                |

---

## 3. Fleet Overview

### 3.1 Page Components

| Component             | Description                                                   |
| --------------------- | ------------------------------------------------------------- |
| `FleetOverviewLayout` | Main layout — toggles between VesselMap and WindyMap          |
| `VesselMap`           | Leaflet map with vessel markers, emission zones, alarm badges |
| `WindyMap`            | Windy weather API map with vessel overlays                    |
| `MapLoadingSpinner`   | Loading overlay shown every 10s during map refresh            |

### 3.2 APIs Required

#### `GET /api/fleet/vessels` — All Vessel Positions & Status

Main data source for the fleet map. Refreshes every **10 seconds**.

**Response:**

```json
{
  "vessels": [
    {
      "vessel_id": 7,
      "name": "Aurora Spirit",
      "position": {
        "lat": 58.5,
        "long": 2.5,
        "direction": 135,
        "timestamp": 1742900340
      },
      "position_status": "Producing",
      "online": 1742900340,
      "me1": 1742900280,
      "me2": 1742900340,
      "me3": 1742885340,
      "ae1": 1742900340,
      "ae2": 1742882340
    },
    {
      "vessel_id": 1,
      "name": "Ocean Voyager",
      "position": {
        "lat": 25.5,
        "long": -93.0,
        "direction": 45,
        "timestamp": 1742900280
      },
      "position_status": "Operation",
      "online": 1742900280,
      "me1": 1742900220,
      "me2": 1742900280,
      "me3": 1742885280,
      "ae1": 1742900280,
      "ae2": 1742882280
    }
  ]
}
```

**TypeScript Interface:**

```ts
interface FleetVessel {
  vessel_id: number;
  name: string;
  position: {
    lat: number;
    long: number;
    direction: number; // Heading degrees (0–360)
    timestamp: number; // Unix timestamp in SECONDS
  };
  position_status: string; // "Producing" | "Operation" | "Supply Run" | "Anchor Handling" | "Drilling" | "Offloading" | "Maintenance" | "Standby" | "Seismic Survey" | "Emergency Ready"
  online: number; // Last online timestamp (Unix seconds)
  me1: number; // ME Port last data timestamp (Unix seconds)
  me2: number; // ME Stbd last data timestamp (Unix seconds)
  me3: number; // ME Center last data timestamp (Unix seconds)
  ae1: number; // Genset 1 last data timestamp (Unix seconds)
  ae2: number; // Genset 2 last data timestamp (Unix seconds)
}
```

**Color Coding Logic (client-side):**
| Condition | Color | Meaning |
|---|---|---|
| `now - timestamp < 5 min` | `#4ade80` (Green) | Recent / Healthy |
| `5 min ≤ diff < 3 hours` | `#facc15` (Yellow) | Warning / Delayed |
| `diff ≥ 3 hours` | `#f87171` (Red) | Alert / Stale |

#### `GET /api/fleet/vessels/{vesselId}/alarms` — Vessel Alarm Summary

Displayed in the vessel popup on map hover.

**Response:**

```json
{
  "vessel_id": 1,
  "alarms": [
    {
      "id": "a1-01",
      "timestamp": 1742900160000,
      "alarm_text": "High coolant temperature",
      "engine": "ME PORT",
      "value": 98,
      "threshold_min": null,
      "threshold_max": 95,
      "severity": 1,
      "status": "active",
      "category": "critical"
    },
    {
      "id": "a1-02",
      "timestamp": 1742899560000,
      "alarm_text": "Low lube oil pressure",
      "engine": "ME STBD",
      "value": 180,
      "threshold_min": 200,
      "threshold_max": null,
      "severity": 1,
      "status": "active",
      "category": "critical"
    }
  ]
}
```

**TypeScript Interface:**

```ts
type AlarmCategory = 'critical' | 'warning' | 'notice' | 'info';

interface AlarmEntry {
  id: string;
  timestamp: number; // Unix timestamp in MILLISECONDS
  alarm_text: string; // e.g., "High coolant temperature"
  engine: string; // e.g., "ME PORT", "ME STBD", "AE1"
  value: number | null; // Current sensor reading
  threshold_min: number | null;
  threshold_max: number | null;
  severity: 1 | 2; // 1 = High, 2 = Normal
  status: 'active' | 'resolved';
  category: AlarmCategory;
}
```

**Alarm Types Reference:**

| Alarm Text                  | Unit | Typical Threshold |
| --------------------------- | ---- | ----------------- |
| High coolant temperature    | °C   | max: 95           |
| Low lube oil pressure       | kPa  | min: 200          |
| High lube oil temperature   | °C   | max: 90           |
| Low fuel pressure           | kPa  | min: 300          |
| High fuel pressure          | kPa  | max: 800          |
| High boost air pressure     | kPa  | max: 250          |
| Low boost air pressure      | kPa  | min: 100          |
| High intake air temperature | °C   | max: 55           |
| Low battery voltage         | V    | min: 23           |
| High battery voltage        | V    | max: 32           |
| Engine overspeed            | RPM  | max: 2200         |

#### `GET /api/fleet/emission-zones` — Emission Control Area Polygons

Overlay polygons for ECA zones on the map.

**Response:**

```json
{
  "zones": [
    {
      "id": "neca",
      "name": "North American ECA",
      "positions": [
        [48.0, -67.0],
        [47.5, -66.0],
        [46.0, -65.0]
      ],
      "options": {
        "color": "#ff6347",
        "fillColor": "#ff6347",
        "fillOpacity": 0.15,
        "weight": 2
      }
    },
    {
      "id": "gulf_mexico",
      "name": "Gulf of Mexico ECA",
      "positions": [ ... ],
      "options": { ... }
    }
  ]
}
```

**TypeScript Interface:**

```ts
interface EmissionZone {
  id: string;
  name: string;
  positions: [number, number][]; // Array of [lat, lng] coordinate pairs
  options: {
    color: string;
    fillColor: string;
    fillOpacity: number;
    weight: number;
  };
}
```

#### Windy Weather API (External — 3rd Party)

The WindyMap component integrates the Windy API for weather overlay.

- **API Endpoint**: `https://api.windy.com/assets/map-forecast/libBoot.js`
- **API Key**: Configured per environment
- **Overlays Supported**: `wind`, `temp`, `pressure`
- **No custom backend API needed** — direct client-side integration

### 3.3 Vessel Popup Data (Map Hover)

When hovering over a vessel marker, the popup shows:

| Data Field            | Source                                                  |
| --------------------- | ------------------------------------------------------- |
| Vessel Name           | `FleetVessel.name`                                      |
| Position Status       | `FleetVessel.position_status`                           |
| Last Position Update  | `FleetVessel.position.timestamp` (formatted as "X ago") |
| Internet/GPS Status   | Derived from `online` timestamp recency                 |
| ME1/ME2/ME3 Status    | Color-coded by each engine's timestamp recency          |
| AE1/AE2 Status        | Color-coded by each engine's timestamp recency          |
| Active Alarms Count   | From alarms API — total active alarms                   |
| Critical Alarms Count | From alarms API — severity=1 active alarms              |

### 3.4 Navigation from Fleet Overview

| User Action                       | Navigation Target                 | State Set                                                          |
| --------------------------------- | --------------------------------- | ------------------------------------------------------------------ |
| Click "View Condition Monitoring" | `/machinery/condition-monitoring` | `selectedShipAtom` = clicked vessel                                |
| Click engine icon (ME1/ME2/etc.)  | `/real-time-data`                 | `selectedShipAtom` = vessel, `selectedEngineAtom` = clicked engine |

---

## 4. Operation Overview

### 4.1 Page Components

| Component                 | Description                                                             |
| ------------------------- | ----------------------------------------------------------------------- |
| `OperationOverviewLayout` | Main layout with engine cards, charts, map, and live socket data        |
| `EngineMonitorCard`       | RPM gauge + fuel consumption gauge + flow meter + totals per engine     |
| `LiveEngineCard`          | Full engine telemetry card (RPM, load, fuel, temps, pressures, voltage) |
| `LiveSocketCard`          | Container with connection status indicator                              |
| `ConsumptionVsSpeedChart` | ComposedChart — ME fuel consumption (bars) + speed (area) over time     |
| `EngineConsumptionChart`  | BarChart — Genset/AE fuel consumption over time                         |
| `RealTimeDataMap`         | Leaflet map showing selected vessel position                            |
| `SpeedMeter`              | Gauge component for RPM and fuel consumption display                    |
| `FlowMeterRow`            | FM In / FM Cons / FM Out metrics                                        |
| `StatBadge`               | Total Fuel (M³) and Running Hours badges                                |

### 4.2 APIs Required

#### `GET /api/vessels/{vesselId}/engines` — All Engine Monitor Data for a Vessel

Returns gauge data, flow meter readings, and totals for all engines on a vessel.

**Response:**

```json
{
  "vessel_id": 1,
  "main_engines": [
    {
      "id": "me1",
      "label": "ME PORT",
      "flowMeter": {
        "fm_in": 35.05,
        "fm_cons": 28.35,
        "fm_out": 6.7
      },
      "gauge": {
        "engine_rpm": 1167.5,
        "engine_load": 11.52,
        "fuel_cons": 28.35
      },
      "totals": {
        "total_fuel": 66.46,
        "running_hours": 5077.1
      },
      "detail": {
        "lubeoil_press": 420.0,
        "lubeoil_temp": 72.5,
        "coolant_press": 180.0,
        "coolant_temp": 82.3,
        "batt_volt": 27.8,
        "exhgas_temp_left": 345.0,
        "exhgas_temp_right": 352.0
      }
    },
    {
      "id": "me2",
      "label": "ME STBD",
      "flowMeter": {
        "fm_in": 32.1,
        "fm_cons": 25.9,
        "fm_out": 6.2
      },
      "gauge": {
        "engine_rpm": 1120.0,
        "engine_load": 10.8,
        "fuel_cons": 25.9
      },
      "totals": {
        "total_fuel": 55.2,
        "running_hours": 4890.5
      },
      "detail": {
        "lubeoil_press": 415.0,
        "lubeoil_temp": 71.0,
        "coolant_press": 175.0,
        "coolant_temp": 80.1,
        "batt_volt": 27.5,
        "exhgas_temp_left": 340.0,
        "exhgas_temp_right": 348.0
      }
    },
    {
      "id": "me3",
      "label": "ME CENTER",
      "flowMeter": { "fm_in": 0, "fm_cons": 0, "fm_out": 0 },
      "gauge": { "engine_rpm": 0, "engine_load": 0, "fuel_cons": 0 },
      "totals": { "total_fuel": 50.1, "running_hours": 3200.0 },
      "detail": null
    }
  ],
  "gensets": [
    {
      "id": "ae1",
      "label": "Genset 1",
      "flowMeter": { "fm_in": 0, "fm_cons": 0, "fm_out": 0 },
      "gauge": { "engine_rpm": 0, "engine_load": 0, "fuel_cons": 0 },
      "totals": { "total_fuel": 12.3, "running_hours": 1500.0 },
      "detail": null
    },
    {
      "id": "ae2",
      "label": "Genset 2",
      "flowMeter": { "fm_in": 0, "fm_cons": 0, "fm_out": 0 },
      "gauge": { "engine_rpm": 0, "engine_load": 0, "fuel_cons": 0 },
      "totals": { "total_fuel": 8.5, "running_hours": 980.0 },
      "detail": null
    }
  ]
}
```

**TypeScript Interfaces:**

```ts
interface EngineFlowMeter {
  fm_in: number; // kg/h — Flow Meter In
  fm_cons: number; // kg/h — Flow Meter Consumption
  fm_out: number; // kg/h — Flow Meter Out
}

interface EngineGaugeData {
  engine_rpm: number; // Current RPM (0–2400 max)
  engine_load: number; // Percentage (0–100)
  fuel_cons: number; // L/H
}

interface EngineTotals {
  total_fuel: number; // M³ (cubic meters)
  running_hours: number; // Hours
}

interface EngineDetailData {
  lubeoil_press: number; // kPa
  lubeoil_temp: number; // °C
  coolant_press: number; // kPa
  coolant_temp: number; // °C
  batt_volt: number; // VDC
  exhgas_temp_left: number; // °C
  exhgas_temp_right: number; // °C
}

interface EngineMonitorData {
  id: string; // "me1", "me2", "me3", "ae1", "ae2"
  label: string; // "ME PORT", "ME STBD", "ME CENTER", "Genset 1", "Genset 2"
  flowMeter: EngineFlowMeter;
  gauge: EngineGaugeData;
  totals: EngineTotals;
  detail?: EngineDetailData | null;
}
```

**Client-Side Calculations:**

```
kW = (engine_load / 100) × 1033          // ENGINE_RATED_KW = 1033
g/kWh = (fuel_cons × 850) / (10.33 × engine_load)    // Returns 0 when engine_load = 0
FM Cons = fuel_cons × 0.8                // Flow meter consumption
FM In = FM Cons + FM Out                  // Flow meter in
```

**Gauge Ranges:**
| Gauge | Min | Max | Unit |
|---|---|---|---|
| RPM | 0 | 2400 | RPM |
| Fuel Consumption | 140 | 280 | g/kWh |
| Lube Oil Pressure | 0 | 1250 | kPa |
| Lube Oil Temp | 0 | 250 | °C |
| Coolant Pressure | 0 | 500 | kPa |
| Coolant Temp | 0 | 360 | °C |

#### `GET /api/vessels/{vesselId}/charts/consumption-vs-speed` — ME Consumption vs Speed Chart Data

Time-series chart data showing main engine fuel consumption and vessel speed.

**Query Params:**
| Param | Type | Description |
|---|---|---|
| `vesselId` | number | Vessel ID |
| `date` | string (optional) | Date filter (defaults to today) |

**Response:**

```json
{
  "vessel_id": 1,
  "data": [
    {
      "time": "08:00",
      "me1": 25.3,
      "me2": 26.1,
      "me3": 0,
      "speed": 12.5
    },
    {
      "time": "09:00",
      "me1": 26.8,
      "me2": 27.5,
      "me3": 0,
      "speed": 14.2
    },
    {
      "time": "10:00",
      "me1": 28.35,
      "me2": 29.0,
      "me3": 0,
      "speed": 15.0
    }
  ]
}
```

**TypeScript Interface:**

```ts
interface ConsumptionSpeedPoint {
  time: string; // "HH:MM" format (24h)
  speed: number; // knots (range: 2–20)
  [engine: string]: number | string; // me1, me2, me3, me4 — fuel consumption in L/H
}
```

**Chart Configuration:**
| Element | Type | Color | Axis |
|---|---|---|---|
| ME Port (me1) | Bar | `#5a5fd7` (blue) | Left Y — L/H |
| ME Stbd (me2) | Bar | `#10b981` (green) | Left Y — L/H |
| ME Center (me3) | Bar | `#eab308` (yellow) | Left Y — L/H |
| AUX 1 (me4) | Bar | `#f97316` (orange) | Left Y — L/H |
| Speed | Area | `#dc3545` (red, 15% fill) | Right Y — knots (0–25) |

#### `GET /api/vessels/{vesselId}/charts/engine-consumption` — Genset Consumption Chart Data

Time-series bar chart for auxiliary engine consumption.

**Response:**

```json
{
  "vessel_id": 1,
  "data": [
    {
      "time": "08:00",
      "ae1": 5.2,
      "ae2": 3.8
    },
    {
      "time": "09:00",
      "ae1": 5.5,
      "ae2": 4.1
    }
  ]
}
```

**TypeScript Interface:**

```ts
interface EngineConsumptionPoint {
  time: string; // "HH:MM" format
  [engine: string]: number | string; // ae1, ae2 — fuel consumption in L/H
}
```

**Chart Configuration:**
| Element | Type | Color |
|---|---|---|
| Genset 1 (ae1) | Bar | `#5a5fd7` (blue) |
| Genset 2 (ae2) | Bar | `#10b981` (green) |

#### `GET /api/vessels/{vesselId}/position` — Single Vessel Position (for embedded map)

Used by the `RealTimeDataMap` component on the Operation Overview page.

**Response:**

```json
{
  "vessel_id": 1,
  "name": "Ocean Voyager",
  "lat": 25.5,
  "long": -93.0,
  "direction": 45,
  "timestamp": 1742900280
}
```

**Map Marker Colors:**
| Condition | Color | Meaning |
|---|---|---|
| `< 5 min` | `#005daa` (Blue) | Recent |
| `5 min – 3 hours` | `#FFC107` (Yellow) | Warning |
| `> 3 hours` | `#F44336` (Red) | Stale |

### 4.3 Operation Overview Layout

```
┌────────────────────────────────────────────────────────────────┐
│  Engine Monitor Cards (2–4 columns based on engine count)       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  ME PORT      │  │  ME STBD      │  │  ME CENTER    │        │
│  │  RPM Gauge    │  │  RPM Gauge    │  │  RPM Gauge    │        │
│  │  Fuel Gauge   │  │  Fuel Gauge   │  │  Fuel Gauge   │        │
│  │  FM In/Cons/Out│ │  FM In/Cons/Out│ │  FM In/Cons/Out│       │
│  │  Total/RunHrs │  │  Total/RunHrs │  │  Total/RunHrs │        │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
├────────────────────────────────────────────────────────────────┤
│  Live Socket Data Row (full engine telemetry from WebSocket)   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  ME PORT Live │  │  ME STBD Live │  │  ME CENTER    │        │
│  │  RPM, Load,   │  │  RPM, Load,   │  │  Live         │        │
│  │  Fuel, Temps, │  │  Fuel, Temps, │  │                │        │
│  │  Pressures,   │  │  Pressures,   │  │                │        │
│  │  Voltage      │  │  Voltage      │  │                │        │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
├────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────┐  ┌─────────────────────────┐  │
│  │  Consumption vs Speed Chart  │  │  Vessel Position Map     │ │
│  │  (ME bars + Speed area)      │  │  (Leaflet single vessel) │ │
│  └─────────────────────────────┘  └─────────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Genset Consumption Chart (AE1/AE2 bars)                 │  │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

---

## 5. Real Time Data

### 5.1 Page Components

| Component            | Description                                                            |
| -------------------- | ---------------------------------------------------------------------- |
| `RealTimeDataLayout` | Main layout — "All Engine" (10-gauge) or individual engine detail view |
| `EngineGroup`        | Paired RPM + Fuel gauges for a main engine                             |
| `GensetGroup`        | Smaller gauge pair for gensets                                         |
| `EngineDetailView`   | 5 overlapping gauges + stat cards for individual engine deep-dive      |
| `AlarmTable`         | Scrollable alarm table filtered by selected vessel/engine              |
| `SpeedMeter`         | Reusable gauge component (RPM, fuel, pressures, temperatures)          |
| `RealTimeDataMap`    | Leaflet map with vessel position                                       |

### 5.2 APIs Required

#### `GET /api/vessels/{vesselId}/engines` — Engine Data (Same as Operation Overview §4.2)

Same endpoint as Operation Overview. Provides static/baseline engine data that gets overlaid with live WebSocket data.

#### `GET /api/vessels/{vesselId}/alarms?engine={engineValue}` — Filtered Alarm Table

Returns alarms for a specific vessel, optionally filtered by engine.

**Query Params:**
| Param | Type | Description |
|---|---|---|
| `vesselId` | number | Required — vessel ID |
| `engine` | string | Optional — `"all"`, `"me1"`, `"me2"`, `"me3"`, `"ae1"`, `"ae2"` |

**Response:**

```json
{
  "vessel_id": 1,
  "engine_filter": "me1",
  "alarms": [
    {
      "id": "a1-01",
      "timestamp": 1742900160000,
      "alarm_text": "High coolant temperature",
      "engine": "ME PORT",
      "value": 98,
      "threshold_min": null,
      "threshold_max": 95,
      "severity": 1,
      "status": "active",
      "category": "critical"
    },
    {
      "id": "a1-05",
      "timestamp": 1742896560000,
      "alarm_text": "Low lube oil pressure",
      "engine": "ME PORT",
      "value": 185,
      "threshold_min": 200,
      "threshold_max": null,
      "severity": 2,
      "status": "resolved",
      "category": "warning"
    }
  ]
}
```

**Alarm Table Columns:**

| #   | Column     | Format                              | Sortable |
| --- | ---------- | ----------------------------------- | -------- |
| 1   | Date       | DD/MM/YYYY                          | Yes      |
| 2   | Time       | HH:MM                               | Yes      |
| 3   | Alarm Text | String                              | No       |
| 4   | Engine     | Badge (e.g., "ME PORT")             | No       |
| 5   | Value      | Number                              | No       |
| 6   | Range      | "≥ min", "≤ max", or "min–max"      | No       |
| 7   | Unit       | String (°C, kPa, RPM, V)            | No       |
| 8   | Severity   | "High" (red) / "Normal" (gray)      | No       |
| 9   | Status     | "active" (green) / "resolved" (red) | No       |

#### `GET /api/vessels/{vesselId}/machinery-scores` — Machinery Health Scores

**Response:**

```json
{
  "vessel_id": 1,
  "scores": [
    {
      "id": "port-engine",
      "name": "Port Engine",
      "value": "37/100",
      "status": "active"
    },
    {
      "id": "stbd-engine",
      "name": "Starboard Engine",
      "value": "55/100",
      "status": "active"
    },
    {
      "id": "center-engine",
      "name": "Center Engine",
      "value": "0/100",
      "status": "inactive"
    }
  ]
}
```

**TypeScript Interface:**

```ts
interface MachineryScoreEntry {
  id: string;
  name: string; // "Port Engine", "Center Engine", etc.
  value: string; // "37/100" format
  status: 'active' | 'inactive';
}
```

### 5.3 "All Engine" Layout (engine = "all")

```
┌──────────────────────────────────────────────────────────────┐
│  ┌──────────────┐  ┌──────────────┐                          │
│  │  ME PORT      │  │  ME STBD      │  Row 1: Main Engines   │
│  │  RPM + Fuel   │  │  RPM + Fuel   │                        │
│  │  TotalF/RunH  │  │  TotalF/RunH  │                        │
│  └──────────────┘  └──────────────┘                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐  │
│  │ Genset 1 │  │ ME Center│  │ Genset 2 │  │ Vessel Map  │  │
│  │ RPM+Fuel │  │ RPM+Fuel │  │ RPM+Fuel │  │             │  │
│  └──────────┘  └──────────┘  └──────────┘  └─────────────┘  │
├──────────────────────────────────────────────────────────────┤
│  Alarm Table (filtered by vessel, all engines)               │
└──────────────────────────────────────────────────────────────┘
```

### 5.4 Individual Engine Detail Layout (engine ≠ "all")

```
┌──────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────────┐    │
│  │  5 Overlapping SpeedMeter Gauges                      │   │
│  │                                                        │   │
│  │  ┌──────────┐                        ┌──────────┐     │   │
│  │  │ LubeOil  │    ┌──────────┐       │ Coolant  │     │   │
│  │  │ Pressure │    │  ENGINE   │       │ Pressure │     │   │
│  │  │ (kPa)    │    │   RPM     │       │ (kPa)    │     │   │
│  │  └──────────┘    └──────────┘       └──────────┘     │   │
│  │  ┌──────────┐     Exh Gas L/R       ┌──────────┐     │   │
│  │  │ LubeOil  │                        │ Coolant  │     │   │
│  │  │ Temp(°C) │                        │ Temp(°C) │     │   │
│  │  └──────────┘                        └──────────┘     │   │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────┐  ┌──────────────────┐  ┌──────────────┐    │
│  │ Engine Load │  │ Fuel Consumption │  │ Battery Volt │    │
│  │ XX.X %      │  │ XX.XX L/H        │  │ XX.X VDC     │    │
│  └─────────────┘  └──────────────────┘  └──────────────┘    │
├──────────────────────────────────────────────────────────────┤
│  Alarm Table (filtered by vessel + specific engine)          │
└──────────────────────────────────────────────────────────────┘
```

---

## 6. WebSocket — Live Engine Telemetry

### 6.1 Connection Details

| Property                     | Value                        |
| ---------------------------- | ---------------------------- |
| **URL**                      | `wss://socket.perfomax.tech` |
| **Protocol**                 | Socket.IO over WebSocket     |
| **Transport**                | `websocket` only             |
| **Reconnection**             | Up to 5 attempts             |
| **Events Emitted by Server** | `ME`, `AE`                   |

### 6.2 Socket Events

#### Event: `ME` — Main Engine Data

Emitted by the server whenever new main engine telemetry arrives.

**Payload:**

```json
{
  "engineId": "ME1",
  "engine_rpm": 1167.5,
  "engine_load": 11.52,
  "fuel_cons": 28.35,
  "run_hrs_counter": 5077.1,
  "total_fuel": 66.46,
  "lubeoil_press": 420.0,
  "lubeoil_temp": 72.5,
  "coolant_press": 180.0,
  "coolant_temp": 82.3,
  "Batt_volt": 27.8,
  "exhgas_temp_left": 345.0,
  "exhgas_temp_right": 352.0
}
```

#### Event: `AE` — Auxiliary Engine / Genset Data

Emitted by the server whenever new genset telemetry arrives.

**Payload:**

```json
{
  "engineId": "AE1",
  "engine_rpm": 1500.0,
  "engine_load": 45.0,
  "fuel_cons": 15.2,
  "run_hrs_counter": 1500.0,
  "total_fuel": 12.3,
  "lubeoil_press": 380.0,
  "lubeoil_temp": 68.0,
  "coolant_press": 160.0,
  "coolant_temp": 78.0,
  "Batt_volt": 26.5,
  "exhgas_temp_left": 310.0,
  "exhgas_temp_right": 318.0
}
```

**TypeScript Interface (shared for ME and AE):**

```ts
interface SocketEngineData {
  engineId: string; // "ME1", "ME2", "ME3", "AE1", "AE2"
  engine_rpm: number; // RPM
  engine_load: number; // Percentage (0–100)
  fuel_cons: number; // L/H
  run_hrs_counter: number; // Running hours
  total_fuel: number; // M³
  lubeoil_press: number; // kPa
  lubeoil_temp: number; // °C
  coolant_press: number; // kPa
  coolant_temp: number; // °C
  Batt_volt: number; // VDC
  exhgas_temp_left: number; // °C
  exhgas_temp_right: number; // °C
}
```

### 6.3 Client-Side Data Merge Logic

The client overlays live socket data onto static engine data:

```
1. Map engine ID: "me1" → "ME1" (uppercase)
2. Look up socket key in latestME[engineId] or latestAE[engineId]
3. If socket data exists → merge into EngineMonitorData:
   - gauge.engine_rpm ← socket.engine_rpm
   - gauge.engine_load ← socket.engine_load
   - gauge.fuel_cons ← socket.fuel_cons
   - totals.total_fuel ← socket.total_fuel
   - totals.running_hours ← socket.run_hrs_counter
   - detail.lubeoil_press ← socket.lubeoil_press
   - detail.lubeoil_temp ← socket.lubeoil_temp
   - detail.coolant_press ← socket.coolant_press
   - detail.coolant_temp ← socket.coolant_temp
   - detail.batt_volt ← socket.Batt_volt
   - detail.exhgas_temp_left ← socket.exhgas_temp_left
   - detail.exhgas_temp_right ← socket.exhgas_temp_right
4. Recalculate flow meter:
   - fm_cons = fuel_cons × 0.8
   - fm_in = fm_cons + fm_out
5. If no socket data → keep static/baseline values
```

### 6.4 Connection Status Indicator

The `LiveSocketCard` component shows a connection status badge:

| State        | Indicator           | Color |
| ------------ | ------------------- | ----- |
| Connected    | Green dot + "Live"  | Green |
| Disconnected | Red dot + "Offline" | Red   |

### 6.5 Pages Using WebSocket

| Page               | Components Using Socket                                                                             |
| ------------------ | --------------------------------------------------------------------------------------------------- |
| Operation Overview | `OperationOverviewLayout` → `LiveEngineCard`, `LiveSocketCard`, `EngineMonitorCard` (overlaid data) |
| Real Time Data     | `RealTimeDataLayout` → `EngineGroup`, `GensetGroup`, `EngineDetailView` (overlaid data)             |

---

## API Summary Table

| #   | Method | Endpoint                                        | Used By                                    | Polling                 |
| --- | ------ | ----------------------------------------------- | ------------------------------------------ | ----------------------- |
| 1   | POST   | `/api/auth/callback/credentials`                | Login                                      | —                       |
| 2   | GET    | `/api/auth/session`                             | Middleware, all pages                      | —                       |
| 3   | POST   | `/api/auth/signout`                             | ProfileMenu                                | —                       |
| 4   | GET    | `/api/vessels`                                  | Header dropdowns (all pages)               | —                       |
| 5   | GET    | `/api/engines`                                  | Header engine dropdown                     | —                       |
| 6   | GET    | `/api/user/profile`                             | ProfileMenu                                | —                       |
| 7   | GET    | `/api/notifications`                            | NotificationDropdown (future)              | —                       |
| 8   | GET    | `/api/fleet/vessels`                            | Fleet Overview map                         | Every 10s               |
| 9   | GET    | `/api/fleet/vessels/{id}/alarms`                | Fleet Overview popup                       | On hover                |
| 10  | GET    | `/api/fleet/emission-zones`                     | Fleet Overview map                         | Once on load            |
| 11  | GET    | `/api/vessels/{id}/engines`                     | Operation Overview, Real Time Data         | On vessel change        |
| 12  | GET    | `/api/vessels/{id}/charts/consumption-vs-speed` | Operation Overview                         | On vessel change        |
| 13  | GET    | `/api/vessels/{id}/charts/engine-consumption`   | Operation Overview                         | On vessel change        |
| 14  | GET    | `/api/vessels/{id}/position`                    | Operation Overview map, Real Time Data map | On vessel change        |
| 15  | GET    | `/api/vessels/{id}/alarms?engine={value}`       | Real Time Data alarm table                 | On vessel/engine change |
| 16  | GET    | `/api/vessels/{id}/machinery-scores`            | Real Time Data (currently commented out)   | On vessel change        |
| 17  | WS     | `wss://socket.perfomax.tech` (ME event)         | Operation Overview, Real Time Data         | Continuous stream       |
| 18  | WS     | `wss://socket.perfomax.tech` (AE event)         | Operation Overview, Real Time Data         | Continuous stream       |

---

## Engine ID Mapping Reference

| Engine ID (code) | Socket Event | Socket Key | Label     | Alarm Engine |
| ---------------- | ------------ | ---------- | --------- | ------------ |
| `me1`            | `ME`         | `ME1`      | ME PORT   | ME PORT      |
| `me2`            | `ME`         | `ME2`      | ME STBD   | ME STBD      |
| `me3`            | `ME`         | `ME3`      | ME CENTER | ME CENTER    |
| `me4`            | `ME`         | `ME4`      | AUX 1     | —            |
| `ae1`            | `AE`         | `AE1`      | Genset 1  | AE1          |
| `ae2`            | `AE`         | `AE2`      | Genset 2  | AE2          |
