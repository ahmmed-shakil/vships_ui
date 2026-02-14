import { DailyOverviewLayout } from '@/app/shared/daily-overview';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Daily Overview'),
};

// const pageHeader = {
//   title: 'Daily Overview',
//   breadcrumb: [
//     {
//       href: '/',
//       name: 'Home',
//     },
//     {
//       name: 'Daily Overview',
//     },
//   ],
// };

export default function DailyOverviewPage() {
  return (
    <>
      {/* <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} /> */}
      <DailyOverviewLayout />
    </>
  );
}
