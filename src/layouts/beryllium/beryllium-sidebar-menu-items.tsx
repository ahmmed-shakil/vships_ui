import { routes } from '@/config/routes';
import {
  PiBellSimpleRinging,
  PiChartLineUp,
  PiGear,
  PiHammer,
  PiShoppingCart,
} from 'react-icons/pi';

// Note: do not add href in the label object, it is rendering as label
export const berylliumSidebarMenuItems = [
  // label start
  {
    name: 'Overview',
  },
  // label end
  {
    name: 'Fleet Overview',
    href: routes.fleet.overview,
    icon: <PiShoppingCart />,
  },
  {
    name: 'Operation Monitoring',
    href: routes.fleet.operationMonitoring,
    icon: <PiChartLineUp />,
  },
  {
    name: 'Alarm Monitoring',
    href: routes.fleet.alarmMonitoring,
    icon: <PiBellSimpleRinging />,
  },

  // label start
  {
    name: 'Machinery',
  },
  // label end
  {
    name: 'Condition Monitoring',
    href: routes.machinery.conditionMonitoring,
    icon: <PiHammer />,
  },
  {
    name: 'Machinery Overview',
    href: routes.machinery.machineryOverview,
    icon: <PiGear />,
  },
];
