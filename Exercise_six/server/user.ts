"use server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function signUp(name: string, email: string, password: string) {
  const user = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
    },
  });
  return user;
}

export async function signIn(email: string, password: string) {
  const user = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
  });
  return user;
}

export async function logOut() {
  await auth.api.signOut({
    headers: await headers(),
  });
  redirect("/login");
}

export async function logInWithGoogle() {
  const user = await auth.api.signInSocial({
    body: {
      provider: "google",
      callbackURL: "/chat",
    },
  });
  if (user.url) {
    redirect(user.url);
  }
}

export async function getUserInfo() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}
