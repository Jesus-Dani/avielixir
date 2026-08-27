"use server";

import { redirect } from "next/navigation";
import { checkAdminPassword, createAdminSession, clearAdminSession } from "@/lib/admin-auth";

export async function adminLogin(formData: FormData) {
  const password = String(formData.get("password") ?? "");

  if (!checkAdminPassword(password)) {
    redirect("/admin/login?error=1");
  }

  await createAdminSession();
  redirect("/admin");
}

export async function adminLogout() {
  await clearAdminSession();
  redirect("/admin/login");
}
