export interface FAQItem {
  id: string;
  category: "Admissions & Eligibility" | "Curriculum & IATA" | "Tuition & Fees" | "International Pathways" | "Learning Modes";
  question: string;
  answer: string;
}

export const allFaqs: FAQItem[] = [
  {
    id: "faq-1",
    category: "Admissions & Eligibility",
    question: "What are the minimum educational requirements to enroll?",
    answer: "Our core 4-week professional courses require completion of secondary school education (SSCE, WAEC, NECO, GCE, GCSE O-Levels, or national high school equivalent). Fluency in written and spoken English is essential, as international aviation operating manuals and GDS systems use English.",
  },
  {
    id: "faq-2",
    category: "Admissions & Eligibility",
    question: "Is prior experience in aviation or travel necessary?",
    answer: "No prior experience is necessary. Our programs are designed from fundamental principles through to operational proficiency. Whether you are a fresh school leaver or switching careers from banking, hospitality, or administration, our hands-on curriculum guides you step-by-step.",
  },
  {
    id: "faq-3",
    category: "Curriculum & IATA",
    question: "Are your curricula aligned with international industry standards?",
    answer: "Yes. Our courses in Air Ticketing & Reservation, Travel Agency Operations, and Passenger Services are structured in accordance with IATA (International Air Transport Association) foundational frameworks, standard ICAO airline codes, and live Global Distribution System (GDS) command architectures.",
  },
  {
    id: "faq-4",
    category: "Curriculum & IATA",
    question: "What certificate do I receive upon graduation?",
    answer: "Upon successful completion of all course modules, practical GDS terminal evaluations, and final assessments, graduates are awarded the official Certificate of Professional Completion from Alpha Step Links Aviation School. Certificates can be verified directly through our academic records office.",
  },
  {
    id: "faq-5",
    category: "Tuition & Fees",
    question: "What is the standard tuition fee per program?",
    answer: "Each verified core 4-week program has a standard tuition fee of ₦150,000. This covers all course modules, hands-on terminal training sessions, study guides, and assessment fees with no hidden administrative charges.",
  },
  {
    id: "faq-6",
    category: "Tuition & Fees",
    question: "How does the International 4-Course Bundle work?",
    answer: "Students who choose any 4 programs (such as Air Ticketing, Customer Service, Travel Agency Operations, and Visa Documentation) receive our discounted bundle tuition of ₦538,000 (regular price ₦600,000), saving ₦62,000. This multi-disciplinary track is ideal for candidates targeting international airline recruitment or agency entrepreneurship.",
  },
  {
    id: "faq-7",
    category: "International Pathways",
    question: "How are the UK, Nigerian, and Canadian locations connected?",
    answer: "Alpha Step Links operates its group corporate headquarters in Ruislip, Greater London, United Kingdom, and its primary classroom and simulation facilities in Ilasamaja, Lagos, Nigeria. We provide academic and career advisory for students planning to pursue advanced aviation or tourism qualifications in Canada and the UK.",
  },
  {
    id: "faq-8",
    category: "International Pathways",
    question: "Does Alpha Step Links Aviation School guarantee employment or visas?",
    answer: "No legitimate educational institution can guarantee employment or governmental visa decisions. We take institutional ethics seriously: we provide rigorous, industry-recognized training, CV review, and airline assessment preparation, but final hiring decisions rest with airlines and immigration decisions rest with sovereign embassies.",
  },
  {
    id: "faq-9",
    category: "Learning Modes",
    question: "Can I take courses online if I cannot attend the Lagos center?",
    answer: "Yes. All seven core programs offer live virtual classroom tracks with interactive video lectures, remote access to GDS training sandboxes, and recorded sessions for working professionals. We also offer weekend executive schedules in addition to regular weekday cohorts.",
  },
  {
    id: "faq-10",
    category: "Learning Modes",
    question: "How long does each cohort run?",
    answer: "Standard weekday cohorts run for 4 intensive weeks (Monday through Thursday, with practical lab sessions on Friday). Weekend cohorts run across 6 consecutive Saturdays and Sundays to accommodate candidates with weekday employment.",
  },
];
