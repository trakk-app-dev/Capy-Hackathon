// Mock storage layer — uses URL.createObjectURL(). Object URLs are session-only (don't persist on reload).
// To restore: git checkout src/lib/storage.ts

export async function uploadImage(
  _uid: string,
  file: File,
  _folder: 'context' | 'proof'
): Promise<string> {
  let fileToUpload: File | Blob = file;
  if (file.size > 5 * 1024 * 1024) {
    fileToUpload = await compressImage(file);
  }
  return URL.createObjectURL(fileToUpload);
}

export async function uploadMultipleImages(
  uid: string,
  files: File[],
  folder: 'context' | 'proof'
): Promise<string[]> {
  return Promise.all(files.map((f) => uploadImage(uid, f, folder)));
}

async function compressImage(file: File, maxSizeBytes = 5 * 1024 * 1024): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      const maxDim = 2048;
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Could not get canvas context')); return; }
      ctx.drawImage(img, 0, 0, width, height);
      let quality = 0.8;
      const tryCompress = () => {
        canvas.toBlob((blob) => {
          if (!blob) { reject(new Error('Compression failed')); return; }
          if (blob.size <= maxSizeBytes || quality <= 0.3) { resolve(blob); }
          else { quality -= 0.1; tryCompress(); }
        }, 'image/jpeg', quality);
      };
      tryCompress();
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')); };
    img.src = url;
  });
}
