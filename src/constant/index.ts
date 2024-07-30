const METHOD_WITHOUT_BODY = ['get', 'delete'] as const;
const METHOD_WITH_BODY = ['patch', 'put', 'post'] as const;
const REQUEST_INIT_KEYS = [
  'cache',
  'credentials',
  'headers',
  'integrity',
  'keepalive',
  'method',
  'mode',
  'referrer',
  'redirect',
  'referrerPolicy',
  'signal',
] as const;

export { METHOD_WITHOUT_BODY, METHOD_WITH_BODY, REQUEST_INIT_KEYS };
