/** Calcula una huella estable del contenido binario de una fuente oficial. */
export async function sha256(buffer: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/** Combina los hashes de varias planillas en una sola versión de fuente. */
export async function combinedSha256(files: ArrayBuffer[]): Promise<string> {
  return sha256(new TextEncoder().encode((await Promise.all(files.map(sha256))).join("\n")).buffer);
}
