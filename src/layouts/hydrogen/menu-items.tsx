import { routes } from '@/config/routes';
import {
  PiBellSimpleRingingDuotone,
  PiChartLineUpDuotone,
  PiGaugeDuotone,
  PiGearDuotone,
  PiHammerDuotone,
  PiShoppingCartDuotone,
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
    icon: <PiShoppingCartDuotone />,
  },

  {
    name: 'Operation Overview',
    href: routes.fleet.operationOverview,
    icon: <PiBellSimpleRingingDuotone />,
  },
  // Real Time Data section (flat links, same pattern as Machinery)
  {
    name: 'Real Time Data',
  },
  {
    name: 'Gauges & AMS',
    href: routes.fleet.realTimeData,
    icon: <PiGaugeDuotone />,
  },
  {
    name: 'Trend analysis',
    href: routes.fleet.trendAnalysis,
    icon: <PiChartLineUpDuotone />,
  },
  // Machinery section
  {
    name: 'Machinery',
  },
  {
    name: 'Condition Monitoring',
    href: routes.machinery.conditionMonitoring,
    icon: <PiHammerDuotone />,
  },
  {
    name: 'Machinery Overview',
    href: routes.machinery.machineryOverview,
    icon: <PiGearDuotone />,
  },
];

