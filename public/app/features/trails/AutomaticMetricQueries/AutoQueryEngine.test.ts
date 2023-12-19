import { getAutoQueriesForMetric } from './AutoQueryEngine';

describe('AutoQueryEngine', () => {
  describe('Main query', () => {
    it.each([
      // General
      ['my_metric_count', 'sum(rate(${metric}{${filters}}[$__rate_interval]))', 'short'],
      ['my_metric_seconds_count', 'sum(rate(${metric}{${filters}}[$__rate_interval]))', 's'],
      ['my_metric_bytes', 'avg(${metric}{${filters}})', 'bytes'],
      ['my_metric_seconds', 'avg(${metric}{${filters}})', 's'],
      ['my_metric_general', 'avg(${metric}{${filters}})', 'short'],
      ['my_metric_seconds_total', 'sum(rate(${metric}{${filters}}[$__rate_interval]))', 'short'],
      // Sum
      ['my_metric_seconds_sum', 'avg(rate(${metric}{${filters}}[$__rate_interval]))', 's'],
      // Bucket
      [
        'my_metric_bucket',
        [
          'histogram_quantile(0.99, sum by(le) (rate(${metric}{${filters}}[$__rate_interval])))',
          'histogram_quantile(0.90, sum by(le) (rate(${metric}{${filters}}[$__rate_interval])))',
          'histogram_quantile(0.50, sum by(le) (rate(${metric}{${filters}}[$__rate_interval])))',
        ],
        'short',
      ],
      [
        'my_metric_seconds_bucket',
        [
          'histogram_quantile(0.99, sum by(le) (rate(${metric}{${filters}}[$__rate_interval])))',
          'histogram_quantile(0.90, sum by(le) (rate(${metric}{${filters}}[$__rate_interval])))',
          'histogram_quantile(0.50, sum by(le) (rate(${metric}{${filters}}[$__rate_interval])))',
        ],
        's',
      ],
    ])('Given metric named %s should generate query', (metric, expectedQuery, expectedUnit) => {
      const defs = getAutoQueriesForMetric(metric);

      if (typeof expectedQuery === 'string') {
        // For single query
        expect(defs.main.queries[0].expr).toEqual(expectedQuery);
      } else {
        // For multiple queries
        const exprs = defs.main.queries.map((query) => query.expr);
        expect(exprs).toStrictEqual(expectedQuery);
      }
      expect(defs.main.unit).toEqual(expectedUnit);
    });
  });

  describe('Preview query', () => {
    it.each([
      // General
      ['my_metric_count', 'sum(rate(${metric}{${filters}}[$__rate_interval]))', 'short'],
      ['my_metric_seconds_count', 'sum(rate(${metric}{${filters}}[$__rate_interval]))', 's'],
      ['my_metric_bytes', 'avg(${metric}{${filters}})', 'bytes'],
      ['my_metric_seconds', 'avg(${metric}{${filters}})', 's'],
      ['my_metric_general', 'avg(${metric}{${filters}})', 'short'],
      ['my_metric_seconds_total', 'sum(rate(${metric}{${filters}}[$__rate_interval]))', 'short'],
      // Sum
      ['my_metric_seconds_sum', 'avg(rate(${metric}{${filters}}[$__rate_interval]))', 's'],
      // Bucket
      [
        'my_metric_bucket',
        'histogram_quantile(0.50, sum by(le) (rate(${metric}{${filters}}[$__rate_interval])))',
        'short',
      ],
      [
        'my_metric_seconds_bucket',
        'histogram_quantile(0.50, sum by(le) (rate(${metric}{${filters}}[$__rate_interval])))',
        's',
      ],
    ])('Given metric named %s should generate preview query', (metric, expectedQuery, expectedUnit) => {
      const defs = getAutoQueriesForMetric(metric);

      if (typeof expectedQuery === 'string') {
        // For single query
        expect(defs.preview.queries[0].expr).toEqual(expectedQuery);
      } else {
        // For multiple queries
        const exprs = defs.preview.queries.map((query) => query.expr);
        expect(exprs).toStrictEqual(expectedQuery);
      }
      expect(defs.main.unit).toEqual(expectedUnit);
    });
  });

  describe('Breakdown query', () => {
    it.each([
      // General
      ['my_metric_count', 'sum(rate(${metric}{${filters}}[$__rate_interval])) by(${groupby})', 'short'],
      ['my_metric_seconds_count', 'sum(rate(${metric}{${filters}}[$__rate_interval])) by(${groupby})', 's'],
      ['my_metric_bytes', 'avg(${metric}{${filters}}) by(${groupby})', 'bytes'],
      ['my_metric_seconds', 'avg(${metric}{${filters}}) by(${groupby})', 's'],
      ['my_metric_general', 'avg(${metric}{${filters}}) by(${groupby})', 'short'],
      ['my_metric_seconds_total', 'sum(rate(${metric}{${filters}}[$__rate_interval])) by(${groupby})', 'short'],
      // Sum
      ['my_metric_seconds_sum', 'avg(rate(${metric}{${filters}}[$__rate_interval])) by(${groupby})', 's'],
      // Bucket
      [
        'my_metric_bucket',
        'histogram_quantile(0.50, sum by(le, ${groupby}) (rate(${metric}{${filters}}[$__rate_interval])))',
        'short',
      ],
      [
        'my_metric_seconds_bucket',
        'histogram_quantile(0.50, sum by(le, ${groupby}) (rate(${metric}{${filters}}[$__rate_interval])))',
        's',
      ],
    ])('Given metric named %s should generate breakdown query', (metric, expectedQuery, expectedUnit) => {
      const defs = getAutoQueriesForMetric(metric);

      if (typeof expectedQuery === 'string') {
        // For single query
        expect(defs.breakdown.queries[0].expr).toEqual(expectedQuery);
      } else {
        // For multiple queries
        const exprs = defs.breakdown.queries.map((query) => query.expr);
        expect(exprs).toStrictEqual(expectedQuery);
      }
      expect(defs.main.unit).toEqual(expectedUnit);
    });
  });
});
