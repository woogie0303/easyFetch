import { EasyFetchDefaultConfig } from './createInstance';
import Interceptor from './Interceptor';
import RequestUtils from './RequestUtils';

class EasyFetch {
  #baseUrl: string | URL | undefined;
  #headers: HeadersInit | undefined;
  #interceptor: Interceptor;

  constructor(defaultConfig?: EasyFetchDefaultConfig) {
    this.#baseUrl = defaultConfig?.baseUrl;
    this.#headers = defaultConfig?.headers;
    this.#interceptor = new Interceptor();
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
    const combinedDefaultOptionWithFetchArgs = this.#combineDefaultOptions(
      fetchURL,
      requestConfig
    );

    const applyInterceptorRequest =
      await this.#interceptor.flushRequestInterceptors(
        Promise.resolve(combinedDefaultOptionWithFetchArgs)
      );

    this.#dispatchFetch(applyInterceptorRequest[0], applyInterceptorRequest[1]);
    return 1 as T;
  }

  async #dispatchFetch(
    fetchURL: string | URL,
    requestConfig?: RequestInit | RequestInitWithNextConfig
  ): Promise<unknown> {
    const globalFetch = fetch;
    const headers = new Headers(requestConfig?.headers);

    headers.get('Content-Type') ??
      headers.set('Content-Type', 'application/json');

    globalFetch(fetchURL, {
      ...requestConfig,
      headers,
    });
    return;
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
      combinedDefaultUrl = new URL(fetchURL, this.#baseUrl);
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

  get interceptor() {
    return this.#interceptor;
  }
}

export default EasyFetch;
