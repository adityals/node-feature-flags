export interface ConsulKVWatcherConfig {
  /** watcher interval */
  interval: number
  /** consul server base url */
  consulBaseURL: string
  /** consul KV prefix path */
  keyPrefix: string
  /** threshold for retyring consul server */
  unhealthyThreshold: number
  /** enable auto heal */
  autoHealing?: boolean
  /** time to retry for auto healing */
  autoHealingBackoffTime?: number
}
