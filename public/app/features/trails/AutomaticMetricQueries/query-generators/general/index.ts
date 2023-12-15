import { generateQueries } from './queries';
import { getGeneratorParameters } from './rules';

function generator(metricParts: string[]) {
  const suffix = metricParts.at(-1);
  const params = getGeneratorParameters(suffix);
  return generateQueries(params);
}

export default { generator };
