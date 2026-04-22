import { CouponType } from '../config/enums';

export interface Coupon {
  id: string;
  name: string;
  type: CouponType;
  slug: string;
  amount?: string;
  code?: string;
}

export interface Address {
  customerName?: string;
  phoneNumber?: string;
  country?: string;
  state?: string;
  city?: string;
  zip?: string;
  street?: string;
}

export interface GoogleMapLocation {
  lat?: number;
  lng?: number;
  street_number?: string;
  route?: string;
  street_address?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
  formattedAddress?: string;
}

export type ProductColor = {
  name?: string;
  code?: string;
};

export interface CartItem {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  image: string;
  color?: ProductColor | null;
  price: number;
  salePrice?: number;
  quantity: number;
  size: number;
  stock?: number;
  discount?: number;
}

export type Product = {
  id: number;
  slug?: string;
  title: string;
  description?: string;
  price: number;
  sale_price?: number;
  thumbnail: string;
  colors?: ProductColor[];
  sizes?: number[];
};

export type PosProduct = {
  id: number;
  name: string;
  description: string;
  image: string;
  price: number;
  salePrice: number;
  quantity: number;
  size: number;
  discount?: number;
};
export interface CalendarEvent {
  id?: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  title: string;
  description?: string;
  location?: string;
}

export interface FlightingCardProps {
  id: number;
  image: string;
  title: string;
  price: string;
  meta?: {
    model: string;
    hours: string;
    stop: string;
  };
  class: string;
  bucket: {
    luggage?: string;
    bag?: string;
  };
  airlines?: string;
  routes?: {
    arrivalDate: Date | string;
    arrivalTime: Date | string;
    departureDate: Date | string;
    departureTime: Date | string;
    departureCityCode: string;
    departureCity: string;
    departureTerminal: string;
    arrivalCityCode: string;
    arrivalCity: string;
    arrivalTerminal: string;
    layover: {
      layoverCityCode: string;
      layoverCity: string;
      layoverTerminal: string;
      layoverTime: string;
    }[];
  };
  cheapest?: boolean;
  best?: boolean;
  quickest?: boolean;
}

export type LayoverAirPortOptionType = {
  id: number;
  name: string;
  isGroupTitle?: boolean;
  checked?: boolean;
  disabled?: boolean;
};

export type TanTableProductsDataType = {
  id: string;
  name: string;
  category: string;
  image: string;
  price: string;
  quantity: number;
};

// Machinery Overview Types
export interface MachineryAlarms {
  /** blue / info level */
  info: number;
  /** yellow / notice level */
  notice: number;
  /** orange / warning level */
  warning: number;
  /** red / critical level */
  critical: number;
}

export interface MachineryAlarmTooltipRow {
  timestamp: number | string;
  alarm_text: string;
  category: keyof MachineryAlarms;
  value: number | null;
  unit: string;
}

export interface MachineryMetric {
  label: string;
  value: string;
  unit: string;
  /** If true, show a small sparkline after the value */
  showSparkline?: boolean;
  /** Override sparkline data (default: dummy) */
  sparklineData?: { v: number }[];
  /** Stroke colour for sparkline (default: blue #3872FA) */
  sparklineColor?: string;
}

export type MachineryStatus = 'running' | 'standby' | 'off';

export interface MachineryCardProps {
  id: number;
  title: string;
  /** health score as percentage from 0 to 100 */
  healthScore: number;
  /** engine operational status */
  status: MachineryStatus;
  /** alarm counts by severity */
  alarms: MachineryAlarms;
  /** alarm rows used by tooltip content */
  alarmRows?: MachineryAlarmTooltipRow[];
  /** engine metrics list */
  metrics: MachineryMetric[];
}
