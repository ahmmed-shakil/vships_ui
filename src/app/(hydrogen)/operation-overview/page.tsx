import OperationOverviewLayout from '@/components/operation-overview';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Operation Overview'),
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

export default function OperationOverviewPage() {
  return (
    <>
      {/* <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
      </PageHeader> */}
      <OperationOverviewLayout />
    </>
  );
}
