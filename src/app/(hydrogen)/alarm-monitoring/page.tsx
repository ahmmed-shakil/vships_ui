import PageHeader from '@/app/shared/page-header';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Alarm Monitoring'),
};

const pageHeader = {
  title: 'Alarm Monitoring',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'Alarm Monitoring',
    },
  ],
};

export default function AlarmMonitoringPage() {
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
    </>
  );
}
