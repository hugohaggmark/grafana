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

export function getQueryGeneratorFor(suffix: string) {
  return SUFFIX_TO_GENERATOR[suffix] || generalMetricQueriesGenerator;
}

export function getAutoQueriesForMetric(metric: string): AutoQueryInfo {
  const metricParts = metric.split('_');

  const suffix = metric.at(-1);

  if (!suffix) {
    throw new Error(`Unable to get queries for malformed metric ${metric}`);
  }

  const generator = getQueryGeneratorFor(suffix);

  return generator(metricParts);
}
