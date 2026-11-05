/** Inserts a Cloudinary transformation into a delivery URL. */
export function cloudinaryUrl(url: string, transform: string) {
  return url.replace("/image/upload/", `/image/upload/${transform}/`);
}

export const avatarUrl = (url: string, size = 320) =>
  cloudinaryUrl(url, `w_${size},h_${size},c_fill,g_auto,f_auto,q_auto`);

export const screenshotThumb = (url: string) => cloudinaryUrl(url, "w_480,c_limit,f_auto,q_auto");
