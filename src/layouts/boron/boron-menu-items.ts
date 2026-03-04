import { routes } from '@/config/routes';
import {
  PiBellSimpleRingingDuotone,
  PiChartLineUpDuotone,
  PiGearDuotone,
  PiHammerDuotone,
  PiShoppingCartDuotone,
} from 'react-icons/pi';

export const menuItems = [
  // label start
  {
    name: 'Overview',
  },
  // label end
  {
    name: 'Fleet Overview',
    href: routes.fleet.overview,
    icon: PiShoppingCartDuotone,
  },
  {
    name: 'Operation Monitoring',
    href: routes.fleet.operationMonitoring,
    icon: PiChartLineUpDuotone,
  },
  {
    name: 'Alarm Monitoring',
    href: routes.fleet.alarmMonitoring,
    icon: PiBellSimpleRingingDuotone,
  },
  // label start
  {
    name: 'Machinery',
  },
  // label end
  {
    name: 'Condition Monitoring',
    href: routes.machinery.conditionMonitoring,
    icon: PiHammerDuotone,
  },
  {
    name: 'Machinery Overview 2',
    href: routes.machinery.machineryOverview,
    icon: PiGearDuotone,
  },
];
