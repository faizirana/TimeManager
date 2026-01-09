import { User } from "lucide-react";

/**
 * Avatar component with user initials
 *
 * Displays a circular avatar with the first letter of the user's first and last name.
 *
 * @example
 * ```tsx
 * <Avatar name="John" surname="Doe" />
 * ```
 */

interface AvatarProps {
  /** User's first name */
  name: string;
  /** User's surname/last name */
  surname: string;
  /** Optional size class (default: w-10 h-10) */
  size?: string;
  /** Optional additional CSS classes */
  className?: string;
}

export function Avatar({ name, surname, size = "w-10 h-10", className = "" }: AvatarProps) {
  const hasNoData = !name || !surname;
  const initials = hasNoData ? "" : `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();

  return (
    <div
      className={`${size} bg-gray-500 dark:bg-gray-600 rounded-full flex items-center justify-center text-white font-semibold ${className}`}
    >
      {hasNoData ? <User size={16} /> : initials}
    </div>
  );
}
