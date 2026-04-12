'use client';

import cn from '@/utils/class-names';
import { toPng } from 'html-to-image';
import { useCallback, useRef, useState } from 'react';
import { PiDownloadSimpleBold } from 'react-icons/pi';

export default function ChartExportButton({
  targetRef,
  fileName = 'chart',
  className,
}: {
  targetRef: React.RefObject<HTMLElement | null>;
  fileName?: string;
  className?: string;
}) {
  const [exporting, setExporting] = useState(false);

  const handleExport = useCallback(async () => {
    if (!targetRef.current || exporting) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(targetRef.current, {
        cacheBust: true,
        backgroundColor: '#ffffff',
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `${fileName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Chart export failed:', err);
    } finally {
      setExporting(false);
    }
  }, [targetRef, fileName, exporting]);

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      title="Export chart as PNG"
      className={cn(
        'inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground disabled:opacity-50',
        className
      )}
    >
      <PiDownloadSimpleBold className="h-4 w-4" />
    </button>
  );
}
