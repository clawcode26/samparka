"use client";

import React, { useState, useEffect } from "react";
import styles from "./Login.module.css";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type ViewMode = "signin" | "signup" | "forgot" | "verify";

export default function LoginPage() {
  const router = useRouter();
  const { user, role, loading, signIn, signUp, resetPassword, sendVerificationEmail, logout } = useAuth();

  const [mode, setMode] = useState<ViewMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState<"admin" | "reporter">("reporter");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Redirect if logged in and email verified
  useEffect(() => {
    if (!loading && user) {
      if (user.emailVerified) {
        if (role) {
          router.push(`/dashboard/${role}`);
        } else {
          router.push("/dashboard/reporter");
        }
      } else {
        setMode("verify");
      }
    }
  }, [user, role, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setActionLoading(true);

    try {
      if (mode === "signin") {
        await signIn(email, password);
      } else if (mode === "signup") {
        if (!name.trim()) {
          throw new Error("Please enter your name");
        }
        await signUp(email, password, name, selectedRole);
        setMode("verify");
      } else if (mode === "forgot") {
        await resetPassword(email);
        setSuccess("Password reset email sent. Please check your inbox.");
      }
    } catch (err: any) {
      console.error(err);
      let errMsg = "An unexpected error occurred.";
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        errMsg = "Invalid email or password.";
      } else if (err.code === "auth/email-already-in-use") {
        errMsg = "This email is already registered.";
      } else if (err.code === "auth/weak-password") {
        errMsg = "Password should be at least 6 characters.";
      } else if (err.message) {
        errMsg = err.message;
      }
      setError(errMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setError("");
    setSuccess("");
    try {
      await sendVerificationEmail();
      setSuccess("Verification email resent. Please check your inbox.");
    } catch (err: any) {
      setError(err.message || "Failed to resend verification email.");
    }
  };

  const handleLogout = async () => {
    setError("");
    setSuccess("");
    try {
      await logout();
      setMode("signin");
    } catch (err: any) {
      setError(err.message || "Failed to sign out.");
    }
  };

  if (loading) {
    return (
      <div className={styles.loginPage}>
        <div className={styles.loginCard} style={{ textAlign: "center" }}>
          <div className={styles.brand}>Sampark<span>Workspace</span></div>
          <div className={styles.subtitle} style={{ marginBottom: 0 }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (mode === "verify") {
    return (
      <div className={styles.loginPage}>
        <div className={styles.loginCard}>
          <div className={styles.brand}>Sampark<span>Workspace</span></div>
          <div className={styles.subtitle}>Verify your email</div>

          {error && <div className={styles.errorAlert}>{error}</div>}
          {success && <div className={styles.successAlert}>{success}</div>}

          <div style={{ fontSize: "14px", lineHeight: "1.6", color: "var(--neutral-700)", marginBottom: "var(--space-24)" }}>
            We've sent a verification link to <strong>{user?.email}</strong>. Please check your inbox and verify your email to access the workspace.
          </div>

          <button 
            type="button" 
            onClick={handleResendVerification}
            className={styles.primaryButton}
            style={{ marginBottom: "var(--space-12)" }}
          >
            Resend Verification Email
          </button>

          <button 
            type="button" 
            onClick={() => window.location.reload()}
            className={styles.primaryButton}
            style={{ backgroundColor: "var(--neutral-800)", marginBottom: "var(--space-12)" }}
          >
            I've Verified My Email (Refresh)
          </button>

          <span className={styles.secondaryLink} onClick={handleLogout}>
            Sign out and use another account
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <div className={styles.brand}>Sampark<span>Workspace</span></div>
        <div className={styles.subtitle}>Access your editorial workspace</div>

        {error && <div className={styles.errorAlert}>{error}</div>}
        {success && <div className={styles.successAlert}>{success}</div>}

        {mode !== "forgot" && (
          <div className={styles.tabContainer}>
            <div 
              className={`${styles.tab} ${mode === "signin" ? styles.tabActive : ""}`} 
              onClick={() => { setMode("signin"); setError(""); }}
            >
              Sign In
            </div>
            <div 
              className={`${styles.tab} ${mode === "signup" ? styles.tabActive : ""}`} 
              onClick={() => { setMode("signup"); setError(""); }}
            >
              Register
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div className={styles.formGroup}>
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                className={styles.inputField}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className={styles.inputField}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@sampark.in"
              required
            />
          </div>

          {mode !== "forgot" && (
            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className={styles.inputField}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          )}

          {mode === "signup" && (
            <div className={styles.formGroup}>
              <label htmlFor="role">Workspace Role</label>
              <select
                id="role"
                className={styles.selectField}
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as "admin" | "reporter")}
              >
                <option value="reporter">Reporter</option>
                <option value="admin">System Admin</option>
              </select>
            </div>
          )}

          <button 
            type="submit" 
            className={styles.primaryButton}
            disabled={actionLoading}
          >
            {actionLoading ? "Processing..." : mode === "signin" ? "Sign In" : mode === "signup" ? "Create Account" : "Reset Password"}
          </button>
        </form>

        {mode === "signin" && (
          <span className={styles.secondaryLink} onClick={() => { setMode("forgot"); setError(""); }}>
            Forgot your password?
          </span>
        )}

        {mode === "forgot" && (
          <span className={styles.secondaryLink} onClick={() => { setMode("signin"); setError(""); }}>
            Back to Sign In
          </span>
        )}
      </div>
    </div>
  );
}
