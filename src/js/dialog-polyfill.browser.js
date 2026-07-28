// Optional dialog-polyfill bundle.
// Include this script *before* dialogify when you need to support
// legacy browsers without native <dialog> support. It exposes
// window.dialogPolyfill, which dialogify detects at runtime.
import dialogPolyfill from './dialog-polyfill.esm';

if (typeof window !== 'undefined') {
    window.dialogPolyfill = dialogPolyfill;
}

export default dialogPolyfill;
