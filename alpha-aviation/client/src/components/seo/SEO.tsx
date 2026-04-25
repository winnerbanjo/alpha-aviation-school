import { Helmet } from "react-helmet-async";

type SEOProps = {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  publishedTime?: string;
  author?: string;
  noindex?: boolean;
};

const BASE_URL = "https://www.aslaviationschool.co";
const SITE_NAME = "Alpha Step Links Aviation School";
const DEFAULT_IMAGE = "/social-preview.jpg";
const DEFAULT_DESCRIPTION =
  "Alpha Step Links Aviation School offers certified aviation training, IATA-aligned curricula, cabin crew courses, air ticketing, and international internship pathways in Nigeria, UK, and Canada.";

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = "aviation school, cabin crew training, air ticketing, travel agency, aviation courses",
  image = DEFAULT_IMAGE,
  url = BASE_URL,
  type = "website",
  publishedTime,
  author,
  noindex = false,
}: SEOProps) {
  const fullTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} | Premium Aviation Training`;

  const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;
  const fullImage = image.startsWith("http") ? image : `${BASE_URL}${image}`;

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {author && <meta property="article:author" content={author} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />

      {/* Canonical */}
      <link rel="canonical" href={fullUrl} />
    </Helmet>
  );
}

export function HomeSEO() {
  return (
    <SEO
      title={undefined}
      description={`${SITE_NAME} - Certified aviation training institution in Nigeria, UK, and Canada. Enroll in cabin crew, air ticketing, travel & tourism programs. IATA-aligned curricula. 500+ graduates.`}
      keywords="aviation school, aviation training, cabin crew, air ticketing, travel agency, tourism, IATA certified, Nigeria, UK, Canada"
      url="/"
    />
  );
}

export function AboutSEO() {
  return (
    <SEO
      title="About Us"
      description="Learn about Alpha Step Links Aviation School - our mission, vision, and commitment to youth empowerment and international aviation training excellence."
      keywords="about aviation school, our mission, aviation training Nigeria, youth empowerment, aviation professionals"
      url="/about"
    />
  );
}

export function CoursesSEO() {
  return (
    <SEO
      title="Programs & Courses"
      description="Explore our aviation training programs: Air Ticketing, Customer Service, Hospitality & Tourism, Travel Agency Operations, Visa Processing, and Tourism Marketing."
      keywords="aviation courses, air ticketing, customer service, hospitality, tourism, travel agency, visa processing, aviation programs"
      url="/courses"
    />
  );
}

export function EnrollSEO() {
  return (
    <SEO
      title="Enroll Now"
      description="Enroll in Alpha Step Links Aviation School today. Secure your spot in our certified aviation training programs and start your career in aviation."
      keywords="enroll aviation school, aviation training enrollment, join aviation course"
      url="/enroll"
    />
  );
}

export function LoginSEO() {
  return (
    <SEO
      title="Student Login"
      description="Log in to your Alpha Step Links Aviation School student portal to access your courses, resources, and track your progress."
      keywords="student login, aviation school portal, student dashboard"
      url="/login"
      noindex={true}
    />
  );
}

export function ContactSEO() {
  return (
    <SEO
      title="Contact Us"
      description="Get in touch with Alpha Step Links Aviation School. Visit us in Nigeria, UK, or Canada. Call, email, or send a message today."
      keywords="contact aviation school, aviation training contact, visit us"
      url="/contact"
    />
  );
}