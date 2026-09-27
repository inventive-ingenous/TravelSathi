/**
 * Experience image. Shows the experience's photo (`image`) when it has one, otherwise a neutral
 * placeholder drawn inline as an SVG data URI, so nothing is fetched from an outside service and
 * it also works offline.
 */
const escapeXml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const placeholder = (label: string) => {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FDE7D3"/><stop offset="1" stop-color="#F6C3D3"/></linearGradient></defs>` +
    `<rect width="400" height="260" fill="url(#g)"/>` +
    `<text x="200" y="136" text-anchor="middle" font-family="system-ui, sans-serif" font-size="16" fill="#6B4A55">${escapeXml(label.slice(0, 40))}</text>` +
    `</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

export function SceneArt({ image, className = '', alt = '' }: { image?: string; className?: string; alt?: string }) {
  const imgSrc = image || placeholder(alt || 'Experience');
  return <img src={imgSrc} alt={alt} className={`h-full w-full object-cover ${className}`} />;
}
