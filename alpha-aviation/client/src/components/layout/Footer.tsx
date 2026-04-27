import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Footer() {
  const Links = [
    {
      label: "Our Programs",
      to: "/courses",
    },
    {
      label: "About Us",
      to: "/about",
    },
    {
      label: "Campus Life",
      to: "/courses",
    },
    {
      label: "Enroll Now",
      to: "/enroll",
    },
    {
      label: "Student Login",
      to: "/login",
    },
    {
      label: "",
      to: "",
    },
    {
      label: "info@alphasteplinksaviationschool.com",
      to: "mailto:info@alphasteplinksaviationschool.com",
    },
    {
      label: "0814 025 7174",
      to: "tel:+2348140257174",
    },
  ];

  const Social = [
    {
      icon: "iconoir:instagram",
      to: "https://instagram.com",
    },
    {
      icon: "ic:twotone-whatsapp",
      to: "https://wa.me/2348140257174",
    },
    {
      icon: "ic:round-facebook",
      to: "https://facebook.com",
    },
    {
      icon: "proicons:x-twitter",
      to: "https://twitter.com",
    },
    {
      icon: "ic:baseline-tiktok",
      to: "https://tiktok.com",
    },
  ];

  return (
    <div className="bg-black p-0 m-0 border-t border-white/5 relative overflow-hidden group/footer">
      {/* 
          CONTINUOUS 3D FLIGHT BACKGROUND 
          Spans the entire footer background
      */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Deep Perspective Plane 1 */}
        <motion.div
          animate={{
            x: ["-20%", "120%"],
            y: [20, -40, 20],
            rotateZ: [5, 10, 5],
            scale: [0.8, 1.2, 0.8],
            opacity: [0, 0.15, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[10%] left-0 text-white select-none"
        >
          {/* Using a more '3D-perspective' looking icon */}
          <Icon
            icon="game-icons:commercial-airplane"
            width="280"
            height="280"
            className="blur-[1px]"
          />
        </motion.div>

        {/* Deep Perspective Plane 2 (Opposite direction) */}
        <motion.div
          animate={{
            x: ["120%", "-20%"],
            y: [-20, 30, -20],
            rotateZ: [-5, -10, -5],
            scale: [0.6, 0.9, 0.6],
            opacity: [0, 0.1, 0],
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5,
          }}
          className="absolute bottom-[20%] right-0 text-white select-none"
        >
          <Icon
            icon="fluent-mdl2:airplane"
            width="200"
            height="200"
            className="blur-[2px]"
          />
        </motion.div>

        {/* Dynamic Glows */}
        <div className="absolute top-0 right-0 w-2/3 h-full bg-blue-600/[0.03] blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 left-0 w-1/2 h-full bg-[#FF6B35]/[0.03] blur-[150px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto text-white pt-16 sm:pt-24 pb-12 px-6 sm:px-8 relative z-10 flex flex-col">
        {/* MAIN HEADLINE */}
        <div className="relative flex flex-col md:block">
          <h1 className="text-3xl sm:text-7xl md:text-8xl lg:text-9xl uppercase font-black leading-[1] sm:leading-[0.85] tracking-tighter mix-blend-overlay opacity-90 lg:italic mb-12 md:mb-0">
            Alpha Step Links <br />
            Aviation School
          </h1>

          {/* OVERLAPPING ENROLL BUTTON (ABIBUS STYLE) */}
          <div className="md:absolute md:right-0 md:pr-12">
            <Link
              to="/enroll"
              className="relative w-fit py-4  flex items-center  justify-start text-lg shrink-0 px-1 bg-[#FF6B35] text-white rounded-full font-bold overflow-hidden shadow-[0_20px_50px_-10px_rgba(255,107,53,0.4)] transition-all duration-500 hover:scale-105 active:scale-95 group"
            >
              <span className="absolute left-0 aspect-square h-full p-2 bg-transparent flex items-center justify-center transition-transform duration-500 group-hover:translate-x-12">
                <span className="bg-white h-12 lg:h-10 lg:w-10 shrink-0 w-12 flex items-center justify-center rounded-full shadow-inner">
                  <Icon
                    icon="ion:paper-plane"
                    width="1.3em"
                    height="1.3em"
                    style={{ color: "black" }}
                  />
                </span>
              </span>
              <span className="ml-16 lg:ml-14 transition-all duration-500 group-hover:text-transparent pr-8">
                ENROLL
              </span>
              <span className="absolute inset-0 bg-white flex items-center justify-center transform translate-x-full group-hover:translate-x-0 transition-transform duration-500 text-black font-black uppercase tracking-widest">
                JOIN US
              </span>
            </Link>
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 mt-20 sm:mt-32 border-t border-white/5 pt-16">
          <div className="col-span-2 md:col-span-1">
            <h5 className="font-bold text-white uppercase text-xs tracking-[0.2em] mb-6">
              Discovery
            </h5>
            <p className="text-sm text-gray-500 pr-6 leading-relaxed font-medium">
              A haven of aviation excellence where every flight path is an
              experience beyond the ordinary.
            </p>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase text-xs tracking-[0.2em] mb-6">
              Navigate
            </h5>
            <div className="flex flex-col space-y-3">
              {Links.slice(0, 3).map((link, index) => (
                <Link
                  key={index}
                  className="text-gray-500 hover:text-white text-sm font-medium transition-all duration-300 hover:translate-x-1"
                  to={link.to}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase text-xs tracking-[0.2em] mb-6">
              Admissions
            </h5>
            <div className="flex flex-col space-y-3">
              {Links.slice(3, 6).map((link, index) => (
                <Link
                  key={index}
                  className="text-gray-500 hover:text-white text-sm font-medium transition-all duration-300 hover:translate-x-1"
                  to={link.to}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase text-xs tracking-[0.2em] mb-6">
              Campus
            </h5>
            <div className="text-sm text-gray-500 space-y-1 font-medium leading-relaxed">
              <p>7 Chief Tajudeen Odubiyi St,</p>
              <p>Ilasamaja, Lagos,</p>
              <p>Nigeria.</p>
            </div>
          </div>

          <div className="col-span-2 lg:col-span-1">
            <h5 className="font-bold text-white uppercase text-xs tracking-[0.2em] mb-6">
              Get in Touch
            </h5>
            <div className="flex flex-col space-y-3">
              {Links.slice(6, 8).map((link, index) => (
                <a
                  key={index}
                  className="text-gray-500 hover:text-white text-sm font-medium transition-all duration-300 break-all"
                  href={link.to}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* COPYRIGHT & SOCIALS */}
        <div className="flex flex-col sm:flex-row justify-between mt-24 items-center gap-8 pt-8 border-t border-white/5">
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-600">
            © Alpha Step Links Aviation 2026 . All Rights Reserved
          </p>
          <div className="flex gap-6 items-center">
            {Social.map((soc, index) => (
              <a
                key={index}
                href={soc.to}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-white transition-all transform hover:-translate-y-2 active:scale-90"
              >
                <Icon icon={soc.icon} width="1.4em" height="1.4em" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM ACCENT BAR */}
      <div className="h-1 bg-gradient-to-r from-transparent via-[#FF6B35] to-transparent opacity-20 w-full" />
    </div>
  );
}
