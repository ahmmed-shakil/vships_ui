import PageHeader from '@/app/shared/page-header';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Operation Overview'),
};

const pageHeader = {
  title: 'Operation Overview',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'Operation Overview',
    },
  ],
};

export default function OperationOverviewPage() {
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
    </>
  );
}
