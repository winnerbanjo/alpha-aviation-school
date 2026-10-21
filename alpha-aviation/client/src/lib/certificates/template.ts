import { siteConfig } from "@/lib/site-config";
import type { CertificateType, DeliveryMode, Signatory } from "./types";

/**
 * Certificate template content. Everything printed on the certificate that is
 * not specific to the recipient lives here, so wording, partners or the
 * accreditation list can be updated in one place.
 *
 * Signatories are snapshotted by the server at issue time; DEFAULT_SIGNATORIES
 * here only drives the preview before a certificate exists and must mirror
 * server/utils/certificateService.js.
 */

export const DEFAULT_SIGNATORIES: Signatory[] = [
  { name: "Dr. Evelyn Uche", title: "Founder & Group CEO", organisation: "Alpha Step Links Group" },
  { name: "Zainab Olawale", title: "Director of Studies", organisation: "Alpha Step Links Aviation School" },
];

export const CERTIFICATE_TEMPLATE = {
  institution: {
    name: "Alpha Step Links",
    division: "Aviation School",
    memberLine: "A Member of Alpha Step Links Group",
    pillars: ["Travels", "Training", "Business Growth"],
    mission: "Building Global Talent for a Brighter Tomorrow",
    sealTagline: "One Ecosystem. Endless Opportunities.",
    closingTagline: ["Skills Today.", "Global Opportunities", "Tomorrow."],
    website: `www.${siteConfig.domain}`,
  },
  partnerships: {
    heading: ["Global Partnerships", "Global Opportunities"],
    euPic: "860971322",
    euRegisterLabel: "EU Participant Register",
    values: ["Engage", "Collaborate", "Empower"],
  },
  /**
   * Each body's official logo, served from client/public. Use the artwork each
   * organisation supplied with the accreditation (PNG with transparency, SVG or
   * WebP; at least 400px on the long side). Until a file exists at its path the
   * certificate shows the lettered badge instead, so a missing logo never breaks issuing.
   */
  accreditations: {
    heading: ["International Accreditations", "& Partners"],
    items: [
      { mark: "NCAA", logo: "/images/accreditations/ncaa.png", lines: ["Nigerian Civil Aviation", "Authority"] },
      { mark: "IATA", logo: "/images/accreditations/iata.png", lines: ["International Air", "Transport Association"] },
      { mark: "SDC", logo: "/images/accreditations/sdc.png", lines: ["Skill Development", "Council Canada"] },
      { mark: "ACTE", logo: "/images/accreditations/acte.png", lines: ["Association for Career", "and Technical", "Education (USA)"] },
      { mark: "CPD", logo: "/images/accreditations/cpd.png", lines: ["The CPD Certification", "Service (UK)"] },
    ],
  },
  network: {
    heading: ["Our Global Partnership", "Network"],
    items: [
      { flag: "eu", name: "European Union", lines: ["PIC No: 860971322", "EU Participant Register"] },
      { flag: "ca", name: "Canada", lines: ["Training & Workforce", "Development Partners"] },
      { flag: "es", name: "Spain", lines: ["Internship & Training Partners"] },
      { flag: "it", name: "Italy", lines: ["Training & Mobility Partners"] },
      { flag: "de", name: "Germany", lines: ["Training & Mobility Partners"] },
      { flag: "nl", name: "Netherlands", lines: ["Training & Mobility Partners"] },
      { flag: "pt", name: "Portugal", lines: ["Training & Mobility Partners"] },
    ] as Array<{ flag: FlagCode; name: string; lines: string[] }>,
    more: { name: "And more global partners", lines: ["across Europe, North America,", "Africa, Middle East & Asia"] },
  },
  regions: ["Africa", "Europe", "North America", "Asia", "Middle East"],
  seal: { top: "Global Skills", middle: ["Real", "Opportunities"] },
} as const;

export type FlagCode = "eu" | "ca" | "es" | "it" | "de" | "nl" | "pt";

export const TYPE_COPY: Record<
  CertificateType,
  { label: string; subtitle: string; lead: string; body: string }
> = {
  completion: {
    label: "Certificate of Completion",
    subtitle: "of Completion",
    lead: "Has successfully completed a comprehensive training on",
    body: "Through practical learning and assessment, the participant has demonstrated the required knowledge, skills and competence in the above areas.",
  },
  achievement: {
    label: "Certificate of Achievement",
    subtitle: "of Achievement",
    lead: "Has demonstrated outstanding achievement in",
    body: "In recognition of exceptional performance, dedication and mastery of the competencies assessed in the above areas.",
  },
  participation: {
    label: "Certificate of Participation",
    subtitle: "of Participation",
    lead: "Has actively participated in",
    body: "In recognition of committed participation and engagement throughout the programme activities in the above areas.",
  },
};

export const CONGRATULATIONS =
  "We congratulate you on this achievement and wish you success in your global career journey.";

export const DELIVERY_LABELS: Record<DeliveryMode, string> = {
  online: "Online/Virtual",
  in_person: "In-Person",
  hybrid: "Hybrid",
};

export const CERTIFICATE_TYPES: CertificateType[] = ["completion", "achievement", "participation"];
export const DELIVERY_MODES: DeliveryMode[] = ["online", "in_person", "hybrid"];

/** Brand palette used inside the artwork (kept literal: the SVG is exported standalone). */
export const CERT_COLORS = {
  navy: "#10264B",
  night: "#0A1A38",
  ink: "#172B49",
  muted: "#53647C",
  blue: "#1246C8",
  sky: "#DCE8FF",
  paper: "#FFFEFA",
  panel: "#F4F7FC",
  line: "#DCE2EB",
  gold: "#AA8546",
  goldLight: "#E3CB8F",
  goldDeep: "#7E5F2C",
  revoked: "#B42318",
};

/** Mirrors server-side limits so the form can warn before submitting. */
export const CERTIFICATE_LIMITS = {
  nameMin: 2,
  nameMax: 80,
  programmesMax: 8,
  programmeMax: 120,
  programmesTotalMax: 360,
  reasonMin: 5,
  reasonMax: 500,
  bulkMax: 250,
  earliestCompletion: "2015-01-01",
};
