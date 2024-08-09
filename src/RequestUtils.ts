import { METHOD_WITHOUT_BODY, REQUEST_INIT_KEYS } from './constant';
import { MethodWithoutBodyType } from './types/method.type';
import { RequestInitWithNextConfig } from './types/nextProperty.type';

class RequestUtils {
  static async #createMergedRequestInit(
    request: Request,
    requestInit?: RequestInitWithNextConfig
  ): Promise<RequestInitWithNextConfig> {
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
    requestInit?: RequestInitWithNextConfig
  ): Promise<[string, RequestInitWithNextConfig | undefined]> {
    const fetchURL = request.url;
    let requestConfig: RequestInitWithNextConfig | undefined;

    if (requestInit) {
      const { next, priority, window, ...rest } = requestInit;

      requestConfig = {
        ...(await RequestUtils.#createMergedRequestInit(request, rest)),
        priority,
        window,
        next,
      };
    } else {
      requestConfig = {
        ...(await RequestUtils.#createMergedRequestInit(request)),
      };
    }

    return [fetchURL, requestConfig];
  }
}

export default RequestUtils;
