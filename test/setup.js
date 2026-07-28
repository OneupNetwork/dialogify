// jsdom does not implement HTMLDialogElement.showModal/show/close, so provide
// minimal shims that are good enough for behavioural tests.
if (typeof window !== 'undefined' && window.HTMLDialogElement) {
    const proto = window.HTMLDialogElement.prototype;

    proto.showModal = function () {
        this.open = true;
    };

    proto.show = function () {
        this.open = true;
    };

    proto.close = function (returnValue) {
        if (!this.open) {
            return;
        }
        this.open = false;
        if (returnValue !== undefined) {
            this.returnValue = returnValue;
        }
        this.dispatchEvent(new window.Event('close'));
    };
}

// Pre-register a #dialogifyCss element so dialogify skips its CSS injection.
// The source is imported unbuilt (the CSS placeholder is not real CSS), and
// this keeps jsdom from logging a "Could not parse CSS stylesheet" warning.
if (typeof document !== 'undefined' && !document.getElementById('dialogifyCss')) {
    const style = document.createElement('style');
    style.id = 'dialogifyCss';
    document.head.appendChild(style);
}
