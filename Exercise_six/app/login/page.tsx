"use client";
import { getUserInfo } from "@/server/user";
import { redirect } from "next/navigation";
import Login from "./Login";

export default async function logInPage() {
  const user = await getUserInfo();
  if(user) {
     redirect("/dashboard")
  }
  return <Login />
}