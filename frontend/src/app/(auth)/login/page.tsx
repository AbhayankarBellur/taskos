import { LoginForm } from "@/components/auth/login-form";

type Props = { searchParams: Promise<{ expired?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { expired } = await searchParams;
  return <LoginForm expired={expired === "1"} />;
}
