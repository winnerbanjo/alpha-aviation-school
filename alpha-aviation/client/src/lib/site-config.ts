export interface OfficeLocation {
  city: string;
  country: string;
  badge: string;
  addressLines: string[];
  phone: string;
  phoneRaw: string;
  mapUrl: string;
  coordinates: {
    lat: string;
    lng: string;
  };
  officeHours: string;
}

export const siteConfig = {
  name: "Alpha Step Links Aviation School",
  shortName: "ASL Aviation School",
  parentBrand: "Alpha Step Links",
  tagline: "A clear direction forward.",
  domain: "aslaviationschool.co",
  canonicalBase: "https://www.aslaviationschool.co",
  primaryEmail: "info@aslaviationschool.co",
  
  navigation: [
    { label: "Home", href: "/" },
    { label: "About ASL", href: "/about" },
    { label: "Our Programs", href: "/courses" },
    { label: "Student Experience", href: "/student-experience" },
    { label: "International", href: "/international-opportunities" },
    { label: "Contact", href: "/contact" },
  ],

  secondaryNavigation: [
    { label: "Admissions FAQs", href: "/faqs" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Agent portal", href: "/agent/login" },
  ],

  offices: {
    uk: {
      city: "Ruislip, Greater London",
      country: "United Kingdom",
      badge: "UK Headquarters",
      addressLines: [
        "2nd Floor, College Road",
        "17 King Edwards Road",
        "Ruislip HA4 7AE",
        "United Kingdom",
      ],
      phone: "+44 7827 870141",
      phoneRaw: "+447827870141",
      mapUrl: "https://maps.google.com/?q=2nd%20Floor%2C%20College%20Road%2C%2017%20King%20Edwards%20Road%2C%20Ruislip%20HA4%207AE%2C%20United%20Kingdom",
      coordinates: {
        lat: "51.5746° N",
        lng: "0.4285° W",
      },
      officeHours: "Monday – Friday: 09:00 – 17:00 GMT",
    } as OfficeLocation,
    nigeria: {
      city: "Ilasamaja, Lagos",
      country: "Nigeria",
      badge: "West Africa Training Center",
      addressLines: [
        "7 Chief Tajudeen Odubiyi Street",
        "Ilasamaja, Lagos 102214",
        "Nigeria",
      ],
      phone: "+234 814 025 7174",
      phoneRaw: "+2348140257174",
      mapUrl: "https://maps.google.com/?q=7%20Chief%20Tajudeen%20Odubiyi%20St%2C%20Ilasamaja%2C%20Lagos%20102214",
      coordinates: {
        lat: "6.5244° N",
        lng: "3.3792° E",
      },
      officeHours: "Monday – Saturday: 08:30 – 17:30 WAT",
    } as OfficeLocation,
  },

  socialLinks: [
    { platform: "LinkedIn", href: "https://www.linkedin.com/company/alpha-step-links", label: "Alpha Step Links on LinkedIn" },
    { platform: "Instagram", href: "https://www.instagram.com/aslaviationschool", label: "ASL Aviation School on Instagram" },
    { platform: "Facebook", href: "https://www.facebook.com/aslaviationschool", label: "ASL Aviation School on Facebook" },
    { platform: "WhatsApp", href: "https://wa.me/2348140257174", label: "Chat with ASL admissions on WhatsApp" },
  ],

  stats: [
    { label: "Verified Programs", value: "7 Core Tracks", note: "IATA-aligned curricula" },
    { label: "Global Presence", value: "UK & Nigeria", note: "Ruislip & Lagos hubs" },
    { label: "Intensive Format", value: "4 Weeks", note: "Hands-on GDS simulation" },
    { label: "Standard Tuition", value: "₦150,000", note: "Per course or ₦538k 4-course bundle" },
  ],

  brandStandardsNotice: "Alpha Step Links Aviation School operates under the Alpha Step Links brand architecture (Edition 01, Oct 2026). All institutional claims are based on verified operations in Ruislip, UK and Lagos, Nigeria.",
};
