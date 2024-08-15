import { EasyFetchResponse } from '../types/easyFetch.type';

export const hasResponseBody = <T = undefined>(
  res: EasyFetchResponse<T> | EasyFetchResponse<undefined>
): res is EasyFetchResponse<T> => {
  return !!res.body;
};
