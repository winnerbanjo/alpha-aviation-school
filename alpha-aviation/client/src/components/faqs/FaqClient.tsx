import React, { useState, useMemo } from "react";
import type { FAQItem } from "@/lib/faqs-data";
import { Accordion } from "@/components/ui/Accordion";
import { cn } from "@/lib/utils";

interface FaqClientProps {
  faqs: FAQItem[];
}

export function FaqClient({ faqs }: FaqClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = useMemo(() => {
    return ["All", ...new Set(faqs.map((f) => f.category))];
  }, [faqs]);

  const filteredFaqs = useMemo(() => {
    return faqs.filter((item) => {
      const matchesCat =
        selectedCategory === "All" || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [faqs, selectedCategory, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Search and Category Filter Toolbar */}
      <div className="p-6 rounded-stage border border-[#DCE2EB] bg-white shadow-subtle space-y-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions by keyword (e.g. tuition, IATA, GDS, online, requirements)..."
            className="w-full px-4 py-3 pl-10 rounded-xl border border-[#DCE2EB] text-sm text-[#10264B] placeholder-[#53647C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1246C8]"
          />
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#53647C]">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-[#53647C] hover:text-[#1246C8]"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-[#DCE2EB]">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors select-none",
                selectedCategory === cat
                  ? "bg-[#1246C8] text-white"
                  : "bg-[#F5F7FB] text-[#10264B] hover:bg-[#DCE8FF]/50"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Counter */}
      <div className="flex items-center justify-between text-xs text-[#53647C] px-1">
        <span>
          SHOWING {filteredFaqs.length} OF {faqs.length} VERIFIED QUESTIONS
        </span>
        {(searchQuery || selectedCategory !== "All") && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
            }}
            className="text-[#1246C8] hover:underline font-semibold"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* FAQ Accordion List */}
      {filteredFaqs.length > 0 ? (
        <Accordion items={filteredFaqs} allowMultiple={false} />
      ) : (
        <div className="py-12 text-center rounded-stage border border-dashed border-[#DCE2EB] bg-[#F5F7FB] p-6">
          <p className="text-base font-bold text-[#10264B]">
            No matching questions found
          </p>
          <p className="text-xs text-[#53647C] mt-1 mb-4">
            Try adjusting your search terms or contact our admissions desk directly.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
            }}
            className="px-4 py-2 bg-[#1246C8] text-white rounded-xl text-xs font-semibold uppercase tracking-[0.14em]"
          >
            Reset Search
          </button>
        </div>
      )}
    </div>
  );
}
