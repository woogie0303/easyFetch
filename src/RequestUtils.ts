import { METHOD_WITHOUT_BODY, REQUEST_INIT_KEYS } from './constant';
import { hasNextConfig } from './libs/hasNextConfig';
import { MethodWithoutBodyType } from './types/method.type';
import { RequestInitWithNextConfig } from './types/nextProperty.type';

class RequestUtils {
  static async #createMergedRequestInit(
    request: Request,
    requestInit?: RequestInitWithNextConfig | RequestInit
  ): Promise<RequestInit> {
    const mergedRequestConfig = new Request(request, requestInit);
    const isGetOrDeleteMethod = METHOD_WITHOUT_BODY.includes(
      mergedRequestConfig.method.toLowerCase() as MethodWithoutBodyType
    );

    const newRequestInit = REQUEST_INIT_KEYS.reduce(
      (acc, cur) => ({
        ...acc,
        [cur]: mergedRequestConfig[cur],
      }),
      isGetOrDeleteMethod
        ? {}
        : { body: await mergedRequestConfig.arrayBuffer() }
    ) as RequestInit;

    return newRequestInit;
  }

  static async mergeRequestConfig(
    request: Request,
    requestInit?: RequestInitWithNextConfig | RequestInit
  ): Promise<[string, RequestInitWithNextConfig | RequestInit]> {
    const fetchURL = request.url;
    let requestConfig: RequestInitWithNextConfig | RequestInit;

    if (requestInit && hasNextConfig(requestInit)) {
      const { next, priority, window, ...rest } = requestInit;

      requestConfig = {
        ...(await RequestUtils.#createMergedRequestInit(request, rest)),
        priority,
        window,
        next,
      };
    } else {
      requestConfig = {
        ...(await RequestUtils.#createMergedRequestInit(request, requestInit)),
        priority: requestInit?.priority,
        window: requestInit?.window,
      };
    }

    return [fetchURL, requestConfig];
  }
}

export default RequestUtils;
