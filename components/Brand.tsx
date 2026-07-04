import { Waves } from "lucide-react";

// The Mill Stream brand mark: a waves glyph on the stream gradient.
export function BrandMark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const box = size === "lg" ? "h-12 w-12 rounded-2xl" : size === "md" ? "h-9 w-9 rounded-xl" : "h-8 w-8 rounded-lg";
  const icon = size === "lg" ? 24 : size === "md" ? 18 : 16;
  return (
    <div className={`flex items-center justify-center ${box} bg-stream text-white shadow-sm`}>
      <Waves size={icon} strokeWidth={2.2} />
    </div>
  );
}
