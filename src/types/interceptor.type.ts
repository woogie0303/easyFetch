import { EasyFetchRequestType, EasyFetchResponse } from './easyFetch.type';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface InterceptorCallbackType<T extends 'request' | 'response'> {
  (
    onFulfilled?: (
      arg: T extends 'request' ? EasyFetchRequestType : EasyFetchResponse<any>
    ) => T extends 'request'
      ? Promise<EasyFetchRequestType> | EasyFetchRequestType
      : Promise<EasyFetchResponse<any>> | EasyFetchResponse<any>,
    onRejected?: (err: any) => any
  ): void;
}

type InterceptorArgs<T extends 'request' | 'response'> = Parameters<
  InterceptorCallbackType<T>
>;

export { InterceptorArgs, InterceptorCallbackType };
