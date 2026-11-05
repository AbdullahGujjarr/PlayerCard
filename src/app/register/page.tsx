import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/RegisterForm";
import { getSessionUid } from "@/lib/session";

export const metadata: Metadata = { title: "Create your card" };

export default async function RegisterPage() {
  const uid = await getSessionUid();
  if (uid) redirect(`/p/${uid}`);
  return (
    <div className="space-y-5">
      <h1 className="num text-3xl font-bold">Create your card</h1>
      <RegisterForm />
    </div>
  );
}
