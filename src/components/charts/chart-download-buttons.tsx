'use client';

import { toPng } from 'html-to-image';
import type { RefObject } from 'react';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { PiCameraBold, PiFileCsvBold } from 'react-icons/pi';
import { Tooltip } from 'rizzui';

/* ------------------------------------------------------------------ */
/*  CSV helper                                                         */
/* ------------------------------------------------------------------ */

function escapeCSVField(value: unknown): string {
  if (value == null) return '';
  const str = String(value);
  // Wrap in quotes if it contains comma, quote, or newline
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function dataToCSV(
  data: Record<string, unknown>[],
  columns?: { key: string; label: string }[]
): string {
  if (!data.length) return '';

  // Determine columns: use explicit list or derive from data keys
  const cols =
    columns ??
    Object.keys(data[0]).map((key) => ({ key, label: key }));

  const header = cols.map((c) => escapeCSVField(c.label)).join(',');
  const rows = data.map((row) =>
    cols.map((c) => escapeCSVField(row[c.key])).join(',')
  );

  return [header, ...rows].join('\n');
}

function downloadCSV(csvString: string, fileName: string) {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export interface ChartDownloadButtonsProps {
  /** Ref to the DOM element to capture as PNG */
  chartRef: RefObject<HTMLDivElement | null>;
  /** Chart data to export as CSV */
  data: Record<string, unknown>[];
  /** Base filename (without extension) for downloads */
  fileName: string;
  /** Optional explicit column mapping for CSV; defaults to all keys */
  csvColumns?: { key: string; label: string }[];
  /** Optional extra class on the wrapper */
  className?: string;
}

export default function ChartDownloadButtons({
  chartRef,
  data,
  fileName,
  csvColumns,
  className,
}: ChartDownloadButtonsProps) {
  const [snapshotting, setSnapshotting] = useState(false);

  const handlePngDownload = useCallback(async () => {
    if (snapshotting) return;
    const node = chartRef.current;
    if (!node) {
      toast.error('Chart element not found');
      return;
    }
    setSnapshotting(true);
    try {
      const dataUrl = await toPng(node, {
        cacheBust: true,
        backgroundColor: '#111827', // dark bg matching the app theme
        pixelRatio: 2,
        filter: (el) => {
          if (el instanceof HTMLElement && el.classList.contains('ignore-on-export')) {
            return false;
          }
          return true;
        },
      });
      const link = document.createElement('a');
      link.download = `${fileName}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('PNG downloaded');
    } catch (err) {
      console.error('PNG export failed:', err);
      toast.error('PNG export failed');
    } finally {
      setSnapshotting(false);
    }
  }, [snapshotting, chartRef, fileName]);

  const handleCsvDownload = useCallback(() => {
    if (!data.length) {
      toast.error('No data to export');
      return;
    }
    try {
      const csv = dataToCSV(data, csvColumns);
      downloadCSV(csv, fileName);
      toast.success('CSV downloaded');
    } catch (err) {
      console.error('CSV export failed:', err);
      toast.error('CSV export failed');
    }
  }, [data, csvColumns, fileName]);

  return (
    <div className={`flex items-center gap-0.5 ignore-on-export ${className ?? ''}`}>
      <Tooltip content="Download as PNG" placement="bottom">
        <button
          onClick={handlePngDownload}
          disabled={snapshotting}
          className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground disabled:opacity-50"
          aria-label="Download chart as PNG"
        >
          <PiCameraBold className="h-4 w-4" />
        </button>
      </Tooltip>
      <Tooltip content="Download as CSV" placement="bottom">
        <button
          onClick={handleCsvDownload}
          className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          aria-label="Download chart data as CSV"
        >
          <PiFileCsvBold className="h-4 w-4" />
        </button>
      </Tooltip>
    </div>
  );
}
