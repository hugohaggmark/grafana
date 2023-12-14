import { VizPanelBuilder } from '@grafana/scenes';
import { PromQuery } from 'app/plugins/datasource/prometheus/types';

import { bucketMetricQueriesGenerator } from './query-generators/bucket';
import { generalMetricQueriesGenerator, sumMetricQueriesGenerator } from './query-generators/general';
import { AutoQueryInfo } from './types';

export interface AutoQueryDef {
  variant: string;
  title: string;
  unit: string;
  queries: PromQuery[];
  vizBuilder: (def: AutoQueryDef) => VizPanelBuilder<{}, {}>;
}

type MetricQueriesGenerator = (metricParts: string[]) => AutoQueryInfo;

const SUFFIX_TO_GENERATOR: Record<string, MetricQueriesGenerator> = {
  bucket: bucketMetricQueriesGenerator,
  sum: sumMetricQueriesGenerator,
};

function getQueryGeneratorFor(suffix?: string) {
  if (!suffix || suffix === '') {
    return null;
  }
  return SUFFIX_TO_GENERATOR[suffix] || generalMetricQueriesGenerator;
}

export function getAutoQueriesForMetric(metric: string): AutoQueryInfo {
  const metricParts = metric.split('_');

  const suffix = metricParts.at(-1);

  const generator = getQueryGeneratorFor(suffix);

  if (!generator) {
    throw new Error(`Unable to generate queries for metric "${metric}" due to issues with derived suffix "${suffix}"`);
  }

  return generator(metricParts);
}
