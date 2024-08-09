import { EasyFetchDefaultConfig } from './createInstance';
import Interceptor from './Interceptor';
import RequestUtils from './RequestUtils';
import { RequestInitWithNextConfig } from './types/nextProperty.type';
import type { EasyFetchResponse } from './types/response.type';

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
    requestInit?: RequestInitWithNextConfig
  ) {
    let fetchURL: string | URL;
    let requestConfig: RequestInitWithNextConfig | undefined;

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
    requestConfig?: RequestInitWithNextConfig
  ) {
    const combinedDefaultOptionWithFetchArgs = this.#combineDefaultOptions(
      fetchURL,
      requestConfig
    );

    const applyInterceptorRequest =
      await this.#interceptor.flushRequestInterceptors(
        Promise.resolve(combinedDefaultOptionWithFetchArgs)
      );

    //TODO: response값이 같지 않으면 에러발생 왜냐하면 transform result가 아니기 때문에

    return this.#interceptor.flushResPonseInterceptors(
      this.#dispatchFetch<T>(
        applyInterceptorRequest[0],
        applyInterceptorRequest[1]
      )
    ) as Promise<EasyFetchResponse<T>>;
  }

  async #dispatchFetch<T>(
    fetchURL: string | URL,
    requestConfig?: RequestInitWithNextConfig
  ): Promise<EasyFetchResponse<T>> {
    const globalFetch = fetch;
    const headers = new Headers(requestConfig?.headers);

    headers.get('Content-Type') ??
      headers.set('Content-Type', 'application/json');

    try {
      const res = await globalFetch(fetchURL, {
        ...requestConfig,
        headers,
      });

      const body = (await res.json()) as T;

      const response: EasyFetchResponse<T> = {
        headers: res.headers,
        ok: res.ok,
        redirected: res.redirected,
        status: res.status,
        statusText: res.statusText,
        type: res.type,
        url: res.url,
        config: [fetchURL, requestConfig],
        body,
      };

      // Todo: 500 이하 추가
      if (!res.ok || res.status >= 400) {
        throw new Error(`${res.status} Error`, {
          cause: response,
        });
      }

      return Promise.resolve(response);
    } catch (err) {
      // TODO: Easyresponse 형태로 바꾸기
      if (err instanceof Error) {
        return Promise.reject(err.cause);
      } else {
        throw err;
      }
    }
  }

  #combineDefaultOptions(
    fetchURL: string | URL,
    requestConfig: RequestInitWithNextConfig | undefined
  ): [string | URL, RequestInitWithNextConfig | undefined] {
    let combinedDefaultUrl: string | URL | undefined;
    let combinedDefaultHeaders: RequestInitWithNextConfig | undefined;

    if (this.#baseUrl) {
      combinedDefaultUrl = new URL(fetchURL, this.#baseUrl);
    }

    if (this.#headers) {
      const defaultHeaders = new Headers(this.#headers);
      const requestConfigHeaders = new Headers(requestConfig?.headers);

      for (const [key, value] of defaultHeaders.entries()) {
        requestConfigHeaders.set(key, value);
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
    return {
      request: this.#interceptor.request,
      response: this.#interceptor.response,
    };
  }
}

export default EasyFetch;
