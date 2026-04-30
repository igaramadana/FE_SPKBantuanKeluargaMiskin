"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { publicFormFields } from "@/constants/help-center";

export function PublicApplicationForm() {
  const [formData, setFormData] = useState<Record<string, string | File | null>>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({
      ...prev,
      file,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate form submission
      console.log("Form submitted:", formData);
      // Add your API call here
      alert("Pengaduan Anda berhasil dikirim");
      setFormData({});
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Terjadi kesalahan saat mengirim pengaduan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-white px-5 py-20 md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-[#1B5E20] md:text-4xl">
            Formulir Pengaduan Publik
          </h2>

          <p className="mt-3 text-base text-[#555555] md:text-lg">
            Sampaikan sanggahan hasil penilaian anda
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* NIK Pelapor */}
            <div>
              <label htmlFor="nik" className="block text-sm font-medium text-black">
                NIK Pelapor <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nik"
                name="nik"
                value={formData.nik || ""}
                onChange={handleInputChange}
                required
                className="mt-2 w-full rounded-lg border border-[#DDD] bg-white px-4 py-3 text-black placeholder-[#999] focus:border-[#1B5E20] focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/10"
              />
            </div>

            {/* Nama Laporan */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-black">
                Nama Laporan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                required
                className="mt-2 w-full rounded-lg border border-[#DDD] bg-white px-4 py-3 text-black placeholder-[#999] focus:border-[#1B5E20] focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/10"
              />
            </div>
          </div>

          {/* Nomor Telepon / WhatsApp */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-black">
              Nomor Telepon / WhatsApp <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone || ""}
              onChange={handleInputChange}
              required
              className="mt-2 w-full rounded-lg border border-[#DDD] bg-white px-4 py-3 text-black placeholder-[#999] focus:border-[#1B5E20] focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/10"
            />
          </div>

          {/* Deskripsi Pengaduan */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-black">
              Deskripsi Pengaduan <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleInputChange}
              required
              rows={5}
              className="mt-2 w-full rounded-lg border border-[#DDD] bg-white px-4 py-3 text-black placeholder-[#999] focus:border-[#1B5E20] focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/10"
            />
          </div>

          {/* File Upload */}
          <div>
            <label htmlFor="file" className="block text-sm font-medium text-black">
              Unggah Bukti Pendukung (SKTM / SK PHK, dll.)
            </label>

            <div className="mt-3 rounded-2xl border-2 border-dashed border-[#1B5E20]/30 bg-[#F5F8F1] p-8">
              <input
                type="file"
                id="file"
                name="file"
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
              />

              <label htmlFor="file" className="cursor-pointer">
                <div className="flex flex-col items-center justify-center gap-3">
                  <Upload className="h-8 w-8 text-[#1B5E20]" />

                  <div className="text-center">
                    <p className="text-sm font-medium text-black">
                      Klik untuk mengunggah atau seret file kesini
                    </p>
                    <p className="text-xs text-[#999]">
                      Format: JPG, PNG, PDF (Maks 5MB)
                    </p>
                  </div>

                  {formData.file && (
                    <p className="text-sm font-medium text-[#1B5E20]">
                      {(formData.file as File).name}
                    </p>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1B5E20] px-8 py-3 font-semibold text-white transition hover:bg-[#144A18] disabled:opacity-50"
            >
              {isSubmitting ? "Mengirim..." : "Kirim"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
