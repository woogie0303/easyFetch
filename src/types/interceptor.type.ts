import { EasyFetchResponse } from './response.type';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface InterceptorCallbackType<T extends 'request' | 'response'> {
  (
    onFulfilled?: (
      arg: T extends 'request'
        ? [string | URL, RequestInit | undefined]
        : EasyFetchResponse<any>
    ) => T extends 'request'
      ?
          | Promise<[string | URL, RequestInit | undefined]>
          | [string | URL, RequestInit | undefined]
      : Promise<EasyFetchResponse<any>> | EasyFetchResponse<any>,
    onRejected?: (err: any) => any
  ): void;
}

type InterceptorArgs<T extends 'request' | 'response'> = Parameters<
  InterceptorCallbackType<T>
>;

export { InterceptorArgs, InterceptorCallbackType };
