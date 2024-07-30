import { METHOD_WITH_BODY, METHOD_WITHOUT_BODY } from './constant';
import EasyFetch from './EasyFetch';
import type { EasyFetchWithAPIMethodsType } from './types/method.type';

export interface EasyFetchDefaultConfig {
  baseUrl?: string | URL;
  headers?: HeadersInit;
}

const mergeEasyFetchWithAPIMethod = (
  defaultConfig?: EasyFetchDefaultConfig
) => {
  const instance = new EasyFetch(defaultConfig);

  METHOD_WITHOUT_BODY.forEach((method) => {
    async function prototypeAPIMethodWithoutData<T>(
      this: EasyFetch,
      url: string | URL,
      reqConfig?: typeof method extends 'get'
        ? RequestInitWithNextConfig
        : RequestInit
    ) {
      return this.request<T>(url, reqConfig);
    }

    (EasyFetch.prototype as EasyFetchWithAPIMethodsType)[method] =
      prototypeAPIMethodWithoutData;
  });

  METHOD_WITH_BODY.forEach((method) => {
    async function prototypeAPIMethodWithData<T>(
      this: EasyFetch,
      url: string | URL,
      reqBody?: object,
      reqConfig?: Omit<RequestInit, 'method'>
    ): Promise<T> {
      const mergedRequestConfigWithBody: Request = new Request(url, {
        ...reqConfig,
        body: reqBody && JSON.stringify(reqBody),
      });

      return this.request(url, mergedRequestConfigWithBody);
    }

    (EasyFetch.prototype as EasyFetchWithAPIMethodsType)[method] =
      prototypeAPIMethodWithData;
  });

  return instance as EasyFetchWithAPIMethodsType;
};

const createInstance = (defaultConfig?: EasyFetchDefaultConfig) => {
  const instance = mergeEasyFetchWithAPIMethod(defaultConfig);

  return instance;
};

export const easyFetch = createInstance;
