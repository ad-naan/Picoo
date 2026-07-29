import { isIP } from "node:net";
import { lookup } from "node:dns/promises";

function blockedIpv4(address: string) {
  const parts = address.split(".").map(Number);
  if (parts.length !== 4) return true;
  const [a, b] = parts;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a >= 224) return true;
  return false;
}

function blockedIpv6(address: string) {
  const normalized = address.toLowerCase();
  if (normalized === "::" || normalized === "::1") return true;
  if (normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe8") || normalized.startsWith("fe9") || normalized.startsWith("fea") || normalized.startsWith("feb")) return true;
  if (normalized.startsWith("::ffff:")) return blockedIpv4(normalized.slice(7));
  return false;
}

function blockedAddress(address: string) {
  const family = isIP(address);
  if (family === 4) return blockedIpv4(address);
  if (family === 6) return blockedIpv6(address);
  return true;
}

export async function assertPublicFeedUrl(input: string) {
  const url = new URL(input);
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("FEED_URL_PROTOCOL_NOT_ALLOWED");
  if (url.username || url.password) throw new Error("FEED_URL_CREDENTIALS_NOT_ALLOWED");
  if (url.port && url.port !== "80" && url.port !== "443") throw new Error("FEED_URL_PORT_NOT_ALLOWED");
  const addresses = await lookup(url.hostname, { all: true, verbatim: true });
  if (addresses.length === 0) throw new Error("FEED_HOST_NOT_FOUND");
  if (addresses.some((entry) => blockedAddress(entry.address))) throw new Error("FEED_PRIVATE_NETWORK_NOT_ALLOWED");
  return url;
}
