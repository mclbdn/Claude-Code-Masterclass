"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import styles from "./LoginForm.module.css";

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginForm() {
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
      // Sign in with Firebase Auth
      await signInWithEmailAndPassword(auth, email, password);

      // Show success message
      setSuccessMessage("Login successful!");

      // No redirect per spec - just show success
    } catch (error: any) {
      setIsLoading(false);

      // Map Firebase error codes to user-friendly messages
      const errorCode = error?.code || "";

      if (errorCode === "auth/invalid-credential") {
        setFirebaseError("Invalid email or password.");
      } else if (errorCode === "auth/user-not-found") {
        setFirebaseError("No account found with this email.");
      } else if (errorCode === "auth/wrong-password") {
        setFirebaseError("Incorrect password.");
      } else if (errorCode === "auth/user-disabled") {
        setFirebaseError("This account has been disabled.");
      } else if (errorCode === "auth/too-many-requests") {
        setFirebaseError("Too many failed attempts. Please try again later.");
      } else if (errorCode === "auth/network-request-failed") {
        setFirebaseError("Network error. Please check your connection.");
      } else if (errorCode === "auth/invalid-email") {
        setFirebaseError("Invalid email format.");
      } else {
        setFirebaseError("An unexpected error occurred. Please try again.");
        console.error("Login error:", error);
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
        {isLoading ? "Logging in..." : "Login"}
      </button>

      <p className={styles.switchForm}>
        Don&apos;t have an account?{" "}
        <Link href="/signup" className={styles.link}>
          Sign up
        </Link>
      </p>
    </form>
  );
}
