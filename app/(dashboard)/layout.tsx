"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import Navbar from "@/components/Navbar";
import AuthLoadingSpinner from "@/components/AuthLoadingSpinner";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Only redirect after loading is complete
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Show loading state while checking auth
  if (loading) {
    return <AuthLoadingSpinner />;
  }

  // If user is not authenticated, show loading while redirect happens
  // This prevents flash of protected content
  if (!user) {
    return <AuthLoadingSpinner />;
  }

  // User is authenticated, render dashboard
  return (
    <div className="min-h-full flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
