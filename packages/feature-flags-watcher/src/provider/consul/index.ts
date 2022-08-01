import EventEmitter from 'events'
import type { ConsulKVWatcherConfig } from './types'
import { populateConsulKVStore } from '../../store/utility'
import ConsulProvider from './remote'
import type { KVStore } from '../../store/types'

export default class ConsulKVWatcher extends EventEmitter {
  private consulClient: ConsulProvider
  private consulIndex: string
  private kVPrefix: string
  private timer: NodeJS.Timeout | null
  private isRegistered: boolean

  private interval = 5 * 1000
  private unhealthyThreshold = 5
  private healthCheckErrorCounter = 0
  private autoHealing = false
  private autoHealingBackoffTime = 10 * 1000
  private autoHealingTimeout: NodeJS.Timeout | null

  /**
   *
   * @description
   * Create instance for Consul KV Watcher Config
   *
   *
   * @param config {ConsulKVWatcherConfig} Feature flag config
   */
  constructor(config: ConsulKVWatcherConfig) {
    super()

    this.consulClient = new ConsulProvider({
      url: config.consulBaseURL,
      prefix: config.keyPrefix,
    })
    this.consulIndex = ''
    this.kVPrefix = config.keyPrefix
    this.timer = null
    this.isRegistered = false

    this.interval = config.interval || this.interval
    this.unhealthyThreshold =
      config.unhealthyThreshold || this.unhealthyThreshold
    this.healthCheckErrorCounter = 0
    this.autoHealing = config.autoHealing || this.autoHealing
    this.autoHealingBackoffTime =
      config.autoHealingBackoffTime || this.autoHealingBackoffTime
    this.autoHealingTimeout = null
  }

  /**
   * @description
   * Start Consul KV watcher, events will emit after this method invocation
   * Available Events:
   * `changed`: when consul with prefix provided changed
   * `healthy`: when the worker able to hit consul server
   * `unhealthy`: when the worker not able to hit consul server given max attempt
   * `stop`: when the worker stop
   *
   * @returns {Promise<KVStore>}
   */
  public async startWatch(): Promise<KVStore> {
    if (this.isRegistered) {
      return { store: null, error: Error('Watcher already registered') }
    }

    const { data, consulIndex: nextConsulIndex } =
      await this.consulClient.read()
    const { store, error } = populateConsulKVStore(data, this.kVPrefix)

    this.runTick()
    this.consulIndex = nextConsulIndex

    return { store: store, error: error }
  }

  private runTick(): void {
    this.isRegistered = true

    this.timer = setInterval(async () => {
      const {
        data,
        error,
        consulIndex: nextConsulIndex,
      } = await this.consulClient.read()
      if (error !== null) {
        this.emit('error', error)
        this.handleError()
        return
      }
      if (nextConsulIndex === '') {
        this.emit('error', Error('Header [x-consul-index] is empty'))
        this.handleError()
        return
      }

      const { store, error: errorStore } = populateConsulKVStore(
        data,
        this.kVPrefix,
      )
      if (errorStore !== null) {
        this.emit('error', errorStore)
        this.handleError()
        return
      }

      if (this.validateConsulIndex(this.consulIndex, nextConsulIndex)) {
        this.consulIndex = nextConsulIndex
        this.emit('changed', store)
      }

      this.healthCheckErrorCounter = 0
      this.emit('healthy')
    }, this.interval)
  }

  /**
   * @description
   * Stop ConsulKV watcher
   *
   * @returns {Error|null}
   */
  public stopWatch(): Error | null {
    if (!this.isRegistered) {
      return Error('Watcher is not initialized')
    }

    if (this.timer !== null && this.isRegistered) {
      clearInterval(this.timer)
      this.isRegistered = false
    }

    if (this.autoHealingTimeout !== null) {
      clearTimeout(this.autoHealingTimeout)
    }

    this.emit('stop')

    return null
  }

  private handleError(): void {
    this.healthCheckErrorCounter++
    if (this.healthCheckErrorCounter >= this.unhealthyThreshold) {
      this.emit('unhealthy')
      this.stopWatch()

      if (this.autoHealing === true) {
        this.restart()
      }
    }
  }

  private restart(): void {
    this.healthCheckErrorCounter = 0
    this.autoHealingTimeout = setTimeout(() => {
      this.startWatch()
    }, this.autoHealingBackoffTime)
  }

  private validateConsulIndex(prev: string, next: string): boolean {
    if (prev !== next) {
      return true
    }
    return false
  }
}
