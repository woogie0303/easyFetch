## EasyFetch

#### [한국어 버전](./README_KO.md)

While working on the attraction team project using the Next.js App Router, I encountered some inconveniences, especially being familiar with React and Axios. These issues include:

- Lack of interceptor functionality in client components.
- Using res.json, JSON.stringify
- Handling of errors above status 400 using res.ok.
- Missing API methods like axios.post in the fetch API.

To address these inconveniences, EasyFetch was created as an extended fetch for Next.js App Router, making it more user-friendly for those accustomed to Axios.

## Install

```
pnpm add @woogie0303/easyfetch
```

```
yarn add @woogie0303/easyfetch
```

```
npm install @woogie0303/easyfetch
```

## Type

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
  keyof Body | 'clone' | 'url'
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

## Feature

### You can set default headers and baseUrl.

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

### Use API methods and you can set Request instances as argument.

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

This feature allows you to add custom logic before a request is sent.

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

You can configure logic to handle responses before they are processed. For handling 400-level errors, use the EasyFetchResponse type assertion to handle server errors.

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

#### Handling 400-level Server Errors

```ts
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
```

## Note

When handling errors, note that the Interceptor Response feature is not the same as transforming the response data. Returning an error config url as an argument helps maintain type consistency.

```ts
// Incorrect usage
const easy = easyFetch();
easy.interceptor.response(
  (res) => res,
  (err) => {
    const serverError = err as EasyFetchResponse<ResponseType>;

    return { data: 'Hi' };
  }
);

const data = await easy.get<ResponseType>('https://sdf'); // return {data: 'Hi'}

// Correct usage
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

## License

MIT © [DongWook Kang](https://github.com/woogie0303)
