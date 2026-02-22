"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS, Heist, heistConverter } from "@/types/firestore";
import { useUser } from "@/hooks/useUser";

type FilterMode = "active" | "assigned" | "expired";

interface UseHeistsReturn {
  heists: Heist[];
  loading: boolean;
  error: string;
}

export function useHeists(filter: FilterMode): UseHeistsReturn {
  const { user, loading: authLoading } = useUser();
  const [heists, setHeists] = useState<Heist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Wait for auth
    if (authLoading) {
      setLoading(true);
      return;
    }

    // No user authenticated
    if (!user) {
      setHeists([]);
      setLoading(false);
      return;
    }

    // Build query
    const heistsRef = collection(db, COLLECTIONS.HEISTS).withConverter(
      heistConverter,
    );
    const now = Timestamp.now();

    let q;
    if (filter === "active") {
      q = query(
        heistsRef,
        where("assignedTo", "==", user.uid),
        where("deadline", ">", now),
      );
    } else if (filter === "assigned") {
      q = query(
        heistsRef,
        where("createdBy", "==", user.uid),
        where("deadline", ">", now),
      );
    } else {
      q = query(heistsRef, where("deadline", "<=", now));
    }

    setLoading(true);
    setError("");

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let heistDocs = snapshot.docs.map((doc) => doc.data());

        // Client-side filter for expired: only show heists with finalStatus
        if (filter === "expired") {
          heistDocs = heistDocs.filter((h) => h.finalStatus !== null);
        }

        setHeists(heistDocs);
        setLoading(false);
      },
      (err) => {
        console.error(`Error fetching ${filter} heists:`, err);
        setError(err.message);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [filter, user, authLoading]);

  return { heists, loading, error };
}
