import html2canvas from 'html2canvas';
import type { Match } from '../types';

/**
 * Draws an SVG (by URL) onto an offscreen canvas and returns a PNG data URL.
 * Forces the browser's own SVG renderer to rasterize the flag first,
 * completely bypassing html2canvas's broken SVG support on mobile.
 */
function svgToPng(svgUrl: string, w: number, h: number): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const cvs = document.createElement('canvas');
            cvs.width = w * 3;   // 3× for sharpness
            cvs.height = h * 3;
            const ctx = cvs.getContext('2d');
            if (!ctx) return reject(new Error('No 2d context'));
            ctx.drawImage(img, 0, 0, cvs.width, cvs.height);
            resolve(cvs.toDataURL('image/png'));
        };
        img.onerror = () => reject(new Error(`Failed to load ${svgUrl}`));
        img.src = svgUrl;
    });
}

/**
 * On MOBILE only: replaces every .team-flag <img> with a pre-rasterized PNG.
 * Returns a function that restores all original srcs after the canvas is captured.
 */
async function rasterizeSvgFlags(container: HTMLElement): Promise<() => void> {
    const imgs = Array.from(
        container.querySelectorAll<HTMLImageElement>('img.team-flag')
    );
    const restoreMap: Array<{ img: HTMLImageElement; original: string }> = [];

    await Promise.all(
        imgs.map(async (img) => {
            try {
                const png = await svgToPng(
                    img.src,
                    img.naturalWidth || 24,
                    img.naturalHeight || 16
                );
                restoreMap.push({ img, original: img.src });
                img.src = png;
            } catch {
                // Leave as-is if anything fails — better partial than crash
            }
        })
    );

    return () => restoreMap.forEach(({ img, original }) => { img.src = original; });
}

export const exportBracketToImage = async (
    _matchesList: Match[],
    filename: string = 'wc2026-prediction.jpg'
) => {
    try {
        const wrapperElement = document.getElementById('bracket-export-target');
        const scrollContainer = wrapperElement?.querySelector('.bracket-scroll-container') as HTMLElement;
        const bracketColumns = wrapperElement?.querySelector('.bracket-columns') as HTMLElement;

        if (!wrapperElement || !scrollContainer) throw new Error('Bracket element not found');

        const isMobile = window.innerWidth <= 768;

        // ── Save originals ────────────────────────────────────────────────────
        const origOverflow = scrollContainer.style.overflow;
        const origMaxWidth = wrapperElement.style.maxWidth;
        const origWrapWidth = wrapperElement.style.width;
        const origColWidth = bracketColumns?.style.width ?? '';

        // Measure the true content width BEFORE touching overflow
        const fullWidth = scrollContainer.scrollWidth;
        const fullHeight = scrollContainer.scrollHeight;

        // ── Expand layout for capture ─────────────────────────────────────────
        scrollContainer.style.overflow = 'visible';
        wrapperElement.style.maxWidth = 'none';

        if (isMobile) {
            // Physically widen the wrapper to the bracket's full scrollable width.
            wrapperElement.style.width = `${fullWidth}px`;

            // IMPORTANT: also lock bracket-columns to the same explicit width so that
            // "flex: 1 1 0" columns don't stretch and create giant empty gaps.
            // Setting it to an explicit px == "use exactly this space, don't grow."
            if (bracketColumns) bracketColumns.style.width = `${fullWidth}px`;
        }

        // On mobile: pre-rasterize all SVG flags to PNG so html2canvas renders them properly
        const restoreSvgs = isMobile
            ? await rasterizeSvgFlags(wrapperElement)
            : () => { };

        const exportScale = isMobile ? 1.5 : 2;

        const canvas = await html2canvas(wrapperElement, {
            scale: exportScale,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#0a0a0c',
            logging: false,
            windowWidth: fullWidth,
            windowHeight: fullHeight,
        });

        // ── Restore everything ────────────────────────────────────────────────
        restoreSvgs();
        scrollContainer.style.overflow = origOverflow;
        wrapperElement.style.maxWidth = origMaxWidth;
        wrapperElement.style.width = origWrapWidth;
        if (bracketColumns) bracketColumns.style.width = origColWidth;

        // Mobile: Web Share API (link.click() is blocked in async context on iOS/Android)
        // Desktop: direct download via anchor click
        const blob = await new Promise<Blob>((resolve, reject) =>
            canvas.toBlob((b) => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/jpeg', 0.95)
        );

        const file = new File([blob], filename, { type: 'image/jpeg' });
        if (isMobile && navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: 'My WC 2026 Bracket' });
        } else {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = filename;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
        }
    } catch (err) {
        console.error('Error generating image:', err);
        alert('There was an issue generating the bracket image.');
    }
};
