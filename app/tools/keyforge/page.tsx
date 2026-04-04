import type { Metadata } from "next";
import KeyForgePage from "./KeyForgePage";

export const metadata: Metadata = {
  title: "KeyForge – Password & Passphrase Generator",
  description:
    "Generate strong passwords and passphrases instantly. Client-side only — nothing is stored or sent to any server.",
};

export default function Page() {
  return <KeyForgePage />;
}
