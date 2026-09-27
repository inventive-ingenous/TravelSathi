import { CATEGORY_META } from '../data/experiences';
import type { Category, Experience } from './types';
import { HOTEL_COORDS, getExperienceCoords, type LatLng } from './geo';

declare global {
  interface Window {
    google?: any;
    initGoogleMapsCallback?: () => void;
  }
}

let loadPromise: Promise<any | null> | null = null;

export function loadGoogleMapsScript(apiKey: string): Promise<any | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve) => {
    // If script tag already exists
    const existing = document.querySelector<HTMLScriptElement>('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existing) {
      if (window.google?.maps) {
        resolve(window.google.maps);
        return;
      }
      const interval = setInterval(() => {
        if (window.google?.maps) {
          clearInterval(interval);
          resolve(window.google.maps);
        }
      }, 50);
      setTimeout(() => {
        clearInterval(interval);
        resolve(window.google?.maps || null);
      }, 5000);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.maps) {
        resolve(window.google.maps);
      } else {
        resolve(null);
      }
    };
    script.onerror = (e) => {
      console.warn('Google Maps script failed to load:', e);
      resolve(null);
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}

export function createHotelMarkerIcon() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 36 46">
      <defs>
        <filter id="hshad" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.35"/>
        </filter>
      </defs>
      <path d="M18 44 C18 44 33 28 33 17 A15 15 0 0 0 3 17 C3 28 18 44 18 44 Z" fill="#0B1433" stroke="#FFFFFF" stroke-width="2" filter="url(#hshad)"/>
      <rect x="11" y="9" width="14" height="14" rx="3" fill="#FFFFFF" fill-opacity="0.2"/>
      <text x="18" y="21" font-family="Plus Jakarta Sans, system-ui, sans-serif" font-size="13" font-weight="800" fill="#FFFFFF" text-anchor="middle">H</text>
    </svg>
  `;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new window.google.maps.Size(36, 46),
    anchor: new window.google.maps.Point(18, 44),
  };
}

export function createExperienceMarkerIcon({
  category,
  indexInRoute,
  isSelected,
  isDimmed,
}: {
  category: Category;
  indexInRoute?: number;
  isSelected?: boolean;
  isDimmed?: boolean;
}) {
  const tone = CATEGORY_META[category]?.tone || '#F2711C';
  const bgColor = isSelected ? '#0B1433' : tone;
  const strokeColor = isSelected ? '#F2711C' : '#FFFFFF';
  const strokeWidth = isSelected ? '2.5' : '1.8';
  const opacity = isDimmed ? '0.4' : '1';
  const scale = isSelected ? 1.25 : 1;
  const w = Math.round(36 * scale);
  const h = Math.round(46 * scale);
  const anchorY = Math.round(44 * scale);

  const label = typeof indexInRoute === 'number' ? String(indexInRoute + 1) : CATEGORY_META[category]?.emoji || '•';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 36 46" opacity="${opacity}">
      <defs>
        <filter id="eshad" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" flood-color="#000" flood-opacity="0.38"/>
        </filter>
      </defs>
      <path d="M18 44 C18 44 33 28 33 17 A15 15 0 0 0 3 17 C3 28 18 44 18 44 Z" fill="${bgColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" filter="url(#eshad)"/>
      <circle cx="18" cy="17" r="11" fill="${isSelected ? '#1B2446' : 'rgba(255,255,255,0.18)'}" />
      <text x="18" y="21.5" font-family="Plus Jakarta Sans, system-ui, sans-serif" font-size="${typeof indexInRoute === 'number' ? '13' : '12'}" font-weight="800" fill="#FFFFFF" text-anchor="middle">${label}</text>
    </svg>
  `;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new window.google.maps.Size(w, h),
    anchor: new window.google.maps.Point(w / 2, anchorY),
  };
}

export function createTravelerMarkerIcon() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="14" fill="#3B82F6" fill-opacity="0.28" />
      <circle cx="16" cy="16" r="7" fill="#3B82F6" stroke="#FFFFFF" stroke-width="2.5" />
    </svg>
  `;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new window.google.maps.Size(32, 32),
    anchor: new window.google.maps.Point(16, 16),
  };
}

export function createLegBadgeIcon(text: string) {
  const w = Math.max(52, text.length * 8 + 18);
  const h = 24;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      <rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="11" fill="#0B1433" stroke="#FFFFFF" stroke-width="1.5" />
      <text x="${w / 2}" y="15.5" font-family="Plus Jakarta Sans, system-ui, sans-serif" font-size="11" font-weight="700" fill="#FFFFFF" text-anchor="middle">${text}</text>
    </svg>
  `;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new window.google.maps.Size(w, h),
    anchor: new window.google.maps.Point(w / 2, h / 2),
  };
}

export function renderInfoWindowContent(exp: Experience, onSelectId?: string): string {
  const meta = CATEGORY_META[exp.category];
  return `
    <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; padding: 4px; max-width: 240px; color: #0b1433;">
      <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
        <span style="font-size: 11px; font-weight: 700; background: ${meta?.tone || '#F2711C'}18; color: ${meta?.tone || '#F2711C'}; padding: 2px 7px; border-radius: 999px;">
          ${meta?.emoji || ''} ${meta?.label || exp.category}
        </span>
        <span style="font-size: 11px; font-weight: 700; color: #71717a; margin-left: auto;">
          ★ ${exp.rating} (${exp.reviews})
        </span>
      </div>
      <div style="font-size: 14px; font-weight: 700; line-height: 1.25; margin-bottom: 4px;">
        ${exp.title}
      </div>
      <div style="font-size: 12px; color: #71717a; margin-bottom: 8px;">
        ${exp.area} · ₹${exp.price}
      </div>
      <button
        onclick="window.dispatchEvent(new CustomEvent('anvesha:select-exp', { detail: '${exp.id}' }))"
        style="width: 100%; border: none; background: #0B1433; color: white; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer;"
      >
        View Experience
      </button>
    </div>
  `;
}
