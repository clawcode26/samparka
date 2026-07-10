"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Languages } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function FloatingLanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const pathname = usePathname();

  useEffect(() => {
    // 1. Add Google Translate init callback
    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: "auto",
          includedLanguages: "en,or",
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    // 2. Inject script if not already present
    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }

    // 3. Keep checking if Google combo is loaded and apply the saved language
    const interval = setInterval(() => {
      const googleCombo = document.querySelector(".goog-te-combo") as HTMLSelectElement;
      if (googleCombo) {
        const savedLang = localStorage.getItem("site-language") || "en";
        // Google combo expects empty string "" or "en" for the default page language.
        // If savedLang is "or", select "or". If "en", select "" or "en".
        const targetValue = savedLang === "or" ? "or" : "en";
        if (googleCombo.value !== targetValue) {
          googleCombo.value = targetValue;
          googleCombo.dispatchEvent(new Event("change"));
        }
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Listen to global language context change and update Google Translation combo
  useEffect(() => {
    const googleCombo = document.querySelector(".goog-te-combo") as HTMLSelectElement;
    if (googleCombo) {
      const targetValue = language === "or" ? "or" : "en";
      if (googleCombo.value !== targetValue) {
        googleCombo.value = targetValue;
        googleCombo.dispatchEvent(new Event("change"));
      }
    }
  }, [language]);

  // Hide the floating selector on dashboard views
  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  const handleLangToggle = (lang: "en" | "or") => {
    setLanguage(lang);
  };

  return (
    <>
      {/* Hidden google translate container required by the script */}
      <div id="google_translate_element" style={{ display: "none" }} />
      
      <div 
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          backgroundColor: "#ffffff",
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: "9999px",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
          padding: "6px 12px",
          transition: "transform 150ms ease"
        }}
        className="floating-translate-bar skiptranslate"
      >
        <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--neutral-700)", display: "flex", alignItems: "center", gap: "4px" }}>
          <Languages size={14} style={{ color: "var(--brand-color)" }} /> Translate:
        </span>
        <button
          onClick={() => handleLangToggle("en")}
          style={{
            padding: "3px 10px",
            fontSize: "11px",
            fontWeight: 600,
            borderRadius: "9999px",
            border: "none",
            cursor: "pointer",
            background: language === "en" ? "var(--brand-color)" : "none",
            color: language === "en" ? "#ffffff" : "var(--text-light)",
            transition: "all 150ms ease"
          }}
        >
          English
        </button>
        <button
          onClick={() => handleLangToggle("or")}
          style={{
            padding: "3px 10px",
            fontSize: "11px",
            fontWeight: 600,
            borderRadius: "9999px",
            border: "none",
            cursor: "pointer",
            background: language === "or" ? "var(--brand-color)" : "none",
            color: language === "or" ? "#ffffff" : "var(--text-light)",
            transition: "all 150ms ease"
          }}
        >
          ଓଡ଼ିଆ
        </button>
      </div>
    </>
  );
}
