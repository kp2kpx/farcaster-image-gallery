/*
 * Image Gallery Mini App
 *
 * This script fetches a user's previous casts from the Farcaster network and
 * extracts images embedded in those casts. It uses the Mini App SDK to
 * determine the user's fid (Farcaster ID) from the session context. It then
 * calls the Neynar hub API to retrieve the user's casts, searching for
 * `.png`, `.jpg`, `.jpeg`, `.gif` and `.webp` images either in the cast's
 * embeds array or directly in the text. The resulting image URLs are shown
 * as a simple gallery on the page.
 *
 * To make this work you need a Neynar API key. Create an account at
 * https://neynar.com and replace the placeholder below with your API key.
 */

//  const NEYNAR_API_KEY = 'NEYNAR_FROG_FM';
const NEYNAR_API_KEY = 'NEYNAR_FROG_FM';
 sts for a given fid via the Neynar hub API.
 *
 * @param {number} fid The Farcaster ID of the user.
 * @returns {Promise<Array>} An array of cast messages.
 */
async function fetchCasts(fid) {
  const endpoint = `https://hub-api.neynar.com/v1/castsByFid?fid=${fid}&pageSize=1000`;
  const response = await fetch(endpoint, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      // Neynar accepts either `api_key` or `x-api-key` header names
      'api_key': NEYNAR_API_KEY,
      'x-api-key': NEYNAR_API_KEY
    }
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch casts: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data.messages ?? [];
}

/**
 * Extracts image URLs from a single cast message.
 *
 * @param {object} message A cast message returned by the Neynar API.
 * @returns {string[]} An array of image URL strings.
 */
function extractImagesFromCast(message) {
  const images = [];
  const castBody = message?.data?.castAddBody ?? {};
  // Extract images from the embeds array (each embed may be a URL or an object)
  if (Array.isArray(castBody.embeds)) {
    castBody.embeds.forEach((embed) => {
      if (typeof embed === 'string') {
        if (/\.(png|jpe?g|gif|webp)$/i.test(embed)) {
          images.push(embed);
        }
      } else if (embed && typeof embed.url === 'string') {
        const url = embed.url;
        if (/\.(png|jpe?g|gif|webp)$/i.test(url)) {
          images.push(url);
        }
      }
    });
  }
  // Extract images from the text using a regex
  const text = castBody.text ?? '';
  const regex = /(https?:\/\/\S+\.(?:png|jpe?g|gif|webp))/gi;
  const matches = text.match(regex);
  if (matches) {
    images.push(...matches);
  }
  return images;
}

/**
 * Fetches all images from a user's casts.
 *
 * @param {number} fid The Farcaster ID of the user.
 * @returns {Promise<string[]>} A list of image URLs.
 */
async function fetchUserImages(fid) {
  const messages = await fetchCasts(fid);
  const allImages = [];
  messages.forEach((msg) => {
    const imgs = extractImagesFromCast(msg);
    allImages.push(...imgs);
  });
  // Deduplicate images
  return Array.from(new Set(allImages));
}

/**
 * Initializes the mini app: obtains the user's fid, fetches their images,
 * and renders them to the DOM.
 */
async function init() {
  const statusEl = document.getElementById('status');
  const galleryEl = document.getElementById('gallery');
  try {
    // Wait for the SDK to signal readiness
    await sdk.ready();
    const context = sdk.context;
    const fid = context?.user?.fid;
    if (!fid) {
      statusEl.innerText = 'Unable to determine your Farcaster ID. Please try again inside Farcaster.';
      return;
    }
    statusEl.innerText = 'Fetching your images...';
    const images = await fetchUserImages(fid);
    if (images.length === 0) {
      statusEl.innerText = 'No images were found in your casts.';
      return;
    }
    statusEl.innerText = '';
    images.forEach((url) => {
      const img = document.createElement('img');
      img.src = url;
      img.alt = 'Cast image';
      img.className = 'cast-image';
      galleryEl.appendChild(img);
    });
  } catch (error) {
    console.error(error);
    statusEl.innerText = 'An error occurred while loading images.';
  }
}

// Bootstrap the mini app when the document is ready
document.addEventListener('DOMContentLoaded', () => {
  init();
});
