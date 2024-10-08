import { EasyFetchResponse } from '../types/easyFetch.type';

const hasEasyFetchResponse = <T>(
  error: unknown
): error is EasyFetchResponse<T> => {
  return Object.keys(error as EasyFetchResponse<T>).includes('config');
};

export { hasEasyFetchResponse };
