/**
 * Client-side image optimization/compression utility.
 * Resizes large images and compresses to WebP (with JPEG fallback).
 */

interface OptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  outputType?: "image/webp" | "image/jpeg";
}

const DEFAULT_OPTIONS: Required<OptimizeOptions> = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.82,
  outputType: "image/webp",
};

/**
 * Compress and resize an image file.
 * Returns a new File object (WebP or JPEG).
 */
export const optimizeImage = (
  file: File,
  options?: OptimizeOptions
): Promise<File> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    // Skip non-image files
    if (!file.type.startsWith("image/")) {
      return reject(new Error("Not an image file"));
    }

    // Skip SVGs — they're already optimized
    if (file.type === "image/svg+xml") {
      return resolve(file);
    }

    // Skip GIFs to preserve animation
    if (file.type === "image/gif") {
      return resolve(file);
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Scale down if exceeds max dimensions
      if (width > opts.maxWidth || height > opts.maxHeight) {
        const ratio = Math.min(opts.maxWidth / width, opts.maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return reject(new Error("Canvas context unavailable"));
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Try WebP first, fallback to JPEG
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            // Fallback to JPEG if WebP fails
            canvas.toBlob(
              (jpegBlob) => {
                if (!jpegBlob) return reject(new Error("Compression failed"));
                const ext = "jpg";
                const name = file.name.replace(/\.[^.]+$/, `.${ext}`);
                resolve(new File([jpegBlob], name, { type: "image/jpeg" }));
              },
              "image/jpeg",
              opts.quality
            );
            return;
          }

          const ext = opts.outputType === "image/webp" ? "webp" : "jpg";
          const name = file.name.replace(/\.[^.]+$/, `.${ext}`);
          resolve(new File([blob], name, { type: opts.outputType }));
        },
        opts.outputType,
        opts.quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
};

/**
 * Format file size for display.
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
