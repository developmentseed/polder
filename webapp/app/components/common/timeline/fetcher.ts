export interface DataFetcherData<T> {
  key: string[];
  status: 'loading' | 'error' | 'success';
  error?: Error;
  data?: T;
}

type TreeMap<T> = Map<string, TreeMap<T> | DataFetcherData<T>>;

function getNestedMap<T>(dataMap: TreeMap<T>, key: string[]) {
  if (key.length === 0) {
    return dataMap;
  }

  const [k, ...remaining] = key;
  const next = dataMap.get(k);
  if (!next || !(next instanceof Map)) {
    return;
  }
  return getNestedMap(next as TreeMap<T>, remaining);
}

function flattenNestedMap<T>(dataMap: TreeMap<T>) {
  let results: DataFetcherData<T>[] = [];

  for (const data of dataMap.values()) {
    results = results.concat(
      data instanceof Map ? flattenNestedMap(data) : data
    );
  }
  return results;
}

export class DataFetcher<T> extends EventTarget {
  private _cache_: TreeMap<T> = new Map();

  constructor() {
    super();
    this.fetchData = this.fetchData.bind(this);
  }

  getCacheMap(key: string[]) {
    return getNestedMap(this._cache_, key);
  }

  private getCached(key: string[]) {
    const data = this.getCacheMap(key);
    return data ? (data.get('#') as DataFetcherData<T>) : undefined;
  }

  private setCached(key: string[], value: DataFetcherData<T>) {
    let current = this._cache_;
    for (const k of key) {
      let next = current.get(k);
      if (!next) {
        next = new Map();
        current.set(k, next);
      }
      current = next as TreeMap<T>;
    }
    current.set('#', value);
  }

  async fetchData({
    key,
    url,
    options,
    force = false
  }: {
    key: string[];
    url: string;
    options?: RequestInit;
    force?: boolean;
  }) {
    const cached = this.getCached(key);
    if (!force && cached && cached.status !== 'error') {
      return;
    }

    this.setCached(key, { key, status: 'loading' });
    this.dispatchEvent(new CustomEvent('data', { detail: { key } }));

    try {
      // const data = _data_.find((d) => d.date === key.last);
      // await new Promise((resolve) =>
      //   setTimeout(resolve, Math.random() * 4000 + 1000)
      // );

      const response = await fetch(url, options);

      if (response.status === 404) {
        // Not found is valid.
        this.setCached(key, { key, status: 'success', data: undefined});
        return;
      }

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const data = await response.json();
      this.setCached(key, { key, status: 'success', data });
    } catch (error) {
      this.setCached(key, { key, status: 'error', error });
    }

    this.dispatchEvent(new CustomEvent('data', { detail: { key } }));
  }

  getData(key: string[] = []) {
    const data = this.getCacheMap(key);
    return data ? flattenNestedMap(data) : [];
  }
}
