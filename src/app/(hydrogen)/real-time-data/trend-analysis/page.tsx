import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Trend Analysis'),
};

export default function TrendAnalysisPage() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center rounded-lg border border-dashed border-muted p-8 text-center">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Trend Analysis</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Placeholder screen for the upcoming Grafana-like dashboard.
        </p>
      </div>
    </div>
  );
}
