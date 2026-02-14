import styles from "./Skeleton.module.css"

export default function Skeleton() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.avatar} />
        <div className={styles.headerText}>
          <div className={`${styles.line} ${styles.title}`} />
          <div className={`${styles.line} ${styles.subtitle}`} />
        </div>
      </div>
      <div className={styles.body}>
        <div className={`${styles.line} ${styles.full}`} />
        <div className={`${styles.line} ${styles.full}`} />
        <div className={`${styles.line} ${styles.medium}`} />
      </div>
    </div>
  )
}
