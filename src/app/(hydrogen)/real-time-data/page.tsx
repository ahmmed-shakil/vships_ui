import { RealTimeDataLayout } from '@/components/real-time-data';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Real Time Data'),
};

export default function AlarmMonitoringPage() {
  return <RealTimeDataLayout />;
}