import PageHeader from '@/app/shared/page-header';
import { metaObject } from '@/config/site.config';
import { Box } from 'rizzui/box';
import TableLayout from '../../tables/table-layout';
import InvoiceTable from '@/app/shared/invoice/invoice-list/table';
import { invoiceData } from '@/data/invoice-data';

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
      {/* <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} /> */}
      <Box className="@container/pd">
        <TableLayout
          title={pageHeader.title}
          breadcrumb={pageHeader.breadcrumb}
          data={invoiceData}
          fileName="invoice_data"
          header="ID,Name,Username,Avatar,Email,Due Date,Amount,Status,Created At"
        >
          <InvoiceTable />
        </TableLayout>
      </Box>
    </>
  );
}
