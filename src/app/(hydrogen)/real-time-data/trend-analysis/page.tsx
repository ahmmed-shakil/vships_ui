import { metaObject } from '@/config/site.config';
import TrendAnalysisLayout from '@/components/real-time-data/trend-analysis';

export const metadata = {
  ...metaObject('Trend Analysis'),
};

export default function TrendAnalysisPage() {
  return <TrendAnalysisLayout />;
}
