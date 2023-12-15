import { generateQueries } from '../general/queries';
import { getGeneratorParameters } from '../general/rules';

function generator(metricParts: string[]) {
  // assumes suffix is "sum"
  if (metricParts.at(-1) !== 'sum') {
    throw new Error('This generator is only for metrics with suffix "sum"');
  }
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

export default { generator };
