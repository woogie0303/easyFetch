import { RESPONSE_BODY_UNDEFINED_MESSAGE } from '../constant';
import {
  EasyFetchRequestType,
  EasyFetchResponse,
} from '../types/easyFetch.type';

export const convertEasyFetchResponse = async <T>(
  res: Response,
  reqConfig: EasyFetchRequestType
): Promise<EasyFetchResponse<T> | EasyFetchResponse<undefined>> => {
  const responseWithoutBody: Omit<EasyFetchResponse<T>, 'body'> = {
    headers: res.headers,
    ok: res.ok,
    redirected: res.redirected,
    status: res.status,
    statusText: res.statusText,
    type: res.type,
    config: [
      reqConfig[0],
      {
        ...reqConfig[1],
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
