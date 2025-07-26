"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTakipListesi } from "@/contexts/TakipListesiContext";

export default function TakipListesi() {
  const router = useRouter();
  const { takipListesi } = useTakipListesi();
  
  // Redirect to Kaleci subpage on load
  useEffect(() => {
    router.push('/takip-listesi/kaleci');
  }, [router]);
  
  // This page will not be displayed due to the redirect,
  // but we'll include a simple loading state just in case
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-8">Takip Listesi</h1>
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500">Yönlendiriliyor...</p>
      </div>
    </div>
  );
} 