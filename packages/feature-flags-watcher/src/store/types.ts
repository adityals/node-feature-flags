import FeatureFlagStoreClass from '.'

export type FeatureFlagStore = FeatureFlagStoreClass

export interface KVStore {
  store: FeatureFlagStoreClass | null
  error: Error | null
}
