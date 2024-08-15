import { RESPONSE_BODY_UNDEFINED_MESSAGE } from '../constant';
import { EasyFetchResponse } from '../types/easyFetch.type';

export const convertEasyFetchResponse = async <T>(
  res: Response,
  reqConfig: RequestInit
): Promise<EasyFetchResponse<T> | EasyFetchResponse<undefined>> => {
  const responseWithoutBody: Omit<EasyFetchResponse<T>, 'body'> = {
    headers: res.headers,
    ok: res.ok,
    redirected: res.redirected,
    status: res.status,
    statusText: res.statusText,
    type: res.type,
    url: res.url,
    config: [
      res.url,
      {
        ...reqConfig,
      },
    ],
  };

  try {
    const body = (await res.json()) as T;
    const response = { ...responseWithoutBody, body };

    return response;
  } catch (err) {
    if ((err as Error).message === RESPONSE_BODY_UNDEFINED_MESSAGE) {
      const response = { ...responseWithoutBody, body: undefined };
      return response;
    } else {
      throw err;
    }
  }
};
