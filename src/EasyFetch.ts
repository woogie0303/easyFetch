import { EasyFetchDefaultConfig } from './createInstance';
import RequestUtils from './RequestUtils';

class EasyFetch {
  #baseUrl: string | URL | undefined;
  #headers: HeadersInit | undefined;

  constructor(defaultConfig?: EasyFetchDefaultConfig) {
    this.#baseUrl = defaultConfig?.baseUrl;
    this.#headers = defaultConfig?.headers;
  }

  async request<T>(
    request: RequestInfo | URL,
    requestInit?: RequestInit | RequestInitWithNextConfig
  ): Promise<T> {
    let fetchURL: string | URL;
    let requestConfig: RequestInit | RequestInitWithNextConfig | undefined;

    if (request instanceof Request) {
      const [url, mergeRequestConfig] = await RequestUtils.mergeRequestConfig(
        request,
        requestInit
      );
      fetchURL = url;
      requestConfig = mergeRequestConfig;
    } else {
      fetchURL = request;
      requestConfig = requestInit;
    }
    return this.#request<T>(fetchURL, requestConfig);
  }

  async #request<T>(
    fetchURL: string | URL,
    requestConfig?: RequestInit | RequestInitWithNextConfig
  ): Promise<T> {
    const globalFetch = fetch;
    const combinedDefaultOptionWithFetchArgs = this.#combineDefaultOptions(
      fetchURL,
      requestConfig
    );

    return 1 as T;
  }

  #combineDefaultOptions(
    fetchURL: string | URL,
    requestConfig: RequestInit | RequestInitWithNextConfig | undefined
  ): [string | URL, RequestInit | RequestInitWithNextConfig | undefined] {
    let combinedDefaultUrl: string | URL | undefined;
    let combinedDefaultHeaders:
      | RequestInit
      | RequestInitWithNextConfig
      | undefined;

    if (this.#baseUrl) {
      combinedDefaultUrl = new URL(this.#baseUrl, fetchURL);
    }

    if (this.#headers) {
      const defaultHeaders = new Headers(this.#headers);

      for (const [key, value] of new Headers(
        requestConfig?.headers
      ).entries()) {
        defaultHeaders.set(key, value);
      }

      combinedDefaultHeaders = {
        ...requestConfig,
        headers: defaultHeaders,
      };
    }

    return [
      combinedDefaultUrl ?? fetchURL,
      combinedDefaultHeaders ?? requestConfig,
    ];
  }
}

export default EasyFetch;
