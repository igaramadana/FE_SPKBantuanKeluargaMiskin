type StatCardProps = {
  title: string;
  value: string;
  description?: string;
};

export function StatCard({ title, value, description }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>

      <h3 className="mt-3 text-3xl font-bold text-slate-950">{value}</h3>

      {description && (
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      )}
    </div>
  );
}