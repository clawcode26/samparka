import React from "react";

export function TranslateFix({ text }: { text: string }) {
  if (!text) return null;
  
  // Split by specific words we want to override translation for.
  // Currently handles: ବୌଦ୍ଧ (Boudh)
  const parts = text.split(/(ବୌଦ୍ଧ)/g);
  
  return (
    <>
      {parts.map((part, i) => {
        if (part === "ବୌଦ୍ଧ") {
          return (
            <span key={i} className="boudh-wrapper">
              <span className="odia-text">ବୌଦ୍ଧ</span>
              <span className="eng-text" translate="no" style={{ display: "none" }}>Boudh</span>
            </span>
          );
        }
        return part;
      })}
    </>
  );
}
