import { VAR_FILTERS_EXPR, VAR_GROUP_BY_EXP, VAR_METRIC_EXPR } from '../../shared';
import { simpleGraphBuilder } from '../graph-builders/simple';
import { AutoQueryDef } from '../types';
import { getGrafanaUnit } from '../units';

export type AutoQueryParameters = {
  agg: string;
  unit: string;
  rate: boolean;
};

/** This suffix will set rate to true */
const RATE_SUFFIXES = new Set(['count', 'total', 'sum']);

/** Non-default aggregattion keyed by suffix */
const SPECIFIC_AGGREGATIONS_FOR_SUFFIX: Record<string, string> = {
  count: 'sum',
  total: 'sum',
};

export function getGeneratorParameters(suffix?: string): AutoQueryParameters {
  if (suffix == null) {
    throw new Error(`Cannot get generator parameters for ${suffix}`);
  }

  if (suffix === 'sum') {
    throw new Error(
      '`generalMetricQueriesGenerator` may not be used for suffix `sum`. use `sumMetricsQueriesGenerator` instead'
    );
  }
  return {
    agg: SPECIFIC_AGGREGATIONS_FOR_SUFFIX[suffix] || 'avg',
    unit: getGrafanaUnit(suffix),
    rate: RATE_SUFFIXES.has(suffix),
  };
}

export function generalMetricQueriesGenerator(metricParts: string[]) {
  const suffix = metricParts.at(-1);
  const params = getGeneratorParameters(suffix);
  return generateQueries(metricParts, params);
}

export function sumMetricQueriesGenerator(metricParts: string[]) {
  // assumes suffix is "sum"

  // Get suffix before _sum
  const functionalSuffix = metricParts.at(-2);

  const params = {
    // The suffix before _sum will determine some of the params
    ...getGeneratorParameters(functionalSuffix),
    // But the suffix of sum must always have the following parameters
    rate: true,
  };
  return generateQueries(metricParts, params);
}

export function generateQueries(metricParts: string[], { agg, rate, unit }: AutoQueryParameters) {
  const title = metricParts.join('_');

  let query = `${VAR_METRIC_EXPR}${VAR_FILTERS_EXPR}`;
  if (rate) {
    query = `rate(${query}[$__rate_interval])`;
  }

  const main: AutoQueryDef = {
    title: `${title}`,
    variant: 'graph',
    unit,
    queries: [{ refId: 'A', expr: `${agg}(${query})` }],
    vizBuilder: simpleGraphBuilder,
  };

  const breakdown: AutoQueryDef = {
    title: `${title}`,
    variant: 'graph',
    unit,
    queries: [
      {
        refId: 'A',
        expr: `${agg}(${query}) by(${VAR_GROUP_BY_EXP})`,
        legendFormat: `{{${VAR_GROUP_BY_EXP}}}`,
      },
    ],
    vizBuilder: simpleGraphBuilder,
  };

  return { preview: main, main: main, breakdown: breakdown, variants: [] };
}
