export async function postJson<T = unknown>(url: string, body: unknown, method = "POST"): Promise<T> {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error ?? "Something went wrong. Please try again.");
  return data as T;
}

/** Shrinks a phone photo before upload so it works on slow mobile data. */
export async function shrinkImage(file: File, maxSide: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not read that image."))), "image/jpeg", 0.85);
  });
}

export async function uploadImage(blob: Blob, kind: "avatar" | "screenshot"): Promise<string> {
  const sign = await postJson<{
    timestamp: number;
    folder: string;
    allowed_formats: string;
    signature: string;
    apiKey: string;
    cloudName: string;
  }>("/api/upload/sign", { kind });
  const form = new FormData();
  form.append("file", blob, `${kind}.jpg`);
  form.append("api_key", sign.apiKey);
  form.append("timestamp", String(sign.timestamp));
  form.append("folder", sign.folder);
  form.append("allowed_formats", sign.allowed_formats);
  form.append("signature", sign.signature);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.secure_url) throw new Error("Image upload failed. Check your connection and try again.");
  return data.secure_url as string;
}
