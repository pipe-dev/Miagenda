/**
 * Media Upload Service (100% Free Cloud Image Hosting & Local Audio)
 * - Uploads media to free ImgBB CDN (via serverless /api/upload or direct client)
 * - Returns lightweight HTTPS CDN URLs to save in Firestore documents
 * - Pre-optimizes images on client before uploading to save mobile data & speed up transfer
 * - Zero Google Cloud Storage usage / 100% Free
 */

// Client-side quick compressor to speed up upload transfer and reduce payload size
const optimizeImageForUpload = (file: File | Blob, maxDimension = 1400, quality = 0.85): Promise<Blob> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              resolve(blob || file);
            },
            'image/jpeg',
            quality
          );
        } else {
          resolve(file);
        }
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
};

/**
 * Upload image to Free ImgBB Hosting
 * Returns direct CDN image URL
 */
export const uploadImageToCloud = async (file: File | Blob): Promise<string> => {
  const optimizedBlob = await optimizeImageForUpload(file);

  // 1. Try secure Serverless endpoint (Zero Client API Key exposure)
  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: optimizedBlob,
      headers: { 'Content-Type': 'image/jpeg' }
    });
    if (res.ok) {
      const json = await res.json();
      if (json && json.url) return json.url;
    }
  } catch (_) {
    // Serverless endpoint not present in pure static mode, proceed to client fallback
  }

  // 2. Try ImgBB API directly if API key is provided in .env
  const imgbbApiKey = import.meta.env.VITE_IMGBB_API_KEY;
  if (imgbbApiKey) {
    try {
      const formData = new FormData();
      formData.append('image', optimizedBlob);
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data && data.data && data.data.url) {
        return data.data.display_url || data.data.url;
      }
    } catch (e) {
      console.warn('[ImgBB Upload Warning]:', e);
    }
  }

  // 3. Fallback: Compact Data URL
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(optimizedBlob);
  });
};

/**
 * Upload Audio Note
 * Returns Data URL (100% Free, zero external storage)
 */
export const uploadAudioToCloud = async (audioBlob: Blob): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(audioBlob);
  });
};
