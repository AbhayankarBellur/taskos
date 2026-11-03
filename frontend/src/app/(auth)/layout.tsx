import { GuestLayout } from "@/components/auth/guest-layout";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <GuestLayout>{children}</GuestLayout>;
}
