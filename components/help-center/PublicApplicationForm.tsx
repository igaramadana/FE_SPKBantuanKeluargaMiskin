"use client";

import { useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";

declare global {
  interface Window {
    grecaptcha?: {
      render: (
        container: HTMLElement,
        params: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        }
      ) => number;
      reset: (widgetId?: number) => void;
    };
    onRecaptchaLoad?: () => void;
  }
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "application/pdf",
]);
const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "pdf"]);

const getFileExtension = (fileName: string) =>
  fileName.split(".").pop()?.toLowerCase() ?? "";

const validateFile = (file: File | null) => {
  if (!file) {
    return null;
  }

  const extension = getFileExtension(file.name);
  const isAllowedType =
    ALLOWED_MIME_TYPES.has(file.type) || ALLOWED_EXTENSIONS.has(extension);

  if (!isAllowedType) {
    return "Format file tidak sesuai. Gunakan JPG, PNG, atau PDF.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "Ukuran file melebihi 5 MB. Silakan unggah file yang lebih kecil.";
  }

  return null;
};

export function PublicApplicationForm() {
  const [formData, setFormData] = useState<Record<string, string | File | null>>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [recaptchaError, setRecaptchaError] = useState<string | null>(null);
  const recaptchaRef = useRef<HTMLDivElement | null>(null);
  const recaptchaWidgetIdRef = useRef<number | null>(null);
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!recaptchaSiteKey) {
      return;
    }

    recaptchaWidgetIdRef.current = null;
    setRecaptchaToken(null);
    setRecaptchaError(null);

    const renderRecaptcha = () => {
      if (!window.grecaptcha || !recaptchaRef.current) {
        return;
      }

      if (recaptchaWidgetIdRef.current !== null) {
        window.grecaptcha.reset(recaptchaWidgetIdRef.current);
        return;
      }

      recaptchaWidgetIdRef.current = window.grecaptcha.render(
        recaptchaRef.current,
        {
          sitekey: recaptchaSiteKey,
          callback: (token: string) => {
            setRecaptchaToken(token);
            setRecaptchaError(null);
          },
          "expired-callback": () => {
            setRecaptchaToken(null);
          },
          "error-callback": () => {
            setRecaptchaToken(null);
          },
        }
      );
    };

    if (window.grecaptcha) {
      renderRecaptcha();
      return;
    }

    window.onRecaptchaLoad = renderRecaptcha;

    if (!document.getElementById("recaptcha-script")) {
      const script = document.createElement("script");
      script.id = "recaptcha-script";
      script.src =
        "https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, [formKey, recaptchaSiteKey]);

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
    const errorMessage = validateFile(file);

    setFileError(errorMessage);

    if (errorMessage) {
      e.target.value = "";
      setFormData((prev) => ({
        ...prev,
        file: null,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      file,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fileToSend = formData.file instanceof File ? formData.file : null;
    const fileValidationError = validateFile(fileToSend);

    if (fileValidationError) {
      setFileError(fileValidationError);
      return;
    }

    if (!recaptchaSiteKey) {
      setRecaptchaError("reCAPTCHA belum dikonfigurasi.");
      return;
    }

    if (!recaptchaToken) {
      setRecaptchaError("Silakan verifikasi bahwa Anda bukan robot.");
      return;
    }

    setIsSubmitting(true);
    setFileError(null);
    setErrorMessage(null);
    setSuccessMessage(null);
    setRecaptchaError(null);

    try {
      const payload = new FormData();
      payload.append("nik", String(formData.nik ?? ""));
      payload.append("name", String(formData.name ?? ""));
      payload.append("phone", String(formData.phone ?? ""));
      payload.append("description", String(formData.description ?? ""));
      payload.append("recaptchaToken", recaptchaToken);

      if (fileToSend) {
        payload.append("file", fileToSend);
      }

      const response = await fetch("/api/help-center/complaint", {
        method: "POST",
        body: payload,
      });

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          responseData?.message || "Terjadi kesalahan saat mengirim pengaduan"
        );
      }

      const successMsg =
        responseData?.message || "Pengaduan Anda berhasil dikirim";
      setSuccessMessage(successMsg);
      setFormData({});
      setFormKey((prev) => prev + 1);
      setRecaptchaToken(null);

      if (recaptchaWidgetIdRef.current !== null) {
        window.grecaptcha?.reset(recaptchaWidgetIdRef.current);
      }

      // Hapus success message setelah 5 detik
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error("Error submitting form:", error);
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengirim pengaduan";
      setErrorMessage(errorMsg);
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

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-medium text-green-800">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">{errorMessage}</p>
          </div>
        )}

        <form key={formKey} onSubmit={handleSubmit} className="space-y-6">
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
                value={typeof formData.nik === "string" ? formData.nik : ""}
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
                value={typeof formData.name === "string" ? formData.name : ""}
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
              value={typeof formData.phone === "string" ? formData.phone : ""}
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
              value={typeof formData.description === "string" ? formData.description : ""}
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

                  {formData.file instanceof File && (
                    <p className="text-sm font-medium text-[#1B5E20]">
                      {formData.file.name}
                    </p>
                  )}
                </div>
              </label>
            </div>

            {fileError && (
              <p className="mt-3 text-sm font-medium text-red-600">
                {fileError}
              </p>
            )}
          </div>

            {/* reCAPTCHA */}
            <div className="space-y-3">
              <div className="flex justify-center">
                <div ref={recaptchaRef} />
              </div>
              {!recaptchaSiteKey && (
                <p className="text-center text-sm font-medium text-red-600">
                  reCAPTCHA belum dikonfigurasi.
                </p>
              )}
              {recaptchaError && (
                <p className="text-center text-sm font-medium text-red-600">
                  {recaptchaError}
                </p>
              )}
            </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <button
              type="submit"
              disabled={isSubmitting || !recaptchaToken || !recaptchaSiteKey}
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
