import type { Metadata } from "next";
import ComingSoon from "@/components/book/ComingSoon";

export const metadata: Metadata = {
  title: "Coming May 2026 — You Are Not Dead Yet",
  description:
    "Join the launch list for You Are Not Dead Yet: A Body Repair Manual for People Who Refuse to Feel Old.",
};

export default function BookComingSoonPage() {
  return <ComingSoon />;
}
