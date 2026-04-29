import { cn } from "@/lib/cn";

type StatCardProps = {
    label: string;
    value: string;
    variant?: "default" | "green";
};

export function StatCard({ label, value, variant = "default"}: StatCardProps) {
    return (
        <div className={cn(
            "rounded-2xl p-4",
            variant === "green" ? "bg-[#C7EABB]" : "bg-[#F5F7F6]"
        )}>
            <p className="text-xs text-[#555555]">{label}</p>
            <p className="mt-2 text-2xl font-bold text-[#1B5E20">{value}</p>
        </div>
    );
}