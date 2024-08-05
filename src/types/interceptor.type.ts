/* eslint-disable @typescript-eslint/no-explicit-any */
interface InterceptorCallbackType<T extends 'request' | 'response'> {
  (
    onFulfilled?: (
      arg: T extends 'request'
        ? [string | URL, RequestInit | undefined]
        : Response
    ) => T extends 'request'
      ?
          | Promise<[string | URL, RequestInit | undefined]>
          | [string | URL, RequestInit | undefined]
      : Promise<Response>,
    onRejected?: (err: any) => any
  ): void;
}

// type interfaceCallbackArgType<T extends InterceptorCallbackType<T extends 'request' | 'response'> =

type InterceptorArgs<T extends 'request' | 'response'> = Parameters<
  InterceptorCallbackType<T>
>;

export { InterceptorArgs, InterceptorCallbackType };
