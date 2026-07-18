import { motion } from "framer-motion";
import { MapPin, Phone, Mail } from "lucide-react";
import { ContactSEO } from "@/components/seo/SEO";

const contactCards = [
  {
    title: "Address",
    items: [
      {
        label: "United Kingdom Headquarters",
        value:
          "2nd Floor, College Road, 17 King Edwards Road, Ruislip HA4 7AE, United Kingdom",
        href: "https://maps.google.com/?q=2nd%20Floor%2C%20College%20Road%2C%2017%20King%20Edwards%20Road%2C%20Ruislip%20HA4%207AE%2C%20United%20Kingdom",
        external: true,
      },
      {
        label: "Nigerian Office",
        value: "7 Chief Tajudeen Odubiyi St, Ilasamaja, Lagos 102214",
        href: "https://maps.google.com/?q=7%20Chief%20Tajudeen%20Odubiyi%20St%2C%20Ilasamaja%2C%20Lagos%20102214",
        external: true,
      },
    ],
    icon: MapPin,
  },
  {
    title: "Phone",
    items: [
      {
        label: "UK Phone Number",
        value: "+44 7827 870141",
        href: "tel:+447827870141",
      },
      {
        label: "Nigerian Phone Number",
        value: "+234 814 025 7174",
        href: "tel:+2348140257174",
      },
    ],
    icon: Phone,
  },
  {
    title: "Email",
    items: [
      {
        value: "info@aslaviationschool.co",
        href: "mailto:info@aslaviationschool.co",
      },
    ],
    icon: Mail,
  },
];

export function Contact() {
  return (
    <>
      <ContactSEO />

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center px-4 sm:px-6 bg-gradient-to-b from-[#e3f2fd] via-[#f0f8ff] to-white pt-32 pb-20">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs font-bold text-blue-600 uppercase tracking-[0.4em] mb-6 block">
              Contact Us
            </span>
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1]">
              Let's Start Your <br />
              <span className="text-[#FF6B35]">Aviation Journey.</span>
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              Have questions about our programs? Our team is here to help you
              every step of the way.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.12 * index, duration: 0.45 }}
                >
                  <div className="h-full min-h-64 bg-white border border-slate-200 rounded-2xl p-8 shadow-[0px_8px_30px_rgba(15,23,42,0.06)] hover:border-[#0061FF]/40 hover:shadow-[0px_14px_40px_rgba(15,23,42,0.1)] transition-all flex flex-col">
                    <div className="w-12 h-12 rounded-2xl bg-[#0061FF]/10 text-[#0061FF] flex items-center justify-center mb-6">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-3">
                      {card.title}
                    </h2>
                    <div className="flex flex-col justify-between gap-4 h-full">
                      {card.items.map((item) => (
                        <a
                          key={`${card.title}-${item.value}`}
                          href={item.href}
                          target={item.external ? "_blank" : undefined}
                          rel={
                            item.external ? "noopener noreferrer" : undefined
                          }
                          className="block group"
                        >
                          {item.label && (
                            <span className="block text-sm font-semibold text-slate-900 mb-1">
                              {item.label}
                            </span>
                          )}
                          <span className="block text-slate-500 leading-relaxed break-words group-hover:text-[#0061FF] transition-colors">
                            {item.value}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
