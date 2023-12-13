import { PanelBuilders, SceneQueryRunner } from '@grafana/scenes';

import { trailDS } from '../../shared';
import { AutoQueryDef } from '../types';

export function percentilesGraphBuilder(def: AutoQueryDef) {
  return PanelBuilders.timeseries()
    .setTitle(def.title)
    .setData(
      new SceneQueryRunner({
        datasource: trailDS,
        maxDataPoints: 200,
        queries: def.queries,
      })
    )
    .setUnit(def.unit)
    .setCustomFieldConfig('fillOpacity', 9);
}
