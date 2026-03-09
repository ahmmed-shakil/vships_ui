import { routes } from '@/config/routes';
import { atom } from 'jotai';
import {
    PiBellSimpleRinging,
    PiBrowser,
    PiChartLineUp,
    PiGear,
    PiHammer,
    PiShoppingCart,
} from 'react-icons/pi';

export interface SubMenuItemType {
  name: string;
  description?: string;
  href: string;
  badge?: string;
}

export interface ItemType {
  name: string;
  icon: any;
  href?: string;
  description?: string;
  badge?: string;
  subMenuItems?: SubMenuItemType[];
}

export interface MenuItemsType {
  id: string;
  name: string;
  title: string;
  icon: any;
  menuItems: ItemType[];
}

export const carbonMenuItems: MenuItemsType[] = [
  {
    id: '1',
    name: 'Dashboard',
    title: 'Overview',
    icon: PiBrowser,
    menuItems: [
      {
        name: 'Fleet Overview',
        href: routes.fleet.overview,
        icon: PiShoppingCart,
      },
      {
        name: 'Real Time Data',
        href: routes.fleet.realTimeData,
        icon: PiChartLineUp,
      },
      {
        name: 'Alarm Monitoring',
        href: routes.fleet.alarmMonitoring,
        icon: PiBellSimpleRinging,
      },
    ],
  },
  {
    id: '2',
    name: 'Machinery',
    title: 'Machinery',
    icon: PiGear,
    menuItems: [
      {
        name: 'Condition Monitoring',
        href: routes.machinery.conditionMonitoring,
        icon: PiHammer,
      },
      {
        name: 'Machinery Overview 2',
        href: routes.machinery.machineryOverview,
        icon: PiGear,
      },
    ],
  },
];

export const carbonMenuItemAtom = atom(carbonMenuItems[0]);
