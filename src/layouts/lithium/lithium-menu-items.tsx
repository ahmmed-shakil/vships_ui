import { routes } from '@/config/routes';

export type SubMenuItemType = {
  name: string;
  href: string;
};

export type DropdownItemType = {
  name: string;
  icon: string;
  description?: string;
  href?: string;
  subMenuItems?: SubMenuItemType[];
};

export type LithiumMenuItem = {
  overview: {
    name: string;
    type: string;
    dropdownItems: DropdownItemType[];
  };
  machinery: {
    name: string;
    type: string;
    dropdownItems: DropdownItemType[];
  };
};

export const lithiumMenuItems: LithiumMenuItem = {
  overview: {
    name: 'Overview',
    type: 'link',
    dropdownItems: [
      {
        name: 'Fleet Overview',
        href: routes.fleet.overview,
        icon: 'ShopIcon',
      },
      {
        name: 'Real Time Data',
        href: routes.fleet.realTimeData,
        icon: 'AnalyticsCircularIcon',
      },
      {
        name: 'Alarm Monitoring',
        href: routes.fleet.alarmMonitoring,
        icon: 'NotificationSettingsIcon',
      },
    ],
  },
  machinery: {
    name: 'Machinery',
    type: 'link',
    dropdownItems: [
      {
        name: 'Condition Monitoring',
        href: routes.machinery.conditionMonitoring,
        icon: 'SettingsWarningIcon',
      },
      {
        name: 'Machinery Overview',
        href: routes.machinery.machineryOverview,
        icon: 'BusinessIcon',
      },
    ],
  },
};

export type LithiumMenuItemsKeys = keyof LithiumMenuItem;
