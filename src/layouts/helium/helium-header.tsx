'use client';

import HeaderBreadcrumb from '@/app/shared/header-breadcrumb';
import HamburgerButton from '@/layouts/hamburger-button';
import ProfileMenu from '@/layouts/profile-menu';
import cn from '@/utils/class-names';
import logoImg from '@public/desktop-logo.png';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { PiCameraBold, PiFileCsvBold, PiSpinnerBold } from 'react-icons/pi';
import { Tooltip } from 'rizzui';
import { toPng } from 'html-to-image';
import { useAtomValue } from 'jotai';
import {
  selectedEngineAtom,
  selectedShipAtom,
  selectedTimeAtom,
  dateRangeAtom,
} from '@/store/condition-monitoring-atoms';
import { exportSensorDataCSV } from '@/services/api';
import Sidebar from './helium-sidebar';

const ConditionMonitoringHeaderSelectors = dynamic(
  () => import('@/components/machinery/condition-monitoring/header-selectors'),
  { ssr: false }
);

const MachineryOverviewHeaderSelectors = dynamic(
  () => import('@/components/machinery/machinery-overview/header-selectors'),
  { ssr: false }
);

const AlarmOverviewHeaderSelectors = dynamic(
  () => import('@/components/machinery/alarm-overview/header-selectors'),
  { ssr: false }
);

const RealTimeDataHeaderSelectors = dynamic(
  () => import('@/components/real-time-data/header-selectors'),
  { ssr: false }
);

const OperationOverviewHeaderSelectors = dynamic(
  () => import('@/components/operation-overview/header-selectors'),
  { ssr: false }
);

function HeaderMenuRight({
  showDownloads,
  isExporting,
  snapshotting,
  onSnapshot,
  onCsvExport,
}: {
  showDownloads: boolean;
  isExporting: boolean;
  snapshotting: boolean;
  onSnapshot: () => void;
  onCsvExport: () => void;
}) {
  return (
    <div className="ms-auto flex shrink-0 items-center gap-2 text-gray-700 xs:gap-3 xl:gap-4">
      {showDownloads && (
        <div className="flex items-center gap-0.5">
          <Tooltip content="Download page snapshot" placement="bottom">
            <button
              onClick={onSnapshot}
              disabled={snapshotting || isExporting}
              className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground disabled:opacity-50"
              aria-label="Download page as PNG"
            >
              {snapshotting ? (
                <PiSpinnerBold className="h-5 w-5 animate-spin" />
              ) : (
                <PiCameraBold className="h-5 w-5" />
              )}
            </button>
          </Tooltip>
          <Tooltip content="Export page data as CSV" placement="bottom">
            <button
              onClick={onCsvExport}
              disabled={isExporting || snapshotting}
              className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground disabled:opacity-50"
              aria-label="Export page data as CSV"
            >
              {isExporting ? (
                <PiSpinnerBold className="h-5 w-5 animate-spin" />
              ) : (
                <PiFileCsvBold className="h-5 w-5" />
              )}
            </button>
          </Tooltip>
        </div>
      )}
      <ProfileMenu />
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();
  const isConditionMonitoring = pathname.startsWith(
    '/machinery/condition-monitoring'
  );
  const isMachineryOverview = pathname.startsWith(
    '/machinery/machinery-overview'
  );
  const isAlarmOverview = pathname.startsWith('/machinery/alarm-overview');
  const isRealTimeData = pathname.startsWith('/real-time-data');
  // const isAlarmMonitoring = pathname.startsWith('/alarm-monitoring');
  const isOperationOverview = pathname.startsWith('/operation-overview');

  // Only show header-level downloads on trend analysis
  // (condition monitoring has its own download buttons in header-selectors)
  const showDownloads = pathname === '/real-time-data/trend-analysis';

  const [snapshotting, setSnapshotting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const selectedShip = useAtomValue(selectedShipAtom);
  const selectedTime = useAtomValue(selectedTimeAtom);
  const selectedEngine = useAtomValue(selectedEngineAtom);
  const dateRange = useAtomValue(dateRangeAtom);

  const handlePageSnapshot = useCallback(async () => {
    if (snapshotting || isExporting) return;
    setSnapshotting(true);
    try {
      const mainEl = document.querySelector('main') as HTMLElement | null;
      const target = mainEl ?? document.body;
      const dataUrl = await toPng(target, {
        cacheBust: true,
        backgroundColor: '#111827',
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      const pageName =
        window.location.pathname.replace(/\//g, '-').replace(/^-/, '') ||
        'page';
      link.download = `${pageName}-snapshot.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Page snapshot downloaded');
    } catch (err) {
      console.error('Page snapshot failed:', err);
      toast.error('Page snapshot failed');
    } finally {
      setSnapshotting(false);
    }
  }, [snapshotting, isExporting]);

  const handlePageCsvExport = useCallback(async () => {
    if (snapshotting || isExporting) return;
    
    if (!selectedShip) {
      toast.error('Please select a vessel first');
      return;
    }

    setIsExporting(true);
    try {
      // Derive from/to from the selected time preset or custom date range
      const now = new Date();
      let from: Date;
      if (selectedTime === 'Custom Time' && dateRange[0] && dateRange[1]) {
        from = dateRange[0];
      } else {
        // Parse presets like '5 min', '30 min', '2 hours', '12h', '24h', '48h', '1h', '1d', '7d', '1m', '3m'
        const match = selectedTime.match(/^(\d+)\s*(min|hour|h|d|m)s?$/i);
        if (match) {
          const num = parseInt(match[1]);
          const unit = match[2].toLowerCase();
          from = new Date(now);
          if (unit === 'min') from.setMinutes(from.getMinutes() - num);
          else if (unit === 'hour' || unit === 'h') from.setHours(from.getHours() - num);
          else if (unit === 'd') from.setDate(from.getDate() - num);
          else if (unit === 'm') from.setMonth(from.getMonth() - num);
          else from.setDate(from.getDate() - 1);
        } else {
          from = new Date(now);
          from.setDate(from.getDate() - 1);
        }
      }

      const to =
        selectedTime === 'Custom Time' && dateRange[1]
          ? dateRange[1].toISOString()
          : now.toISOString();

      await exportSensorDataCSV(selectedShip.id, from.toISOString(), to, selectedEngine?.value);
      toast.success('CSV downloaded successfully');
    } catch (err) {
      console.error('CSV export failed:', err);
      toast.error('Failed to download CSV data');
    } finally {
      setIsExporting(false);
    }
  }, [snapshotting, isExporting, selectedShip, selectedTime, selectedEngine, dateRange]);

  return (
    <header
      className={
        'sticky top-0 z-[999] flex items-center bg-gray-0/80 px-4 py-4 backdrop-blur-xl dark:bg-gray-50/50 md:px-5 lg:px-6 xl:-ms-1.5 xl:pl-4 2xl:-ms-0 2xl:py-6 2xl:pl-6 3xl:px-8 3xl:pl-6 4xl:px-10 4xl:pl-9'
      }
    >
      <div
        className={cn(
          'flex items-center',
          isConditionMonitoring ||
            isMachineryOverview ||
            isAlarmOverview ||
            isRealTimeData ||
            isOperationOverview
            ? 'w-auto shrink-0'
            : 'w-full max-w-2xl'
        )}
      >
        <HamburgerButton
          view={
            <Sidebar className="static w-full xl:p-0 2xl:w-full [&>div]:xl:rounded-none" />
          }
        />
        <Link
          href={'/'}
          aria-label="Site Logo"
          className="me-4 shrink-0 lg:me-5 xl:hidden"
        >
          <Image src={logoImg} alt="Logo" width={120} height={30} priority />
        </Link>
        <HeaderBreadcrumb />
      </div>

      {isConditionMonitoring && (
        <div className="mx-4 flex-1 2xl:mx-10">
          <ConditionMonitoringHeaderSelectors />
        </div>
      )}

      {isMachineryOverview && (
        <div className="mx-4 flex-1 2xl:mx-10">
          <MachineryOverviewHeaderSelectors />
        </div>
      )}

      {isAlarmOverview && (
        <div className="mx-4 flex-1 2xl:mx-10">
          <AlarmOverviewHeaderSelectors />
        </div>
      )}

      {isRealTimeData && (
        <div className="mx-4 flex-1 2xl:mx-10">
          <RealTimeDataHeaderSelectors />
        </div>
      )}

      {isOperationOverview && (
        <div className="mx-4 flex-1 2xl:mx-10">
          <OperationOverviewHeaderSelectors />
        </div>
      )}

      <HeaderMenuRight
        showDownloads={showDownloads}
        isExporting={isExporting}
        snapshotting={snapshotting}
        onSnapshot={handlePageSnapshot}
        onCsvExport={handlePageCsvExport}
      />
    </header>
  );
}
