const PRACTICAL_SEQUENCE_VISUAL_PREFIX = "/practical/visuals/";
const SAFE_RASTER_FILE_NAME =
  /^[A-Za-z0-9][A-Za-z0-9._-]*\.(?:avif|bmp|gif|ico|jpe?g|png|tiff?|webp)$/i;

export type PracticalVisualAssetFetcher = (
  pathname: string,
) => Promise<Response>;

export type PracticalVisualAssetGlobal = typeof globalThis & {
  __SEOLBI_PRACTICAL_VISUAL_ASSET_FETCH__?: PracticalVisualAssetFetcher;
};

export function normalizePracticalSequenceVisualAssetPath(pathname: string) {
  if (!pathname.startsWith(PRACTICAL_SEQUENCE_VISUAL_PREFIX)) return null;
  const fileName = pathname.slice(PRACTICAL_SEQUENCE_VISUAL_PREFIX.length);
  if (!SAFE_RASTER_FILE_NAME.test(fileName)) return null;
  return `${PRACTICAL_SEQUENCE_VISUAL_PREFIX}${fileName}`;
}
