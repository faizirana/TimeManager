/**
 * User types for profile and authentication
 */

/**
 * Extended user profile with all available fields
 */
export interface UserProfile {
  id: number;
  name: string;
  surname: string;
  email: string;
  mobileNumber?: string;
  role: "manager" | "employee" | "admin";
  id_manager: number | null;
  createdAt?: string;
  updatedAt?: string;
  manager?: {
    id: number;
    name: string;
    surname: string;
    email: string;
  };
}

/**
 * User update data structure
 */
export interface UpdateUserData {
  name?: string;
  surname?: string;
  email?: string;
  mobileNumber?: string;
  password?: string;
}

/**
 * User password change data
 */
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}
