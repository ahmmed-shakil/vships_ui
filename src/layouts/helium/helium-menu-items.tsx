import { routes } from '@/config/routes';
import {
  PiBellSimpleRinging,
  PiChartLineUp,
  PiGear,
  PiHammer,
  PiShoppingCart,
} from 'react-icons/pi';

// Note: do not add href in the label object, it is rendering as label
export const menuItems = [
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
    name: 'Operation Overview',
    href: routes.fleet.operationOverview,
    icon: <PiBellSimpleRinging />,
  },
  {
    name: 'Real Time Data',
    href: routes.fleet.realTimeData,
    icon: <PiChartLineUp />,
    dropdownItems: [
      {
        name: 'Gauges & AMS',
        href: routes.fleet.realTimeData,
      },
      {
        name: 'Trend analysis',
        href: routes.fleet.trendAnalysis,
      },
    ],
  },
  // Machinery section
  {
    name: 'Machinery',
  },
  {
    name: 'Machinery Overview',
    href: routes.machinery.machineryOverview,
    icon: <PiGear />,
  },
  {
    name: 'Alarm Overview',
    href: routes.machinery.alarmOverview,
    icon: <PiBellSimpleRinging />,
  },
  {
    name: 'Condition Monitoring',
    href: routes.machinery.conditionMonitoring,
    icon: <PiHammer />,
  },
  // {
  //   name: 'Alarm Monitoring',
  //   href: routes.machinery.alarmOverview,
  //   icon: <PiHammer />,
  // },
];
