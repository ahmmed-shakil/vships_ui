import PageHeader from '@/app/shared/page-header';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Daily Overview'),
};

const pageHeader = {
  title: 'Daily Overview',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'Daily Overview',
    },
  ],
};

export default function DailyOverviewPage() {
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
    </>
  );
}
