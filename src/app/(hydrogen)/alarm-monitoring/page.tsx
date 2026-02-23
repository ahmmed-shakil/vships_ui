import { AlarmMonitorLayout } from '@/components/alarm-monitor';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Alarm Monitoring'),
};

export default function AlarmMonitoringPage() {
  return <AlarmMonitorLayout />;
}