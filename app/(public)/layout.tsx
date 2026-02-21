"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import AuthLoadingSpinner from "@/components/AuthLoadingSpinner";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Only redirect after loading is complete
    if (!loading && user) {
      router.push("/heists");
    }
  }, [user, loading, router]);

  // Show loading state while checking auth
  if (loading) {
    return <AuthLoadingSpinner />;
  }

  // If user is authenticated, show loading while redirect happens
  // This prevents flash of login/signup forms
  if (user) {
    return <AuthLoadingSpinner />;
  }

  // User is not authenticated, render public pages
  return <main className="public min-h-full">{children}</main>;
}
