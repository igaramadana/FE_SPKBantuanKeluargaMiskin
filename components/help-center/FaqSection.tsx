"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { faqItems } from "@/constants/help-center";

type FaqItemProps = {
  id: number;
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: (id: number) => void;
};

function FaqItem({ id, question, answer, isOpen, onToggle }: FaqItemProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#1B5E20]/20 bg-white shadow-sm transition hover:shadow-md">
      <button
        onClick={() => onToggle(id)}
        className="flex w-full items-center justify-between gap-4 p-6 text-left transition hover:bg-[#F5F8F1]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C7EABB]">
            <HelpCircle className="h-5 w-5 text-[#1B5E20]" />
          </div>

          <h3 className="text-base font-semibold text-black md:text-lg">
            {question}
          </h3>
        </div>

        <ChevronDown
          className={`h-6 w-6 flex-shrink-0 text-[#1B5E20] transition duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="border-t border-[#1B5E20]/10 px-6 py-4">
          <p className="text-base leading-7 text-[#555555]">{answer}</p>
        </div>
      )}
    </div>
  );
}

export function FaqSection() {
  const [openItems, setOpenItems] = useState<number[]>([1]);

  const handleToggle = (id: number) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <section className="bg-[#F5F8F1] px-5 py-20 md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-[#1B5E20] md:text-4xl">
            Tanya Jawab (FAQ)
          </h2>

          <p className="mt-3 text-base text-[#555555] md:text-lg">
            Temukan jawaban atas pertanyaan yang sering diajukan
          </p>
        </div>

        <div className="space-y-4">
          {faqItems.map((item) => (
            <FaqItem
              key={item.id}
              {...item}
              isOpen={openItems.includes(item.id)}
              onToggle={handleToggle}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
