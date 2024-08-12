## EasyFetch

### 계기

React+Axios에 익숙해져 있는 상태에서 attraction 팀프로젝트에서 Next.js App router 사용하다보니 몇가지 불편함을 접했습니다.

- 클라이언트 컴포넌트에서 interceptor 기능의 부재
- 직접 해야하는 직렬화, 역직렬화
- 400번 이상의 에러는 res.ok로 분기 처리
- fetch에서는 사용할 수 없는 `axios.post`와 같은 API 메서드

위와 같은 불편한 사항들을 해결하기 위해 Easyfetch는 Next App router에서 사용하는 확장된 fetch를 axios 사용자들이 좀 더 편리하게 사용하기 위해 만든 라이브러리 입니다.

## 설치

```
pnpm add easyFetch
```

```
yarn add easyFetch
```

```
npm install easyFetch
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

## 특징

### easyFetch()

```ts
const easy = easyFetch(defaultConfig);
```

#### parmeter

```
defaultConfig?: {
  baseUrl?: string | URL;
  headers?: HeadersInit;
}
```

#### returns

```ts
// GET, DELETE (without request body)
{
  get: <T>(url: string | URL, reqConfig?: Omit<RequestInitWithNextConfig, "method">) => Promise<EasyFetchResponse<T>>;

  delete: <T>(url: string | URL, reqConfig?: Omit<RequestInitWithNextConfig, "method">) => Promise<EasyFetchResponse<T>>;
}

// PATCH, PUT, POST (with request body)
{
   patch: <T>(url: string | URL, reqBody?: object, reqConfig?: Omit<RequestInitWithNextConfig, "method">) => Promise<EasyFetchResponse<T>>;
    put: <T>(url: string | URL, reqBody?: object, reqConfig?: Omit<RequestInitWithNextConfig, "method">) => Promise<EasyFetchResponse<T>>;
    post: <T>(url: string | URL, reqBody?: object, reqConfig?: Omit<RequestInitWithNextConfig, "method">) => Promise<EasyFetchResponse<T>>;
}
```

### Request Interceptor

요청을 보내기 전에 Fetch 인자와 관련해서 설정할 것이 있으면 추가할 수 있는 기능입니다.

```ts
const resolve = () => {};
const reject = () => {};
const easy = easyFetch();

easy.interceptor.request(resolve, reject);
```

#### parameter

```ts
 onFulfilled?: (
      arg: [string | URL, RequestInitWithNextConfig | undefined]
    ) =>  | Promise<[string | URL, RequestInitWithNextConfig | undefined]>
          | [string | URL, RequestInitWithNextConfig | undefined]
  onRejected?: (err: any) => any
```

### Response Interceptor

응답을 받기전에 처리해야할 로직을 설정할 수 있습니다. 400번대 에러를 처리할때는 EasyFetchResponse 타입 단언을 사용해서 서버 에러를 핸들링 할 수 있습니다.

- 400대 서버 에러처리

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

에러를 핸들링할 때 Interceptor Response기능은 response의 형태를 바꿔주는 transform response와 다른 기능입니다. error config 메서드를 인자로 해서 반환해주는 것이 타입의 일관성을 줄 수 있습니다.

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
