/* eslint-disable @typescript-eslint/no-explicit-any */
import { METHOD_WITH_BODY, METHOD_WITHOUT_BODY } from './constant';
import EasyFetch from './EasyFetch';
import type { EasyFetchWithAPIMethodsType } from './types/method.type';
import createPrototypeAPIMethod from './utils/createPrototypeAPIMethod';

export interface EasyFetchDefaultConfig {
  baseUrl?: string | URL;
  headers?: HeadersInit;
}

const mergeEasyFetchWithAPIMethod = (
  defaultConfig?: EasyFetchDefaultConfig
) => {
  const instance = new EasyFetch(defaultConfig);

  [...METHOD_WITH_BODY, ...METHOD_WITHOUT_BODY].forEach((method) => {
    (EasyFetch.prototype as EasyFetchWithAPIMethodsType)[method] =
      createPrototypeAPIMethod(method);
  });

  return instance as EasyFetchWithAPIMethodsType;
};

const createInstance = (defaultConfig?: EasyFetchDefaultConfig) => {
  const instance = mergeEasyFetchWithAPIMethod(defaultConfig);

  return instance;
};

export const easyFetch = createInstance;
