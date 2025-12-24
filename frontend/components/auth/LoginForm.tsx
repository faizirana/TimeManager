"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/UI/Input";
import { Button } from "@/components/UI/Button";
import { Label } from "@/components/UI/Label";

import { useAuth } from "@/lib/hooks/useAuth";

export default function LoginForm() {
  const { handleSubmit, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
          type={showPassword ? "text" : "password"}
          name="floating_password"
          id="floating_password"
          placeholder=" "
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Label htmlFor="floating_password">Mot de passe</Label>
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-0 top-2.5 text-gray-300 hover:text-gray-600"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Connexion..." : "Se connecter"}
      </Button>
    </form>
  );
}
