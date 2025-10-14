"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Authentication hook: login + logout
 *
 * Provides:
 *  - handleSubmit: for logging in
 *  - logout: for logging out
 *  - loading: loading status
 *  - error: error message, if any
 */
export function useAuth() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    /**
     * Handles the form submission for user login.
     *
     * @param e - The form submission event.
     * @param email - Email of the user
     * @param password - Password of the user
     */
    async function handleSubmit(
        e: React.FormEvent<HTMLFormElement>,
        email: string,
        password: string,
    ) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            setLoading(false);

            if (!res.ok) {
                const data = await res.json();
                setError(data.message || "Une erreur est survenue.");
                return;
            }

            router.push("/dashboard");
        } catch {
            setLoading(false);
            setError("Erreur de connexion au serveur.");
        }
    }

    async function logout() {
        try {
            setLoading(true);
            // Appel de l'API pour supprimer le cookie/token côté serveur
            await fetch("/api/logout", { method: "POST" });
            setLoading(false);
            router.push("/login");
        } catch {
            setLoading(false);
            setError("Erreur lors de la déconnexion.");
        }
    }

    return { handleSubmit, logout, loading, error };
}
