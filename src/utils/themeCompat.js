/**
 * Theme Compatibility Module
 *
 * Detects third-party themes that replace SillyTavern's layout model, and marks
 * the body so our CSS can adapt. Without a detected theme nothing is added and
 * the extension keeps its original vanilla-SillyTavern behaviour.
 *
 * Currently handles: SillyTavern-Not-A-Discord-Theme
 *
 * Why this is needed: vanilla SillyTavern centres #sheld and leaves free margins
 * on both sides, which our panel overlays. The Discord theme instead tiles every
 * panel left-to-right and derives the chat width from --center-panels-width, so
 * it only reserves space for panels it knows about - and it does not know about
 * us. Marking the body lets style.css swap to the theme's tiling model.
 */

/** Folder name of the theme extension, as it appears in its stylesheet URL. */
const NSD_THEME_DIR = 'SillyTavern-Not-A-Discord-Theme';

/** Class applied to <body> while the theme is active. */
export const NSD_THEME_CLASS = 'rpg-nsd-theme';

/**
 * True when the theme's stylesheet is loaded (i.e. the extension is enabled).
 * @returns {boolean}
 */
function hasThemeStylesheet() {
    return Array.from(document.styleSheets).some(sheet => (sheet.href || '').includes(NSD_THEME_DIR));
}

/**
 * True when the theme's layout variables resolve on <body>.
 * Used as a fallback in case the stylesheet is injected inline rather than linked.
 * @returns {boolean}
 */
function hasThemeLayoutVars() {
    const style = getComputedStyle(document.body);
    return style.getPropertyValue('--nav-bar-width').trim() !== ''
        && style.getPropertyValue('--center-panels-width').trim() !== '';
}

/**
 * Whether SillyTavern-Not-A-Discord-Theme is currently active.
 * @returns {boolean}
 */
export function isNsdThemeActive() {
    return hasThemeStylesheet() || hasThemeLayoutVars();
}

/**
 * Syncs the body class with the current theme state.
 * @returns {boolean} Whether the theme is active.
 */
export function updateThemeCompatClass() {
    const isActive = isNsdThemeActive();
    document.body.classList.toggle(NSD_THEME_CLASS, isActive);
    return isActive;
}

/**
 * Initialises theme detection and keeps it in sync if stylesheets change later.
 */
export function initThemeCompat() {
    try {
        const isActive = updateThemeCompatClass();

        if (isActive) {
            console.log('[RPG Companion] Not-A-Discord-Theme detected - using its tiling layout.');
        }

        // Stylesheets can be added/removed when extensions are toggled at runtime.
        const observer = new MutationObserver(() => updateThemeCompatClass());
        observer.observe(document.head, { childList: true });
    } catch (error) {
        console.error('[RPG Companion] Theme compatibility detection failed:', error);
        // Non-critical - fall back to the vanilla layout.
    }
}
