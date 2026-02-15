import styles from './Avatar.module.css'

interface AvatarProps {
  name: string
}

function getInitials(name: string): string {
  // Find all uppercase letters in the name
  const uppercaseLetters = name.match(/[A-Z]/g)

  if (uppercaseLetters && uppercaseLetters.length >= 2) {
    // PascalCase name - return first 2 uppercase letters
    return uppercaseLetters.slice(0, 2).join('')
  }

  // Simple name - return first letter uppercase
  return name.charAt(0).toUpperCase()
}

export default function Avatar({ name }: Readonly<AvatarProps>) {
  const initials = getInitials(name)

  return (
    <div className={styles.avatar}>
      <span className={styles.initials}>{initials}</span>
    </div>
  )
}
