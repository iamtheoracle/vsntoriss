import { createHmac, timingSafeEqual } from "node:crypto";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function base32Encode(data: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = "";
  for (const byte of data) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += ALPHABET[(value << (5 - bits)) & 31];
  return output;
}

export function base32Decode(input: string): Buffer {
  const clean = input.replace(/=+$/g, "").replace(/\s+/g, "").toUpperCase();
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const char of clean) {
    const index = ALPHABET.indexOf(char);
    if (index < 0) throw new Error("Invalid base32.");
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

export function hotp(key: Buffer, counter: bigint, digits = 6): string {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(counter);
  const hmac = createHmac("sha1", key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const bin = hmac.readUInt32BE(offset) & 0x7fffffff;
  return String(bin % 10 ** digits).padStart(digits, "0");
}

export function totpAt(secret: string, timeMs: number, digits = 6, stepSeconds = 30): { code: string; counter: bigint } {
  const counter = BigInt(Math.floor(timeMs / 1000 / stepSeconds));
  return { code: hotp(base32Decode(secret), counter, digits), counter };
}

export function matchTotp(
  secret: string,
  code: string,
  timeMs = Date.now(),
  lastAccepted: bigint | null = null,
): bigint | null {
  const cleaned = code.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(cleaned)) return null;
  for (const skew of [-1, 0, 1]) {
    const at = totpAt(secret, timeMs + skew * 30_000);
    if (lastAccepted !== null && at.counter <= lastAccepted) continue;
    const left = Buffer.from(at.code);
    const right = Buffer.from(cleaned);
    if (left.length === right.length && timingSafeEqual(left, right)) return at.counter;
  }
  return null;
}
