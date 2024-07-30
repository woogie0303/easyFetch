import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { easyFetch } from '../src/createInstance';
import RequestUtils from '../src/RequestUtils';

describe('EasyFetch', () => {
  const globalFetch = fetch;
  let fetchMocked: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMocked = vi.fn();
    // @ts-ignore
    fetch = fetchMocked;
  });

  afterEach(() => {
    // @ts-ignore
    fetch = globalFetch;
  });

  it('merges a request instance with the request config when it is passed as an argument.', async () => {
    //given
    const spyRequestMethod = vi.spyOn(RequestUtils, 'mergeRequestConfig');
    const easy = easyFetch();

    // when
    const request = new Request('http://sdf', {
      mode: 'cors',
      cache: 'no-cache',
    });
    await easy.request(request, {
      method: 'POST',
      referrerPolicy: 'no-referrer',
    });

    // then
    const expectRequestInstance = new Request('http://sdf', {
      mode: 'cors',
      cache: 'no-cache',
      method: 'POST',
      referrerPolicy: 'no-referrer',
    });
    const actualRequestValue = await spyRequestMethod.mock.results[0].value;
    const requestBody = await expectRequestInstance.arrayBuffer();

    expect(actualRequestValue[1]).toStrictEqual({
      body: requestBody,
      cache: expectRequestInstance.cache,
      credentials: expectRequestInstance.credentials,
      headers: expectRequestInstance.headers,
      integrity: expectRequestInstance.integrity,
      keepalive: expectRequestInstance.keepalive,
      method: expectRequestInstance.method,
      mode: expectRequestInstance.mode,
      priority: undefined,
      referrer: expectRequestInstance.referrer,
      redirect: expectRequestInstance.redirect,
      referrerPolicy: expectRequestInstance.referrerPolicy,
      signal: expectRequestInstance.signal,
      window: undefined,
    });
  });

  it('merges requestInstance when requestInit with a next property is passed as an argument', async () => {
    // given
    const spyRequestMethod = vi.spyOn(RequestUtils, 'mergeRequestConfig');
    const easy = easyFetch();

    // when
    const request = new Request('http://sdf', {
      mode: 'cors',
      cache: 'no-cache',
    });
    await easy.request(request, {
      next: { revalidate: 300 },
    });

    // then
    const expectRequestInstance = new Request('http://sd', {
      cache: 'no-cache',
    });

    const actualRequestValue = await spyRequestMethod.mock.results[0].value;

    expect(actualRequestValue[1]).toStrictEqual({
      cache: expectRequestInstance.cache,
      credentials: expectRequestInstance.credentials,
      headers: expectRequestInstance.headers,
      integrity: expectRequestInstance.integrity,
      keepalive: expectRequestInstance.keepalive,
      method: expectRequestInstance.method,
      mode: expectRequestInstance.mode,
      priority: undefined,
      referrer: expectRequestInstance.referrer,
      redirect: expectRequestInstance.redirect,
      referrerPolicy: expectRequestInstance.referrerPolicy,
      signal: expectRequestInstance.signal,
      window: undefined,
      next: { revalidate: 300 },
    });
  });

  it('get method does not have body', async () => {
    // given
    const spyRequestMethod = vi.spyOn(RequestUtils, 'mergeRequestConfig');
    const easy = easyFetch();

    // when
    const request = new Request('http://sdf', {
      mode: 'cors',
      cache: 'no-cache',
    });
    await easy.request(request, {
      next: { revalidate: 300 },
    });

    // then

    const actualRequestValue = await spyRequestMethod.mock.results[0].value;

    expect(Object.keys(actualRequestValue[1]).includes('body')).toBe(false);
  });
});
