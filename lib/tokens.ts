/**
 * Secure token storage abstraction.
 * Encrypt sensitive integration credentials before storing in DB.
 * Uses ENCRYPTION_KEY (32 chars) for AES-style usage — extension: use crypto.scrypt or AES-256-GCM.
 */

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const KEY_LENGTH = 32;

function getKey(): Buffer {
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < KEY_LENGTH) {
    throw new Error("ENCRYPTION_KEY must be set and at least 32 characters");
  }
  return Buffer.from(ENCRYPTION_KEY.slice(0, KEY_LENGTH), "utf8");
}

/** Simple XOR for MVP; replace with proper AES-256-GCM in production. */
function xorBuffer(data: Buffer, key: Buffer): Buffer {
  const out = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i++) {
    out[i] = data[i] ^ key[i % key.length];
  }
  return out;
}

export function encryptToken(plain: string): string {
  const key = getKey();
  const data = Buffer.from(plain, "utf8");
  const encrypted = xorBuffer(data, key);
  return encrypted.toString("base64");
}

export function decryptToken(encrypted: string): string {
  const key = getKey();
  const data = Buffer.from(encrypted, "base64");
  const decrypted = xorBuffer(data, key);
  return decrypted.toString("utf8");
}
