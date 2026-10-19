import { SEO } from "@/components/seo/SEO";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/sections/PageHero";
import { siteConfig } from "@/lib/site-config";


export function PrivacyPolicy() {
  const lastUpdated = "October 2026";

  return (
    <div className="flex flex-col">
      <SEO title="Privacy Policy & Data Notice" description="Privacy and data protection notice for Alpha Step Links Aviation School, adhering to UK GDPR and NDPR standards." url="/privacy-policy" />
      <PageHero
        breadcrumbs={[{ label: "Privacy Policy" }]}
        eyebrow="Legal notice & data protection"
        title="Privacy and data"
        accent="handling notice."
        description={`Last updated: ${lastUpdated} · Alpha Step Links Group data policy`}
        size="compact"
      />

      {/* Policy Content */}
      <section className="py-16 sm:py-24 bg-white border-b border-[#DCE2EB]">
        <Container size="narrow">
          <div className="prose prose-slate max-w-none space-y-8 text-sm text-[#53647C] leading-relaxed">
            <div>
              <h2 className="text-xl font-bold text-[#10264B] mb-2 uppercase">
                1. Data Controller Identification
              </h2>
              <p>
                This privacy notice applies to personal information collected and processed by <strong>Alpha Step Links</strong> and its operating division <strong>Alpha Step Links Aviation School</strong>.
              </p>
              <p className="mt-2">
                Our registered administrative offices are located at:
                <br />
                • <strong>United Kingdom:</strong> 2nd Floor, College Road, 17 King Edwards Road, Ruislip HA4 7AE, United Kingdom.
                <br />
                • <strong>Nigeria:</strong> 7 Chief Tajudeen Odubiyi Street, Ilasamaja, Lagos 102214, Nigeria.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#10264B] mb-2 uppercase">
                2. How This Website Handles Your Information
              </h2>
              <p>
                When you enroll online, sign in to the student or agent portal, or send a message through our contact form, the details you provide are transmitted securely to our admissions systems. Student and agent accounts are stored in our records so that we can manage your enrollment, tuition and course progress. Passwords are stored in a hashed form and are never visible to our staff.
              </p>
              <p className="mt-2">
                Messages sent through the contact form are delivered to our admissions team by email. You can also write to us directly at <code>{siteConfig.primaryEmail}</code>.
              </p>
              <p className="mt-2">
                Online tuition payments are processed by our payment provider; we do not store your full card details. This website also uses analytics tools (Google Analytics and the Meta Pixel) to understand how visitors use the site.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#10264B] mb-2 uppercase">
                3. Information We Collect
              </h2>
              <p>
                We collect only the information needed to admit, teach and support you:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Full legal name, email address, and telephone/WhatsApp number.</li>
                <li>Your selected programs, enrollment status and tuition balance.</li>
                <li>Documents you upload to your student portal, such as prior academic certificates (SSCE/WAEC or equivalent) and payment receipts.</li>
                <li>Payment confirmations from our payment provider or your bank.</li>
                <li>For recruitment agents: agency name and the students you register on their behalf.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#10264B] mb-2 uppercase">
                4. Purpose of Processing
              </h2>
              <p>
                We process your information solely for legitimate educational administration:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Reviewing admission eligibility for 4-week certificate programs.</li>
                <li>Scheduling GDS computer terminal access and mock passenger handling labs.</li>
                <li>Issuing official certificates of completion and academic transcripts.</li>
                <li>Complying with applicable civil aviation training records retention laws.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#10264B] mb-2 uppercase">
                5. Your Legal Rights (NDPR & UK GDPR)
              </h2>
              <p>
                Under the Nigeria Data Protection Act (NDPR) and the UK General Data Protection Regulation (UK GDPR), you possess the right to:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Request access to personal records held by our academic registry.</li>
                <li>Request correction of inaccurate information on your student record.</li>
                <li>Request erasure of your prospective enquiry data where retention is no longer required.</li>
                <li>Lodge an inquiry or concern regarding data processing directly with our privacy officer.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#10264B] mb-2 uppercase">
                6. Contact Our Data Desk
              </h2>
              <p>
                For any inquiries regarding this policy or the handling of your academic records, please write to:
                <br />
                <strong>Email:</strong> {siteConfig.primaryEmail}
                <br />
                <strong>UK Desk:</strong> {siteConfig.offices.uk.phone}
                <br />
                <strong>Nigeria Desk:</strong> {siteConfig.offices.nigeria.phone}
              </p>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
