import { METHOD_WITH_BODY, METHOD_WITHOUT_BODY } from '../constant';
import EasyFetch from '../EasyFetch';
import { RequestInitWithNextConfig } from './nextProperty.type';
import { EasyFetchResponse } from './response.type';

type MethodWithBodyType = (typeof METHOD_WITH_BODY)[number];
type MethodWithoutBodyType = (typeof METHOD_WITHOUT_BODY)[number];

type MethodType = MethodWithBodyType | MethodWithoutBodyType;
type MethodFunction<T> = T extends MethodWithBodyType
  ? <P>(
      url: string | URL,
      reqBody?: object,
      reqConfig?: Omit<RequestInitWithNextConfig, 'method'>
    ) => Promise<EasyFetchResponse<P>>
  : <P>(
      url: string | URL,
      reqConfig?: Omit<RequestInitWithNextConfig, 'method'>
    ) => Promise<EasyFetchResponse<P>>;

type EasyFetchWithAPIMethodsType = EasyFetch & {
  [K in MethodType]: MethodFunction<K>;
};

export { EasyFetchWithAPIMethodsType, MethodType, MethodWithoutBodyType };
