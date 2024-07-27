import { METHOD_WITH_BODY, METHOD_WITHOUT_BODY } from './constant';
import EasyFetch from './EasyFetch';
import type { EasyFetchWithAPIMethodsType } from './types/method.type';

export interface EasyFetchDefaultConfig {
  baseUrl?: string | URL;
  headers?: HeadersInit;
}

// function isMethodWithoutBody(
//   methodArg: MethodType
// ): methodArg is MethodWithoutBodyType {
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   return METHOD_WITHOUT_BODY.includes(methodArg as any);
// }

const mergeEasyFetchWithAPIMethod = (
  defaultConfig?: EasyFetchDefaultConfig
) => {
  const instance = new EasyFetch(defaultConfig);

  METHOD_WITHOUT_BODY.forEach((method) => {
    async function prototypeAPIMethodWithoutData<T>(
      this: EasyFetch,
      url: string | URL,
      reqConfig?: typeof method extends 'get'
        ? RequestInit
        : RequestInitWithNextConfig
    ) {
      const requestInit = new Request(url, {
        method,
        ...reqConfig,
      });

      return this.request<T>(url, requestInit);
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
      const requestInit = new Request(url, {
        method,
        ...reqConfig,
        body: reqBody && JSON.stringify(reqBody),
      });

      return this.request(url, requestInit);
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

const hi = easyFetch();
hi.get<EasyFetchDefaultConfig>('htttp:/sdfjklsdf', {});
