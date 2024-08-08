import { RequestInitWithNextConfig } from '../types/nextProperty.type';

const hasNextConfig = (
  reqConfig: RequestInit | RequestInitWithNextConfig
): reqConfig is RequestInitWithNextConfig => {
  return Object.keys(reqConfig).includes('next');
};

export { hasNextConfig };
