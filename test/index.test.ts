import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { METHOD_WITH_BODY, METHOD_WITHOUT_BODY } from '../src/constant';
import { easyFetch } from '../src/createInstance';
import { EasyFetchResponse } from '../src/types/easyFetch.type';

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
    const fetchMockedArg = fetchMocked.mock.calls[0][1];

    const expectRequestInstance = new Request('http://sdf', {
      mode: 'cors',
      cache: 'no-cache',
      method: 'POST',
      referrerPolicy: 'no-referrer',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const requestBody = await expectRequestInstance.arrayBuffer();

    expect(fetchMockedArg).toStrictEqual({
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

  it('get and delete method does not have body', async () => {
    // given
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
    const fetchMockedArg = fetchMocked.mock.calls;

    const getMethodReturn = fetchMockedArg[0][1];
    const deleteMethodReturn = fetchMockedArg[1][1];
    const postMethodReturn = fetchMockedArg[2][1];

    expect(Object.keys(getMethodReturn).includes('body')).toBe(false);
    expect(Object.keys(deleteMethodReturn).includes('body')).toBe(false);
    expect(Object.keys(postMethodReturn).includes('body')).toBe(true);
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

  it('interceptor response value when response status is 401', async () => {
    // given
    type Token = {
      refreshToken: string;
      accessToken: string;
    };
    type ErrorType = {
      message: string;
    };

    const easy = easyFetch();
    easy.interceptor.response(
      (res) => res,
      async (err) => {
        const error = err as EasyFetchResponse<ErrorType>;

        if (error.status === 401) {
          const { body } = await easy.get<Token>('https://google.co/getToken', {
            ...error.config[1],
          });

          const headers = new Headers(error.config[1]?.headers);

          headers.set('Authorization', `Bearer ${body.accessToken}`);

          return easy.request(error.config[0], {
            ...error.config[1],
            headers,
          });
        }

        throw err;
      }
    );

    // when
    fetchMocked.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'error is define' }), {
        status: 401,
      })
    );
    fetchMocked.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ refreshToken: '123124', accessToken: '1252923' }),
        {
          status: 200,
        }
      )
    );
    fetchMocked.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'success' }), {
        status: 200,
      })
    );

    const { config } = await easy.get('https://attraction.com', {
      credentials: 'include',
    });

    // then
    const headers = new Headers(config[1]?.headers);

    expect(headers.get('Authorization')).equal('Bearer 1252923');
  });
});
