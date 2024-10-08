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
const RESPONSE_BODY_UNDEFINED_MESSAGE = 'Unexpected end of JSON input';

export {
  METHOD_WITHOUT_BODY,
  METHOD_WITH_BODY,
  REQUEST_INIT_KEYS,
  RESPONSE_BODY_UNDEFINED_MESSAGE,
};
