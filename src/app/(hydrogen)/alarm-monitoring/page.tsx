import { AlarmMonitorLayout } from '@/app/shared/alarm-monitor';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Alarm Monitoring'),
};

export default function AlarmMonitoringPage() {
  return <AlarmMonitorLayout />;
}