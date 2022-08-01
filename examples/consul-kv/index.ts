import http from 'http'
import type { IncomingMessage, ServerResponse } from 'http'
import FFConfig from './config'
import { ConsulKVWatcher } from 'node-feature-flags-watcher'

const featureFlag = new FFConfig()
const PORT = 3000

async function initFeatureFlagWatcher() {
  const featureFlags = new ConsulKVWatcher({
    consulBaseURL: 'http://localhost:8500',
    keyPrefix: 'service/my-service/v1/feature-flag',
    interval: 5 * 1000,
    unhealthyThreshold: 3,
    autoHealing: true,
  })

  const { store, error } = await featureFlags.startWatch()
  if (error !== null) {
    console.error('[Watcher][Error][Init]', error.message)
  }

  if (store !== null) {
    featureFlag.populate(store)
  }

  featureFlags.on('changed', data => {
    console.log('[Watcher] Data received')
    featureFlag.populate(data)
  })

  featureFlags.on('error', error => {
    console.error('[Watcher][Error]', error.message)
  })

  featureFlags.on('unhealthy', () => {
    console.error('[Watcher] Unhealthy threshold reached')
  })

  featureFlags.on('stop', () => {
    console.error('[Watcher] has been stopped')
  })
}

const handler = (_: IncomingMessage, res: ServerResponse) => {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(featureFlag.config))
}

http.createServer(handler).listen(PORT, '0.0.0.0', async () => {
  console.log(`Server is running on http://localhost:${PORT}`)
  await initFeatureFlagWatcher()
})
