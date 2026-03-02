'use client';

import { useDirection } from '@/hooks/use-direction';
import {
  DropdownItemType,
  LithiumMenuItemsKeys,
  lithiumMenuItems,
} from '@/layouts/lithium/lithium-menu-items';
import NavMenu from '@/layouts/nav-menu/nav-menu';
import cn from '@/utils/class-names';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PiCaretDownBold } from 'react-icons/pi';
import { NavMenuDirection } from '../nav-menu/nav-menu-types';
import { LithiumMenuIconType, lithiumMenuIcons } from './lithium-menu-icons';
import { useActivePathname } from './use-pathname-active';

export function LinkMenu({
  items,
  className = '',
}: {
  items: DropdownItemType[];
  className?: string;
}) {
  const pathname = usePathname();
  return (
    <ul className={cn('w-full', className, 'bg-gray-0 dark:bg-gray-100')}>
      {items.map((item, index) => {
        const Icon = lithiumMenuIcons?.[item.icon as LithiumMenuIconType];
        const isActive = item.href === pathname;
        return (
          <li
            key={`link-menu-${item.name}-${index}`}
            className="relative my-0.5"
          >
            <Link
              href={item.href ?? '/'}
              className={cn(
                'flex items-center gap-3 whitespace-nowrap rounded-md bg-gray-100/0 px-3 py-2 font-medium text-gray-900 duration-200 hover:bg-gray-100 hover:dark:bg-gray-50/50',
                { 'bg-gray-100 dark:bg-gray-50/50': isActive }
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="relative block">{item.name}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default function HeaderMenuLeft() {
  const { direction } = useDirection();
  return (
    <>
      <NavMenu
        dir={direction as NavMenuDirection}
        menuClassName="pb-5 top-3 gap-8 relative"
        menuContentClassName="mt-2 border border-gray-200 dark:border-gray-300"
      >
        <NavMenu.Item>
          <NavMenu.Trigger className="flex items-center gap-1 duration-200">
            <MenuTriggerButton name="overview" />
          </NavMenu.Trigger>
          <NavMenu.Content className="border border-[red] bg-white dark:bg-gray-100">
            <div className="w-[420px]">
              <LinkMenu
                className="grid grid-cols-2 gap-x-1 p-3 dark:bg-gray-100"
                items={lithiumMenuItems.overview.dropdownItems ?? []}
              />
            </div>
          </NavMenu.Content>
        </NavMenu.Item>
        <NavMenu.Item>
          <NavMenu.Trigger className="flex items-center gap-1 duration-200">
            <MenuTriggerButton name="machinery" />
          </NavMenu.Trigger>
          <NavMenu.Content>
            <div className="w-[420px]">
              <LinkMenu
                className="grid grid-cols-2 gap-x-1 p-3 dark:bg-gray-100"
                items={lithiumMenuItems.machinery.dropdownItems ?? []}
              />
            </div>
          </NavMenu.Content>
        </NavMenu.Item>
      </NavMenu>
    </>
  );
}

function MenuTriggerButton({ name }: { name: LithiumMenuItemsKeys }) {
  const { isActive } = useActivePathname();
  return (
    <>
      <span
        className={cn(
          'inline-block w-full overflow-hidden whitespace-nowrap pe-1.5 ps-0 text-sm font-medium leading-5 text-gray-900 transition-all duration-200',
          isActive(lithiumMenuItems[name].dropdownItems)
            ? 'text-primary'
            : 'group-hover:text-gray-900'
        )}
      >
        {lithiumMenuItems[name].name}
      </span>
      <span
        className={cn(
          'text-gray-900 duration-200',
          isActive(lithiumMenuItems[name].dropdownItems!) && 'text-primary'
        )}
      >
        <PiCaretDownBold />
      </span>
    </>
  );
}
