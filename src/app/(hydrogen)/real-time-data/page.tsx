import RealTimeDataLayout from '@/components/real-time-data';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Real Time Data'),
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
      <RealTimeDataLayout />
    </>
  );
}
