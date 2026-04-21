export function CoreValues() {
  return (
    <section className="bg-white py-32 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-24 gap-8">
          <h2 className="text-5xl sm:text-6xl font-bold tracking-tight text-slate-900">
            Our <span className="text-blue-600">Foundation.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 border-l border-t border-slate-100">
          <div className="p-12 sm:p-20 border-r border-b border-slate-100 space-y-6 group hover:bg-slate-50 transition-colors duration-500">
            <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">
              01
            </span>
            <h3 className="text-3xl font-bold text-slate-900">Excellence.</h3>
            <p className="text-xl text-slate-500 font-light leading-relaxed">
              We strive for the highest standards in every aspect of our
              training, from curriculum design to instructor expertise.
            </p>
          </div>
          <div className="p-12 sm:p-20 border-r border-b border-slate-100 space-y-6 group hover:bg-slate-50 transition-colors duration-500">
            <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">
              02
            </span>
            <h3 className="text-3xl font-bold text-slate-900">Precision.</h3>
            <p className="text-xl text-slate-500 font-light leading-relaxed">
              Accuracy and attention to detail are at the heart of aviation;
              we instill these principles through rigorous programs.
            </p>
          </div>
          <div className="p-12 sm:p-20 border-r border-b border-slate-100 space-y-6 group hover:bg-slate-50 transition-colors duration-500">
            <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">
              03
            </span>
            <h3 className="text-3xl font-bold text-slate-900">
              Global Reach.
            </h3>
            <p className="text-xl text-slate-500 font-light leading-relaxed">
              Connecting students to international opportunities and IATA
              certifications across Nigeria, the UK, and Canada.
            </p>
          </div>
          <div className="p-12 sm:p-20 border-r border-b border-slate-100 space-y-6 group hover:bg-slate-50 transition-colors duration-500">
            <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">
              04
            </span>
            <h3 className="text-3xl font-bold text-slate-900">Community.</h3>
            <p className="text-xl text-slate-500 font-light leading-relaxed">
              Dedicated to youth empowerment and fostering inclusive education
              to build a diverse aviation workforce.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
