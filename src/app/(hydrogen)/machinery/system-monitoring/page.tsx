import SystemMonitoringLayout from '@/app/shared/machinery/system-monitoring';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('System Monitoring'),
};

// const pageHeader = {
//   title: 'System Monitoring',
//   breadcrumb: [
//     {
//       href: '/',
//       name: 'Home',
//     },
//     {
//       name: 'Machinery',
//     },
//     {
//       name: 'System Monitoring',
//     },
//   ],
// };

export default function SystemMonitoringPage() {
  return (
    <>
      {/* <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} /> */}
      <SystemMonitoringLayout />
    </>
  );
}
