import { METHOD_WITH_BODY } from '../constant';
import EasyFetch from '../EasyFetch';
import { EasyFetchResponse } from '../types/easyFetch.type';
import { MethodType } from '../types/method.type';
import { RequestInitWithNextConfig } from '../types/nextProperty.type';

function createPrototypeAPIMethod(method: MethodType) {
  const hasBodyMethod = (
    method: MethodType
  ): method is (typeof METHOD_WITH_BODY)[number] => {
    return METHOD_WITH_BODY.some((m) => m === method);
  };

  if (hasBodyMethod(method)) {
    return async function <T>(
      this: EasyFetch,
      url: string | URL,
      reqBody?: object,
      reqConfig?: Omit<RequestInitWithNextConfig, 'method'>
    ): Promise<EasyFetchResponse<T>> {
      const mergedRequestConfigWithBody: RequestInitWithNextConfig = {
        ...reqConfig,
        body: reqBody && JSON.stringify(reqBody),
        method: method.toUpperCase(),
      };

      return this.request<T>(url, mergedRequestConfigWithBody);
    };
  } else {
    return async function <T>(
      this: EasyFetch,
      url: string | URL,
      reqConfig?: RequestInitWithNextConfig
    ): Promise<EasyFetchResponse<T>> {
      return this.request<T>(url, {
        ...reqConfig,
        method: method.toUpperCase(),
      });
    };
  }
}

export default createPrototypeAPIMethod;
