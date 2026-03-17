'use client';

import { LAYOUT_OPTIONS } from '@/config/enums';
import { useIsMounted } from '@/hooks/use-is-mounted';
// import BerylLiumLayout from '@/layouts/beryllium/beryllium-layout';
// import CarbonLayout from '@/layouts/carbon/carbon-layout';
import HeliumLayout from '@/layouts/helium/helium-layout';
import HydrogenLayout from '@/layouts/hydrogen/layout';
// import LithiumLayout from '@/layouts/lithium/lithium-layout';
import { useLayout } from '@/layouts/use-layout';
// import BoronLayout from 'will-be-deleted/boron/boron-layout';

type LayoutProps = {
  children: React.ReactNode;
};

export default function DefaultLayout({ children }: LayoutProps) {
  return <LayoutProvider>{children}</LayoutProvider>;
}

function LayoutProvider({ children }: LayoutProps) {
  const { layout } = useLayout();
  const isMounted = useIsMounted();

  if (!isMounted) {
    return null;
  }

  if (layout === LAYOUT_OPTIONS.HELIUM) {
    return <HeliumLayout>{children}</HeliumLayout>;
  }
  if (layout === LAYOUT_OPTIONS.LITHIUM) {
    // return <LithiumLayout>{children}</LithiumLayout>;
    return <div>lithium removed. check `(hydrogen)/layout.tsx`</div>
  }
  if (layout === LAYOUT_OPTIONS.BERYLLIUM) {
    // return <BerylLiumLayout>{children}</BerylLiumLayout>;
    return <div>beryllium removed. check `(hydrogen)/layout.tsx`</div>
  }
  if (layout === LAYOUT_OPTIONS.BORON) {
    // return <BoronLayout>{children}</BoronLayout>;
    return <div>boron removed. check `(hydrogen)/layout.tsx`</div>
  }
  if (layout === LAYOUT_OPTIONS.CARBON) {
    // return <CarbonLayout>{children}</CarbonLayout>;
    return <div>carbon removed. check `(hydrogen)/layout.tsx`</div>
  }

  return <HydrogenLayout>{children}</HydrogenLayout>;
}
