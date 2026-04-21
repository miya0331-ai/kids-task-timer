"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getFamily } from "@/lib/family";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const f = getFamily();
    router.replace(f ? "/kids" : "/login");
  }, [router]);
  return (
    <div className="flex-1 flex items-center justify-center text-orange-400">
      よみこみ中…
    </div>
  );
}
