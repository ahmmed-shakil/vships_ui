import PageHeader from '@/app/shared/page-header';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Fleet Overview'),
};

const pageHeader = {
  title: 'Fleet Overview',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'Fleet Overview',
    },
  ],
};

export default function FleetOverviewPage() {
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
    </>
  );
}
