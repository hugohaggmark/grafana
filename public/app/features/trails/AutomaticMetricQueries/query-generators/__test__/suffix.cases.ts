export const SUFFIX_TO_EXPECTED_PARAMS = {
  count: { agg: 'sum', rate: true, unit: 'short' },
  total: { agg: 'sum', rate: true, unit: 'short' },
  thing: { agg: 'avg', rate: false, unit: 'short' },
  seconds: { agg: 'avg', rate: false, unit: 's' },
  bytes: { agg: 'avg', rate: false, unit: 'bytes' },
};
