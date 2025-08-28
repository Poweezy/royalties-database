/**
 * Device Fingerprinting Utility
 * Generates unique device fingerprints for security and session management
 */

class DeviceFingerprint {
    constructor() {
        this.fingerprintCache = null;
        this.components = [
            'userAgent',
            'language',
            'colorDepth',
            'deviceMemory',
            'hardwareConcurrency',
            'screenResolution',
            'availableScreenResolution',
            'timezone',
            'sessionStorage',
            'localStorage',
            'indexedDB',
            'webGL',
            'canvas',
            'webRTC',
            'fonts',
            'plugins',
            'touchSupport',
            'audioContext'
        ];
    }

    /**
     * Generate comprehensive device fingerprint
     */
    async generateFingerprint() {
        if (this.fingerprintCache) {
            return this.fingerprintCache;
        }

        try {
            const fingerprint = {
                timestamp: new Date().toISOString(),
                userAgent: this.getUserAgent(),
                language: this.getLanguage(),
                colorDepth: this.getColorDepth(),
                deviceMemory: this.getDeviceMemory(),
                hardwareConcurrency: this.getHardwareConcurrency(),
                screenResolution: this.getScreenResolution(),
                availableScreenResolution: this.getAvailableScreenResolution(),
                timezone: this.getTimezone(),
                sessionStorage: this.hasSessionStorage(),
                localStorage: this.hasLocalStorage(),
                indexedDB: this.hasIndexedDB(),
                webGL: await this.getWebGLFingerprint(),
                canvas: this.getCanvasFingerprint(),
                webRTC: await this.getWebRTCFingerprint(),
                fonts: await this.getFontFingerprint(),
                plugins: this.getPluginsFingerprint(),
                touchSupport: this.getTouchSupport(),
                audioContext: await this.getAudioContextFingerprint(),
                cookiesEnabled: this.areCookiesEnabled(),
                doNotTrack: this.getDoNotTrack(),
                platform: this.getPlatform(),
                cpuClass: this.getCPUClass()
            };

            // Calculate hash of all components
            fingerprint.hash = await this.calculateFingerprintHash(fingerprint);
            
            this.fingerprintCache = fingerprint;
            return fingerprint;

        } catch (error) {
            console.error('Error generating device fingerprint:', error);
            return this.getFallbackFingerprint();
        }
    }

    /**
     * Get user agent string
     */
    getUserAgent() {
        return navigator.userAgent || 'Unknown';
    }

    /**
     * Get browser language
     */
    getLanguage() {
        return navigator.language || navigator.userLanguage || 'Unknown';
    }

    /**
     * Get screen color depth
     */
    getColorDepth() {
        return screen.colorDepth || -1;
    }

    /**
     * Get device memory (if available)
     */
    getDeviceMemory() {
        return navigator.deviceMemory || -1;
    }

    /**
     * Get hardware concurrency
     */
    getHardwareConcurrency() {
        return navigator.hardwareConcurrency || -1;
    }

    /**
     * Get screen resolution
     */
    getScreenResolution() {
        return {
            width: screen.width || -1,
            height: screen.height || -1
        };
    }

    /**
     * Get available screen resolution
     */
    getAvailableScreenResolution() {
        return {
            width: screen.availWidth || -1,
            height: screen.availHeight || -1
        };
    }

    /**
     * Get timezone
     */
    getTimezone() {
        try {
            return Intl.DateTimeFormat().resolvedOptions().timeZone;
        } catch {
            return new Date().getTimezoneOffset().toString();
        }
    }

    /**
     * Check if session storage is available
     */
    hasSessionStorage() {
        try {
            return typeof sessionStorage !== 'undefined';
        } catch {
            return false;
        }
    }

    /**
     * Check if local storage is available
     */
    hasLocalStorage() {
        try {
            return typeof localStorage !== 'undefined';
        } catch {
            return false;
        }
    }

    /**
     * Check if IndexedDB is available
     */
    hasIndexedDB() {
        try {
            return typeof indexedDB !== 'undefined';
        } catch {
            return false;
        }
    }

    /**
     * Get WebGL fingerprint
     */
    async getWebGLFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            
            if (!gl) {
                return 'Not supported';
            }

            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR);
            const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);

            return {
                vendor: vendor || 'Unknown',
                renderer: renderer || 'Unknown',
                version: gl.getParameter(gl.VERSION) || 'Unknown',
                shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION) || 'Unknown'
            };
        } catch {
            return 'Error';
        }
    }

    /**
     * Get canvas fingerprint
     */
    getCanvasFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Draw text with different fonts
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillText('Device fingerprint test 🔒', 2, 2);
            
            ctx.font = '11px Times';
            ctx.fillText('Device fingerprint test 🔒', 4, 17);
            
            return canvas.toDataURL();
        } catch {
            return 'Error';
        }
    }

    /**
     * Get WebRTC fingerprint
     */
    async getWebRTCFingerprint() {
        try {
            return new Promise((resolve) => {
                const timeout = setTimeout(() => resolve('Timeout'), 1000);
                
                const rtc = new RTCPeerConnection({
                    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
                });

                rtc.createDataChannel('');
                
                rtc.onicecandidate = (ice) => {
                    if (ice.candidate) {
                        clearTimeout(timeout);
                        resolve(ice.candidate.candidate);
                        rtc.close();
                    }
                };

                rtc.createOffer()
                    .then(offer => rtc.setLocalDescription(offer))
                    .catch(() => {
                        clearTimeout(timeout);
                        resolve('Error');
                    });
            });
        } catch {
            return 'Not supported';
        }
    }

    /**
     * Get font fingerprint
     */
    async getFontFingerprint() {
        try {
            const baseFonts = ['monospace', 'sans-serif', 'serif'];
            const testString = 'mmmmmmmmmmlli';
            const testSize = '72px';
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Test fonts list
            const fontList = [
                'Arial', 'Arial Black', 'Arial Narrow', 'Arial Unicode MS',
                'Calibri', 'Cambria', 'Comic Sans MS', 'Consolas', 'Courier',
                'Courier New', 'Georgia', 'Helvetica', 'Impact', 'Lucida Console',
                'Lucida Sans Unicode', 'Microsoft Sans Serif', 'Palatino Linotype',
                'Tahoma', 'Times', 'Times New Roman', 'Trebuchet MS', 'Verdana'
            ];

            const availableFonts = [];

            // Get baseline measurements
            const baselines = {};
            baseFonts.forEach(baseFont => {
                ctx.font = testSize + ' ' + baseFont;
                baselines[baseFont] = {
                    width: ctx.measureText(testString).width,
                    height: parseInt(testSize)
                };
            });

            // Test each font
            for (const font of fontList) {
                let detected = false;
                for (const baseFont of baseFonts) {
                    ctx.font = testSize + ' ' + font + ',' + baseFont;
                    const measurements = {
                        width: ctx.measureText(testString).width,
                        height: parseInt(testSize)
                    };
                    
                    if (measurements.width !== baselines[baseFont].width) {
                        detected = true;
                        break;
                    }
                }
                if (detected) {
                    availableFonts.push(font);
                }
            }

            return availableFonts;
        } catch {
            return ['Error'];
        }
    }

    /**
     * Get plugins fingerprint
     */
    getPluginsFingerprint() {
        try {
            if (!navigator.plugins) {
                return ['Not available'];
            }

            const plugins = [];
            for (let i = 0; i < navigator.plugins.length; i++) {
                const plugin = navigator.plugins[i];
                plugins.push({
                    name: plugin.name,
                    description: plugin.description,
                    filename: plugin.filename,
                    version: plugin.version
                });
            }
            return plugins;
        } catch {
            return ['Error'];
        }
    }

    /**
     * Get touch support info
     */
    getTouchSupport() {
        try {
            let maxTouchPoints = 0;
            let touchEvent = false;
            
            if (typeof navigator.maxTouchPoints !== 'undefined') {
                maxTouchPoints = navigator.maxTouchPoints;
            } else if (typeof navigator.msMaxTouchPoints !== 'undefined') {
                maxTouchPoints = navigator.msMaxTouchPoints;
            }
            
            try {
                document.createEvent('TouchEvent');
                touchEvent = true;
            } catch {}
            
            const touchStart = 'ontouchstart' in window;
            
            return {
                maxTouchPoints,
                touchEvent,
                touchStart
            };
        } catch {
            return { error: true };
        }
    }

    /**
     * Get audio context fingerprint
     */
    async getAudioContextFingerprint() {
        try {
            return new Promise((resolve) => {
                const timeout = setTimeout(() => resolve('Timeout'), 1000);
                
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const analyser = audioContext.createAnalyser();
                const gain = audioContext.createGain();
                const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
                
                gain.gain.value = 0;
                oscillator.type = 'triangle';
                oscillator.frequency.value = 10000;
                
                oscillator.connect(analyser);
                analyser.connect(scriptProcessor);
                scriptProcessor.connect(gain);
                gain.connect(audioContext.destination);
                
                scriptProcessor.onaudioprocess = function(bins) {
                    clearTimeout(timeout);
                    const copiedData = new Float32Array(analyser.frequencyBinCount);
                    analyser.getFloatFrequencyData(copiedData);
                    
                    oscillator.disconnect();
                    scriptProcessor.disconnect();
                    gain.disconnect();
                    audioContext.close();
                    
                    resolve(copiedData.slice(0, 30).toString());
                };
                
                oscillator.start(0);
            });
        } catch {
            return 'Not supported';
        }
    }

    /**
     * Check if cookies are enabled
     */
    areCookiesEnabled() {
        try {
            return navigator.cookieEnabled;
        } catch {
            return false;
        }
    }

    /**
     * Get Do Not Track setting
     */
    getDoNotTrack() {
        try {
            return navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack || '0';
        } catch {
            return 'Unknown';
        }
    }

    /**
     * Get platform
     */
    getPlatform() {
        try {
            return navigator.platform || 'Unknown';
        } catch {
            return 'Unknown';
        }
    }

    /**
     * Get CPU class (legacy IE)
     */
    getCPUClass() {
        try {
            return navigator.cpuClass || 'Unknown';
        } catch {
            return 'Unknown';
        }
    }

    /**
     * Calculate fingerprint hash
     */
    async calculateFingerprintHash(fingerprint) {
        try {
            const fingerprintString = JSON.stringify(fingerprint, null, 0);
            const encoder = new TextEncoder();
            const data = encoder.encode(fingerprintString);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch {
            // Fallback hash
            let hash = 0;
            const fingerprintString = JSON.stringify(fingerprint, null, 0);
            for (let i = 0; i < fingerprintString.length; i++) {
                const char = fingerprintString.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return Math.abs(hash).toString(16);
        }
    }

    /**
     * Get fallback fingerprint
     */
    getFallbackFingerprint() {
        return {
            timestamp: new Date().toISOString(),
            userAgent: this.getUserAgent(),
            language: this.getLanguage(),
            screenResolution: this.getScreenResolution(),
            timezone: this.getTimezone(),
            fallback: true,
            hash: 'fallback_' + Date.now()
        };
    }

    /**
     * Check if two fingerprints are similar (for device recognition)
     */
    compareFingerprints(fp1, fp2, threshold = 0.8) {
        try {
            const keys = Object.keys(fp1).filter(key => key !== 'timestamp' && key !== 'hash');
            let matches = 0;
            
            for (const key of keys) {
                if (JSON.stringify(fp1[key]) === JSON.stringify(fp2[key])) {
                    matches++;
                }
            }
            
            const similarity = matches / keys.length;
            return similarity >= threshold;
        } catch {
            return false;
        }
    }

    /**
     * Clear cached fingerprint
     */
    clearCache() {
        this.fingerprintCache = null;
    }
}

export const deviceFingerprint = new DeviceFingerprint();
