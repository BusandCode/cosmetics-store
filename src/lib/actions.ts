"use server";

import { signIn, signOut, auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  let signInError = false;
  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch {
    signInError = true;
  }

  if (signInError) {
    return { error: "Invalid email or password" };
  }

  const session = await auth();
  if (session?.user?.role === "ADMIN") {
    redirect("/admin");
  } else {
    redirect("/");
  }
}