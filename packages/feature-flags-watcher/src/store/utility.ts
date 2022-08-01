import type { ConsulKVResponse } from '../provider/consul/remote.types'
import FeatureFlagStore from '.'
import { KVStore } from './types'

export function populateConsulKVStore(
  data: ConsulKVResponse[] | null,
  kvPrefix: string,
): KVStore {
  if (!data || data.length === 0) {
    return { store: null, error: Error('Data is not valid, it may be null') }
  }

  const records = data.map(v => [
    v.Key.replace(`${kvPrefix}/`, ''),
    parseValue(v.Value),
  ])
  const store = new FeatureFlagStore(
    records as Iterable<readonly [string, string]>,
  )
  return { store: store, error: null }
}

function parseValue(value: string) {
  const decode = Buffer.from(value, 'base64').toString()
  try {
    return JSON.parse(decode)
  } catch {
    return decode
  }
}
