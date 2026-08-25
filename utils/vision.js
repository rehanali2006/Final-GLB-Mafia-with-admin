

const VISION_API_URL = "https://vision.googleapis.com/v1/files:annotate";
const MAX_PAGES = 5;
const MAX_KEYWORDS = 15;


const STOPWORDS = new Set([
  "the","and","for","are","but","not","you","all","can","her","was","one","our","out",
  "day","get","has","him","his","how","man","new","now","old","see","two","way","who",
  "boy","did","its","let","put","say","she","too","use","this","that","with","from",
  "your","have","more","will","home","when","also","been","were","what","which","their",
  "about","into","than","them","then","these","some","such","only","over","after","most",
  "other","would","could","should","there","where","being","during","between","through",
  "each","both","those","above","below","again","further","because","while","before",
  "unit","chapter","page","department","university","college","institute","student",
  "students","semester","exam","examination","question","questions","paper","subject",
  "section","branch","year","note","notes","assignment","syllabus","www","com","http",
  "https","pdf","www.","fig","figure","table","www","aktu","glb",
]);


async function fetchAsBase64(fileUrl) {
  const response = await fetch(fileUrl);
  if (!response.ok) {
    throw new Error(`Failed to download file for analysis (HTTP ${response.status})`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer).toString("base64");
}

function extractKeywords(text, limit = MAX_KEYWORDS) {
  const freq = new Map();
  const words = (text.toLowerCase().match(/[a-z]{3,}/g) || []);

  for (const word of words) {
    if (STOPWORDS.has(word)) continue;
    freq.set(word, (freq.get(word) || 0) + 1);
  }

  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}

/**
 * Run Google Cloud Vision DOCUMENT_TEXT_DETECTION on a PDF URL and return
 * extracted text + derived keywords.
 *
 * @param {string} fileUrl - Publicly accessible PDF URL (e.g. Cloudinary URL).
 * @returns {Promise<{text: string, keywords: string[]} | null>} null when
 *          Vision isn't configured (no API key) -- treated as "skipped", not an error.
 */
async function analyzePdf(fileUrl) {
  const apiKey = process.env.GOOGLE_VISION_API_KEY;
  if (!apiKey) {
    return null; 
  }

  const base64Content = await fetchAsBase64(fileUrl);

  const requestBody = {
    requests: [
      {
        inputConfig: {
          content: base64Content,
          mimeType: "application/pdf",
        },
        features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
        pages: Array.from({ length: MAX_PAGES }, (_, i) => i + 1), // pages 1-5
      },
    ],
  };

  const response = await fetch(`${VISION_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const apiMessage = data?.error?.message || `HTTP ${response.status}`;
    throw new Error(`Vision API error: ${apiMessage}`);
  }

  const perPageResponses = data?.responses?.[0]?.responses || [];

  let fullText = "";
  for (const page of perPageResponses) {
    if (page?.error) continue; 
    fullText += (page?.fullTextAnnotation?.text || "") + "\n";
  }

  const keywords = extractKeywords(fullText);

  return {
    text: fullText.trim().slice(0, 3000), 
    keywords,
  };
}

module.exports = { analyzePdf, extractKeywords };
