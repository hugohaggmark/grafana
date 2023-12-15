import * as queries from '../general/queries';
import * as rules from '../general/rules';
import { SUFFIX_TO_EXPECTED_PARAMS, forEachKeyValue } from '../general/rules.test';

const generateQueries = jest.spyOn(queries, 'generateQueries');
const getGeneratorParameters = jest.spyOn(rules, 'getGeneratorParameters');

import general from '.';

describe('general.generator', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('for metric lacking a "_sum" suffix', () => {
    const metricParts = ['metric', 'without', 'sum', 'suffix'];
    test('results in thrown error', () => {
      expect(() => general.generator(metricParts)).toThrowError();
    });
  });

  forEachKeyValue(SUFFIX_TO_EXPECTED_PARAMS, (functionalSuffix, nonSumExpectedParams) => {
    const metricParts = ['a', 'b', functionalSuffix, 'sum'];

    // Expected params are the same functionalSuffix before sum, except
    // rate is forced to true by the sum suffix
    const expectedParams = { ...nonSumExpectedParams, rate: true };

    jest.clearAllMocks();
    describe(`when called with ${JSON.stringify(metricParts)}`, () => {
      general.generator(metricParts);
      const generateQueriesParams = generateQueries.mock.lastCall?.[0];
      const getGeneratorParametersPrefix = getGeneratorParameters.mock.lastCall?.[0];

      test(`\`getGeneratorParameters\` will be called with ${JSON.stringify(functionalSuffix)}`, () => {
        expect(getGeneratorParametersPrefix).toBe(functionalSuffix);
      });
      test(`\`generateQueries\` will be called with ${JSON.stringify(expectedParams)}`, () => {
        expect(generateQueriesParams).toStrictEqual(expectedParams);
      });
    });
  });
});
