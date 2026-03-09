import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Login | Sneaker Flash",
  description: "Sign in to your Sneaker Flash account to browse and shop the latest sneakers.",
};

export default function LoginPage() {
  return <LoginForm />;
}
