import axios from 'axios'
import type { AxiosInstance } from 'axios'
import type {
  ConsulRemoteClientConfig,
  ConsulRemoteReadResponse,
} from './remote.types'

export default class ConsulRemoteClient {
  private httpClient: AxiosInstance

  constructor(config: ConsulRemoteClientConfig) {
    this.httpClient = axios.create({
      baseURL: `${config.url}/v1/kv/${config.prefix}`,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  public async read(): Promise<ConsulRemoteReadResponse> {
    try {
      const response = await this.httpClient.get('?recurse=true')
      const consulIndex = response.headers['x-consul-index'] || ''
      return { data: response.data, consulIndex, error: null }
    } catch (ex) {
      return { data: null, consulIndex: '', error: ex as Error }
    }
  }
}
