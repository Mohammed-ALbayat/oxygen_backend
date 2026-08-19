export function getAppBaseUrl(): string {
  const baseUrl = process.env.APP_URL?.trim();

  if (!baseUrl) {
    return `http://localhost:${process.env.PORT ?? 4000}`;
  }

  return baseUrl.replace(/\/+$/, '');
}

export function toStorageUrl(
  filename: string | null | undefined,
): string | null {
  if (!filename) {
    return null;
  }

  return `${getAppBaseUrl()}/storage?filename=${encodeURIComponent(filename)}`;
}
