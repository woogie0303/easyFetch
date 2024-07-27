import { EasyFetchDefaultConfig } from './createInstance';

class EasyFetch {
  #baseUrl: string | URL | undefined;
  #headers: HeadersInit | undefined;

  constructor(defaultConfig?: EasyFetchDefaultConfig) {
    this.#baseUrl = defaultConfig?.baseUrl;
    this.#headers = defaultConfig?.headers;
  }

  async request<T>(url: string | URL, reqConfig?: RequestInit): Promise<T> {}

  async #request() {
    return '1';
  }
}

export default EasyFetch;
