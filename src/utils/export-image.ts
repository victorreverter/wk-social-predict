import html2canvas from 'html2canvas';
import type { Match } from '../types';

export const exportBracketToImage = async (
    _matchesList: Match[],
    filename: string = 'wc2026-prediction.jpg'
) => {
    try {
        const wrapperElement = document.getElementById('bracket-export-target');
        const scrollContainer = wrapperElement?.querySelector('.bracket-scroll-container') as HTMLElement;

        if (!wrapperElement || !scrollContainer) throw new Error('Bracket element not found');

        // 1. Calculate the true, uncropped width of the entire Bracket matrix
        const targetWidth = scrollContainer.scrollWidth;

        // Temporarily adjust styling to capture the full overflowing bracket correctly
        const originalOverflow = scrollContainer.style.overflow;
        const originalMaxWidth = wrapperElement.style.maxWidth;
        const originalWidth = wrapperElement.style.width;

        scrollContainer.style.overflow = 'visible';
        wrapperElement.style.maxWidth = 'none';
        // 2. FORCE the wrapper to physically expand to the uncropped pixel width so html2canvas doesn't truncate the DOM node.
        wrapperElement.style.width = `${targetWidth}px`;

        // Prevent out-of-memory crashes on iOS by dropping the scale on mobile devices
        const isMobile = window.innerWidth <= 768;
        const exportScale = isMobile ? 1.5 : 2;

        const canvas = await html2canvas(wrapperElement, {
            scale: exportScale,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#0a0a0c', // Ensure the background bleeds correctly
            logging: false,
        });

        // Restore styles
        scrollContainer.style.overflow = originalOverflow;
        wrapperElement.style.maxWidth = originalMaxWidth;
        wrapperElement.style.width = originalWidth;

        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.click();
    } catch (err) {
        console.error('Error generating image:', err);
        alert("There was an issue generating the bracket image.");
    }
};
