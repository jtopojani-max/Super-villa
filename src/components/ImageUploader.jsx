import { useEffect, useMemo, useRef, useState } from "react";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../firebase.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import {
  buildUserPostImagePath,
  isValidImageUrl,
  prepareImageForUpload,
  validateImageFile,
} from "../utils/imageUpload.js";
import { Icon } from "./Shared.jsx";

const COPY = {
  sq: {
    label: "Fotot e prones",
    modeLabel: "Menyra e fotos",
    uploadTab: "Ngarko foto",
    urlTab: "Perdor URL",
    count: (current, max) => `${current}/${max} foto`,
    coverHint: "Fotoja e pare perdoret si cover.",
    uploadInProgress: "Prit sa te perfundoje upload-i aktual.",
    loginRequired: "Duhet te jeni i kycur per te ngarkuar foto.",
    maxFiles: (max) => `Mund te shtosh maksimumi ${max} foto.`,
    invalidFile: "Skedari nuk eshte valid.",
    uploadError: "Nuk u arrit te ngarkohet nje nga fotot. Provo perseri.",
    missingUrl: "Vendos nje link te fotos.",
    invalidUrl: "Vendos nje link valid te fotos (http/https).",
    browseAria: "Zgjidh foto nga pajisja",
    dropTitle: (max) => `Zvarrit deri ne ${max} foto ketu`,
    dropCopy: "ose perdor butonin me poshte per t'i marre direkt nga pajisja.",
    browseButton: "Zgjidh foto nga pajisja",
    meta: "Vetem image/*, maksimumi 5 MB secila. Mbi 1 MB kompresohet automatikisht.",
    uploading: "Duke ngarkuar...",
    uploadingFile: (name) => `Duke ngarkuar: ${name}`,
    add: "Shto",
    urlMeta: (max) => `Mund te shtosh deri ne ${max} linke, nje nga nje.`,
    cover: "Cover",
    imageAlt: (index) => `Foto ${index}`,
  },
  en: {
    label: "Property photos",
    modeLabel: "Photo mode",
    uploadTab: "Upload photos",
    urlTab: "Use URL",
    count: (current, max) => `${current}/${max} photos`,
    coverHint: "The first photo is used as the cover.",
    uploadInProgress: "Please wait for the current upload to finish.",
    loginRequired: "You must be logged in to upload photos.",
    maxFiles: (max) => `You can add a maximum of ${max} photos.`,
    invalidFile: "The selected file is not valid.",
    uploadError: "Could not upload one of the photos. Please try again.",
    missingUrl: "Enter an image URL.",
    invalidUrl: "Enter a valid image URL (http/https).",
    browseAria: "Choose photos from device",
    dropTitle: (max) => `Drag up to ${max} photos here`,
    dropCopy: "or use the button below to pick them directly from your device.",
    browseButton: "Choose photos from device",
    meta: "Only image/* files, up to 5 MB each. Files over 1 MB are compressed automatically.",
    uploading: "Uploading...",
    uploadingFile: (name) => `Uploading: ${name}`,
    add: "Add",
    urlMeta: (max) => `You can add up to ${max} links, one at a time.`,
    cover: "Cover",
    imageAlt: (index) => `Image ${index}`,
  },
};

const normalizeValues = (values) => {
  if (Array.isArray(values)) {
    return values.filter((value) => typeof value === "string" && value.trim()).map((value) => value.trim());
  }

  if (typeof values === "string" && values.trim()) {
    return [values.trim()];
  }

  return [];
};

const buildUploadItem = (file) => ({
  id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  name: file.name,
  previewUrl: URL.createObjectURL(file),
});

export default function ImageUploader({
  className = "",
  label,
  uid,
  values = [],
  onChange,
  onUploadingChange,
  maxFiles = 10,
}) {
  const { lang } = useLanguage();
  const copy = COPY[lang] || COPY.sq;
  const fileInputRef = useRef(null);
  const uploadTaskRef = useRef(null);
  const mountedRef = useRef(true);
  const currentValuesRef = useRef(normalizeValues(values));
  const uploadingItemsRef = useRef([]);
  const [mode, setMode] = useState("upload");
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [activeUploadName, setActiveUploadName] = useState("");
  const [uploadingItems, setUploadingItems] = useState([]);
  const [recentUploads, setRecentUploads] = useState([]);

  const imageValues = useMemo(() => normalizeValues(values).slice(0, maxFiles), [maxFiles, values]);

  useEffect(() => {
    onUploadingChange?.(uploading);
  }, [onUploadingChange, uploading]);

  useEffect(() => {
    currentValuesRef.current = imageValues;
  }, [imageValues]);

  useEffect(() => {
    uploadingItemsRef.current = uploadingItems;
  }, [uploadingItems]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (uploadTaskRef.current) {
        uploadTaskRef.current.cancel();
        uploadTaskRef.current = null;
      }
      uploadingItemsRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  const canAddMore = imageValues.length + uploadingItems.length < maxFiles;

  const clearUploadingItems = () => {
    setUploadingItems((current) => {
      current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      return [];
    });
  };

  const removeUploadingItem = (itemId) => {
    setUploadingItems((current) => {
      const target = current.find((item) => item.id === itemId);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return current.filter((item) => item.id !== itemId);
    });
  };

  const stopActiveUpload = () => {
    if (uploadTaskRef.current) {
      uploadTaskRef.current.cancel();
      uploadTaskRef.current = null;
    }
    setUploading(false);
    setProgress(0);
    setActiveUploadName("");
  };

  const appendImages = (nextUrls) => {
    const merged = Array.from(new Set([...currentValuesRef.current, ...nextUrls])).slice(0, maxFiles);
    currentValuesRef.current = merged;
    onChange?.(merged);
  };

  const handleRemoveImage = (urlToRemove) => {
    const nextValues = currentValuesRef.current.filter((url) => url !== urlToRemove);
    currentValuesRef.current = nextValues;
    onChange?.(nextValues);
    setRecentUploads((current) => current.filter((url) => url !== urlToRemove));
    setError("");
  };

  const handleUploadError = (uploadError) => {
    if (uploadError?.code === "storage/canceled") return;
    console.error("Image upload failed:", uploadError);
    setError(copy.uploadError);
  };

  const uploadSingleFile = async (file, item) => {
    const preparedFile = await prepareImageForUpload(file);
    const storagePath = buildUserPostImagePath(uid, preparedFile.name);
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, preparedFile, {
      contentType: preparedFile.type,
    });

    uploadTaskRef.current = uploadTask;

    const downloadUrl = await new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          if (!mountedRef.current) return;
          setProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
        },
        (uploadError) => reject(uploadError),
        async () => {
          try {
            resolve(await getDownloadURL(uploadTask.snapshot.ref));
          } catch (downloadError) {
            reject(downloadError);
          }
        }
      );
    });

    uploadTaskRef.current = null;
    appendImages([downloadUrl]);
    setRecentUploads((current) => Array.from(new Set([...current, downloadUrl])));
    removeUploadingItem(item.id);
  };

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    if (uploading) {
      setError(copy.uploadInProgress);
      return;
    }

    if (!uid) {
      setError(copy.loginRequired);
      return;
    }

    if (imageValues.length + uploadingItems.length + files.length > maxFiles) {
      setError(copy.maxFiles(maxFiles));
      return;
    }

    try {
      files.forEach((file) => validateImageFile(file));
    } catch (validationError) {
      setError(validationError instanceof Error ? validationError.message : copy.invalidFile);
      return;
    }

    const nextItems = files.map(buildUploadItem);
    setError("");
    setUploading(true);
    setProgress(0);
    setUploadingItems((current) => [...current, ...nextItems]);

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const item = nextItems[index];

      if (!mountedRef.current) return;
      setActiveUploadName(file.name);

      try {
        await uploadSingleFile(file, item);
      } catch (uploadError) {
        if (uploadError?.code === "storage/canceled") {
          removeUploadingItem(item.id);
          break;
        }

        handleUploadError(uploadError);
        removeUploadingItem(item.id);
      }
    }

    if (!mountedRef.current) return;
    stopActiveUpload();
  };

  const handleBrowse = () => {
    if (uploading) {
      setError(copy.uploadInProgress);
      return;
    }
    if (!canAddMore) {
      setError(copy.maxFiles(maxFiles));
      return;
    }
    fileInputRef.current?.click();
  };

  const handleDropzoneClick = (event) => {
    const interactiveTarget = event.target.closest("button, a, input, label");
    if (interactiveTarget) return;
    handleBrowse();
  };

  const handleFileInputChange = async (event) => {
    await handleFiles(event.target.files);
    event.target.value = "";
  };

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setError("");
    setDragActive(false);

    if (nextMode === "url") {
      stopActiveUpload();
      clearUploadingItems();
    }
  };

  const handleAddUrl = () => {
    const normalizedUrl = urlInput.trim();

    if (!normalizedUrl) {
      setError(copy.missingUrl);
      return;
    }

    if (!isValidImageUrl(normalizedUrl)) {
      setError(copy.invalidUrl);
      return;
    }

    if (imageValues.length >= maxFiles) {
      setError(copy.maxFiles(maxFiles));
      return;
    }

    appendImages([normalizedUrl]);
    setUrlInput("");
    setError("");
  };

  const galleryItems = [
    ...imageValues.map((url, index) => ({
      id: url,
      type: "uploaded",
      url,
      index,
      isRecent: recentUploads.includes(url),
    })),
    ...uploadingItems.map((item) => ({
      id: item.id,
      type: "uploading",
      url: item.previewUrl,
      name: item.name,
    })),
  ];

  return (
    <div className={`${className} image-uploader-field`.trim()}>
      <label>{label || copy.label}</label>

      <div className="image-uploader__topbar">
        <span className="image-uploader__count">{copy.count(imageValues.length, maxFiles)}</span>
        <span className="image-uploader__cover-hint">{copy.coverHint}</span>
      </div>

      <div className="image-uploader__toggle" role="tablist" aria-label={copy.modeLabel}>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "upload"}
          className={`image-uploader__toggle-btn ${mode === "upload" ? "is-active" : ""}`}
          onClick={() => handleModeChange("upload")}
        >
          {copy.uploadTab}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "url"}
          className={`image-uploader__toggle-btn ${mode === "url" ? "is-active" : ""}`}
          onClick={() => handleModeChange("url")}
        >
          {copy.urlTab}
        </button>
      </div>

      {galleryItems.length > 0 && (
        <div className="image-uploader__gallery">
          {galleryItems.map((item, index) => (
            <div key={item.id} className={`image-uploader__thumb ${item.type === "uploading" ? "is-uploading" : ""}`}>
              <img src={item.url} alt={copy.imageAlt(index + 1)} className="image-uploader__thumb-image" />
              <div className="image-uploader__thumb-overlay">
                <span className="image-uploader__thumb-index">{index === 0 ? copy.cover : `${index + 1}`}</span>
                {item.type === "uploaded" ? (
                  <>
                    {item.isRecent && (
                      <span className="image-uploader__thumb-status image-uploader__thumb-status--success">
                        <Icon n="check" />
                      </span>
                    )}
                    <button type="button" className="image-uploader__thumb-remove" onClick={() => handleRemoveImage(item.url)}>
                      <Icon n="xmark" />
                    </button>
                  </>
                ) : (
                  <span className="image-uploader__thumb-status image-uploader__thumb-status--uploading">
                    <Icon n="arrow-up" />
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {mode === "upload" ? (
        <div
          className={`image-uploader__dropzone ${dragActive ? "is-dragging" : ""}`}
          role="button"
          tabIndex={0}
          aria-label={copy.browseAria}
          onClick={handleDropzoneClick}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleBrowse();
            }
          }}
          onDragEnter={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setDragActive(false);
          }}
          onDrop={async (event) => {
            event.preventDefault();
            setDragActive(false);
            await handleFiles(event.dataTransfer.files);
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            className="image-uploader__input"
            onChange={handleFileInputChange}
          />

          <div className="image-uploader__dropzone-icon">
            <Icon n="cloud-arrow-up" />
          </div>
          <strong className="image-uploader__dropzone-title">{copy.dropTitle(maxFiles)}</strong>
          <p className="image-uploader__dropzone-copy">{copy.dropCopy}</p>

          <div className="image-uploader__actions">
            <button
              type="button"
              className="btn btn--primary image-uploader__device-btn"
              disabled={!canAddMore || uploading}
              onClick={(event) => {
                event.stopPropagation();
                handleBrowse();
              }}
            >
              <Icon n="image" /> {copy.browseButton}
            </button>
            <span className="image-uploader__meta">{copy.meta}</span>
          </div>

          {uploading && (
            <div className="image-uploader__progress">
              <div className="image-uploader__progress-head">
                <span>{activeUploadName ? copy.uploadingFile(activeUploadName) : copy.uploading}</span>
                <strong>{progress}%</strong>
              </div>
              <div className="image-uploader__progress-track" aria-hidden="true">
                <span className="image-uploader__progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="image-uploader__url-panel">
          <div className="image-uploader__url-actions">
            <input
              type="url"
              value={urlInput}
              onChange={(event) => {
                setUrlInput(event.target.value);
                setError("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleAddUrl();
                }
              }}
              placeholder="https://images.unsplash.com/..."
            />
            <button type="button" className="btn btn--primary" disabled={imageValues.length >= maxFiles} onClick={handleAddUrl}>
              <Icon n="plus" /> {copy.add}
            </button>
          </div>
          <p className="image-uploader__meta">{copy.urlMeta(maxFiles)}</p>
        </div>
      )}

      {error && <p className="auth-server-error image-uploader__error">{error}</p>}
    </div>
  );
}
