import type {
  InterceptorArgs,
  InterceptorCallbackType,
} from './types/interceptor.type';
import { EasyFetchResponse } from './types/response.type';

class Interceptor {
  requestCbArr: InterceptorArgs<'request'>[];
  responseCbArr: InterceptorArgs<'response'>[];

  constructor() {
    this.requestCbArr = [];
    this.responseCbArr = [];
  }
  request: InterceptorCallbackType<'request'> = (onFulfilled, onRejected) => {
    this.requestCbArr.unshift([onFulfilled, onRejected]);
  };

  response: InterceptorCallbackType<'response'> = (onFulfilled, onRejected) => {
    this.responseCbArr.push([onFulfilled, onRejected]);
  };

  async flushRequestInterceptors(
    initVal: Promise<[string | URL, RequestInit | undefined]>
  ) {
    const flushArr = this.requestCbArr;

    let promiseInit = initVal;

    for (let i = 0; i < flushArr.length; i++) {
      promiseInit = promiseInit.then(...flushArr[i]);
    }

    return promiseInit;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async flushResPonseInterceptors(initVal: Promise<EasyFetchResponse<any>>) {
    const flushArr = this.responseCbArr;

    let promiseInit = initVal;

    for (let i = 0; i < flushArr.length; i++) {
      promiseInit = promiseInit.then(...flushArr[i]);
    }

    return promiseInit;
  }
}

export default Interceptor;
