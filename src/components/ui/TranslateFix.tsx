import React from "react";

export function TranslateFix({ text }: { text: string }) {
  if (!text) return null;
  
  // Split by specific words we want to override translation for.
  // Handles: ବୌଦ୍ଧ (Odia) and Boudh (English)
  const parts = text.split(/(ବୌଦ୍ଧ|Boudh)/gi);
  
  return (
    <>
      {parts.map((part, i) => {
        if (part === "ବୌଦ୍ଧ" || part.toLowerCase() === "boudh") {
          return (
            <span key={i} className="boudh-wrapper" translate="no">
              <span className="odia-text">ବୌଦ୍ଧ</span>
              <span className="eng-text">Boudh</span>
            </span>
          );
        }
        return part;
      })}
    </>
  );
}
