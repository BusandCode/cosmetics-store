"use server";

import { signIn, signOut, auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

export async function loginAction(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    await signIn("credentials", {
      email,
      password,
      redirect: false, // Don't redirect automatically
    });

    // Get the session after successful login
    const session = await auth();
    
    // Check if user is admin
    if (session?.user?.role === "admin") {
      redirect("/admin");
    } else {
      redirect("/");
    }
  } catch (error) {
    return { error: "Invalid email or password" };
  }
}