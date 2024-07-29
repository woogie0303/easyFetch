const hasNextConfig = (
  reqConfig: RequestInit | RequestInitWithNextConfig
): reqConfig is RequestInitWithNextConfig => {
  return Object.keys(reqConfig).includes('next');
};

const createMergedRequestInit = async (
  request: Request,
  requestInit?: RequestInit
): Promise<RequestInit> => {
  const mergedRequestConfig = new Request(request, requestInit);
  const requestBody = await mergedRequestConfig.arrayBuffer();

  return {
    body: requestBody,
    cache: mergedRequestConfig.cache,
    credentials: mergedRequestConfig.credentials,
    headers: mergedRequestConfig.headers,
    integrity: mergedRequestConfig.integrity,
    keepalive: mergedRequestConfig.keepalive,
    method: mergedRequestConfig.method,
    mode: mergedRequestConfig.mode,
    priority: requestInit?.priority,
    referrer: mergedRequestConfig.referrer,
    redirect: mergedRequestConfig.redirect,
    referrerPolicy: mergedRequestConfig.referrerPolicy,
    signal: mergedRequestConfig.signal,
    window: requestInit?.window,
  };
};

export { createMergedRequestInit, hasNextConfig };
