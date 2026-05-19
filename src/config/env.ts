import { APP_ENV, API_BASE_URL, ORG_SLUG, APP_NAME } from '@env';

type Environment = 'local' | 'development' | 'production';

const currentEnv: Environment = APP_ENV || 'local';

if (__DEV__) {
  console.log(
    '[ENV] APP_ENV:', currentEnv,
    '| API_BASE_URL:', API_BASE_URL,
    '| ORG_SLUG:', ORG_SLUG,
  );
}

export const env = {
  APP_ENV: currentEnv,
  API_BASE_URL,
  ORG_SLUG,
  APP_NAME: APP_NAME ?? 'Dribee',
} as const;

export const isLocal = currentEnv === 'local';
export const isDev = currentEnv === 'development';
export const isProd = currentEnv === 'production';
