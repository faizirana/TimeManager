"use client";

import React, { useState, useEffect } from "react";
import { useProtectedRoute } from "@/lib/hooks/useProtectedRoute";
import {
  getCurrentUserProfile,
  updateCurrentUser,
  getUserById,
} from "@/lib/services/users/usersService";
import { UserProfile, UpdateUserData } from "@/lib/types/user";
import ProfileView from "@/components/profile/ProfileView";
import ProfileEditForm from "@/components/profile/ProfileEditForm";
import { useAuth } from "@/lib/hooks/useAuth";
import { Skeleton } from "@/components/UI/Skeleton";

/**
 * Profile Page
 *
 * Displays and allows editing of the current user's profile
 */
export default function ProfilePage() {
  useProtectedRoute();

  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCurrentUserProfile();

      // Fetch manager details if id_manager exists
      if (data.id_manager) {
        try {
          const manager = await getUserById(data.id_manager);
          data.manager = {
            id: manager.id,
            name: manager.name,
            surname: manager.surname,
            email: manager.email,
          };
        } catch (err) {
          console.error("Failed to fetch manager details:", err);
          // Continue without manager details
        }
      }

      setProfile(data);
    } catch (err) {
      console.error("Failed to load profile:", err);
      setError("Impossible de charger le profil. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: UpdateUserData) => {
    try {
      setError(null);
      const updatedProfile = await updateCurrentUser(data);

      // Fetch manager details if id_manager exists
      if (updatedProfile.id_manager) {
        try {
          const manager = await getUserById(updatedProfile.id_manager);
          updatedProfile.manager = {
            id: manager.id,
            name: manager.name,
            surname: manager.surname,
            email: manager.email,
          };
        } catch (err) {
          console.error("Failed to fetch manager details:", err);
        }
      }

      setProfile(updatedProfile);
      setIsEditing(false);
      setSuccessMessage("Profil mis à jour avec succès!");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);

      // If password was changed, the backend invalidates all tokens
      // User will be automatically logged out by the auth system
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      setError(err.message || "Erreur lors de la mise à jour du profil");
      throw err; // Re-throw to let the form handle it
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setSuccessMessage(null);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="bg-[var(--background-2)] rounded-lg border border-[var(--border)] p-6 space-y-6">
          <div className="flex items-center space-x-4">
            <Skeleton className="w-20 h-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">Erreur</h3>
          <p className="text-red-700 dark:text-red-300">{error}</p>
          <button
            onClick={loadProfile}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Mon Profil</h1>
        <p className="text-[var(--muted-foreground)] mt-2">
          Gérez vos informations personnelles et vos paramètres de compte
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-green-800 dark:text-green-200">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Profile Content */}
      {isEditing ? (
        <ProfileEditForm profile={profile} onSave={handleSave} onCancel={handleCancel} />
      ) : (
        <ProfileView profile={profile} onEdit={handleEdit} />
      )}
    </div>
  );
}
