type EasyFetchResponse<T> = Omit<
  Awaited<ReturnType<typeof fetch>>,
  keyof Body | 'clone'
> & {
  body: Promise<T>;
  config: [string | URL, RequestInit | RequestInitWithNextConfig | undefined];
};

Response;

export { EasyFetchResponse };
