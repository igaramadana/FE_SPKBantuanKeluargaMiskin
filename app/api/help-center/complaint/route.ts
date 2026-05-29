import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "application/pdf",
]);
const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "pdf"]);

const getFileExtension = (fileName: string) =>
  fileName.split(".").pop()?.toLowerCase() ?? "";

const readRequiredField = (formData: FormData, field: string) => {
  const value = formData.get(field);
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

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

const verifyRecaptcha = async (
  token: string,
  remoteIp: string | null,
  secret: string
) => {
  const params = new URLSearchParams({
    secret,
    response: token,
  });

  if (remoteIp) {
    params.append("remoteip", remoteIp);
  }

  const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  return response.json() as Promise<{
    success: boolean;
    "error-codes"?: string[];
  }>;
};

export async function POST(request: Request) {
  const formData = await request.formData();
  const nik = readRequiredField(formData, "nik");
  const name = readRequiredField(formData, "name");
  const phone = readRequiredField(formData, "phone");
  const description = readRequiredField(formData, "description");
  const recaptchaToken = readRequiredField(formData, "recaptchaToken");

  if (!nik || !name || !phone || !description) {
    return NextResponse.json(
      { message: "Mohon lengkapi semua field yang wajib diisi." },
      { status: 400 }
    );
  }

  if (!recaptchaToken) {
    return NextResponse.json(
      { message: "Silakan verifikasi reCAPTCHA terlebih dahulu." },
      { status: 400 }
    );
  }

  const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;

  if (!recaptchaSecret) {
    console.error("❌ reCAPTCHA secret key missing");
    return NextResponse.json(
      { message: "Konfigurasi reCAPTCHA belum lengkap. Periksa .env" },
      { status: 500 }
    );
  }

  const remoteIp = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();

  try {
    const recaptchaResult = await verifyRecaptcha(
      recaptchaToken,
      remoteIp ?? null,
      recaptchaSecret
    );

    if (!recaptchaResult.success) {
      console.error("❌ reCAPTCHA verification failed", {
        errorCodes: recaptchaResult["error-codes"],
      });
      return NextResponse.json(
        { message: "Verifikasi reCAPTCHA gagal. Silakan coba lagi." },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("❌ reCAPTCHA verification error:", error);
    return NextResponse.json(
      { message: "Gagal memverifikasi reCAPTCHA." },
      { status: 500 }
    );
  }

  const file = formData.get("file");
  const upload = file instanceof File ? file : null;
  const fileError = validateFile(upload);

  if (fileError) {
    return NextResponse.json({ message: fileError }, { status: 400 });
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
    console.error("❌ SMTP Config Missing:", {
      smtpHost: !!smtpHost,
      smtpPort: !!smtpPort,
      smtpUser: !!smtpUser,
      smtpPass: !!smtpPass,
    });
    return NextResponse.json(
      { message: "Konfigurasi email belum lengkap. Periksa variabel SMTP di .env" },
      { status: 500 }
    );
  }

  try {
    const portNumber = Number(smtpPort);
    
    console.log("📧 Konfigurasi SMTP:", {
      host: smtpHost,
      port: portNumber,
      user: smtpUser,
      secure: portNumber === 465,
    });

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: portNumber,
      secure: portNumber === 465, // true untuk port 465, false untuk port 587
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const attachments = upload
      ? [
          {
            filename: upload.name,
            content: Buffer.from(await upload.arrayBuffer()),
            contentType: upload.type || undefined,
          },
        ]
      : [];

    const textBody = [
      "Pengaduan Publik Baru",
      "",
      `NIK Pelapor: ${nik}`,
      `Nama Laporan: ${name}`,
      `Nomor Telepon/WhatsApp: ${phone}`,
      "",
      "Deskripsi Pengaduan:",
      description,
    ].join("\n");

    const htmlBody = `
      <h2>Pengaduan Publik Baru</h2>
      <p><strong>NIK Pelapor:</strong> ${nik}</p>
      <p><strong>Nama Laporan:</strong> ${name}</p>
      <p><strong>Nomor Telepon/WhatsApp:</strong> ${phone}</p>
      <p><strong>Deskripsi Pengaduan:</strong></p>
      <p>${description.replace(/\n/g, "<br />")}</p>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || smtpUser,
      to: "lifegoodtv94@gmail.com",
      subject: `Pengaduan Publik - ${name}`,
      text: textBody,
      html: htmlBody,
      attachments,
    });

    console.log("✅ Email berhasil dikirim ke lifegoodtv94@gmail.com");
    return NextResponse.json({
      ok: true,
      message: "✅ Pengaduan Anda berhasil dikirim i!",
    });
  } catch (error) {
    console.error("❌ Error saat mengirim email:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? `Gagal mengirim email: ${error.message}`
            : "Gagal mengirim email. Silakan coba lagi.",
      },
      { status: 500 }
    );
  }
}
