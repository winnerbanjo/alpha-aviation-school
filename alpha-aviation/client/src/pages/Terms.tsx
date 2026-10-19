import { SEO } from "@/components/seo/SEO";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/sections/PageHero";


export function Terms() {
  const lastUpdated = "October 2026";

  return (
    <div className="flex flex-col">
      <SEO title="Terms & Conditions" description="Institutional terms of enrollment, attendance requirements, tuition policies, and academic completion standards for Alpha Step Links Aviation School." url="/terms" />
      <PageHero
        breadcrumbs={[{ label: "Terms & Conditions" }]}
        eyebrow="Institutional terms & policies"
        title="Terms of enrollment"
        accent="and code of conduct."
        description={`Last updated: ${lastUpdated} · Alpha Step Links Aviation School`}
        size="compact"
      />

      {/* Terms Content */}
      <section className="py-16 sm:py-24 bg-white border-b border-[#DCE2EB]">
        <Container size="narrow">
          <div className="space-y-8 text-sm text-[#53647C] leading-relaxed">
            <div>
              <h2 className="text-xl font-bold text-[#10264B] mb-2 uppercase">
                1. Scope of Agreement
              </h2>
              <p>
                These terms govern enrollment and academic participation in professional courses provided by Alpha Step Links Aviation School. By completing an application or enrolling in a course, students agree to adhere to these academic rules.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#10264B] mb-2 uppercase">
                2. Tuition & Payment Policy
              </h2>
              <p>
                Standard tuition fees are established at <strong>₦150,000 per 4-week course</strong>, or <strong>₦538,000 for the 4-course international package</strong>. All fees must be paid through the secure online payment in your student portal or into authorized institutional bank accounts before course access credentials or GDS terminal stations are assigned.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#10264B] mb-2 uppercase">
                3. Attendance & Practical Evaluation
              </h2>
              <p>
                Because aviation operations require rigorous discipline, students must maintain a minimum attendance rate of <strong>85%</strong> across lectures and practical simulation lab sessions. Candidates who fail to meet attendance thresholds must repeat missed terminal modules before sitting for final certification exams.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#10264B] mb-2 uppercase">
                4. Certification Issuance
              </h2>
              <p>
                Official Certificates of Completion from Alpha Step Links Aviation School are awarded solely upon passing both theoretical assessments and practical GDS command evaluations. Certification confirms curriculum completion and does not constitute a state-granted pilot licence or sovereign visa authorization.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#10264B] mb-2 uppercase">
                5. Ethical Representation & Non-Guarantee
              </h2>
              <p>
                Alpha Step Links commits to honest career advisement. The institution does not guarantee employment, salary levels, or embassy visa approvals. Prospective students should review course requirements carefully before committing to a cohort.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
