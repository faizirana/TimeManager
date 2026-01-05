"use client";

import LoginForm from "@/components/auth/LoginForm";
import Toast from "@/components/UI/Toast";
import { useAutoLogin } from "@/lib/hooks/useAutoLogin";

export default function LoginPage() {
  const { isCheckingToken, shouldShowAutoLoginMessage } = useAutoLogin();

  // Show loading state while checking token
  if (isCheckingToken && !shouldShowAutoLoginMessage) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Vérification de votre session...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      {shouldShowAutoLoginMessage && (
        <Toast
          message="Vous êtes déjà connecté ! Redirection en cours..."
          type="success"
          duration={2000}
        />
      )}

      <div className="flex flex-col items-center space-y-6 w-100">
        <h1 className="text-3xl font-bold text-gray-800">Connexion</h1>
        <LoginForm disabled={shouldShowAutoLoginMessage} />
        {/* TODO : Add feature Forgot Password */}
        {/* <p className="text-sm text-gray-600">
                    Mots de passe oublié ?{" "}
                    <a href="/forget-password" className="text-blue-600 hover:underline">
                        changer son mot de passe
                    </a>
                </p> */}
      </div>
    </main>
  );
}
