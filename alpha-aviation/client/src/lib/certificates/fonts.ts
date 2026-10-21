// Certificate typefaces. They are registered under private family names so
// they never collide with site fonts, and the same files are inlined as data
// URIs when a certificate is exported (an SVG drawn to a canvas cannot fetch
// fonts on its own). All faces are SIL Open Font License.

import cinzel600 from "@fontsource/cinzel/files/cinzel-latin-600-normal.woff2?url";
import cinzel700 from "@fontsource/cinzel/files/cinzel-latin-700-normal.woff2?url";

import playfair700Latin from "@fontsource/playfair-display/files/playfair-display-latin-700-normal.woff2?url";
import playfair700Ext from "@fontsource/playfair-display/files/playfair-display-latin-ext-700-normal.woff2?url";
import playfair700Viet from "@fontsource/playfair-display/files/playfair-display-vietnamese-700-normal.woff2?url";

import garamond400Latin from "@fontsource/eb-garamond/files/eb-garamond-latin-400-normal.woff2?url";
import garamond400Ext from "@fontsource/eb-garamond/files/eb-garamond-latin-ext-400-normal.woff2?url";
import garamond400Viet from "@fontsource/eb-garamond/files/eb-garamond-vietnamese-400-normal.woff2?url";
import garamond600Latin from "@fontsource/eb-garamond/files/eb-garamond-latin-600-normal.woff2?url";
import garamond600Ext from "@fontsource/eb-garamond/files/eb-garamond-latin-ext-600-normal.woff2?url";
import garamond600Viet from "@fontsource/eb-garamond/files/eb-garamond-vietnamese-600-normal.woff2?url";
import garamond400ItalicLatin from "@fontsource/eb-garamond/files/eb-garamond-latin-400-italic.woff2?url";
import garamond400ItalicExt from "@fontsource/eb-garamond/files/eb-garamond-latin-ext-400-italic.woff2?url";
import garamond400ItalicViet from "@fontsource/eb-garamond/files/eb-garamond-vietnamese-400-italic.woff2?url";

import inter500 from "@fontsource/inter/files/inter-latin-500-normal.woff2?url";
import inter600 from "@fontsource/inter/files/inter-latin-600-normal.woff2?url";
import inter700 from "@fontsource/inter/files/inter-latin-700-normal.woff2?url";
import inter800 from "@fontsource/inter/files/inter-latin-800-normal.woff2?url";

import vibesLatin from "@fontsource/great-vibes/files/great-vibes-latin-400-normal.woff2?url";
import vibesExt from "@fontsource/great-vibes/files/great-vibes-latin-ext-400-normal.woff2?url";
import vibesViet from "@fontsource/great-vibes/files/great-vibes-vietnamese-400-normal.woff2?url";

export const CERT_FONT = {
  display: "ASL Cert Display",
  name: "ASL Cert Name",
  serif: "ASL Cert Serif",
  sans: "ASL Cert Sans",
  script: "ASL Cert Script",
} as const;

type Subset = "latin" | "latin-ext" | "vietnamese";

const UNICODE_RANGE: Record<Subset, string> = {
  latin:
    "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
  "latin-ext":
    "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF",
  vietnamese:
    "U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB",
};

interface FaceSource {
  family: string;
  weight: number;
  style: "normal" | "italic";
  files: Partial<Record<Subset, string>>;
}

const FACES: FaceSource[] = [
  { family: CERT_FONT.display, weight: 600, style: "normal", files: { latin: cinzel600 } },
  { family: CERT_FONT.display, weight: 700, style: "normal", files: { latin: cinzel700 } },
  {
    family: CERT_FONT.name,
    weight: 700,
    style: "normal",
    files: { latin: playfair700Latin, "latin-ext": playfair700Ext, vietnamese: playfair700Viet },
  },
  {
    family: CERT_FONT.serif,
    weight: 400,
    style: "normal",
    files: { latin: garamond400Latin, "latin-ext": garamond400Ext, vietnamese: garamond400Viet },
  },
  {
    family: CERT_FONT.serif,
    weight: 600,
    style: "normal",
    files: { latin: garamond600Latin, "latin-ext": garamond600Ext, vietnamese: garamond600Viet },
  },
  {
    family: CERT_FONT.serif,
    weight: 400,
    style: "italic",
    files: {
      latin: garamond400ItalicLatin,
      "latin-ext": garamond400ItalicExt,
      vietnamese: garamond400ItalicViet,
    },
  },
  { family: CERT_FONT.sans, weight: 500, style: "normal", files: { latin: inter500 } },
  { family: CERT_FONT.sans, weight: 600, style: "normal", files: { latin: inter600 } },
  { family: CERT_FONT.sans, weight: 700, style: "normal", files: { latin: inter700 } },
  { family: CERT_FONT.sans, weight: 800, style: "normal", files: { latin: inter800 } },
  {
    family: CERT_FONT.script,
    weight: 400,
    style: "normal",
    files: { latin: vibesLatin, "latin-ext": vibesExt, vietnamese: vibesViet },
  },
];

const fontFaceRule = (face: FaceSource, subset: Subset, src: string) =>
  `@font-face{font-family:"${face.family}";font-style:${face.style};font-weight:${face.weight};font-display:block;src:url(${src}) format("woff2");unicode-range:${UNICODE_RANGE[subset]};}`;

const STYLE_ID = "asl-certificate-fonts";

/** Registers the certificate faces with the document (idempotent). */
const registerDocumentFonts = () => {
  if (typeof document === "undefined" || document.getElementById(STYLE_ID)) return;
  const css = FACES.flatMap((face) =>
    (Object.entries(face.files) as Array<[Subset, string]>).map(([subset, url]) =>
      fontFaceRule(face, subset, url),
    ),
  ).join("\n");
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = css;
  document.head.appendChild(style);
};

const faceDescriptor = (face: FaceSource) => `${face.style} ${face.weight} 32px "${face.family}"`;

const BASE_SAMPLE = "ABCabc123";

/**
 * Loads every certificate face, plus the subsets needed for `text` (names with
 * accents pull in latin-ext / vietnamese). Resolves once they can be measured.
 */
export const ensureCertificateFonts = async (text = "") => {
  registerDocumentFonts();
  if (typeof document === "undefined" || !document.fonts) return;
  const sample = `${BASE_SAMPLE}${text}`;
  await Promise.all(
    FACES.map((face) => document.fonts.load(faceDescriptor(face), sample).catch(() => [])),
  );
};

/** True when the text uses characters beyond the basic Latin subset. */
export const needsExtendedSubsets = (text: string) =>
  // eslint-disable-next-line no-control-regex
  /[^\u0000-ÿ\u2000-\u206F€™]/.test(text);

const dataUrlCache = new Map<string, Promise<string>>();

const toDataUrl = (url: string) => {
  let cached = dataUrlCache.get(url);
  if (!cached) {
    cached = fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Font request failed: ${res.status}`);
        return res.blob();
      })
      .then(
        (blob) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(blob);
          }),
      );
    cached.catch(() => dataUrlCache.delete(url));
    dataUrlCache.set(url, cached);
  }
  return cached;
};

/**
 * @font-face rules with the font files inlined, for a standalone SVG. Only the
 * Latin subsets are embedded unless the certificate text needs more.
 */
export const embeddedFontCss = async (text: string) => {
  const extended = needsExtendedSubsets(text);
  const rules = await Promise.all(
    FACES.flatMap((face) =>
      (Object.entries(face.files) as Array<[Subset, string]>)
        .filter(([subset]) => subset === "latin" || extended)
        .map(async ([subset, url]) => fontFaceRule(face, subset, await toDataUrl(url))),
    ),
  );
  return rules.join("\n");
};
