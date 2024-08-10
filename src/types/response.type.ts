import { RequestInitWithNextConfig } from './nextProperty.type';

type EasyFetchResponse<T> = Omit<
  Awaited<ReturnType<typeof fetch>>,
  keyof Body | 'clone'
> & {
  body: T;
  config: [string | URL, RequestInitWithNextConfig | undefined];
};

Response;

export { EasyFetchResponse };
