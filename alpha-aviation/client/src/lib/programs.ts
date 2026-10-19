export interface Program {
  id: string;
  slug: string;
  title: string;
  category: "Ticketing & Operations" | "Hospitality & Passenger Services" | "Travel & Agency Management" | "Retailing & Documentation";
  shortDescription: string;
  description: string;
  duration: string;
  priceNGN: number;
  deliveryMode: "In-Person (Lagos) & Live Virtual (Global)";
  highlights: string[];
  outline: string[];
  targetAudience: string[];
  careerOutcomes: string[];
  certificationNote: string;
  technicalGraphicType: "radar-gds" | "cabin-service" | "travel-corridor" | "visa-border" | "hotel-reception" | "tourism-network" | "customer-flight";
  faqItems: { question: string; answer: string }[];
}

export const programsData: Program[] = [
  {
    id: "air-ticketing",
    slug: "air-ticketing",
    title: "Air Ticketing & Reservation Management",
    category: "Ticketing & Operations",
    shortDescription: "Master industry Global Distribution Systems (GDS), IATA billing codes, fare construction, and flight booking workflows.",
    description: "An intensive four-week professional training program developed to provide candidates with operational mastery of global airline ticketing and Global Distribution Systems (GDS). Students build real-world proficiency in fare quotation rules, electronic ticketing, mileage principles, and automated booking recovery procedures.",
    duration: "4 weeks",
    priceNGN: 150000,
    deliveryMode: "In-Person (Lagos) & Live Virtual (Global)",
    technicalGraphicType: "radar-gds",
    highlights: [
      "IATA standard coding, global indicators, and geography",
      "Hands-on Global Distribution System (GDS) workflow terminals",
      "Comprehensive fare ladder construction and tax calculations",
      "Billing and Settlement Plan (BSP) reporting simulation",
    ],
    outline: [
      "Introduction to Airline Operations & Industry Structure",
      "IATA Codes, Geography & Global Airline Network",
      "Passenger Handling Procedures & Travel Documentation",
      "Reservations & GDS Workflow",
      "Fare Construction & Fare Rules",
      "Ticketing & E-Ticketing Practices",
      "Refunds, Reissues & Irregular Operations",
      "Customer Service, Complaint Handling & Service Recovery",
      "Practical GDS Workshops & Mock BSP Reporting",
      "Final Review, Examination & Certification",
    ],
    targetAudience: [
      "Aspiring airline ticketing agents and reservation officers",
      "Travel consultants looking to upgrade GDS computational skills",
      "Graduates seeking immediate placement in commercial aviation sales",
    ],
    careerOutcomes: [
      "Airline Reservation Agent",
      "GDS Fare Desk Specialist",
      "Corporate Travel Desk Manager",
      "Airport Sales Desk Executive",
    ],
    certificationNote: "Curriculum aligned with IATA Foundation standards. Students complete practical terminal assessment before receiving their ASL certificate of completion.",
    faqItems: [
      {
        question: "Which Global Distribution Systems are covered?",
        answer: "The curriculum provides structured training on GDS command logic, itinerary building, and PNR creation aligned with Sabre, Amadeus, and Galileo workflows.",
      },
      {
        question: "Are there prerequisites for this course?",
        answer: "Basic computer literacy and secondary school completion (SSCE/WAEC/O-Levels or equivalent) are required. No prior aviation background is necessary.",
      },
    ],
  },
  {
    id: "customer-service",
    slug: "customer-service",
    title: "Customer Service & Communication in Aviation",
    category: "Hospitality & Passenger Services",
    shortDescription: "Develop high-calibre communication, conflict de-escalation, and international passenger care standards.",
    description: "Customer experience is the core differentiator in civil aviation. This rigorous course immerses trainees in modern passenger psychological profiles, cultural etiquette, crisis de-escalation, and seamless airport ground handling communication.",
    duration: "4 weeks",
    priceNGN: 150000,
    deliveryMode: "In-Person (Lagos) & Live Virtual (Global)",
    technicalGraphicType: "customer-flight",
    highlights: [
      "Cross-cultural sensitivity across international flight corridors",
      "Handling disruptive and anxious passengers with proven protocols",
      "Radio telephony, public address (PA) voice modulation, and gate announcements",
      "Incident documentation and regulatory reporting standard operating procedures",
    ],
    outline: [
      "Introduction to Aviation Customer Service",
      "Principles of Customer Care & Service Culture",
      "Communication Techniques in Aviation",
      "Handling Difficult Passengers & Service Recovery",
      "Cross-Cultural Awareness & Sensitivity in Aviation",
      "Complaint Management, Escalation & Documentation",
      "Documentation & Reporting",
      "Practical Scenarios & Role-Play Exercises",
      "Summary & Key Learning Points",
    ],
    targetAudience: [
      "Aspiring cabin crew and flight attendants",
      "Airport customer care officers and VIP lounge hosts",
      "Airline guest relations personnel",
    ],
    careerOutcomes: [
      "Cabin Crew & In-flight Service Host",
      "Airport Terminal Guest Service Executive",
      "VIP Airline Lounge Representative",
      "Airline Service Recovery Specialist",
    ],
    certificationNote: "Includes practical voice modulation, de-escalation drills, and grooming standards evaluation leading to the ASL Certificate in Aviation Customer Care.",
    faqItems: [
      {
        question: "Does this course help with cabin crew interviews?",
        answer: "Yes, intensive modules cover personal grooming, posture, standard cabin announcements, situational judgment tests, and assessment day roleplay scenarios.",
      },
    ],
  },
  {
    id: "hospitality",
    slug: "hospitality",
    title: "Hospitality & Tourism Management",
    category: "Hospitality & Passenger Services",
    shortDescription: "An expansive executive overview of airport ground handling, in-flight cabin service, and luxury tourism hospitality.",
    description: "A comprehensive pathway bridging international hospitality disciplines with modern aviation operations. Students examine airline cabin services, hotel operations, airport executive lounges, and the international tourism value chain.",
    duration: "4 weeks",
    priceNGN: 150000,
    deliveryMode: "In-Person (Lagos) & Live Virtual (Global)",
    technicalGraphicType: "cabin-service",
    highlights: [
      "Cabin crew service choreography and in-flight catering management",
      "Airport VIP terminal management and luxury concierge services",
      "Aviation safety and security fundamentals",
      "International tourism marketing and destination distribution channels",
    ],
    outline: [
      "Introduction to Hospitality & Tourism Management",
      "Overview of the Aviation, Hospitality, and Tourism Industry",
      "Organization Structure of Hospitality and Aviation Services",
      "Customer Service Excellence in Aviation & Tourism",
      "Airport and Airline Hospitality Operations",
      "Tourism Management and Travel Operations",
      "Airline Cabin Services and In-Flight Hospitality",
      "Ground Handling and Airport Passenger Services",
      "Communication Skills and Professional Grooming",
      "Safety, Security, and Emergency Management",
      "Aviation Law, Ethics, and Professional Conduct",
      "Technology in Hospitality, Tourism, and Aviation",
      "Cultural Awareness and International Tourism",
      "Career Opportunities in Aviation, Hospitality & Tourism",
    ],
    targetAudience: [
      "Graduates seeking dual qualification across aviation and luxury hospitality",
      "Cabin service aspirants wanting an expansive operational foundation",
      "Hospitality professionals transitioning to airport and airline roles",
    ],
    careerOutcomes: [
      "In-flight Hospitality Lead",
      "Airport Executive Lounge Supervisor",
      "International Tourism Coordinator",
      "Airline Operations Guest Coordinator",
    ],
    certificationNote: "Awarded upon successful completion of 14 core modules and situational hospitality case examinations.",
    faqItems: [
      {
        question: "How does this differ from standard hotel courses?",
        answer: "This program specifically integrates aviation frameworks, airline cabin safety laws, ICAO security guidelines, and airport ground handling dynamics alongside hotel guest management.",
      },
    ],
  },
  {
    id: "travel-agency",
    slug: "travel-agency",
    title: "Travel Agency Operations",
    category: "Travel & Agency Management",
    shortDescription: "Understand the commercial mechanics of modern travel agencies, itinerary creation, and supplier contracting.",
    description: "A comprehensive program designed for aspiring agency founders, travel managers, and corporate booking specialists. Learn how to package global travel products, negotiate airline wholesale contracts, and navigate travel law and compliance.",
    duration: "4 weeks",
    priceNGN: 150000,
    deliveryMode: "In-Person (Lagos) & Live Virtual (Global)",
    technicalGraphicType: "travel-corridor",
    highlights: [
      "Bespoke itinerary design and international tour package pricing",
      "Wholesale airline inventory procurement and consolidation",
      "Regulatory compliance with aviation bodies (NCAA, IATA, ABTA frameworks)",
      "Digital agency automation tools and customer CRM setups",
    ],
    outline: [
      "Introduction to the travel industry",
      "Travel products and services",
      "Reservations and booking procedures",
      "Travel documentation",
      "Tour planning and Itinerary development",
      "Legal, Ethical and regulatory issues",
      "Practical training and case studies",
    ],
    targetAudience: [
      "Entrepreneurs launching independent travel agencies or consultancies",
      "Corporate procurement officers managing corporate flight accounts",
      "Travel agency staff wanting structured operational knowledge",
    ],
    careerOutcomes: [
      "Travel Agency Managing Director",
      "Corporate Travel Desk Lead",
      "Outbound Tour Planning Specialist",
      "Aviation Product Merchandiser",
    ],
    certificationNote: "Includes business plan development and commercial compliance guidelines for operating a licensed travel desk.",
    faqItems: [
      {
        question: "Can I start my own travel business after this program?",
        answer: "Yes, the curriculum equips you with the exact operational workflows, supplier partnerships, GDS access rules, and regulatory compliance steps necessary to launch or manage an agency.",
      },
    ],
  },
  {
    id: "visa-processing",
    slug: "visa-processing",
    title: "Visa Processing & Documentation",
    category: "Retailing & Documentation",
    shortDescription: "Specialized training in embassy documentation, biometric verification, immigration requirements, and consular protocols.",
    description: "A precision-focused training program addressing one of the most critical segments of the international travel industry: cross-border documentation. Learn verification procedures, embassy compliance rules, and risk reduction for international traveler dossiers.",
    duration: "4 weeks",
    priceNGN: 150000,
    deliveryMode: "In-Person (Lagos) & Live Virtual (Global)",
    technicalGraphicType: "visa-border",
    highlights: [
      "In-depth analysis of UK, Schengen, US, and Canadian visa frameworks",
      "Document fraud detection and financial statement verification",
      "Online consular portal navigation and biometric appointment scheduling",
      "Professional client interview coaching and file preparation",
    ],
    outline: [
      "Definition of visa processing and documentation",
      "Introduction to visa processing",
      "Types of visas",
      "Visa application procedures",
      "Visa documentation requirements",
      "Document verification and assessment",
      "Customer service and communication",
      "Practical training and case studies",
    ],
    targetAudience: [
      "Visa advisory consultants and immigration documentation officers",
      "Travel agency visa desk specialists",
      "Corporate mobility coordinators managing expatriate travel",
    ],
    careerOutcomes: [
      "Visa Desk Supervisor",
      "Immigration Documentation Specialist",
      "Corporate Mobility Advisor",
      "Consular Services Coordinator",
    ],
    certificationNote: "Awarded upon successful completion of mock case audits, document verification drills, and ethical compliance standards.",
    faqItems: [
      {
        question: "Does this program guarantee visa approvals for clients?",
        answer: "No. In accordance with ethical standards, this program trains students on accurate document compilation and consular compliance. Only diplomatic missions issue visa decisions.",
      },
    ],
  },
  {
    id: "hotel-management",
    slug: "hotel-management",
    title: "Hotel & Front Office Management",
    category: "Hospitality & Passenger Services",
    shortDescription: "Front-desk operations, Property Management Systems (PMS), revenue awareness, and VIP hospitality standards.",
    description: "A tailored executive course examining the guest lifecycle, property reservation technology, financial night-audit fundamentals, and service recovery strategies essential for high-end airport hotels and international hospitality chains.",
    duration: "4 weeks",
    priceNGN: 150000,
    deliveryMode: "In-Person (Lagos) & Live Virtual (Global)",
    technicalGraphicType: "hotel-reception",
    highlights: [
      "Complete guest cycle management: reservations, check-in, billing, departure",
      "Front-office software (PMS) workflow simulation",
      "Handling high-pressure flight crew layovers and delayed flight passenger lodging",
      "Cross-cultural etiquette and professional executive grooming",
    ],
    outline: [
      "Introduction to Hospitality in Aviation",
      "Overview of Hotel Operations",
      "Front Office Department: Roles & Responsibilities",
      "Guest Cycle in Hotel Operations",
      "Front Office Procedures & Systems",
      "Customer Service Excellence in Front Office Management",
      "Handling Complaints & Service Recovery",
      "Cultural Awareness & Professional Ethics",
      "Safety, Security & Emergency Procedures",
      "Revenue & Financial Awareness",
      "Technology & Innovation in Hotel Front Office",
      "Professional Grooming & Workplace Etiquette",
      "Career Opportunities in Hotel & Aviation Hospitality",
      "Practical Scenarios & Case Studies",
      "Summary & Key Learning Points",
    ],
    targetAudience: [
      "Hospitality graduates seeking front-office supervisory positions",
      "Front desk officers aiming for airport hotel and transit facility roles",
      "Guest relations specialists in travel and leisure industries",
    ],
    careerOutcomes: [
      "Front Office Manager",
      "Guest Experience Supervisor",
      "Airport Transit Hotel Desk Lead",
      "Reservations & Yield Assistant",
    ],
    certificationNote: "Includes comprehensive practical simulation of front-desk operations and emergency recovery scenarios.",
    faqItems: [
      {
        question: "Is this training recognized in airport hotels?",
        answer: "Yes, the course includes specific modules on airline crew accommodation blocks, transit passengers, and rapid turnaround service delivery.",
      },
    ],
  },
  {
    id: "tourism-marketing",
    slug: "tourism-marketing",
    title: "Tourism Marketing & Entrepreneurship",
    category: "Retailing & Documentation",
    shortDescription: "Strategic destination marketing, digital travel retailing, and commercial venture setup in global tourism.",
    description: "Transform passion for travel into a resilient commercial enterprise. This course covers destination branding, social selling for travel products, influencer partnerships, tour packaging economics, and entrepreneurship fundamentals.",
    duration: "4 weeks",
    priceNGN: 150000,
    deliveryMode: "In-Person (Lagos) & Live Virtual (Global)",
    technicalGraphicType: "tourism-network",
    highlights: [
      "Digital customer acquisition strategies for modern travel retailers",
      "Designing high-yield destination tour packages",
      "Tourism unit economics, cash-flow forecasting, and pricing models",
      "Building strategic alliances with airlines, resorts, and tourism boards",
    ],
    outline: [
      "Foundations of Tourism & Travel Industry Marketing",
      "Tourist Behaviour, Customer Needs & Service Excellence",
      "Tourism Products, Packaging & Distribution Channels",
      "Destination Marketing, Branding & Promotion",
      "Digital Tourism Marketing & Modern Travel Retailing",
      "Tourism Entrepreneurship, Professionalism & Career Paths",
    ],
    targetAudience: [
      "Travel startup founders and digital tourism entrepreneurs",
      "Marketing professionals entering the aviation and leisure sectors",
      "Tourism board and destination marketing executives",
    ],
    careerOutcomes: [
      "Tourism Marketing Executive",
      "Destination Brand Strategist",
      "Digital Travel Retailing Consultant",
      "Independent Travel Business Founder",
    ],
    certificationNote: "Candidates develop and present an actionable commercial marketing campaign for an international aviation or tourism venture.",
    faqItems: [
      {
        question: "Does the course cover digital and social media marketing?",
        answer: "Yes, dedicated modules cover modern search intent, social travel retailing, direct-to-consumer booking funnels, and CRM customer retention.",
      },
    ],
  },
];

export const internationalBundleConfig = {
  bundleCount: 4,
  bundlePriceNGN: 538000,
  regularPriceNGN: 600000,
  savingsNGN: 62000,
  label: "International 4-Course Career Track",
  badge: "Save ₦62,000",
  description: "Select any 4 core programs to qualify for the consolidated international aviation pathway curriculum and priority mentorship review.",
};

export function getProgramBySlug(slug: string): Program | undefined {
  return programsData.find((p) => p.slug === slug);
}
