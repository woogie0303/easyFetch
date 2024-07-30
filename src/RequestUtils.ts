import { hasNextConfig } from './libs/hasNextConfig';

class RequestUtils {
  static async createMergedRequestInit(
    request: Request,
    requestInit?: RequestInit
  ) {
    const mergedRequestConfig = new Request(request, requestInit);

    if (mergedRequestConfig.method === 'GET') {
      return {
        cache: mergedRequestConfig.cache,
        credentials: mergedRequestConfig.credentials,
        headers: mergedRequestConfig.headers,
        integrity: mergedRequestConfig.integrity,
        keepalive: mergedRequestConfig.keepalive,
        method: mergedRequestConfig.method,
        mode: mergedRequestConfig.mode,
        priority: requestInit?.priority,
        referrer: mergedRequestConfig.referrer,
        redirect: mergedRequestConfig.redirect,
        referrerPolicy: mergedRequestConfig.referrerPolicy,
        signal: mergedRequestConfig.signal,
        window: requestInit?.window,
      };
    }

    const requestBody = await mergedRequestConfig.arrayBuffer();

    return {
      body: requestBody,
      cache: mergedRequestConfig.cache,
      credentials: mergedRequestConfig.credentials,
      headers: mergedRequestConfig.headers,
      integrity: mergedRequestConfig.integrity,
      keepalive: mergedRequestConfig.keepalive,
      method: mergedRequestConfig.method,
      mode: mergedRequestConfig.mode,
      priority: requestInit?.priority,
      referrer: mergedRequestConfig.referrer,
      redirect: mergedRequestConfig.redirect,
      referrerPolicy: mergedRequestConfig.referrerPolicy,
      signal: mergedRequestConfig.signal,
      window: requestInit?.window,
    };
  }

  static async mergeRequestConfig(
    request: Request,
    requestInit?: RequestInitWithNextConfig | RequestInit
  ): Promise<[string, RequestInitWithNextConfig | RequestInit]> {
    const fetchURL = request.url;
    let requestConfig: RequestInitWithNextConfig | RequestInit;

    if (requestInit && hasNextConfig(requestInit)) {
      const { next, ...rest } = requestInit;
      const mergedRequestInit = await RequestUtils.createMergedRequestInit(
        request,
        rest
      );

      requestConfig = {
        ...mergedRequestInit,
        next,
      };
    } else {
      requestConfig = await RequestUtils.createMergedRequestInit(
        request,
        requestInit
      );
    }

    return [fetchURL, requestConfig];
  }
}

export default RequestUtils;
