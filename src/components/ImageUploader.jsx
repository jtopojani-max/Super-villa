import { useEffect, useMemo, useRef, useState } from "react";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../firebase.js";
import {
  buildUserPostImagePath,
  isValidImageUrl,
  prepareImageForUpload,
  validateImageFile,
} from "../utils/imageUpload.js";
import { Icon } from "./Shared.jsx";

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
  label = "Fotot e prones",
  uid,
  values = [],
  onChange,
  onUploadingChange,
  maxFiles = 10,
}) {
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
    if (uploadError?.code === "storage/canceled") {
      return;
    }

    console.error("Image upload failed:", uploadError);
    setError("Nuk u arrit te ngarkohet nje nga fotot. Provo perseri.");
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
          const nextProgress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setProgress(nextProgress);
        },
        (uploadError) => reject(uploadError),
        async () => {
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(url);
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
      setError("Prit sa te perfundoje upload-i aktual.");
      return;
    }

    if (!uid) {
      setError("Duhet te jeni i kycur per te ngarkuar foto.");
      return;
    }

    if (imageValues.length + uploadingItems.length + files.length > maxFiles) {
      setError(`Mund te shtosh maksimumi ${maxFiles} foto.`);
      return;
    }

    try {
      files.forEach((file) => validateImageFile(file));
    } catch (validationError) {
      setError(validationError instanceof Error ? validationError.message : "Skedari nuk eshte valid.");
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
      setError("Prit sa te perfundoje upload-i aktual.");
      return;
    }
    if (!canAddMore) {
      setError(`Mund te shtosh maksimumi ${maxFiles} foto.`);
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
      setError("Vendos nje link te fotos.");
      return;
    }

    if (!isValidImageUrl(normalizedUrl)) {
      setError("Vendos nje link valid te fotos (http/https).");
      return;
    }

    if (imageValues.length >= maxFiles) {
      setError(`Mund te shtosh maksimumi ${maxFiles} foto.`);
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
      <label>{label}</label>

      <div className="image-uploader__topbar">
        <span className="image-uploader__count">{imageValues.length}/{maxFiles} foto</span>
        <span className="image-uploader__cover-hint">Fotoja e pare perdoret si cover.</span>
      </div>

      <div className="image-uploader__toggle" role="tablist" aria-label="Menyra e fotos">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "upload"}
          className={`image-uploader__toggle-btn ${mode === "upload" ? "is-active" : ""}`}
          onClick={() => handleModeChange("upload")}
        >
          Upload photos
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "url"}
          className={`image-uploader__toggle-btn ${mode === "url" ? "is-active" : ""}`}
          onClick={() => handleModeChange("url")}
        >
          Use URL
        </button>
      </div>

      {galleryItems.length > 0 && (
        <div className="image-uploader__gallery">
          {galleryItems.map((item, index) => (
            <div key={item.id} className={`image-uploader__thumb ${item.type === "uploading" ? "is-uploading" : ""}`}>
              <img src={item.url} alt={`Foto ${index + 1}`} className="image-uploader__thumb-image" />
              <div className="image-uploader__thumb-overlay">
                <span className="image-uploader__thumb-index">{index === 0 ? "Cover" : `${index + 1}`}</span>
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
          aria-label="Zgjidh foto nga pajisja"
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
          <strong className="image-uploader__dropzone-title">Zvarrit deri ne 10 foto ketu</strong>
          <p className="image-uploader__dropzone-copy">ose perdor butonin me poshte per t&apos;i marre direkt nga pajisja.</p>

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
              <Icon n="image" /> Zgjidh foto nga pajisja
            </button>
            <span className="image-uploader__meta">Vetem image/*, maksimumi 5 MB secila. Mbi 1 MB kompresohet automatikisht.</span>
          </div>

          {uploading && (
            <div className="image-uploader__progress">
              <div className="image-uploader__progress-head">
                <span>{activeUploadName ? `Duke ngarkuar: ${activeUploadName}` : "Duke ngarkuar..."}</span>
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
              <Icon n="plus" /> Shto
            </button>
          </div>
          <p className="image-uploader__meta">Mund te shtosh deri ne 10 linke, nje nga nje.</p>
        </div>
      )}

      {error && <p className="auth-server-error image-uploader__error">{error}</p>}
    </div>
  );
}
