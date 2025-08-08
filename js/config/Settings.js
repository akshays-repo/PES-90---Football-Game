(() => {
    // Global game settings
    const GAME_SETTINGS = {
        units: {
            // Speed unit: 'mph' | 'kmh' | 'mps'
            speed: 'mph',
            // Pixels per meter conversion factor (adjust to calibrate speed to real-world units)
            // Assuming ~8 px per meter by default (800px ~ 100m field width)
            pixelsPerMeter: 8
        },
        ui: {
            speedMeter: {
                enabled: true,
                // Which entity to track for speed: 'player' | 'ball'
                source: 'player',
                // Smoothing factor (0 = no smoothing, 1 = full smoothing/no change)
                smoothing: 0.25,
                // Positioning: either via anchor or absolute x/y
                position: {
                    anchor: 'bottom-right', // 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
                    margin: 12,
                    x: null,
                    y: null
                },
                // Dimensions and colors
                size: { width: 160, height: 50 },
                colors: {
                    background: 'rgba(0, 0, 0, 0.65)',
                    text: '#ffffff',
                    accent: '#ffd700'
                }
            }
        }
    };

    // Simple helpers to get/set nested values using dot-paths
    const getByPath = (obj, path, fallback) => {
        if (!path) return obj;
        const parts = path.split('.');
        let current = obj;
        for (const part of parts) {
            if (current && Object.prototype.hasOwnProperty.call(current, part)) {
                current = current[part];
            } else {
                return fallback;
            }
        }
        return current;
    }

    const setByPath = (obj, path, value) => {
        const parts = path.split('.');
        let current = obj;
        while (parts.length > 1) {
            const key = parts.shift();
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }
        current[parts[0]] = value;
    }

    // Expose globally
    window.GAME_SETTINGS = GAME_SETTINGS;
    window.getSetting = (path, fallback) => getByPath(GAME_SETTINGS, path, fallback);
    window.setSetting = (path, value) => setByPath(GAME_SETTINGS, path, value);
})(); 