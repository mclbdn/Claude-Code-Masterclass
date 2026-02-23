import { Heist } from "@/types/firestore/heist";
import {
  isExpired,
  formatDeadline,
  getTimeRemaining,
} from "@/lib/utils/dateUtils";
import styles from "./HeistCard.module.css";

interface HeistCardProps {
  heist: Heist;
}

export default function HeistCard({ heist }: Readonly<HeistCardProps>) {
  const expired = isExpired(heist.deadline);
  const showStatusBadge = heist.finalStatus !== null;
  const timeRemaining =
    !heist.finalStatus && !expired ? getTimeRemaining(heist.deadline) : null;

  const cardClassName = expired
    ? `${styles.card} ${styles.cardExpired}`
    : styles.card;

  const titleClassName = expired
    ? `${styles.title} ${styles.titleExpired}`
    : styles.title;

  const descriptionClassName = expired
    ? `${styles.description} ${styles.descriptionExpired}`
    : styles.description;

  return (
    <article className={cardClassName} aria-label={`Heist: ${heist.title}`}>
      <div className={styles.cardHeader}>
        <h3 className={titleClassName}>{heist.title}</h3>
        {showStatusBadge && (
          <span
            className={
              heist.finalStatus === "success"
                ? styles.badgeSuccess
                : styles.badgeFailure
            }
          >
            {heist.finalStatus === "success" ? "Success" : "Failure"}
          </span>
        )}
      </div>

      <div className={styles.cardBody}>
        <p className={descriptionClassName}>{heist.description}</p>
      </div>

      <div className={styles.cardFooter}>
        <span className={styles.assignee}>
          Assigned to: {heist.assignedToCodename}
        </span>
        <div className={styles.deadlineInfo}>
          <span className={styles.deadline}>
            {formatDeadline(heist.deadline)}
          </span>
          {timeRemaining && (
            <span className={styles.timeRemaining}>
              {" "}
              • {timeRemaining} left
            </span>
          )}
          {expired && !showStatusBadge && (
            <span className={styles.expiredText}> • Expired</span>
          )}
        </div>
      </div>
    </article>
  );
}
