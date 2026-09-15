"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export type SignInFormState = { status: "idle" | "error"; message?: string };

export async function signInAction(_prev: SignInFormState, formData: FormData): Promise<SignInFormState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
    return { status: "idle" };
  } catch (error) {
    if (error instanceof AuthError) return { status: "error", message: "E-posta veya şifre hatalı." };
    throw error;
  }
}
