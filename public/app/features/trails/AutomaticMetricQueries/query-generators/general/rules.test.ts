import { SUFFIX_TO_EXPECTED_PARAMS } from '../__test__/suffix.cases';
import { forEachKeyValue } from '../__test__/util';

import { getGeneratorParameters } from './rules';

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
