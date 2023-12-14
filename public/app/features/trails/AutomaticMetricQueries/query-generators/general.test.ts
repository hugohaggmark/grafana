import { AutoQueryInfo } from '../types';

import { generateQueries, getGeneratorParameters } from './general';

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

  const suffixToExpectedParams = {
    count: { agg: 'sum', rate: true, unit: 'short' },
    total: { agg: 'sum', rate: true, unit: 'short' },
    thing: { agg: 'avg', rate: false, unit: 'short' },
    seconds: { agg: 'avg', rate: false, unit: 's' },
    bytes: { agg: 'avg', rate: false, unit: 'bytes' },
  };

  let suffix: keyof typeof suffixToExpectedParams;
  for (suffix in suffixToExpectedParams) {
    describe(`when suffix is ${JSON.stringify(suffix)}`, () => {
      const params = getGeneratorParameters(suffix);
      const expectedParams: typeof params = suffixToExpectedParams[suffix];

      let key: keyof typeof params;
      for (key in params) {
        const expected = expectedParams[key];
        const actual = params[key];

        test(`params.${key} should be ${JSON.stringify(expected)}`, () => expect(actual).toBe(expected));
      }
    });
  }
});

describe('generateQueries', () => {
  // WIP
  const agg = 'fakeagg';
  const unit = 'fakeunit';

  function assertAggUnit(queryInfo: AutoQueryInfo) {
    let key: keyof typeof queryInfo;
    for (key in queryInfo) {
      if (key !== 'variants') {
        const queryDef = queryInfo[key];
        test(`expected unit is part of queryInfo.${key}`, () => expect(queryDef.unit).toBe(unit));

        continue;
      }

      queryInfo[key].forEach((queryDef, index) => {
        test(`expected unit is part of queryInfo.${key}[${index}]`, () => expect(queryDef.unit).toBe(unit));
      });
    }
  }

  describe('when rate is false', () => {
    const queryInfo = generateQueries({ agg, unit, rate: false });
    assertAggUnit(queryInfo);
  });
});
