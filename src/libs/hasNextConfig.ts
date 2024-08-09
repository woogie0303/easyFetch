import { EasyFetchResponse } from '../types/response.type';

const hasEasyFetchResponse = <T>(
  error: unknown
): error is EasyFetchResponse<T> => {
  return Object.keys((error as Error).cause as EasyFetchResponse<T>).includes(
    'config'
  );
};

export { hasEasyFetchResponse };
