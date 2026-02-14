import FleetOverviewLayout from '@/app/shared/fleet-overview';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Fleet Overview'),
};

// const pageHeader = {
//   title: 'File Manager',
//   breadcrumb: [
//     {
//       href: routes.eCommerce.dashboard,
//       name: 'Home',
//     },
//     {
//       href: routes.file.dashboard,
//       name: 'File Manager',
//     },
//     {
//       name: 'List',
//     },
//   ],
// };

export default function FleetOverviewPage() {
  return (
    <>
      {/* <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <UploadButton modalView={<FileUpload />} />
      </PageHeader> */}

      {/* <FileStats className="mb-6 @5xl:mb-8 @7xl:mb-11" /> */}
      <FleetOverviewLayout />
    </>
  );
}
