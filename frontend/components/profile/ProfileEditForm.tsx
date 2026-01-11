"use client";

import React, { useState } from "react";
import { UserProfile, UpdateUserData } from "@/lib/types/user";
import { Button } from "@/components/UI/Button";
import { Input } from "@/components/UI/Input";
import { Label } from "@/components/UI/Label";

interface ProfileEditFormProps {
  profile: UserProfile;
  onSave: (data: UpdateUserData) => Promise<void>;
  onCancel: () => void;
}

/**
 * ProfileEditForm Component
 *
 * Form to edit user profile information with validation
 */
export default function ProfileEditForm({ profile, onSave, onCancel }: ProfileEditFormProps) {
  const [formData, setFormData] = useState({
    name: profile.name ?? "",
    surname: profile.surname ?? "",
    email: profile.email ?? "",
    mobileNumber: profile.mobileNumber ?? "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name?.trim()) {
      newErrors.name = "Le prénom est requis";
    }

    // Surname validation
    if (!formData.surname?.trim()) {
      newErrors.surname = "Le nom est requis";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email?.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    // Mobile number validation (optional - only validate format if provided)
    const phoneRegex = /^[0-9]{10}$/;
    if (formData.mobileNumber?.trim() && !phoneRegex.test(formData.mobileNumber)) {
      newErrors.mobileNumber = "Le numéro doit contenir 10 chiffres";
    }

    // Password validation (only if provided)
    if (formData.password) {
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        newErrors.password =
          "Le mot de passe doit contenir au moins 8 caractères, 1 majuscule et 1 chiffre";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const updateData: UpdateUserData = {
        name: formData.name,
        surname: formData.surname,
        email: formData.email,
        mobileNumber: formData.mobileNumber,
      };

      // Only include password if provided
      if (formData.password) {
        updateData.password = formData.password;
      }

      await onSave(updateData);
    } catch (_error) {
      setErrors({ submit: "Erreur lors de la mise à jour du profil" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <div className="bg-[var(--background-2)] rounded-lg border border-[var(--border)] p-6">
      <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">Modifier mon profil</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error message */}
        {errors.submit && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{errors.submit}</p>
          </div>
        )}

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Name */}
          <div>
            <Label htmlFor="name" variant="static">
              Prénom <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              variant="outline"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>

          {/* Last Name */}
          <div>
            <Label htmlFor="surname" variant="static">
              Nom <span className="text-red-500">*</span>
            </Label>
            <Input
              id="surname"
              name="surname"
              value={formData.surname}
              onChange={handleChange}
              variant="outline"
              className={errors.surname ? "border-red-500" : ""}
            />
            {errors.surname && <p className="mt-1 text-sm text-red-500">{errors.surname}</p>}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" variant="static">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              variant="outline"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
          </div>

          {/* Mobile Number */}
          <div>
            <Label htmlFor="mobileNumber" variant="static">
              Téléphone
            </Label>
            <Input
              type="tel"
              id="mobileNumber"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              placeholder="0123456789"
              variant="outline"
              className={errors.mobileNumber ? "border-red-500" : ""}
            />
            {errors.mobileNumber && (
              <p className="mt-1 text-sm text-red-500">{errors.mobileNumber}</p>
            )}
          </div>
        </div>

        {/* Read-only fields */}
        <div className="pt-4 border-t border-[var(--border)]">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
            Informations en lecture seule
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="role" variant="static">
                Rôle
              </Label>
              <Input
                id="role"
                type="text"
                value={profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                disabled
                variant="outline"
              />
            </div>
            {profile.id_manager && (
              <div>
                <Label htmlFor="id_manager" variant="static">
                  ID Manager
                </Label>
                <Input
                  id="id_manager"
                  type="text"
                  value={profile.id_manager}
                  disabled
                  variant="outline"
                />
              </div>
            )}
          </div>
        </div>

        {/* Password Change Section */}
        <div className="pt-4 border-t border-[var(--border)]">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
            Changer le mot de passe (optionnel)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* New Password */}
            <div>
              <Label htmlFor="password" variant="static">
                Nouveau mot de passe
              </Label>
              <Input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Laisser vide pour ne pas changer"
                variant="outline"
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirmPassword" variant="static">
                Confirmer le mot de passe
              </Label>
              <Input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirmer le nouveau mot de passe"
                variant="outline"
                className={errors.confirmPassword ? "border-red-500" : ""}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>
          </div>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Le mot de passe doit contenir au moins 8 caractères, 1 majuscule et 1 chiffre
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" onClick={onCancel} disabled={loading} variant="outline">
            Annuler
          </Button>
          <Button type="submit" disabled={loading} variant="primary">
            {loading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </form>
    </div>
  );
}
