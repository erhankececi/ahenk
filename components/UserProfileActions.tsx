"use client";

import { useRouter } from "next/navigation";
import SafetyMenu from "@/components/SafetyMenu";

export default function UserProfileActions({ targetId, meId }: { targetId: string; meId: string }) {
  const router = useRouter();
  return <SafetyMenu meId={meId} targetId={targetId} onBlocked={() => router.push("/kesfet")} />;
}
