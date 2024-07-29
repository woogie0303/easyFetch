import { EasyFetchDefaultConfig } from './createInstance';
import {
  createMergedRequestInit,
  hasNextConfig,
} from './libs/mergedRequestInit';

class EasyFetch {
  #baseUrl: string | URL | undefined;
  #headers: HeadersInit | undefined;

  constructor(defaultConfig?: EasyFetchDefaultConfig) {
    this.#baseUrl = defaultConfig?.baseUrl;
    this.#headers = defaultConfig?.headers;
  }

  async #mergeRequestConfig(
    request: Request,
    requestInit?: RequestInitWithNextConfig | RequestInit
  ): Promise<[string, RequestInitWithNextConfig | RequestInit]> {
    const fetchURL = request.url;
    let requestConfig: RequestInitWithNextConfig | RequestInit;

    if (requestInit && hasNextConfig(requestInit)) {
      const { next, ...rest } = requestInit;
      const mergedRequestInit = await createMergedRequestInit(request, rest);

      requestConfig = {
        ...mergedRequestInit,
        next,
      };
    }

    requestConfig = await createMergedRequestInit(request, requestInit);

    return [fetchURL, requestConfig];
  }

  async request<T>(
    request: RequestInfo | URL,
    requestInit?: RequestInit | RequestInitWithNextConfig
  ): Promise<T> {
    let fetchURL: string | URL;
    let requestConfig: RequestInit | RequestInitWithNextConfig | undefined;

    if (request instanceof Request) {
      const [url, mergeRequestConfig] = await this.#mergeRequestConfig(
        request,
        requestInit
      );
      fetchURL = url;
      requestConfig = mergeRequestConfig;
    } else {
      fetchURL = request;
      requestConfig = requestInit;
    }
    return this.#request(fetchURL, requestConfig) as T; // DUMMY
  }

  async #request(
    fetchURL: string | URL,
    requestConfig: RequestInit | RequestInitWithNextConfig | undefined
  ) {
    return '1';
  }
}

export default EasyFetch;
