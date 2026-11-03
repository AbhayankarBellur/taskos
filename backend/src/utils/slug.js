import { randomBytes } from "node:crypto";

export function slugify(value) {
  const slug = value.toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug || "workspace";
}

export const withSuffix = (slug) =>
  `${slug}-${randomBytes(3).toString("hex")}`;
