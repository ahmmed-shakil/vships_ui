import OperationOverviewLayout from '@/components/operation-overview';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Opreation Overview'),
};

// const pageHeader = {
//   title: 'Real Time Data',
//   breadcrumb: [
//     {
//       href: '/',
//       name: 'Home',
//     },
//     {
//       name: 'Real Time Data',
//     },
//   ],
// };

export default function RealTimeDataPage() {
  return (
    <>
      {/* <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
      </PageHeader> */}
      <OperationOverviewLayout />
    </>
  );
}
