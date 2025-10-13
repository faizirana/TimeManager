"use client";

import { useState } from "react";
import { Input } from "@/components/UI/Input";
import { Button } from "@/components/UI/Button";
import { Label } from "@/components/UI/Label";
import { useRouter } from "next/navigation";

export default function LoginForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    /*
     * Handles the form submission for user login.
     *
     * @param e - The form submission event.
     */
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // API call simulation
            await new Promise((r) => setTimeout(r, 1000));
            if (email === "admin@example.com" && password === "123456") {
                router.push("/dashboard");
            } else {
                setError("Email ou mot de passe incorrect");
            }
        } catch {
            setError("Une erreur est survenue");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-2xl shadow-md w-full max-w-lg space-y-4"
        >
            <div className="relative z-0 w-full mb-8 group">
                <Input
                    type="email"
                    name="floating_email"
                    id="floating_email"
                    placeholder=" "
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <Label htmlFor="floating_email">Email</Label>
            </div>

            <div className="relative z-0 w-full mb-8 group">
                <Input
                    type="password"
                    name="floating_password"
                    id="floating_password"
                    placeholder=" "
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <Label htmlFor="floating_password">Mot de passe</Label>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button type="submit" disabled={loading}>
                {loading ? "Connexion..." : "Se connecter"}
            </Button>
        </form>
    );
}
