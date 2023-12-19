export function forEachKeyValue<K extends string, V>(obj: Record<K, V>, callback: (key: K, value: V) => void) {
  let key: K;
  for (key in obj) {
    const value = obj[key];
    callback(key, value);
  }
}
