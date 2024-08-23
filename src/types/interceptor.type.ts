/* eslint-disable @typescript-eslint/no-explicit-any */
interface InterceptorCallbackType<T> {
  (
    onFulfilled?: (arg: T) => T | Promise<T>,
    onRejected?: (err: any) => any
  ): void;
}
type InterceptorArgs<T> = Parameters<InterceptorCallbackType<T>>;

export { InterceptorArgs, InterceptorCallbackType };
