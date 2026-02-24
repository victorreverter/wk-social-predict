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

        // Temporarily adjust styling to capture the full overflowing bracket correctly
        const originalOverflow = scrollContainer.style.overflow;
        const originalMaxWidth = wrapperElement.style.maxWidth;
        // The wrapper's parent restricts bounds, so we must force it to expand as well
        const wrapperParent = wrapperElement.parentElement;
        const originalParentWidth = wrapperParent ? wrapperParent.style.width : '';

        if (wrapperParent) {
            wrapperParent.style.width = 'fit-content';
        }
        scrollContainer.style.overflow = 'visible';
        wrapperElement.style.maxWidth = 'none';
        wrapperElement.style.width = 'max-content';

        // 1. Calculate the true, uncropped width of the entire Bracket matrix
        const targetWidth = scrollContainer.scrollWidth;
        const targetHeight = scrollContainer.scrollHeight;

        // Prevent out-of-memory crashes on iOS by dropping the scale on mobile devices
        const isMobile = window.innerWidth <= 768;
        const exportScale = isMobile ? 1.2 : 2;

        const canvas = await html2canvas(wrapperElement, {
            scale: exportScale,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#0a0a0c', // Ensure the background bleeds correctly
            logging: false,
            // 2. FORCE html2canvas to render the entire width, ignoring the phone's narrow screen limits
            width: targetWidth,
            height: targetHeight,
            windowWidth: targetWidth,
            windowHeight: targetHeight,
        });

        // Restore styles
        if (wrapperParent) {
            wrapperParent.style.width = originalParentWidth;
        }
        scrollContainer.style.overflow = originalOverflow;
        wrapperElement.style.maxWidth = originalMaxWidth;
        wrapperElement.style.width = '';

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
