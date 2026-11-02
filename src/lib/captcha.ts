import crypto from 'crypto';
import svgCaptcha from 'svg-captcha';

/**
 * Stateless, server-verified captcha + signed datasheet download tokens.
 *
 * Captcha token = "<nonce>.<expiresAt>.<hmac(nonce.expiresAt.ANSWER)>"
 * The answer itself never leaves the server; the client only gets an SVG made of paths
 * (no <text> elements), so it can't be read straight out of the markup.
 */

const CAPTCHA_TTL_MS = 10 * 60 * 1000; // 10 minutes to solve
const DOWNLOAD_TTL_MS = 15 * 60 * 1000; // download link valid for 15 minutes

function getSecret(): string {
  const secret =
    process.env.CAPTCHA_SECRET || process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('CAPTCHA_SECRET (or AUTH_SECRET) must be set to use captcha verification');
  }
  return secret;
}

function sign(value: string): string {
  return crypto.createHmac('sha256', getSecret()).update(value).digest('base64url');
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

// Single-use protection: a solved captcha can't be replayed for spam.
// In-memory per server instance; tokens also expire after CAPTCHA_TTL_MS.
const usedNonces = new Map<string, number>();
function markNonceUsed(nonce: string, expiresAt: number): boolean {
  const now = Date.now();
  for (const [n, exp] of usedNonces) {
    if (exp < now) usedNonces.delete(n);
  }
  if (usedNonces.has(nonce)) return false;
  usedNonces.set(nonce, expiresAt);
  return true;
}

export function createCaptcha(): { token: string; svg: string } {
  // Deliberately easy to read: 4 large digits, 2 light lines, single dark colour.
  // Digits 0 and 1 are left out so they can't be confused with O / I / l.
  const captcha = svgCaptcha.create({
    size: 4,
    charPreset: '23456789',
    noise: 2,
    color: false,
    width: 160,
    height: 48,
    fontSize: 52,
  });
  const nonce = crypto.randomBytes(12).toString('base64url');
  const expiresAt = Date.now() + CAPTCHA_TTL_MS;
  const answer = captcha.text.toUpperCase();
  const token = `${nonce}.${expiresAt}.${sign(`captcha.${nonce}.${expiresAt}.${answer}`)}`;
  return { token, svg: captcha.data };
}

export type CaptchaResult = { ok: true } | { ok: false; reason: 'missing' | 'expired' | 'invalid' };

export function verifyCaptcha(token: unknown, answer: unknown): CaptchaResult {
  if (typeof token !== 'string' || typeof answer !== 'string' || !token || !answer.trim()) {
    return { ok: false, reason: 'missing' };
  }
  const [nonce, expStr, sig] = token.split('.');
  const expiresAt = Number(expStr);
  if (!nonce || !sig || !Number.isFinite(expiresAt)) return { ok: false, reason: 'invalid' };
  if (expiresAt < Date.now()) return { ok: false, reason: 'expired' };

  const expected = sign(`captcha.${nonce}.${expiresAt}.${answer.trim().toUpperCase()}`);
  if (!safeEqual(sig, expected)) return { ok: false, reason: 'invalid' };
  if (!markNonceUsed(nonce, expiresAt)) return { ok: false, reason: 'expired' };
  return { ok: true };
}

/** Signed, time-limited token that authorises downloading one product's datasheet */
export function createDownloadToken(productSlug: string): string {
  const expiresAt = Date.now() + DOWNLOAD_TTL_MS;
  return `${expiresAt}.${sign(`download.${productSlug}.${expiresAt}`)}`;
}

export function verifyDownloadToken(productSlug: string, token: unknown): boolean {
  if (typeof token !== 'string' || !productSlug) return false;
  const [expStr, sig] = token.split('.');
  const expiresAt = Number(expStr);
  if (!sig || !Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;
  return safeEqual(sig, sign(`download.${productSlug}.${expiresAt}`));
}
