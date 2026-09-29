import React, { useState, useRef } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, ImageOff, Upload } from "lucide-react";

// Allow http/https URLs or base64 data URLs
const URL_REGEX = /^(https?:\/\/.+|data:image\/.+)/i;
const MAX_IMAGES = 10;

/**
 * ImageGalleryEditor
 * Props:
 *   images: string[]          - current ordered list of URLs
 *   onChange: (urls) => void  - called with updated array
 *   maxImages?: number        - default 10
 */
export default function ImageGalleryEditor({ images = [], onChange, maxImages = MAX_IMAGES }) {
  const [brokenImages, setBrokenImages] = useState({});
  const fileInputRefs = useRef([]);

  const update = (newArr) => onChange(newArr);

  const handleUrlChange = (idx, val) => {
    const next = [...images];
    next[idx] = val;
    // reset broken state when user edits
    setBrokenImages((prev) => { const p = { ...prev }; delete p[idx]; return p; });
    update(next);
  };

  const handleFileChange = (idx, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleUrlChange(idx, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = (idx) => {
    if (fileInputRefs.current[idx]) {
      fileInputRefs.current[idx].click();
    }
  };

  const addImage = () => {
    if (images.length >= maxImages) return;
    update([...images, ""]);
  };

  const removeImage = (idx) => {
    if (images.length <= 1) return; // keep at least 1
    update(images.filter((_, i) => i !== idx));
    setBrokenImages((prev) => {
      const p = { ...prev };
      delete p[idx];
      return p;
    });
  };

  const moveUp = (idx) => {
    if (idx === 0) return;
    const next = [...images];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    update(next);
  };

  const moveDown = (idx) => {
    if (idx === images.length - 1) return;
    const next = [...images];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    update(next);
  };

  const getUrlStatus = (url) => {
    if (!url || !url.trim()) return "empty";
    if (!URL_REGEX.test(url.trim())) return "invalid";
    // Check for exact duplicates
    if (images.filter((u) => u.trim() === url.trim()).length > 1) return "duplicate";
    return "valid";
  };

  const borderClass = (status) => {
    switch (status) {
      case "empty": return "border-slate-200 dark:border-slate-700";
      case "invalid": return "border-rose-400";
      case "duplicate": return "border-amber-400";
      default: return "border-emerald-400";
    }
  };

  const statusMsg = (status) => {
    switch (status) {
      case "invalid": return "URL inválida (debe iniciar con https:// o seleccionar un archivo)";
      case "duplicate": return "URL/Imagen duplicada";
      default: return null;
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
        Pega URLs de fotos o selecciona imágenes de tu almacenamiento. Mínimo 1, máximo {maxImages}.
      </p>

      {images.map((url, idx) => {
        const status = getUrlStatus(url);
        const isBroken = brokenImages[idx];
        return (
          <div key={idx} className="flex items-start gap-2">
            {/* Thumbnail */}
            <div className="w-14 h-10 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
              {url && URL_REGEX.test(url) && !isBroken ? (
                <img
                  src={url}
                  alt={`Preview ${idx + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={() => setBrokenImages((prev) => ({ ...prev, [idx]: true }))}
                />
              ) : isBroken ? (
                <div className="flex flex-col items-center justify-center text-rose-400 text-[9px] px-1 text-center">
                  <ImageOff className="w-3.5 h-3.5 mb-0.5" />
                  <span>Error</span>
                </div>
              ) : (
                <div className="w-6 h-6 text-slate-300">
                  <ImageOff className="w-full h-full" />
                </div>
              )}
            </div>

            {/* URL input and File picker */}
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => handleUrlChange(idx, e.target.value)}
                  placeholder="https://example.com/foto.jpg o subir archivo"
                  className={`flex-1 w-full bg-slate-50 dark:bg-slate-900/50 border rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none transition-colors ${borderClass(status)}`}
                />
                <button
                  type="button"
                  onClick={() => triggerFileInput(idx)}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Subir
                </button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(idx, e)}
                  ref={(el) => (fileInputRefs.current[idx] = el)}
                  className="hidden"
                />
              </div>
              {statusMsg(status) && (
                <p className={`text-[10px] font-medium ${status === "duplicate" ? "text-amber-600" : "text-rose-600"}`}>
                  {statusMsg(status)}
                </p>
              )}
            </div>

            {/* Order buttons */}
            <div className="flex flex-col gap-0.5 shrink-0">
              <button
                type="button"
                onClick={() => moveUp(idx)}
                disabled={idx === 0}
                className="p-1 rounded text-slate-400 hover:text-brand-600 hover:bg-brand-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Mover arriba"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => moveDown(idx)}
                disabled={idx === images.length - 1}
                className="p-1 rounded text-slate-400 hover:text-brand-600 hover:bg-brand-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Mover abajo"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Remove button */}
            <button
              type="button"
              onClick={() => removeImage(idx)}
              disabled={images.length <= 1}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
              title="Quitar foto"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      })}

      <button
        type="button"
        onClick={addImage}
        disabled={images.length >= maxImages}
        className="mt-1 flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Agregar foto {images.length >= maxImages ? `(máximo ${maxImages})` : ""}
      </button>
    </div>
  );
}
