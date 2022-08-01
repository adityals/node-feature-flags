export interface ConsulRemoteClientConfig {
  url: string
  prefix: string
}

export interface ConsulKVResponse {
  CreateIndex: number
  ModifyIndex: number
  LockIndex: number
  Key: string
  Flags: number
  Value: string
  Session: string
}

export interface ConsulRemoteReadResponse {
  data: ConsulKVResponse[] | null
  consulIndex: string
  error: Error | null
}
