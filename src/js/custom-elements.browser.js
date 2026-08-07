// Optional customized built-in elements polyfill.
// Safari/WebKit does not implement customized built-in elements, so
// `<dialog is="bahamut-dialogify">` is never upgraded there. Include this
// script *before* dialogify to patch `customElements.define` so the
// declarative syntax works; the programmatic API does not need it.
import '@ungap/custom-elements';
