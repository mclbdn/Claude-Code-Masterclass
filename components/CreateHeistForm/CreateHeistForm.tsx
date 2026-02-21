"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { createHeist } from "@/lib/utils/createHeist";
import { fetchUsers, createHeistDocument } from "@/lib/firebase";
import type { UserDocument } from "@/lib/firebase";
import type { HeistFormData } from "@/lib/utils/createHeist";
import styles from "./CreateHeistForm.module.css";

interface FormErrors {
  title?: string;
  description?: string;
  assignedTo?: string;
}

export default function CreateHeistForm() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();

  const [formData, setFormData] = useState<HeistFormData>({
    title: "",
    description: "",
    assignedTo: "",
  });
  const [users, setUsers] = useState<UserDocument[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingUsers, setIsFetchingUsers] = useState(true);
  const [firebaseError, setFirebaseError] = useState<string>("");

  useEffect(() => {
    async function loadUsers() {
      if (authLoading) return;

      setIsFetchingUsers(true);

      try {
        const allUsers = await fetchUsers();

        // Filter out current user
        const filteredUsers = allUsers.filter((u) => u.id !== user?.uid);

        setUsers(filteredUsers);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setFirebaseError("Failed to load users. Please refresh the page.");
      } finally {
        setIsFetchingUsers(false);
      }
    }

    loadUsers();
  }, [authLoading, user?.uid]);

  function validate(): FormErrors {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.assignedTo) {
      newErrors.assignedTo = "Please select a user to assign this heist to";
    }

    return newErrors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Clear previous errors
    setErrors({});
    setFirebaseError("");

    // Client-side validation
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Check user is authenticated
    if (!user) {
      setFirebaseError("You must be logged in to create a heist");
      return;
    }

    setIsLoading(true);

    try {
      // Find assignee's codename
      const assignee = users.find((u) => u.id === formData.assignedTo);
      if (!assignee) {
        throw new Error("Selected user not found");
      }

      // Create heist data
      const heistInput = createHeist(
        formData,
        user.uid,
        user.displayName || "Unknown",
        assignee.codename,
      );

      // Write to Firestore
      await createHeistDocument(heistInput);

      // Redirect immediately (per spec)
      router.push("/heists");
    } catch (error: any) {
      setIsLoading(false);

      // Map Firestore error codes
      const errorCode = error?.code || "";

      if (errorCode === "permission-denied") {
        setFirebaseError("You don't have permission to create heists.");
      } else if (errorCode === "unavailable") {
        setFirebaseError("Network error. Please check your connection.");
      } else {
        setFirebaseError("Failed to create heist. Please try again.");
        console.error("Create heist error:", error);
      }
    }
  }

  // Show empty state if no users available
  if (users.length === 0 && !isFetchingUsers && !firebaseError) {
    return (
      <div className={styles.emptyState}>
        <p>No users available to assign heists to.</p>
        <p>Please create additional user accounts first.</p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {firebaseError && (
        <div className={styles.firebaseError} role="alert">
          {firebaseError}
        </div>
      )}

      <div className={styles.inputGroup}>
        <label htmlFor="title" className={styles.label}>
          Title
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className={`${styles.input} ${errors.title ? styles.inputError : ""}`}
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? "title-error" : undefined}
          disabled={isLoading}
        />
        {errors.title && (
          <p id="title-error" className={styles.error} role="alert">
            {errors.title}
          </p>
        )}
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="description" className={styles.label}>
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className={`${styles.textarea} ${errors.description ? styles.inputError : ""}`}
          rows={4}
          aria-invalid={!!errors.description}
          aria-describedby={
            errors.description ? "description-error" : undefined
          }
          disabled={isLoading}
        />
        {errors.description && (
          <p id="description-error" className={styles.error} role="alert">
            {errors.description}
          </p>
        )}
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="assignedTo" className={styles.label}>
          Assign To
        </label>
        <select
          id="assignedTo"
          value={formData.assignedTo}
          onChange={(e) =>
            setFormData({ ...formData, assignedTo: e.target.value })
          }
          className={`${styles.select} ${errors.assignedTo ? styles.inputError : ""}`}
          aria-invalid={!!errors.assignedTo}
          aria-describedby={errors.assignedTo ? "assignedTo-error" : undefined}
          disabled={isLoading || isFetchingUsers}
        >
          <option value="">
            {isFetchingUsers ? "Loading users..." : "Select a user..."}
          </option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.codename}
            </option>
          ))}
        </select>
        {errors.assignedTo && (
          <p id="assignedTo-error" className={styles.error} role="alert">
            {errors.assignedTo}
          </p>
        )}
      </div>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={isLoading || isFetchingUsers}
      >
        {isLoading ? "Creating heist..." : "Create Heist"}
      </button>
    </form>
  );
}
