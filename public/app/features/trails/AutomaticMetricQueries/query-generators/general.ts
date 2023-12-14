import { VAR_FILTERS_EXPR, VAR_GROUP_BY_EXP, VAR_METRIC_EXPR } from '../../shared';
import { simpleGraphBuilder } from '../graph-builders/simple';
import { AutoQueryDef, AutoQueryInfo } from '../types';
import { getGrafanaUnit } from '../units';

export type AutoQueryParameters = {
  agg: string;
  unit: string;
  rate: boolean;
};

/** This suffix will set rate to true */
const RATE_SUFFIXES = new Set(['count', 'total']);

/** Non-default aggregattion keyed by suffix */
const SPECIFIC_AGGREGATIONS_FOR_SUFFIX: Record<string, string> = {
  count: 'sum',
  total: 'sum',
};

export function getGeneratorParameters(suffix?: string): AutoQueryParameters {
  if (suffix == null || suffix == '') {
    throw new Error(`Cannot get generator parameters for undefined of blank suffix`);
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
  return generateQueries(params);
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
  return generateQueries(params);
}

const GENERAL_BASE_QUERY = `${VAR_METRIC_EXPR}${VAR_FILTERS_EXPR}`;
const GENERAL_RATE_BASE_QUERY = `rate(${GENERAL_BASE_QUERY}[$__rate_interval])`;

export function getGeneralBaseQuery(rate: boolean) {
  return rate ? GENERAL_RATE_BASE_QUERY : GENERAL_BASE_QUERY;
}

export function generateQueries({ agg, rate, unit }: AutoQueryParameters): AutoQueryInfo {
  const baseQuery = getGeneralBaseQuery(rate);

  const main = createMainQuery(baseQuery, agg, unit);

  const breakdown = createBreakdownQuery(baseQuery, agg, unit);

  return { preview: main, main: main, breakdown: breakdown, variants: [] };
}

function createMainQuery(baseQuery: string, agg: string, unit: string): AutoQueryDef {
  return {
    title: `${VAR_METRIC_EXPR}`,
    variant: 'graph',
    unit,
    queries: [{ refId: 'A', expr: `${agg}(${baseQuery})` }],
    vizBuilder: simpleGraphBuilder,
  };
}

function createBreakdownQuery(baseQuery: string, agg: string, unit: string): AutoQueryDef {
  return {
    title: `${VAR_METRIC_EXPR}`,
    variant: 'graph',
    unit,
    queries: [
      {
        refId: 'A',
        expr: `${agg}(${baseQuery}) by(${VAR_GROUP_BY_EXP})`,
        legendFormat: `{{${VAR_GROUP_BY_EXP}}}`,
      },
    ],
    vizBuilder: simpleGraphBuilder,
  };
}
