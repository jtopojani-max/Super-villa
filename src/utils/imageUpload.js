const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const COMPRESSION_THRESHOLD_BYTES = 1024 * 1024;
const MAX_DIMENSION = 1200;
const IMAGE_QUALITY = 0.85;

export const isValidImageUrl = (value) => {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized) return false;

  try {
    const parsed = new URL(normalized);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const sanitizeFileName = (name) => {
  const normalized = String(name || "")
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "");

  return normalized || "image";
};

const getMimeType = (file) => {
  if (["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return file.type;
  }

  return "image/jpeg";
};

const getExtensionForMimeType = (mimeType) => {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
};

const replaceExtension = (fileName, extension) => {
  if (!fileName.includes(".")) return `${fileName}.${extension}`;
  return fileName.replace(/\.[^.]+$/, `.${extension}`);
};

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => resolve({ image, objectUrl });
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Nuk u arrit te lexohet fotoja e zgjedhur."));
    };

    image.src = objectUrl;
  });

export const validateImageFile = (file) => {
  if (!file) {
    throw new Error("Zgjidh nje foto per ta ngarkuar.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Lejohen vetem skedare foto.");
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("Fotoja duhet te jete maksimumi 5 MB.");
  }
};

export const prepareImageForUpload = async (file) => {
  validateImageFile(file);

  if (file.size <= COMPRESSION_THRESHOLD_BYTES) {
    return file;
  }

  const { image, objectUrl } = await loadImage(file);

  try {
    const longestSide = Math.max(image.width, image.height) || 1;
    const scale = Math.min(1, MAX_DIMENSION / longestSide);
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Shfletuesi nuk mbeshtet perpunimin e fotos.");
    }

    canvas.width = width;
    canvas.height = height;
    context.drawImage(image, 0, 0, width, height);

    const mimeType = getMimeType(file);
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (nextBlob) => {
          if (nextBlob) resolve(nextBlob);
          else reject(new Error("Nuk u arrit te kompresohet fotoja."));
        },
        mimeType,
        mimeType === "image/png" ? undefined : IMAGE_QUALITY
      );
    });

    const sanitizedName = sanitizeFileName(file.name);
    const nextName =
      mimeType === file.type
        ? sanitizedName
        : replaceExtension(sanitizedName, getExtensionForMimeType(mimeType));

    return new File([blob], nextName, {
      type: mimeType,
      lastModified: Date.now(),
    });
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Nuk u arrit te pergatitet fotoja per upload.");
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

export const buildUserPostImagePath = (uid, fileName) =>
  `users/${uid}/posts/${Date.now()}_${sanitizeFileName(fileName)}`;
