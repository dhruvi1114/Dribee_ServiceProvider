import { API_BASE_URL } from '@/utils/constants/api.constant';

/** Prefix relative URLs and rewrite localhost image hosts so devices can load media. */
export function resolveMediaUrl(uri: string | null | undefined): string | null {
  if (uri == null) return null;
  const s = String(uri).trim();
  if (!s) return null;

  let apiOrigin: string;
  try {
    apiOrigin = new URL(API_BASE_URL).origin;
  } catch {
    apiOrigin = API_BASE_URL.replace(/\/$/, '');
  }

  if (s.startsWith('//')) {
    try {
      const { protocol } = new URL(API_BASE_URL);
      return `${protocol}${s}`;
    } catch {
      return `https:${s}`;
    }
  }

  if (s.startsWith('/')) {
    return `${apiOrigin}${s}`;
  }

  try {
    const u = new URL(s);
    if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') {
      const api = new URL(API_BASE_URL);
      const port = api.port ? `:${api.port}` : '';
      return `${api.protocol}//${api.hostname}${port}${u.pathname}${u.search}`;
    }
    return s;
  } catch {
    return s;
  }
}
