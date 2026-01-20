import PageHeader from '@/app/shared/page-header';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Condition Monitoring'),
};

const pageHeader = {
  title: 'Condition Monitoring',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'Machinery',
    },
    {
      name: 'Condition Monitoring',
    },
  ],
};

export default function ConditionMonitoringPage() {
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
    </>
  );
}
