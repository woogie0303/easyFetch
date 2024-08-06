/* eslint-disable @typescript-eslint/no-explicit-any */
import { METHOD_WITH_BODY, METHOD_WITHOUT_BODY } from './constant';
import EasyFetch from './EasyFetch';
import type { EasyFetchWithAPIMethodsType } from './types/method.type';
import { EasyFetchResponse } from './types/response.type';

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
      reqConfig?: RequestInitWithNextConfig
    ): Promise<EasyFetchResponse<T>> {
      return this.request<T>(url, {
        ...reqConfig,
        method: method.toUpperCase(),
      });
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
    ): Promise<EasyFetchResponse<T>> {
      const mergedRequestConfigWithBody: RequestInit = {
        ...reqConfig,
        body: reqBody && JSON.stringify(reqBody),
        method: method.toUpperCase(),
      };

      return this.request<T>(url, mergedRequestConfigWithBody);
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
