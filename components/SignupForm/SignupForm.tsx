"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { generateCodename } from "@/lib/utils";
import styles from "./SignupForm.module.css";

interface FormErrors {
  email?: string;
  password?: string;
}

export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  function validate(): FormErrors {
    const newErrors: FormErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Clear previous errors and messages
    setErrors({});
    setFirebaseError("");
    setSuccessMessage("");

    // Client-side validation
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Step 2: Generate random codename
      const codename = generateCodename();

      // Step 3: Update user profile with codename
      await updateProfile(user, { displayName: codename });

      // Step 4: Create Firestore document
      await setDoc(doc(db, "users", user.uid), {
        codename: codename,
        id: user.uid,
      });

      // Step 5: Show success and redirect
      setSuccessMessage("Account created successfully!");

      // Wait briefly to show success message before redirect
      setTimeout(() => {
        router.push("/heists");
      }, 500);
    } catch (error: any) {
      setIsLoading(false);

      // Map Firebase error codes to user-friendly messages
      const errorCode = error?.code || "";

      if (errorCode === "auth/email-already-in-use") {
        setFirebaseError(
          "This email is already registered. Try logging in instead.",
        );
      } else if (errorCode === "auth/weak-password") {
        setFirebaseError(
          "Password is too weak. Please use a stronger password.",
        );
      } else if (errorCode === "auth/invalid-email") {
        setFirebaseError("Invalid email format.");
      } else if (errorCode === "auth/operation-not-allowed") {
        setFirebaseError("Email/password accounts are not enabled.");
      } else if (errorCode === "auth/network-request-failed") {
        setFirebaseError("Network error. Please check your connection.");
      } else {
        setFirebaseError("An unexpected error occurred. Please try again.");
        console.error("Signup error:", error);
      }
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {firebaseError && (
        <div className={styles.firebaseError} role="alert">
          {firebaseError}
        </div>
      )}

      {successMessage && (
        <div className={styles.successMessage} role="status">
          {successMessage}
        </div>
      )}

      <div className={styles.inputGroup}>
        <label htmlFor="email" className={styles.label}>
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          disabled={isLoading}
        />
        {errors.email && (
          <p id="email-error" className={styles.error} role="alert">
            {errors.email}
          </p>
        )}
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="password" className={styles.label}>
          Password
        </label>
        <div className={styles.passwordWrapper}>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            disabled={isLoading}
          />
          <button
            type="button"
            className={styles.toggleButton}
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.password && (
          <p id="password-error" className={styles.error} role="alert">
            {errors.password}
          </p>
        )}
      </div>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={isLoading}
      >
        {isLoading ? "Creating account..." : "Sign Up"}
      </button>

      <p className={styles.switchForm}>
        Already have an account?{" "}
        <Link href="/login" className={styles.link}>
          Log in
        </Link>
      </p>
    </form>
  );
}
