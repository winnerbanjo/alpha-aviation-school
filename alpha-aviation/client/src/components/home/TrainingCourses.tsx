import { Ticket, Headphones, Building2, Globe, FileText, TrendingUp } from "lucide-react";

const professionalCourses = [
  {
    id: "air-ticketing",
    title: "Air Ticketing & Reservation Management",
    icon: Ticket,
  },
  {
    id: "customer-service",
    title: "Customer Service & Communication in Aviation",
    icon: Headphones,
  },
  {
    id: "hospitality",
    title: "Hospitality & Tourism Management",
    icon: Building2,
  },
  {
    id: "travel-agency",
    title: "Travel Agency Operations",
    icon: Globe,
  },
  {
    id: "visa-processing",
    title: "Visa Processing & Documentation",
    icon: FileText,
  },
  {
    id: "tourism-marketing",
    title: "Tourism Marketing & Entrepreneurship",
    icon: TrendingUp,
  },
];

export function TrainingCourses() {
  return (
    <section
      id="courses"
      className="bg-white py-32 border-t border-slate-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-24 gap-8">
          <div className="space-y-4">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-[0.4em]">
              Our specializations
            </span>
            <h2 className="text-5xl sm:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1]">
              Advanced <br /> Training.
            </h2>
          </div>
          <p className="text-xl text-slate-500 max-w-md font-light leading-relaxed">
            Tailored curriculum designed for the modern aviation professional,
            delivered with global certification integrity.
          </p>
        </div>

        <div className="border-t border-slate-900/10">
          {professionalCourses?.map((course, index) => {
            return (
              <div
                key={course.id}
                className="group block border-b border-slate-900/10 py-12 transition-all duration-500 hover:bg-slate-50 relative overflow-hidden px-4 sm:px-8"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                  <div className="flex items-center gap-10">
                    <span className="text-sm font-bold text-slate-300 group-hover:text-blue-600 transition-colors">
                      0{index + 1}
                    </span>
                    <h3 className="text-3xl sm:text-5xl font-bold text-slate-900 group-hover:translate-x-4 transition-transform duration-500">
                      {course.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-6"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
