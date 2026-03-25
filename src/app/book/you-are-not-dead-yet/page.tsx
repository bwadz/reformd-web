import type { Metadata } from "next";
import BookPage from "@/components/book/BookPage";

export const metadata: Metadata = {
  title: "You Are Not Dead Yet — Brant Wadsworth",
  description:
    "A Body Repair Manual for People Who Refuse to Feel Old. The Human Operating System — Amazon May 2026.",
};

export default function BookLandingPage() {
  return <BookPage />;
}
