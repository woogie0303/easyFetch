import { RequestInitWithNextConfig } from './nextProperty.type';

type EasyFetchResponse<T> = Omit<
  Awaited<ReturnType<typeof fetch>>,
  keyof Body | 'clone' | 'url'
> & {
  body: T;
  config: EasyFetchRequestType;
};

type EasyFetchRequestType = [
  string | URL,
  RequestInitWithNextConfig | undefined
];

export { EasyFetchRequestType, EasyFetchResponse };
