"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

type AuditLog = {
  id: string;
  nama_user?: string | null;
  aksi: string;
  tabel: string;
  record_id?: string | null;
  created_at: string;
};

export default function AuditLogPage() {
  const [data, setData] = useState<AuditLog[]>([]);

  async function loadData() {
    const result = await apiGet<AuditLog[]>("/audit-log");
    setData(Array.isArray(result) ? result : []);
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <main className="space-y-6 p-6">
      <section className="rounded-xl border bg-white p-5">
        <h1 className="text-2xl font-bold">Audit Log</h1>
        <p className="text-sm text-gray-500">Riwayat aktivitas penting admin seperti verifikasi, perubahan data, dan override hasil SPK.</p>
      </section>

      <section className="rounded-xl border bg-white p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="p-3">Waktu</th>
                <th className="p-3">User</th>
                <th className="p-3">Aksi</th>
                <th className="p-3">Tabel</th>
                <th className="p-3">Record</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-3">{new Date(item.created_at).toLocaleString("id-ID")}</td>
                  <td className="p-3">{item.nama_user || "Sistem/Admin"}</td>
                  <td className="p-3 font-semibold">{item.aksi}</td>
                  <td className="p-3">{item.tabel}</td>
                  <td className="p-3">{item.record_id || "-"}</td>
                </tr>
              ))}
              {data.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-gray-500">Belum ada audit log.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
