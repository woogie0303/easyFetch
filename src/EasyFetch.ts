import { EasyFetchDefaultConfig } from './createInstance';
import Interceptor from './Interceptor';
import RequestUtils from './RequestUtils';
import type {
  EasyFetchRequestType,
  EasyFetchResponse,
} from './types/easyFetch.type';
import { convertEasyFetchResponse } from './utils/convertEasyFetchResponse';
import { hasEasyFetchResponse } from './utils/hasEasyFetchResponse';
import { hasResponseBody } from './utils/hasResponseBody';

class EasyFetch {
  #baseUrl: EasyFetchRequestType[0] | undefined;
  #headers: HeadersInit | undefined;
  #interceptor: Interceptor;

  constructor(defaultConfig?: EasyFetchDefaultConfig) {
    this.#baseUrl = defaultConfig?.baseUrl;
    this.#headers = defaultConfig?.headers;
    this.#interceptor = new Interceptor();
  }

  async request<T>(
    request: RequestInfo | URL,
    requestInit?: EasyFetchRequestType[1]
  ) {
    let fetchURL: EasyFetchRequestType[0];
    let requestConfig: EasyFetchRequestType[1];

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
    fetchURL: EasyFetchRequestType[0],
    requestConfig?: EasyFetchRequestType[1]
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
    fetchURL: EasyFetchRequestType[0],
    requestConfig?: EasyFetchRequestType[1]
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

      const easyFetchResponse = await convertEasyFetchResponse<T>(res, {
        ...requestConfig,
        headers,
      });

      if (
        !res.ok ||
        (res.status < 500 && res.status >= 400) ||
        !hasResponseBody(easyFetchResponse)
      ) {
        throw new Error(`${res.status} Error`, {
          cause: easyFetchResponse,
        });
      }

      return Promise.resolve(easyFetchResponse);
    } catch (err) {
      if (err instanceof Error && hasEasyFetchResponse(err.cause)) {
        return Promise.reject(err.cause);
      } else {
        throw err;
      }
    }
  }

  #combineDefaultOptions(
    fetchURL: EasyFetchRequestType[0],
    requestConfig: EasyFetchRequestType[1]
  ): EasyFetchRequestType {
    let combinedDefaultUrl: EasyFetchRequestType[0] | undefined;
    let combinedDefaultHeaders: EasyFetchRequestType[1];

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
        headers: requestConfigHeaders,
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
