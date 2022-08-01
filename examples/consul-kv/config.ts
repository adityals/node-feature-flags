import type { FeatureFlagStore } from 'node-feature-flags-watcher'

interface Config {
  dbHost: string
  dbName: string
  testConfig: string
}

export default class FFConfig {
  public config: Config
  private static instance: FFConfig

  constructor() {
    if (FFConfig.instance) {
      throw Error('Feature flag config is already initialized')
    }

    this.config = {
      dbHost: '',
      dbName: '',
      testConfig: '',
    }

    FFConfig.instance = this
  }

  public getInstance(): FFConfig {
    return FFConfig.instance
  }

  public populate(store: FeatureFlagStore) {
    this.config = {
      dbHost: (store.get('MONGODB_DATABASE') as string) || '',
      dbName: (store.get('MONGODB_HOST') as string) || '',
      testConfig: (store.get('TEST_CONFIG') as string) || '',
    }
  }
}
