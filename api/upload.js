// Serverless Function for Vercel / Node.js (Hides API Key from Client)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.IMGBB_API_KEY || process.env.VITE_IMGBB_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'IMGBB_API_KEY not configured on server' });
  }

  try {
    const formData = new FormData();
    const blob = new Blob([req.body], { type: req.headers['content-type'] || 'image/jpeg' });
    formData.append('image', blob);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    if (data && data.data && (data.data.display_url || data.data.url)) {
      return res.status(200).json({ url: data.data.display_url || data.data.url });
    }

    return res.status(500).json({ error: 'Failed to upload image to ImgBB' });
  } catch (error) {
    console.error('Serverless upload error:', error);
    return res.status(500).json({ error: error.message });
  }
}
