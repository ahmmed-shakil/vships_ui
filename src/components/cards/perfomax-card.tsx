'use client';

import { ComponentPropsWithRef, forwardRef, ReactNode } from 'react';
import { Title } from 'rizzui/typography';
import cn from '../../utils/class-names';

/* ------------------------------------------------------------------ */
/*  Style definitions                                                  */
/* ------------------------------------------------------------------ */

const cardClasses = {
  base: 'overflow-hidden border border-muted bg-gray-0 dark:bg-gray-50',
  rounded: {
    sm: 'rounded-sm',
    DEFAULT: 'rounded-xl',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
  },
} as const;

/** CSS border-radius values matching the rounded variants */
const borderRadiusMap: Record<keyof typeof cardClasses.rounded, string> = {
  sm: '2px',
  DEFAULT: '12px',
  lg: '12px',
  xl: '16px',
};

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface PerfomaxCardProps
  extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
  /** Card title (string or ReactNode) */
  title?: ReactNode;
  /** Description shown below the title */
  description?: ReactNode;
  /** Content rendered on the right side of the header.
   *  Pass `<HealthScoreHeader />`, any custom component, or omit for nothing. */
  action?: ReactNode;
  /** Optional accent-bar colour at the very top of the card.
   *  Pass a hex/rgb string, or omit to hide the bar entirely. */
  accentColor?: string;
  /** Optional footer slot rendered below children, full-width. */
  footer?: ReactNode;
  /** Optional content rendered below the main header row, full-width. */
  headerFooter?: ReactNode;
  /** Extra class on the header footer wrapper */
  headerFooterClassName?: string;
  /** Border-radius variant */
  rounded?: keyof typeof cardClasses.rounded;
  /** Extra class on the header row */
  headerClassName?: string;
  /** Extra class on the title element */
  titleClassName?: string;
  /** Extra class on the action wrapper */
  actionClassName?: string;
  /** Content rendered between the title and the action slot (e.g. StatusGauge). */
  headerRight?: ReactNode;
  /** Extra class on the description wrapper */
  descriptionClassName?: string;
  /** Extra class on the body (children) wrapper */
  bodyClassName?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const PerfomaxCard = forwardRef<HTMLDivElement, PerfomaxCardProps>(
  function PerfomaxCard(
    {
      title,
      description,
      action,
      accentColor,
      footer,
      headerFooter,
      headerFooterClassName,
      rounded = 'DEFAULT',
      className,
      headerClassName,
      titleClassName,
      actionClassName,
      headerRight,
      descriptionClassName,
      bodyClassName,
      children,
      ...rest
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cn(
          cardClasses.base,
          cardClasses.rounded[rounded],
          className
        )}
        {...rest}
      >
        {/* ── Accent bar ─────────────────────────────────────────────── */}
        {accentColor && (
          <div
            className="h-[6px] w-full"
            style={{
              backgroundColor: accentColor,
              borderRadius: `${borderRadiusMap[rounded]} ${borderRadiusMap[rounded]} 0 0`,
            }}
          />
        )}

        {/* ── Header ─────────────────────────────────────────────────── */}
        {(title || action || headerRight) && (
          <div
            className={cn(
              'px-3 pb-2 pt-3',
              (action || headerRight) && 'flex items-center justify-between',
              headerClassName
            )}
          >
            <div className="flex items-center gap-2">
              <div>
                {title && (
                  <Title
                    as="h3"
                    className={cn(
                      'text-[20px] font-bold leading-7',
                      titleClassName
                    )}
                  >
                    {title}
                  </Title>
                )}
                {description && (
                  <div className={descriptionClassName}>{description}</div>
                )}
              </div>
              {headerRight}
            </div>

            {action && (
              <div className={cn('ps-2', actionClassName)}>{action}</div>
            )}
          </div>
        )}

        {/* ── Header Footer ──────────────────────────────────────────── */}
        {headerFooter && (
          <div className={cn('w-full', headerFooterClassName)}>
            {headerFooter}
          </div>
        )}

        {/* ── Body ───────────────────────────────────────────────────── */}
        {children && <div className={bodyClassName}>{children}</div>}

        {/* ── Footer ─────────────────────────────────────────────────── */}
        {footer}
      </div>
    );
  }
);

PerfomaxCard.displayName = 'PerfomaxCard';
export default PerfomaxCard;
