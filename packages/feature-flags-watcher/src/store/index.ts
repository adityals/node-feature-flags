export default class FeatureFlagStore {
  private store: Map<string, unknown>

  constructor(records: Iterable<readonly [string, unknown]>) {
    this.store = new Map(records)
  }

  public get(key: string): unknown {
    if (!this.store.has(key)) {
      return undefined
    }
    return this.store.get(key)
  }

  public getAllKeys(): Iterator<string> {
    return this.store.keys()
  }
}
