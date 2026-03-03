'use client';

import HeaderBreadcrumb from '@/app/shared/header-breadcrumb';
import HamburgerButton from '@/layouts/hamburger-button';
import NotificationDropdown from '@/layouts/notification-dropdown';
import ProfileMenu from '@/layouts/profile-menu';
import cn from '@/utils/class-names';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PiBellSimpleRingingFill } from 'react-icons/pi';
import { ActionIcon } from 'rizzui/action-icon';
import { Badge } from 'rizzui/badge';
import Sidebar from './helium-sidebar';

const ConditionMonitoringHeaderSelectors = dynamic(
  () => import('@/components/machinery/condition-monitoring/header-selectors'),
  { ssr: false }
);

const MachineryOverviewHeaderSelectors = dynamic(
  () => import('@/components/machinery/machinery-overview/header-selectors'),
  { ssr: false }
);

function HeaderMenuRight() {
  return (
    <div className="ms-auto grid shrink-0 grid-cols-2 items-center gap-2 text-gray-700 xs:gap-3 xl:gap-4">
      <NotificationDropdown>
        <ActionIcon
          aria-label="Notification"
          variant="text"
          className={cn(
            'relative h-[34px] w-[34px] overflow-hidden rounded-full shadow backdrop-blur-md before:absolute before:h-full before:w-full before:-rotate-45 before:rounded-full before:bg-gradient-to-l before:from-orange-dark/25 before:via-orange-dark/0 before:to-orange-dark/0 dark:bg-gray-100 md:h-9 md:w-9 3xl:h-10 3xl:w-10'
          )}
        >
          <PiBellSimpleRingingFill className="h-[18px] w-auto 3xl:h-5" />
          <Badge
            renderAsDot
            color="warning"
            enableOutlineRing
            className="absolute right-1 top-2.5 -translate-x-1 -translate-y-1/4"
          />
        </ActionIcon>
      </NotificationDropdown>
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

  return (
    <header
      className={
        'sticky top-0 z-[990] flex items-center bg-gray-0/80 px-4 py-4 backdrop-blur-xl dark:bg-gray-50/50 md:px-5 lg:px-6 xl:-ms-1.5 xl:pl-4 2xl:-ms-0 2xl:py-6 2xl:pl-6 3xl:px-8 3xl:pl-6 4xl:px-10 4xl:pl-9'
      }
    >
      <div
        className={cn(
          'flex items-center',
          isConditionMonitoring || isMachineryOverview
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
          <Image
            src="/desktop-logo.png"
            alt="Logo"
            width={120}
            height={30}
            priority
          />
        </Link>
        <HeaderBreadcrumb />
      </div>

      {isConditionMonitoring && (
        <div className="mx-4 flex-1 overflow-x-auto 2xl:mx-10">
          <ConditionMonitoringHeaderSelectors />
        </div>
      )}

      {isMachineryOverview && (
        <div className="mx-4 flex-1 overflow-x-auto 2xl:mx-10">
          <MachineryOverviewHeaderSelectors />
        </div>
      )}

      <HeaderMenuRight />
    </header>
  );
}
