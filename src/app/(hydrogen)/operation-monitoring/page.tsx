import OperationMonitorLayout from '@/app/shared/operation-monitor';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Operation Monitoring'),
};

// const pageHeader = {
//   title: 'Operation Monitoring',
//   breadcrumb: [
//     {
//       href: '/',
//       name: 'Home',
//     },
//     {
//       name: 'Operation Monitoring',
//     },
//   ],
// };

export default function OperationMonitoringPage() {
  return (
    <>
      {/* <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
      </PageHeader> */}
      <OperationMonitorLayout />
    </>
  );
}
