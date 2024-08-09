import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { METHOD_WITH_BODY, METHOD_WITHOUT_BODY } from '../src/constant';
import { easyFetch } from '../src/createInstance';
import RequestUtils from '../src/RequestUtils';
import { EasyFetchResponse } from '../src/types/response.type';

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
    const response = new Response(JSON.stringify({ attraction: 'main' }), {
      status: 200,
    });
    const spyMergeRequestConfig = vi.spyOn(RequestUtils, 'mergeRequestConfig');
    const easy = easyFetch();

    fetchMocked.mockResolvedValue(response);

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
    const actualRequestValue = await spyMergeRequestConfig.mock.results[0]
      .value;

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
      next: undefined,
      referrer: expectRequestInstance.referrer,
      redirect: expectRequestInstance.redirect,
      referrerPolicy: expectRequestInstance.referrerPolicy,
      signal: expectRequestInstance.signal,
      window: undefined,
    });
  });

  it('merges requestInstance when requestInit with a next property is passed as an argument', async () => {
    // given
    const response = new Response(JSON.stringify({ attraction: 'main' }), {
      status: 200,
    });
    const spyMergeRequestConfig = vi.spyOn(RequestUtils, 'mergeRequestConfig');
    const easy = easyFetch();

    fetchMocked.mockResolvedValue(response);

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

    const actualRequestValue = await spyMergeRequestConfig.mock.results[0]
      .value;

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

  it('get and delete method does not have body', async () => {
    // given
    const spyMergeRequestConfig = vi.spyOn(RequestUtils, 'mergeRequestConfig');
    const easy = easyFetch();
    const request = new Request('http://sdf', {
      mode: 'cors',
      cache: 'no-cache',
    });

    // when
    // GET 요청
    fetchMocked.mockResolvedValueOnce(
      new Response(JSON.stringify({ attraction: 'main' }), { status: 200 })
    );
    await easy.request(request, {
      next: { revalidate: 300 },
    });

    // DELETE 요청
    fetchMocked.mockResolvedValueOnce(
      new Response(JSON.stringify({ attraction: 'main' }), { status: 200 })
    );
    await easy.request(request, {
      method: 'DELETE',
    });

    // POST 요청
    fetchMocked.mockResolvedValueOnce(
      new Response(JSON.stringify({ attraction: 'main' }), { status: 200 })
    );
    await easy.request(request, {
      method: 'POST',
    });

    // then
    const getMethodReturn = await spyMergeRequestConfig.mock.results[0].value;
    const deleteMethodReturn = await spyMergeRequestConfig.mock.results[1]
      .value;
    const postMethodReturn = await spyMergeRequestConfig.mock.results[2].value;

    expect(Object.keys(getMethodReturn[1]).includes('body')).toBe(false);
    expect(Object.keys(deleteMethodReturn[1]).includes('body')).toBe(false);
    expect(Object.keys(postMethodReturn[1]).includes('body')).toBe(true);
  });

  it('Rest API method added the method property to the requestInit object', async () => {
    // given
    const mergeMethod = [...METHOD_WITHOUT_BODY, ...METHOD_WITH_BODY];

    // when
    await Promise.all(
      mergeMethod.map(async (method) => {
        // 각 메서드 호출마다 새로운 Response 객체를 생성합니다.
        const response = new Response(JSON.stringify({ attraction: 'main' }), {
          status: 200,
        });
        fetchMocked.mockResolvedValueOnce(response);

        const easy = easyFetch();
        await easy[method]('http://sdf');
      })
    );

    // then
    const fetchMockedArg = fetchMocked.mock.calls;

    fetchMockedArg.forEach(([url, requestInit], index) => {
      expect(requestInit.method).toEqual(mergeMethod[index].toUpperCase());
      expect(url).toEqual('http://sdf');
    });
  });

  it('combines URL with the base URL when provided.', async () => {
    // given
    const response = new Response(JSON.stringify({ attraction: 'main' }), {
      status: 200,
    });
    const easy = easyFetch({ baseUrl: 'https://attraction/api/v1/' });
    fetchMocked.mockResolvedValue(response);

    // when
    await easy.get('userRank/strict');

    // then
    const mergeUrlWithBaseUrl = fetchMocked.mock.calls[0][0];

    expect(mergeUrlWithBaseUrl.toString()).equal(
      'https://attraction/api/v1/userRank/strict'
    );
  });

  it('combines headers with the default header when provided', async () => {
    // given
    const response = new Response(JSON.stringify({ attraction: 'main' }), {
      status: 200,
    });
    const easy = easyFetch({ headers: { 'Cache-Control': 'no-cache' } });
    fetchMocked.mockResolvedValue(response);

    // when
    await easy.get('https://attraciton', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // then
    const mergeHeadersWithDefaultHeaders = fetchMocked.mock.calls[0][1].headers;
    const expectHeaders = new Headers({
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json',
    });

    expect(mergeHeadersWithDefaultHeaders).toStrictEqual(expectHeaders);
  });

  it('combines interceptor request config', async () => {
    // given
    const response = new Response(JSON.stringify({ attraction: 'main' }), {
      status: 200,
    });

    fetchMocked.mockResolvedValue(response);

    const easy = easyFetch({ headers: { 'Cache-Control': 'no-cache' } });
    easy.interceptor.request((req) => {
      const [baseurl, requestConfig] = req;

      return [
        baseurl,
        {
          ...requestConfig,
          credentials: 'include',
          mode: 'cors',
        },
      ];
    });

    // when
    await easy.post(
      'https://attraciton',
      { data: 1 },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // then
    const mergeRequestInterceptor: RequestInit = {
      ...fetchMocked.mock.calls[0][1],
    };
    const expectValue: RequestInit = {
      headers: new Headers({
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
      }),
      method: 'POST',
      body: JSON.stringify({ data: 1 }),
      mode: 'cors',
      credentials: 'include',
    };

    expect(mergeRequestInterceptor).toStrictEqual(expectValue);
  });

  it('combines interceptor response config', async () => {
    // given
    const response = new Response(JSON.stringify({ message: '400 error' }), {
      status: 400,
    });

    fetchMocked.mockResolvedValue(response);

    // when
    const easy = easyFetch({ headers: { 'Cache-Control': 'no-cache' } });

    easy.interceptor.response(
      (res) => {
        return res;
      },
      (err) => {
        const error = err as EasyFetchResponse<{
          message: string;
        }>;

        return error.body.message;
      }
    );

    const actualValue = await easy.get('sdfdsf');
    const expectValue = '400 error';

    expect(actualValue).toEqual(expectValue);
  });

  it('sets the default to application/json when the Content-Type is not set.', async () => {
    // given
    const response = new Response(JSON.stringify({ attraction: 'main' }), {
      status: 200,
    });

    fetchMocked.mockResolvedValue(response);

    const easy = easyFetch();

    // when
    await easy.get('https://attraciton');

    // then
    const expectValue = new Headers({
      'Content-type': 'application/json',
    });

    const requestHeaders = new Headers(fetchMocked.mock.calls[0][1].headers);

    expect(requestHeaders).toStrictEqual(expectValue);
  });
});
