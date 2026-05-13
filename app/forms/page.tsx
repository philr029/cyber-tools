import type { Metadata } from "next";
import FormsCentreClient from "./FormsCentreClient";

export const metadata: Metadata = {
  title: "Forms centre – SecureScope",
  description: "Contact, access requests, IT/marketing intakes, and feedback — stored locally with optional server webhook.",
};

export default function FormsPage() {
  return <FormsCentreClient />;
}
