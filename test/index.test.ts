import { describe, expect, it, vi } from 'vitest';
import { easyFetch } from '../src/createInstance';
import RequestUtils from '../src/RequestUtils';

describe('EasyFetch', () => {
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
      method: 'GET',
      referrerPolicy: 'no-referrer',
    });

    // then
    const expectRequestInstance = new Request('http://sdf', {
      mode: 'cors',
      cache: 'no-cache',
      method: 'GET',
      referrerPolicy: 'no-referrer',
    });
    const expectRequestBody = await expectRequestInstance.arrayBuffer();
    const actualRequestValue = await spyRequestMethod.mock.results[0].value;

    expect(actualRequestValue[1]).toStrictEqual({
      body: expectRequestBody,
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

    // then
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
    const expectRequestBody = await expectRequestInstance.arrayBuffer();
    const actualRequestValue = await spyRequestMethod.mock.results[0].value;

    expect(actualRequestValue[1]).toStrictEqual({
      body: expectRequestBody,
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
});
