"use client";

import LoginForm from "./LoginForm";

export default function LoginPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center space-y-6 w-100">
                <h1 className="text-3xl font-bold text-gray-800">Connexion</h1>
                <LoginForm />
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
