
/**
 * PERMISSION SERVICE
 * Tracks if permissions have already been requested to avoid repeated popups on iOS/PWAs.
 */

const STORAGE_KEYS = {
    GEO: 'mt_perm_geo_requested',
    MEDIA: 'mt_perm_media_requested',
    LAST_GEO_PROMPT: 'mt_perm_geo_last_prompt'
};

export const permissionService = {
    /**
     * Checks if geolocation should be requested.
     * Returns true only if it hasn't been requested in the last 7 days.
     */
    canRequestLocation: (): boolean => {
        const lastPrompt = localStorage.getItem(STORAGE_KEYS.LAST_GEO_PROMPT);
        if (!lastPrompt) return true;

        const lastPromptDate = new Date(lastPrompt);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        return lastPromptDate < sevenDaysAgo;
    },

    markLocationRequested: () => {
        localStorage.setItem(STORAGE_KEYS.LAST_GEO_PROMPT, new Date().toISOString());
        localStorage.setItem(STORAGE_KEYS.GEO, 'true');
    },

    /**
     * Checks if camera/mic has been requested globally.
     */
    hasRequestedMedia: (): boolean => {
        return localStorage.getItem(STORAGE_KEYS.MEDIA) === 'true';
    },

    markMediaRequested: () => {
        localStorage.setItem(STORAGE_KEYS.MEDIA, 'true');
    }
};
