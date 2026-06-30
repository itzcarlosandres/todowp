/**
 * Cache stub — Redis eliminado. Las funciones llaman directamente al fetcher.
 * Cuando se instale Redis en producción, reemplazar este archivo.
 */

export async function cache<T>(
  _key: string,
  fetcher: () => Promise<T>,
  _ttlSeconds = 300,
): Promise<T> {
  return fetcher();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function invalidateCache(_pattern: string): Promise<void> {
  // no-op sin Redis
}
