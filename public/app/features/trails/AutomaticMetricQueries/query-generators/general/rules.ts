import { getGrafanaUnit } from '../../units';

import { AutoQueryParameters } from './types';

/** This suffix will set rate to true */
const RATE_SUFFIXES = new Set(['count', 'total']);

/** Non-default aggregattion keyed by suffix */
const SPECIFIC_AGGREGATIONS_FOR_SUFFIX: Record<string, string> = {
  count: 'sum',
  total: 'sum',
};

export function getGeneratorParameters(suffix?: string): AutoQueryParameters {
  if (suffix == null || suffix === '') {
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
