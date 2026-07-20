import type { LegalDoc } from "../types";
import { privacyNotice } from "./privacy-notice";
import { websitePrivacy } from "./website-privacy";
import { cookies } from "./cookies";
import { terms } from "./terms";
import { accessibility } from "./accessibility";

export const legalDocs: LegalDoc[] = [
  privacyNotice,
  websitePrivacy,
  cookies,
  terms,
  accessibility,
];

export { privacyNotice, websitePrivacy, cookies, terms, accessibility };
