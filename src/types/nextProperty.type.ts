interface NextFetchRequestConfig {
  revalidate?: number | false;
  tags?: string[];
}

interface RequestInitWithNextConfig extends globalThis.RequestInit {
  next?: NextFetchRequestConfig | undefined;
}

export { RequestInitWithNextConfig };
