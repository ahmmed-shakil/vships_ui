'use client';

import { useEffect, useRef, useState } from 'react';
import { Title } from 'rizzui/typography';
import cn from '@/utils/class-names';
import Breadcrumb from '@/ui/breadcrumb';

export type PageHeaderTypes = {
  title: string;
  breadcrumb?: { name: string; href?: string }[];
  className?: string;
  /** If true, the header sticks to the top when scrolled past */
  isFixed?: boolean;
  /** Optional component rendered on the right side of the header */
  rightContent?: React.ReactNode;
};

export default function PageHeader({
  title,
  breadcrumb,
  children,
  className,
  isFixed = false,
  rightContent,
}: React.PropsWithChildren<PageHeaderTypes>) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    if (!isFixed) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When the sentinel scrolls out of view, header should stick
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isFixed]);

  return (
    <>
      {/* Sentinel element — sits where the header normally is */}
      {isFixed && <div ref={sentinelRef} className="h-0 w-full" />}

      <header
        className={cn(
          'mb-6 @container xs:-mt-2 lg:mb-7',
          isFixed &&
            isSticky &&
            'sticky top-14 z-[980] bg-gray-0/80 dark:bg-gray-50/50 py-3 shadow-sm backdrop-blur-xl',
          className
        )}
      >
        <div className="flex flex-col @lg:flex-row @lg:items-center @lg:justify-between">
          <div>
            <Title
              as="h2"
              className="mb-2 text-[22px] lg:text-2xl 4xl:text-[26px]"
            >
              {title}
            </Title>

            {breadcrumb && (
              <Breadcrumb
                separator=""
                separatorVariant="circle"
                className="flex-wrap"
              >
                {breadcrumb.map((item) => (
                  <Breadcrumb.Item
                    key={item.name}
                    {...(item?.href && { href: item?.href })}
                  >
                    {item.name}
                  </Breadcrumb.Item>
                ))}
              </Breadcrumb>
            )}
          </div>

          {/* Right side: custom content or children */}
          <div className="flex items-center gap-3 mt-3 @lg:mt-0">
            {rightContent}
            {children}
          </div>
        </div>
      </header>
    </>
  );
}
