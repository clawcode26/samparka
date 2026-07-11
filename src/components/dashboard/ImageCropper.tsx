"use client";

import React, { useRef, useState } from "react";
import { Upload, Crop, Check, AlertCircle } from "lucide-react";

interface ImageCropperProps {
  onImageUploaded: (url: string) => void;
}

export function ImageCropper({ onImageUploaded }: ImageCropperProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setSelectedFile(null);
    setImageSrc(null);
    setCroppedPreview(null);

    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file.");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        // Default: auto center-crop to 16:9
        setTimeout(() => autoCropCenter(), 100);
      };
      reader.readAsDataURL(file);
    }
  };

  const autoCropCenter = () => {
    const img = imageRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Target OG-standard 1200x630 (1.91:1) — perfect for WhatsApp, Twitter, Facebook
    const targetWidth = 1200;
    const targetHeight = 630;
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;

    // Calculate crop parameters for center 16:9
    let sourceX = 0;
    let sourceY = 0;
    let sourceWidth = imgWidth;
    let sourceHeight = imgHeight;

    const imgAspect = imgWidth / imgHeight;
    const targetAspect = targetWidth / targetHeight;

    if (imgAspect > targetAspect) {
      // Image is wider than 16:9
      sourceWidth = imgHeight * targetAspect;
      sourceX = (imgWidth - sourceWidth) / 2;
    } else {
      // Image is taller than 16:9
      sourceHeight = imgWidth / targetAspect;
      sourceY = (imgHeight - sourceHeight) / 2;
    }

    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      targetWidth,
      targetHeight
    );

    setCroppedPreview(canvas.toDataURL("image/jpeg", 0.9));
  };

  const handleUpload = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setLoading(true);
    setError("");

    try {
      // Wrap toBlob in a Promise so async/await and try/catch work correctly.
      // The old callback style meant errors were invisible and setLoading never ran.
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.92)
      );

      if (!blob) throw new Error("Failed to process image canvas.");

      const formData = new FormData();
      formData.append("file", blob, selectedFile?.name || "upload.jpg");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      let data: any = null;
      try {
        const text = await response.text();
        data = JSON.parse(text);
      } catch (_) {
        throw new Error("Server returned an invalid response.");
      }

      if (!response.ok) {
        throw new Error(data?.error || `Upload failed (${response.status})`);
      }

      if (!data?.url) throw new Error("No image URL returned from server.");

      onImageUploaded(data.url);
      setSelectedFile(null);
      setImageSrc(null);
      setCroppedPreview(null);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      // Always reset loading so page never gets stuck blank
      setLoading(false);
    }
  };

  return (
    <div style={{ border: "1px dashed var(--border-color)", padding: "var(--space-24)", borderRadius: "var(--radius)", backgroundColor: "var(--neutral-50)" }}>
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--brand-light)", color: "var(--brand-color)", padding: "12px", borderRadius: "var(--radius)", fontSize: "13px", marginBottom: "16px" }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {!imageSrc ? (
        <div style={{ textAlign: "center" }}>
          <Upload size={32} style={{ color: "var(--neutral-400)", marginBottom: "12px", marginInline: "auto" }} />
          <label style={{ display: "inline-block", background: "var(--brand-color)", color: "#fff", padding: "8px 16px", borderRadius: "var(--radius)", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
            Choose Cover Image
            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
          </label>
          <div style={{ fontSize: "11px", color: "var(--text-light)", marginTop: "8px" }}>Supports JPG, PNG (automatically crops to 16:9 layout)</div>
        </div>
      ) : (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            {/* Original Source */}
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-light)", marginBottom: "4px" }}>Original</div>
              <div style={{ position: "relative", width: "100%", height: "180px", overflow: "hidden", border: "1px solid var(--border-color)", borderRadius: "var(--radius)", backgroundColor: "#000" }}>
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Original"
                  onLoad={autoCropCenter}
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </div>
            </div>

            {/* Cropped 16:9 Preview */}
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-light)", marginBottom: "4px" }}>OG Preview (1200×630)</div>
              <div style={{ position: "relative", width: "100%", height: "180px", overflow: "hidden", border: "1px solid var(--border-color)", borderRadius: "var(--radius)", backgroundColor: "#000" }}>
                {croppedPreview && (
                  <img
                    src={croppedPreview}
                    alt="Preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                )}
              </div>
            </div>
          </div>

          <canvas ref={canvasRef} style={{ display: "none" }} />

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setImageSrc(null);
                setCroppedPreview(null);
              }}
              style={{ background: "#fff", border: "1px solid var(--border-color)", padding: "6px 12px", borderRadius: "var(--radius)", fontSize: "12px", cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={loading}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "var(--brand-color)", border: "none", color: "#fff", padding: "6px 12px", borderRadius: "var(--radius)", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
            >
              {loading ? (
                "Uploading..."
              ) : (
                <>
                  <Check size={14} /> Use & Upload
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
