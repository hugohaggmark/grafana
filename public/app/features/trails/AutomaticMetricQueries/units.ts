const UNIT_MAP: Record<string, string> = {
  bytes: 'bytes',
  seconds: 's',
};

export function getGrafanaUnit(metricUnit: string) {
  return UNIT_MAP[metricUnit] || 'short';
}
