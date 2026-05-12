import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.join('public', 'newsletter', 'assets');

const buttons = [
  // Dark buttons (navy fill, white text)
  { name: 'btn-dark-130-lehirashem',    text: 'להרשמה',              w: 130, h: 36, fill: '#0f3555', color: '#ffffff', border: null },
  { name: 'btn-dark-180-index',         text: 'לאינדקס הפעילויות',  w: 180, h: 36, fill: '#0f3555', color: '#ffffff', border: null },
  { name: 'btn-dark-190-seminars',      text: 'לרשימת הסמינרים',    w: 190, h: 36, fill: '#0f3555', color: '#ffffff', border: null },
  { name: 'btn-dark-220-details-reg',   text: 'לפרטים והרשמה',              w: 220, h: 36, fill: '#0f3555', color: '#ffffff', border: null },
  { name: 'btn-dark-190-membership',   text: 'חברות בלשכת המהנדסים',       w: 190, h: 36, fill: '#0f3555', color: '#ffffff', border: null },
  { name: 'btn-dark-250-cta',           text: 'לפרטים ורישום',             w: 250, h: 40, fill: '#0f3555', color: '#ffffff', border: null },
  // Light buttons (light blue fill, navy text, border)
  { name: 'btn-light-130-details',      text: 'לפרטים',             w: 130, h: 36, fill: '#eef5fa', color: '#0f3555', border: '#d1dfe9' },
  { name: 'btn-light-130-site',         text: 'לאתר הלשכה',        w: 130, h: 36, fill: '#eef5fa', color: '#0f3555', border: '#d1dfe9' },
  { name: 'btn-light-160-shachar',     text: 'חברות במועדון שחר',  w: 160, h: 36, fill: '#eef5fa', color: '#0f3555', border: '#d1dfe9' },
];

function makeSvg({ text, w, h, fill, color, border }) {
  const rx = h / 2;
  const fontSize = h >= 40 ? 16 : 15;
  const strokeEl = border
    ? `<rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="${rx}" ry="${rx}" fill="${fill}" stroke="${border}" stroke-width="1"/>`
    : `<rect x="0" y="0" width="${w}" height="${h}" rx="${rx}" ry="${rx}" fill="${fill}"/>`;

  // Use dy to ensure vertical centering across librsvg versions
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  ${strokeEl}
  <text
    x="${w / 2}"
    y="${h / 2}"
    dy="0.35em"
    text-anchor="middle"
    font-family="Arial, sans-serif"
    font-size="${fontSize}"
    font-weight="700"
    fill="${color}"
    direction="rtl"
  >${text}</text>
</svg>`;
}

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

for (const btn of buttons) {
  const svg = makeSvg(btn);
  const outPath = path.join(OUTPUT_DIR, btn.name + '.png');
  await sharp(Buffer.from(svg)).png().toFile(outPath);
  console.log(`✓ ${btn.name}.png`);
}

console.log('All button images generated.');
