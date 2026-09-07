/** URL of the resource route that streams a contractor photo out of R2. */
export function contractorPhotoUrl(photoId: number): string {
  return `/resident/contractors/photo?id=${photoId}`;
}
