/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  EasyFetchRequestType,
  EasyFetchResponse,
} from './types/easyFetch.type';
import type {
  InterceptorArgs,
  InterceptorCallbackType,
} from './types/interceptor.type';

class Interceptor {
  requestCbArr: InterceptorArgs<EasyFetchRequestType>[];
  responseCbArr: InterceptorArgs<any>[];

  constructor() {
    this.requestCbArr = [];
    this.responseCbArr = [];
  }
  request: InterceptorCallbackType<EasyFetchRequestType> = (
    onFulfilled,
    onRejected
  ) => {
    this.requestCbArr.unshift([onFulfilled, onRejected]);
  };

  response: InterceptorCallbackType<any> = (onFulfilled, onRejected) => {
    this.responseCbArr.push([onFulfilled, onRejected]);
  };

  flushInterceptors<T>(
    initVal: Promise<T>,
    interceptors: InterceptorArgs<T>[]
  ) {
    let promiseInit = initVal;

    for (let i = 0; i < interceptors.length; i++) {
      promiseInit = promiseInit.then(...interceptors[i]);
    }

    return promiseInit;
  }

  flushRequestInterceptors(initVal: Promise<EasyFetchRequestType>) {
    return this.flushInterceptors(initVal, this.requestCbArr);
  }

  flushResponseInterceptors(initVal: Promise<EasyFetchResponse<any>>) {
    return this.flushInterceptors(initVal, this.responseCbArr);
  }
}

export default Interceptor;
