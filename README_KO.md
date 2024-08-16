## EasyFetch

#### [English Version](./README.md)

React+Axios에 익숙해져 있는 상태에서 attraction 팀프로젝트에서 Next.js App router 사용하다보니 몇가지 불편함을 접했습니다.

- 클라이언트 컴포넌트에서 interceptor 기능의 부재
- 직접 해야하는 직렬화, 역직렬화
- 400번 이상의 에러는 res.ok로 분기 처리
- fetch에서는 사용할 수 없는 `axios.post`와 같은 API 메서드

위와 같은 불편한 사항들을 해결하기 위해 Easyfetch는 Next App router에서 사용하는 확장된 fetch를 axios 사용자들이 좀 더 편리하게 사용하기 위해 만든 라이브러리 입니다.

## 설치

```
pnpm add @woogie0303/easyfetch
```

```
yarn add @woogie0303/easyfetch
```

```
npm install @woogie0303/easyfetch
```

## 타입

### RequestInitWithNextConfig

```ts
interface NextFetchRequestConfig {
  revalidate?: number | false;
  tags?: string[];
}

interface RequestInitWithNextConfig extends globalThis.RequestInit {
  next?: NextFetchRequestConfig | undefined;
}
```

### EasyFetchResponse

```ts
type EasyFetchResponse<T> = Omit<
  Awaited<ReturnType<typeof fetch>>,
  keyof Body | 'clone'
> & {
  body: T;
  config: [string | URL, RequestInit | RequestInitWithNextConfig | undefined];
};
```

### EasyFetchRequestType

```ts
type EasyFetchRequestType = [
  string | URL,
  RequestInitWithNextConfig | undefined
];
```

## 특징

### header와 baseUrl을 설정 할 수 있습니다.

#### easyFetch()

```ts
const easy = easyFetch(defaultConfig);
```

#### Parameter

```
defaultConfig?: {
  baseUrl?: string | URL;
  headers?: HeadersInit;
}
```

### api method 및 기존 fetch 인자인 Request 인스턴스를 사용할 수 있습니다.

```ts
const easy = easyFetch({
  baseUrl: 'https://attraction/',
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

const request = new Request('https://hi');

easy.request(request);

easy.get('getUser');
easy.delete('deleteUser');

easy.patch('postUser', { userData: 'kang' });
easy.post('postUser', { userData: 'kang' });
easy.put('postUser', { userData: 'kang' });
```

#### Parameter, Return Type

##### get, delete method

```ts
<T>(url: string | URL, reqConfig?: Omit<RequestInitWithNextConfig, 'method'>) =>
  Promise<EasyFetchResponse<T>>;
```

##### patch, post, put method

```ts
<T>(
  url: string | URL,
  reqBody?: object, // Request Body
  reqConfig?: Omit<RequestInitWithNextConfig, 'method' | 'body'>
) => Promise<EasyFetchResponse<T>>;
```

##### request method

```ts
<T>(request: RequestInfo | URL, requestInit?: RequestInitWithNextConfig) =>
  Promise<EasyFetchResponse<T>>;
```

### Request Interceptor

요청을 보내기 전에 Fetch 인자와 관련해서 설정할 것이 있으면 추가할 수 있는 기능입니다.

```ts
const easy = easyFetch();

easy.interceptor.request(onFulfilled, onReject);
```

#### Parameter, Return Type

```ts
 (
  onFulfilled?: (arg: EasyFetchRequestType)
    => | Promise<EasyFetchRequestType>
       | EasyFetchRequestType,
  onRejected?: (err: any) => any
 ): void
```

### Response Interceptor

응답을 받기전에 처리해야할 로직을 설정할 수 있습니다. 400번대 에러를 처리할때는 EasyFetchResponse 타입 단언을 사용해서 서버 에러를 핸들링 할 수 있습니다.

```ts
const easy = easyFetch();

easy.interceptor.response(onFulfilled, onReject);
```

#### Parameter, Return Type

```ts
 (
  onFulfilled?: (arg: EasyFetchResponse<any>)
    => | Promise<EasyFetchResponse<any>>
       | EasyFetchResponse<any>,
  onRejected?: (err: any) => any
 ): void
```

#### 400대 서버 에러처리

```ts
const easy = easyFetch();

easy.interceptor.response(
  (res) => res,
  async (err) => {
    const serverError = err as EasyFetchResponse<{ data: 1 }>;

    if (serverError.status === 401) {
      const [url, resConfig] = serverError.config;
      const refreshToken = await easy
        .get<RefreshTokenType>('https://getRefresh', { ...resConfig })
        .then(
          (res) => res,
          (err) => {
            throw err;
          }
        );

      const headers = new Headers(resConfig?.headers);
      headers.set('Authorization', `Berarer ${refreshToken.data}`);

      return easy.get(url, { ...resConfig, headers });
    }

    return Promise.reject(err);
  }
);
```

## 주의

에러를 핸들링할 때 Interceptor Response기능은 response의 형태를 바꿔주는 transform response와 다른 기능입니다. error config url을 인자로 해서 반환해주는 것이 타입의 일관성을 줄 수 있습니다.

```ts
// 잘못된 사용 예시
const easy = easyFetch();
easy.interceptor.response(
  (res) => res,
  (err) => {
    const serverError = err as EasyFetchResponse<ResponseType>;

    return { data: 'Hi' };
  }
);

const data = await easy.get<ResponseType>('https://sdf'); // return {data: 'Hi'}

// 올바른 사용 예시
const easy = easyFetch();
easy.interceptor.response(
  (res) => res,
  (err) => {
    const serverError = err as EasyFetchResponse<ResponseType>;
    const [url, requestConfig] = serverError.config;

    return easy.get(url, requestConfig);
  }
);

const data = easy.get<ResponseType>('https://sdf'); // return ResponseType Data
```

## 라이센스

MIT © [DongWook Kang](https://github.com/woogie0303)
