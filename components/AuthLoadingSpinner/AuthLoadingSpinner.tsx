"use client";

import { Clock8 } from "lucide-react";
import styles from "./AuthLoadingSpinner.module.css";

export default function AuthLoadingSpinner() {
  return (
    <div className={styles.container}>
      <Clock8 className={styles.spinner} size={48} strokeWidth={2} />
      <p className={styles.text}>Loading...</p>
    </div>
  );
}
