import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { getSessionUid } from "@/lib/session";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage(props: PageProps<"/login">) {
  const uid = await getSessionUid();
  const { next } = await props.searchParams;
  const target = next === "/upload" ? next : null;
  if (uid) redirect(target ?? `/p/${uid}`);
  return (
    <div className="space-y-5">
      <h1 className="num text-3xl font-bold">Log in</h1>
      <LoginForm next={target} />
    </div>
  );
}
