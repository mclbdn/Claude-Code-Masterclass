import Link from "next/link";
import { Clock8, Target, Zap, Eye } from "lucide-react";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.hero}>
      {/* Animated gradient background */}
      <div className={styles.gradientOrb1} />
      <div className={styles.gradientOrb2} />
      <div className={styles.noise} />

      {/* Main content */}
      <div className={styles.container}>
        {/* Classified stamp decoration */}
        <div className={styles.stamp}>CLASSIFIED</div>

        {/* Logo and headline */}
        <div className={styles.logoSection}>
          <h1 className={styles.logo}>
            P<Clock8 className={styles.clockIcon} strokeWidth={2.75} />
            CKET HEIST
          </h1>
          <p className={styles.tagline}>Plot. Prank. Gloat.</p>
        </div>

        {/* Mission brief */}
        <div className={styles.missionBrief}>
          <div className={styles.briefHeader}>
            <span className={styles.briefLabel}>MISSION BRIEF</span>
            <div className={styles.briefDivider} />
          </div>
          <p className={styles.description}>
            Welcome to the ultimate platform for orchestrating harmless office
            capers. Assign sneaky missions to your coworkers, track their
            progress in real-time, and earn legendary bragging rights for
            executed heists.
          </p>
          <p className={styles.descriptionSmall}>
            From swapping desktop wallpapers to hiding all the staplers—no
            mission is too small, no prank too elaborate. Your office will never
            be the same.
          </p>
        </div>

        {/* Feature cards */}
        <div className={styles.features}>
          <div className={styles.feature}>
            <Target className={styles.featureIcon} />
            <h3 className={styles.featureTitle}>Plot</h3>
            <p className={styles.featureText}>Design elaborate pranks</p>
          </div>
          <div className={styles.feature}>
            <Zap className={styles.featureIcon} />
            <h3 className={styles.featureTitle}>Execute</h3>
            <p className={styles.featureText}>Deploy your heists</p>
          </div>
          <div className={styles.feature}>
            <Eye className={styles.featureIcon} />
            <h3 className={styles.featureTitle}>Track</h3>
            <p className={styles.featureText}>Monitor in real-time</p>
          </div>
        </div>

        {/* CTA */}
        <div className={styles.ctaSection}>
          <Link href="/signup" className={styles.ctaButton}>
            <span className={styles.ctaText}>INITIATE YOUR FIRST HEIST</span>
            <div className={styles.ctaGlow} />
          </Link>
          <p className={styles.loginPrompt}>
            Already an operative?{" "}
            <Link href="/login" className={styles.loginLink}>
              Access your account
            </Link>
          </p>
        </div>

        {/* Decorative elements */}
        <div className={styles.scanline} />
      </div>
    </div>
  );
}
