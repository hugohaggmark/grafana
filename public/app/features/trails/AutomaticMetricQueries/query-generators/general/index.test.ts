import * as queries from './queries';
import * as rules from './rules';
import { SUFFIX_TO_EXPECTED_PARAMS, forEachKeyValue } from './rules.test';

const generateQueries = jest.spyOn(queries, 'generateQueries');
const getGeneratorParameters = jest.spyOn(rules, 'getGeneratorParameters');

import general from '.';

describe('general.generator', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('for metric with "_sum" suffix', () => {
    const metricParts = ['metric', 'with', 'suffix', 'sum'];
    test('results in thrown error', () => {
      expect(() => general.generator(metricParts)).toThrowError();
    });
  });

  forEachKeyValue(SUFFIX_TO_EXPECTED_PARAMS, (suffix, expectedParams) => {
    const metricParts = ['a', 'b', suffix];
    jest.clearAllMocks();
    describe(`when called with ${JSON.stringify(metricParts)}`, () => {
      general.generator(metricParts);
      const generateQueriesParams = generateQueries.mock.lastCall?.[0];
      const getGeneratorParametersPrefix = getGeneratorParameters.mock.lastCall?.[0];

      test(`\`getGeneratorParameters\` will be called with ${JSON.stringify(suffix)}`, () => {
        expect(getGeneratorParametersPrefix).toBe(suffix);
      });
      test(`\`generateQueries\` will be called with ${JSON.stringify(expectedParams)}`, () => {
        expect(generateQueriesParams).toStrictEqual(expectedParams);
      });
    });
  });
});
