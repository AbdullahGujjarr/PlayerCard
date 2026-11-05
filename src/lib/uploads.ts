export type UploadKind = "avatar" | "screenshot";

export const uploadFolder = (uid: string, kind: UploadKind) => `dropcard/${uid}/${kind}`;

/** True only for images this player uploaded to this app's Cloudinary folder. */
export function isOwnUpload(url: string, uid: string, kind: UploadKind) {
  const base = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/`;
  return url.startsWith(base) && url.includes(`/${uploadFolder(uid, kind)}/`);
}
