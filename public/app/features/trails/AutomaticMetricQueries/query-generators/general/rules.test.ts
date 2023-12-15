import { getGeneratorParameters } from './rules';

export const SUFFIX_TO_EXPECTED_PARAMS = {
  count: { agg: 'sum', rate: true, unit: 'short' },
  total: { agg: 'sum', rate: true, unit: 'short' },
  thing: { agg: 'avg', rate: false, unit: 'short' },
  seconds: { agg: 'avg', rate: false, unit: 's' },
  bytes: { agg: 'avg', rate: false, unit: 'bytes' },
};

export function forEachKeyValue<K extends string, V>(obj: Record<K, V>, callback: (key: K, value: V) => void) {
  let key: K;
  for (key in obj) {
    const value = obj[key];
    callback(key, value);
  }
}

describe('getGeneratorParameters', () => {
  describe('should throw an exception', () => {
    const BAD_SUFFIXES = [
      undefined, //
      '', // indicates a malformed metric name
      'sum', // when `sum` is the suffix `sumMetricQueriesGenerator` uses metric part before "sum"
    ];

    BAD_SUFFIXES.forEach((suffix) => {
      test(`when suffix is ${JSON.stringify(suffix)}`, () => {
        expect(() => getGeneratorParameters(suffix)).toThrowError();
      });
    });
  });

  forEachKeyValue(SUFFIX_TO_EXPECTED_PARAMS, (suffix, expectedParam) => {
    const actualParams = getGeneratorParameters(suffix);
    const expectedParams = SUFFIX_TO_EXPECTED_PARAMS[suffix];
    test(`when suffix is ${JSON.stringify(suffix)} params should match ${JSON.stringify(expectedParams)}`, () =>
      expect(actualParams).toStrictEqual(expectedParams));
  });
});
