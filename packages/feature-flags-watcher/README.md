# feature-flags-watcher

Watcher for feature flagging in NodeJS. 

## Available Provider
Available provider for watcher can be seen below:
| Name | Description |
| ---- | ----------- |
| Consul KV | Watch Consul KV server for feature flag |


## Consul KV
**Usage:**
```ts
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
```

**Available Events:**
- `changed`: when consul with prefix provided changed
- `healthy`: when the worker able to hit consul server
- `unhealthy`: when the worker not able to hit consul server given max attempt
- `stop`: when the worker stop

**Example:**

For working example, you can see on the `example/consul-kv`