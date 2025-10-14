"use client";

import { useState } from "react";
import { Input } from "@/components/UI/Input";
import { Button } from "@/components/UI/Button";
import { Label } from "@/components/UI/Label";

import { useAuth } from "@/lib/auth/useAuth";

export default function LoginForm() {
    const { handleSubmit, loading, error } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
        <form
            onSubmit={(e) => handleSubmit(e, email, password)}
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
