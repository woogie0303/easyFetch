import { METHOD_WITHOUT_BODY, REQUEST_INIT_KEYS } from '../constant';
import { EasyFetchRequestType } from '../types/easyFetch.type';
import { MethodWithoutBodyType } from '../types/method.type';

const createMergedRequestInit = async (
  request: Request,
  requestInit?: EasyFetchRequestType[1]
) => {
  const mergedRequestConfig = new Request(request, requestInit);
  const isGetOrDeleteMethod = METHOD_WITHOUT_BODY.includes(
    mergedRequestConfig.method.toLowerCase() as MethodWithoutBodyType
  );

  const newRequestInit = REQUEST_INIT_KEYS.reduce(
    (acc, cur) => ({
      ...acc,
      [cur]: mergedRequestConfig[cur],
    }),
    isGetOrDeleteMethod ? {} : { body: await mergedRequestConfig.arrayBuffer() }
  ) as NonNullable<EasyFetchRequestType[1]>;

  return newRequestInit;
};

const mergeRequestConfig = async (
  request: Request,
  requestInit?: EasyFetchRequestType[1]
): Promise<
  [Exclude<EasyFetchRequestType[0], URL>, EasyFetchRequestType[1]]
> => {
  const fetchURL = request.url;
  let requestConfig: EasyFetchRequestType[1];

  if (requestInit) {
    const { next, priority, window, ...rest } = requestInit;

    requestConfig = {
      ...(await createMergedRequestInit(request, rest)),
      priority,
      window,
      next,
    };
  } else {
    requestConfig = {
      ...(await createMergedRequestInit(request)),
    };
  }

  return [fetchURL, requestConfig];
};
export { mergeRequestConfig };
