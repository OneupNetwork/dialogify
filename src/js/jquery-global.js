// For the browser (IIFE) build, jQuery is a peer dependency that is expected
// to be loaded globally before dialogify. This shim maps the bare `jquery`
// import to that global so the bundle does not embed its own copy.
const jq = window.jQuery || window.$;

if (!jq) {
    throw new Error('Dialogify requires jQuery to be loaded before it.');
}

export default jq;
