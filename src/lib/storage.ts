import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Upload an image file to Firebase Storage and return the download URL.
 * @param uid - User's Firebase UID
 * @param file - The image File object
 * @param folder - 'context' for assignment context images, 'proof' for proof images
 * @returns The public download URL for the uploaded image
 */
export async function uploadImage(
  uid: string,
  file: File,
  folder: 'context' | 'proof'
): Promise<string> {
  // Compress if over 5MB
  let fileToUpload: File | Blob = file;
  if (file.size > 5 * 1024 * 1024) {
    fileToUpload = await compressImage(file);
  }

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `users/${uid}/${folder}/${timestamp}_${safeName}`;
  const storageRef = ref(storage, path);

  // Set contentType explicitly so the upload always satisfies the Storage
  // rules' image/* check — some files arrive with an empty File.type (picked by
  // extension), which would otherwise default to application/octet-stream and be
  // rejected with permission-denied.
  await uploadBytes(storageRef, fileToUpload, {
    contentType: fileToUpload.type || file.type || 'image/jpeg',
  });
  const downloadURL = await getDownloadURL(storageRef);

  return downloadURL;
}

/**
 * Upload multiple images and return all download URLs.
 */
export async function uploadMultipleImages(
  uid: string,
  files: File[],
  folder: 'context' | 'proof'
): Promise<string[]> {
  const urls = await Promise.all(files.map((file) => uploadImage(uid, file, folder)));
  return urls;
}

/**
 * Compress an image to fit under 5MB using canvas.
 * Reduces quality and/or dimensions progressively.
 */
async function compressImage(file: File, maxSizeBytes = 5 * 1024 * 1024): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const canvas = document.createElement('canvas');
      let { width, height } = img;

      // Scale down if very large
      const maxDim = 2048;
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Try progressively lower quality
      let quality = 0.8;
      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Compression failed'));
              return;
            }
            if (blob.size <= maxSizeBytes || quality <= 0.3) {
              resolve(blob);
            } else {
              quality -= 0.1;
              tryCompress();
            }
          },
          'image/jpeg',
          quality
        );
      };

      tryCompress();
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for compression'));
    };

    img.src = url;
  });
}
