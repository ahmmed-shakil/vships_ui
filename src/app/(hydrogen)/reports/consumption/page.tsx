import PageHeader from '@/app/shared/page-header';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Consumption Report'),
};

const pageHeader = {
  title: 'Consumption Report',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'Reports',
    },
    {
      name: 'Consumption Report',
    },
  ],
};

export default function ConsumptionReportPage() {
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
    </>
  );
}
