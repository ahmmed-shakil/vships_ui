import PageHeader from '@/app/shared/page-header';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Machinery Alarms'),
};

const pageHeader = {
  title: 'Alarms',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'Machinery',
    },
    {
      name: 'Alarms',
    },
  ],
};

export default function MachineryAlarmsPage() {
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
    </>
  );
}
