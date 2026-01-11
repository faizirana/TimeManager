"use client";

import React from "react";
import { UserProfile } from "@/lib/types/user";
import { Mail, Phone, Shield, User, Calendar, UserCheck } from "lucide-react";
import { RoleBadge } from "@/components/UI/RoleBadge";
import { Button } from "@/components/UI/Button";

interface ProfileViewProps {
  profile: UserProfile;
  onEdit: () => void;
}

/**
 * ProfileView Component
 *
 * Displays user profile information in read-only mode
 */
export default function ProfileView({ profile, onEdit }: ProfileViewProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-[var(--background-2)] rounded-lg border border-[var(--border)] p-6 space-y-6">
      {/* Header with Avatar and Edit Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-700 to-green-600 flex items-center justify-center text-white text-2xl font-bold">
            {profile.name.charAt(0)}
            {profile.surname.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--foreground)]">
              {profile.name} {profile.surname}
            </h2>
            <RoleBadge variant={profile.role as "admin" | "manager" | "employee" | "user"}>
              <Shield className="w-4 h-4 mr-1" />
              {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
            </RoleBadge>
          </div>
        </div>
        <Button onClick={onEdit} variant="primary">
          Modifier le profil
        </Button>
      </div>

      {/* Profile Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-[var(--muted-foreground)]">
            <Mail className="w-4 h-4 mr-2" />
            Email
          </label>
          <p className="text-[var(--foreground)] font-medium">{profile.email}</p>
        </div>

        {/* Mobile Number */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-[var(--muted-foreground)]">
            <Phone className="w-4 h-4 mr-2" />
            Téléphone
          </label>
          <p className="text-[var(--foreground)] font-medium">{profile.mobileNumber}</p>
        </div>

        {/* First Name */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-[var(--muted-foreground)]">
            <User className="w-4 h-4 mr-2" />
            Prénom
          </label>
          <p className="text-[var(--foreground)] font-medium">{profile.name}</p>
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-[var(--muted-foreground)]">
            <User className="w-4 h-4 mr-2" />
            Nom
          </label>
          <p className="text-[var(--foreground)] font-medium">{profile.surname}</p>
        </div>

        {/* Manager */}
        {profile.manager && (
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-[var(--muted-foreground)]">
              <UserCheck className="w-4 h-4 mr-2" />
              Manager
            </label>
            <p className="text-[var(--foreground)] font-medium">
              {profile.manager.name} {profile.manager.surname}
            </p>
            <p className="text-sm text-[var(--muted-foreground)]">{profile.manager.email}</p>
          </div>
        )}

        {/* Created At */}
        {profile.createdAt && (
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-[var(--muted-foreground)]">
              <Calendar className="w-4 h-4 mr-2" />
              Membre depuis
            </label>
            <p className="text-[var(--foreground)] font-medium">{formatDate(profile.createdAt)}</p>
          </div>
        )}
      </div>

      {/* Account Information */}
      <div className="pt-4 border-t border-[var(--border)]">
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-3">
          Informations du compte
        </h3>
        <div className="space-y-2 text-sm text-[var(--muted-foreground)]">
          <p>
            <span className="font-medium">ID utilisateur:</span> {profile.id}
          </p>
          {profile.updatedAt && (
            <p>
              <span className="font-medium">Dernière modification:</span>{" "}
              {formatDate(profile.updatedAt)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
