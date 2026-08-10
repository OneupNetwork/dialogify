/**
 * dialogify
 * https://github.com/OneupNetwork/dialogify
 */

import $ from 'jquery';

// Read the global config lazily so runtime changes to
// window.dialogifyConfig take effect on every call.
export function getConfig() {
    let config = window.dialogifyConfig;
    if (config == null || typeof config != 'object') {
        config = {};
    }
    config.locale = config.locale || 'zh_TW';
    return config;
}

// Invoke the native HTMLDialogElement method, bypassing any subclass override.
// This keeps the custom element (which overrides show/showModal) from recursing
// back into itself, while still honouring dialog-polyfill, which assigns its
// replacements directly on the element as own properties.
export function nativeDialogCall(dialog, method, args) {
    if (!Object.prototype.hasOwnProperty.call(dialog, method)) {
        const proto = window.HTMLDialogElement && window.HTMLDialogElement.prototype;
        if (proto && typeof proto[method] == 'function') {
            return proto[method].apply(dialog, args || []);
        }
    }
    return dialog[method].apply(dialog, args || []);
}

// Dispatch a real DOM event on the dialog element so that both
// addEventListener and the declarative element handlers can observe it.
// Returns false when a listener called preventDefault().
export function dispatchDomEvent(dialog, type, detail) {
    if (typeof window.CustomEvent != 'function') {
        return true;
    }
    const event = new window.CustomEvent(type, {
        bubbles: false,
        cancelable: true,
        detail: detail
    });
    dialog.dispatchEvent(event);
    return !event.defaultPrevented;
}

// Resolve the locale strings for the current config.
export function getLocale() {
    const config = getConfig();
    return Dialogify.LOCALE[config.locale] || Dialogify.LOCALE['zh_TW'];
}

const DRAWER_POSITIONS = ['left', 'right', 'top', 'bottom'];

const TOAST_POSITIONS = [
    'top-left',
    'top-center',
    'top-right',
    'bottom-left',
    'bottom-center',
    'bottom-right'
];

const LOADING_IMAGE =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMzZweCcgaGVpZ2h0PSczNnB4JyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCIgY2xhc3M9InVpbC1kZWZhdWx0Ij48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0ibm9uZSIgY2xhc3M9ImJrIj48L3JlY3Q+PHJlY3QgIHg9JzQ2LjUnIHk9JzQwJyB3aWR0aD0nNycgaGVpZ2h0PScyMCcgcng9JzUnIHJ5PSc1JyBmaWxsPScjMDA5NDk5JyB0cmFuc2Zvcm09J3JvdGF0ZSgwIDUwIDUwKSB0cmFuc2xhdGUoMCAtMzApJz4gIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9J29wYWNpdHknIGZyb209JzEnIHRvPScwJyBkdXI9JzFzJyBiZWdpbj0nMHMnIHJlcGVhdENvdW50PSdpbmRlZmluaXRlJy8+PC9yZWN0PjxyZWN0ICB4PSc0Ni41JyB5PSc0MCcgd2lkdGg9JzcnIGhlaWdodD0nMjAnIHJ4PSc1JyByeT0nNScgZmlsbD0nIzAwOTQ5OScgdHJhbnNmb3JtPSdyb3RhdGUoMzAgNTAgNTApIHRyYW5zbGF0ZSgwIC0zMCknPiAgPGFuaW1hdGUgYXR0cmlidXRlTmFtZT0nb3BhY2l0eScgZnJvbT0nMScgdG89JzAnIGR1cj0nMXMnIGJlZ2luPScwLjA4MzMzMzMzMzMzMzMzMzMzcycgcmVwZWF0Q291bnQ9J2luZGVmaW5pdGUnLz48L3JlY3Q+PHJlY3QgIHg9JzQ2LjUnIHk9JzQwJyB3aWR0aD0nNycgaGVpZ2h0PScyMCcgcng9JzUnIHJ5PSc1JyBmaWxsPScjMDA5NDk5JyB0cmFuc2Zvcm09J3JvdGF0ZSg2MCA1MCA1MCkgdHJhbnNsYXRlKDAgLTMwKSc+ICA8YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSdvcGFjaXR5JyBmcm9tPScxJyB0bz0nMCcgZHVyPScxcycgYmVnaW49JzAuMTY2NjY2NjY2NjY2NjY2NjZzJyByZXBlYXRDb3VudD0naW5kZWZpbml0ZScvPjwvcmVjdD48cmVjdCAgeD0nNDYuNScgeT0nNDAnIHdpZHRoPSc3JyBoZWlnaHQ9JzIwJyByeD0nNScgcnk9JzUnIGZpbGw9JyMwMDk0OTknIHRyYW5zZm9ybT0ncm90YXRlKDkwIDUwIDUwKSB0cmFuc2xhdGUoMCAtMzApJz4gIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9J29wYWNpdHknIGZyb209JzEnIHRvPScwJyBkdXI9JzFzJyBiZWdpbj0nMC4yNXMnIHJlcGVhdENvdW50PSdpbmRlZmluaXRlJy8+PC9yZWN0PjxyZWN0ICB4PSc0Ni41JyB5PSc0MCcgd2lkdGg9JzcnIGhlaWdodD0nMjAnIHJ4PSc1JyByeT0nNScgZmlsbD0nIzAwOTQ5OScgdHJhbnNmb3JtPSdyb3RhdGUoMTIwIDUwIDUwKSB0cmFuc2xhdGUoMCAtMzApJz4gIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9J29wYWNpdHknIGZyb209JzEnIHRvPScwJyBkdXI9JzFzJyBiZWdpbj0nMC4zMzMzMzMzMzMzMzMzMzMzcycgcmVwZWF0Q291bnQ9J2luZGVmaW5pdGUnLz48L3JlY3Q+PHJlY3QgIHg9JzQ2LjUnIHk9JzQwJyB3aWR0aD0nNycgaGVpZ2h0PScyMCcgcng9JzUnIHJ5PSc1JyBmaWxsPScjMDA5NDk5JyB0cmFuc2Zvcm09J3JvdGF0ZSgxNTAgNTAgNTApIHRyYW5zbGF0ZSgwIC0zMCknPiAgPGFuaW1hdGUgYXR0cmlidXRlTmFtZT0nb3BhY2l0eScgZnJvbT0nMScgdG89JzAnIGR1cj0nMXMnIGJlZ2luPScwLjQxNjY2NjY2NjY2NjY2NjdzJyByZXBlYXRDb3VudD0naW5kZWZpbml0ZScvPjwvcmVjdD48cmVjdCAgeD0nNDYuNScgeT0nNDAnIHdpZHRoPSc3JyBoZWlnaHQ9JzIwJyByeD0nNScgcnk9JzUnIGZpbGw9JyMwMDk0OTknIHRyYW5zZm9ybT0ncm90YXRlKDE4MCA1MCA1MCkgdHJhbnNsYXRlKDAgLTMwKSc+ICA8YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSdvcGFjaXR5JyBmcm9tPScxJyB0bz0nMCcgZHVyPScxcycgYmVnaW49JzAuNXMnIHJlcGVhdENvdW50PSdpbmRlZmluaXRlJy8+PC9yZWN0PjxyZWN0ICB4PSc0Ni41JyB5PSc0MCcgd2lkdGg9JzcnIGhlaWdodD0nMjAnIHJ4PSc1JyByeT0nNScgZmlsbD0nIzAwOTQ5OScgdHJhbnNmb3JtPSdyb3RhdGUoMjEwIDUwIDUwKSB0cmFuc2xhdGUoMCAtMzApJz4gIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9J29wYWNpdHknIGZyb209JzEnIHRvPScwJyBkdXI9JzFzJyBiZWdpbj0nMC41ODMzMzMzMzMzMzMzMzM0cycgcmVwZWF0Q291bnQ9J2luZGVmaW5pdGUnLz48L3JlY3Q+PHJlY3QgIHg9JzQ2LjUnIHk9JzQwJyB3aWR0aD0nNycgaGVpZ2h0PScyMCcgcng9JzUnIHJ5PSc1JyBmaWxsPScjMDA5NDk5JyB0cmFuc2Zvcm09J3JvdGF0ZSgyNDAgNTAgNTApIHRyYW5zbGF0ZSgwIC0zMCknPiAgPGFuaW1hdGUgYXR0cmlidXRlTmFtZT0nb3BhY2l0eScgZnJvbT0nMScgdG89JzAnIGR1cj0nMXMnIGJlZ2luPScwLjY2NjY2NjY2NjY2NjY2NjZzJyByZXBlYXRDb3VudD0naW5kZWZpbml0ZScvPjwvcmVjdD48cmVjdCAgeD0nNDYuNScgeT0nNDAnIHdpZHRoPSc3JyBoZWlnaHQ9JzIwJyByeD0nNScgcnk9JzUnIGZpbGw9JyMwMDk0OTknIHRyYW5zZm9ybT0ncm90YXRlKDI3MCA1MCA1MCkgdHJhbnNsYXRlKDAgLTMwKSc+ICA8YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSdvcGFjaXR5JyBmcm9tPScxJyB0bz0nMCcgZHVyPScxcycgYmVnaW49JzAuNzVzJyByZXBlYXRDb3VudD0naW5kZWZpbml0ZScvPjwvcmVjdD48cmVjdCAgeD0nNDYuNScgeT0nNDAnIHdpZHRoPSc3JyBoZWlnaHQ9JzIwJyByeD0nNScgcnk9JzUnIGZpbGw9JyMwMDk0OTknIHRyYW5zZm9ybT0ncm90YXRlKDMwMCA1MCA1MCkgdHJhbnNsYXRlKDAgLTMwKSc+ICA8YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSdvcGFjaXR5JyBmcm9tPScxJyB0bz0nMCcgZHVyPScxcycgYmVnaW49JzAuODMzMzMzMzMzMzMzMzMzNHMnIHJlcGVhdENvdW50PSdpbmRlZmluaXRlJy8+PC9yZWN0PjxyZWN0ICB4PSc0Ni41JyB5PSc0MCcgd2lkdGg9JzcnIGhlaWdodD0nMjAnIHJ4PSc1JyByeT0nNScgZmlsbD0nIzAwOTQ5OScgdHJhbnNmb3JtPSdyb3RhdGUoMzMwIDUwIDUwKSB0cmFuc2xhdGUoMCAtMzApJz4gIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9J29wYWNpdHknIGZyb209JzEnIHRvPScwJyBkdXI9JzFzJyBiZWdpbj0nMC45MTY2NjY2NjY2NjY2NjY2cycgcmVwZWF0Q291bnQ9J2luZGVmaW5pdGUnLz48L3JlY3Q+PC9zdmc+';

function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// Align the cross axis of an anchored dialog against the anchor rect.
function alignAxis(align, start, anchorSize, boxSize) {
    if (align == 'center') {
        return start + anchorSize / 2 - boxSize / 2;
    }
    if (align == 'end') {
        return start + anchorSize - boxSize;
    }
    return start;
}

// Upper bound for the exit animation, in case `finished` never settles.
const EXIT_ANIMATION_TIMEOUT = 600;

// Run `done` once every animation currently running on `el` has finished.
// Falls through synchronously when nothing is animating (which is also the
// case under `prefers-reduced-motion`, where the exit animations are off).
function whenAnimationsDone(el, done) {
    const animations = typeof el.getAnimations == 'function' ? el.getAnimations() : [];
    if (!animations.length) {
        done();
        return;
    }

    let settled = false;
    const finish = function () {
        if (!settled) {
            settled = true;
            done();
        }
    };

    Promise.all(
        animations.map(function (animation) {
            return animation.finished.catch(function () {});
        })
    ).then(finish);
    window.setTimeout(finish, EXIT_ANIMATION_TIMEOUT);
}

// True when the click happened outside the element's box. Pointer coordinates
// are compared against the rect instead of relying on `event.target`, because a
// click on the padding of a full-height drawer also targets the dialog itself.
function isOutsideRect(el, event) {
    const rect = el.getBoundingClientRect();
    // Without layout information there is nothing to compare against, so keep
    // the historical behaviour of trusting the event target.
    if (!rect.width && !rect.height) {
        return true;
    }
    return (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
    );
}

class Dialogify {
    constructor(source, options) {
        this._setup(window.document.createElement('dialog'), source, options, { append: true });
    }

    // Build the dialogify chrome around `dialog`. Shared by the programmatic
    // constructor and by the custom element, which adopts existing markup.
    _setup(dialog, source, options, setupOptions) {
        const config = getConfig();

        if (setupOptions == null || typeof setupOptions != 'object') {
            setupOptions = {};
        }

        // dialog-polyfill is optional; register only when it has been loaded.
        if (window.dialogPolyfill && typeof window.dialogPolyfill.registerDialog === 'function') {
            window.dialogPolyfill.registerDialog(dialog);
        }

        if (options == null || typeof options != 'object') {
            options = {};
        }

        this.options = options;

        let ajaxPrefix = options.ajaxPrefix === undefined ? '/ajax/' : options.ajaxPrefix;

        let self = this;
        let content;
        let ajax = false;
        const contentNodes = setupOptions.content || null;
        if (contentNodes) {
            // Existing markup is adopted as-is; nodes are moved in later so that
            // listeners already bound by the author are preserved.
            content = null;
        } else if (source.charAt(0) == '#') {
            content = $(source).html();
        } else if (source.indexOf(ajaxPrefix) == 0) {
            content = `<div class="dialogify-ajax-content" role="status" aria-live="polite"><img class="dialogify-ajax-loading" src="${LOADING_IMAGE}" alt="${escapeHtml(getLocale().loading)}"></div>`;
            ajax = true;
        } else {
            content = source;
        }

        content = content == null ? null : `<div class="dialogify__body">${content}</div>`;

        let widthClass = options.size || 'dialogify__fixedwidth';
        let dialogClass = 'dialogify';
        if (options.fixed !== false) {
            dialogClass += ' fixed';
        }

        // Drawer mode slides the dialog in from an edge instead of centring it.
        if (DRAWER_POSITIONS.indexOf(options.position) >= 0) {
            dialogClass += ` dialogify--drawer dialogify--${options.position}`;
        }

        if (options.variant) {
            dialogClass += ` dialogify--${options.variant}`;
        }

        let dialogHtml = `<div class="dialogify__content ${widthClass}"><div></div></div>`;

        if (options.useDialogForm !== false) {
            dialogHtml = `<form method="dialog">${dialogHtml}</form>`;
        }

        Dialogify.counter++;
        this.id = dialog.id || `dialogify_${Dialogify.counter}`;

        // create dialog element
        const $dialog = $(dialog)
            .attr('id', this.id)
            .addClass(dialogClass)
            .append(dialogHtml)
            .on('close', function () {
                self._teardownAnchor();
                $(self).triggerHandler('close');
                if (options.backgroundScroll === false) {
                    $('body').css({ overflow: '', 'padding-right': '' });
                }
                // Keep the dialog rendered while the exit animation plays; it
                // is already out of the top layer at this point. Normally the
                // class is already there (see `_markClosing`), this is the
                // safety net for closes triggered outside of Dialogify.
                $(dialog).addClass('dialogify--closing');
                if (self._onClosing) {
                    self._onClosing();
                }
                whenAnimationsDone(dialog, function () {
                    $(dialog).removeClass('dialogify--closing');
                    if (options.autoRemove !== false) {
                        if (self._resizeObserver) {
                            self._resizeObserver.disconnect();
                        }
                        $(dialog).remove();
                    }
                    if (self._onExit) {
                        self._onExit();
                    }
                });
                self._resolveClosePromise();
            })
            .on('cancel', function (e) {
                $(self).triggerHandler('cancel');
                if (options.closable === false || !self._fireBeforeClose()) {
                    e.preventDefault();
                } else {
                    self._markClosing();
                }
            })
            .click(function (e) {
                // A backdrop click targets the dialog element but lands outside
                // its box; a click on the dialog's own padding must not close it.
                if (options.closable !== false && e.target == dialog && isOutsideRect(dialog, e)) {
                    if (dispatchDomEvent(dialog, 'cancel')) {
                        self.close();
                    }
                }
            });

        // A <form method="dialog"> submit closes the dialog natively, bypassing
        // close(); intercept it so beforeclose can veto that path too.
        if (options.useDialogForm !== false) {
            $dialog.find('form[method="dialog"]').on('submit', function (e) {
                if (!self._fireBeforeClose(this.returnValue)) {
                    e.preventDefault();
                } else {
                    self._markClosing();
                }
            });
        }

        if (setupOptions.append !== false) {
            $dialog.appendTo('body');
        }

        // close button
        if (options.closable !== false) {
            let closeButtonImage =
                'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMTYgMTYiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDE2IDE2OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PHN0eWxlIHR5cGU9InRleHQvY3NzIj4uc3Qwe2ZpbGw6IzA1NTY2Njt9PC9zdHlsZT48cmVjdCB4PSIzLjEiIHk9IjEiIGNsYXNzPSJzdDAiIHdpZHRoPSIxLjciIGhlaWdodD0iMSIvPjxyZWN0IHg9IjIuMSIgeT0iMi4xIiBjbGFzcz0ic3QwIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIi8+PHJlY3QgeD0iMSIgeT0iMy4xIiBjbGFzcz0ic3QwIiB3aWR0aD0iMSIgaGVpZ2h0PSIxLjciLz48cmVjdCB4PSIxIiB5PSIxMS4xIiBjbGFzcz0ic3QwIiB3aWR0aD0iMSIgaGVpZ2h0PSIxLjciLz48cmVjdCB4PSIyLjEiIHk9IjEyLjkiIGNsYXNzPSJzdDAiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiLz48cmVjdCB4PSIzLjEiIHk9IjEzLjkiIGNsYXNzPSJzdDAiIHdpZHRoPSIxLjciIGhlaWdodD0iMSIvPjxnPjxyZWN0IHg9IjQuOSIgY2xhc3M9InN0MCIgd2lkdGg9IjYuMyIgaGVpZ2h0PSIxIi8+PC9nPjxyZWN0IHg9IjQuOSIgeT0iMTUiIGNsYXNzPSJzdDAiIHdpZHRoPSI2LjMiIGhlaWdodD0iMSIvPjxyZWN0IHk9IjQuOSIgY2xhc3M9InN0MCIgd2lkdGg9IjEiIGhlaWdodD0iNi4zIi8+PHJlY3QgeD0iMTEuMSIgeT0iMSIgY2xhc3M9InN0MCIgd2lkdGg9IjEuNyIgaGVpZ2h0PSIxIi8+PHJlY3QgeD0iMTIuOSIgeT0iMi4xIiBjbGFzcz0ic3QwIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIi8+PHJlY3QgeD0iMTMuOSIgeT0iMy4xIiBjbGFzcz0ic3QwIiB3aWR0aD0iMSIgaGVpZ2h0PSIxLjciLz48cmVjdCB4PSIxMy45IiB5PSIxMS4xIiBjbGFzcz0ic3QwIiB3aWR0aD0iMSIgaGVpZ2h0PSIxLjciLz48cmVjdCB4PSIxMi45IiB5PSIxMi45IiBjbGFzcz0ic3QwIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIi8+PHJlY3QgeD0iMTEuMSIgeT0iMTMuOSIgY2xhc3M9InN0MCIgd2lkdGg9IjEuNyIgaGVpZ2h0PSIxIi8+PHJlY3QgeD0iMTUiIHk9IjQuOSIgY2xhc3M9InN0MCIgd2lkdGg9IjEiIGhlaWdodD0iNi4zIi8+PHBvbHlnb24gY2xhc3M9InN0MCIgcG9pbnRzPSI5LjcsMy44IDkuNyw0LjkgOC43LDQuOSA4LjcsNS45IDcuMyw1LjkgNy4zLDQuOSA2LjMsNC45IDYuMywzLjggMy44LDMuOCAzLjgsNS4yIDQuOSw1LjIgNC45LDYuMyA1LjksNi4zIDUuOSw3LjMgNyw3LjMgNyw4LjMgNS45LDguMyA1LjksOS40IDQuOSw5LjQgNC45LDEwLjQgMy44LDEwLjQgMy44LDEwLjggMy44LDExLjggNi4zLDExLjggNi4zLDEwLjggNy4zLDEwLjggNy4zLDkuNyA4LjcsOS43IDguNywxMC44IDkuNywxMC44IDkuNywxMS44IDEyLjIsMTEuOCAxMi4yLDEwLjQgMTEuMSwxMC40IDExLjEsOS40IDEwLjEsOS40IDEwLjEsOC4zIDksOC4zIDksNy4zIDEwLjEsNy4zIDEwLjEsNi4zIDExLjEsNi4zIDExLjEsNS4yIDEyLjIsNS4yIDEyLjIsNC45IDEyLjIsMy44ICIvPjwvc3ZnPg==';
            let closeButtonClassName = '';
            let closeButtonStyle = {};

            let closeButton = options.closeButton || config.closeButton;
            if (closeButton != null && typeof closeButton == 'object') {
                closeButtonImage = closeButton.image || closeButtonImage;
                closeButtonClassName = closeButton.className || closeButtonClassName;
                closeButtonStyle = closeButton.style || closeButtonStyle;
            }

            let $closeImage = $('<img>').attr({ src: closeButtonImage, alt: '' });
            // <a> without href is not keyboard focusable, so the button role,
            // tabindex, accessible name and key handling are added explicitly.
            let $closeButton = $('<a>')
                .addClass('dialogify__close')
                .attr({ role: 'button', tabindex: 0, 'aria-label': getLocale().close })
                .css(closeButtonStyle)
                .append($closeImage)
                .click(function () {
                    if (dispatchDomEvent(dialog, 'cancel')) {
                        self.close();
                    }
                })
                .on('keydown', function (e) {
                    if (e.key == 'Enter' || e.key == ' ' || e.key == 'Spacebar') {
                        e.preventDefault();
                        $(this).click();
                    }
                });

            if (closeButtonClassName) {
                $closeButton.addClass(closeButtonClassName);
            }

            $(dialog).append($closeButton);
        }

        // custom style
        let dialogConfig = options.dialog || config.dialog;
        if (dialogConfig != null && typeof dialogConfig == 'object') {
            $(dialog).css(dialogConfig.style || {});
            if (dialogConfig.className) {
                $(dialog).addClass(dialogConfig.className);
            }

            let $dialogContent = $(dialog).find('.dialogify__content');
            $dialogContent.css(dialogConfig.contentStyle || {});
            if (dialogConfig.contentClassName) {
                $dialogContent.addClass(dialogConfig.contentClassName);
            }
        }

        // append content
        this.$content = $(dialog).find('.dialogify__content > div');
        if (contentNodes) {
            this.$content.append($('<div>').addClass('dialogify__body').append(contentNodes));
        } else {
            this.$content.append(content);
        }

        // convenient handles for the content body and the dialog form
        this.$body = this.$content.find('.dialogify__body');
        this.$form = $(dialog).find('form[method="dialog"]');

        // ajax content
        if (ajax) {
            let requestUrl = source;
            let ajaxData = options.ajaxData || {};
            try {
                let url = new URL(source, window.location.href);
                Object.keys(ajaxData).forEach(function (key) {
                    url.searchParams.append(key, ajaxData[key]);
                });
                requestUrl = url.toString();
            } catch {
                // keep the original source if it is not a valid URL
            }

            window
                .fetch(requestUrl, {
                    headers: { 'X-Requested-With': 'XMLHttpRequest' }
                })
                .then(function (response) {
                    return response.text();
                })
                .then(function (resp) {
                    if (options.ajaxComplete) {
                        options.ajaxComplete.call(self);
                    }

                    self.$content.find('.dialogify-ajax-content').html(resp);
                });
        }

        // expose the underlying <dialog> element for prototype methods
        this.dialog = dialog;

        // fix blurry render caused by sub-pixel translate in some browsers
        // see also https://stackoverflow.com/a/42256897/3188956
        // Only centred dialogs use a translate; drawers, popovers and toasts
        // position themselves and would have their animation frozen by the
        // rounded matrix being written back as an inline style.
        if (window.ResizeObserver && !$(dialog).is('.dialogify--drawer, .dialogify--toast')) {
            this._resizeObserver = new window.ResizeObserver(function () {
                if (!$(dialog).is('.dialogify--popover')) {
                    roundCssTransformMatrix(dialog);
                }
            });
            this._resizeObserver.observe(dialog);
        }
    }

    // Fire the cancelable `beforeclose` event on both the instance (jQuery) and
    // the element (DOM). Returns false when either side vetoed the close.
    _fireBeforeClose(returnValue) {
        const jqEvent = $.Event('beforeclose');
        jqEvent.returnValue = returnValue;
        $(this).triggerHandler(jqEvent);

        const allowed = dispatchDomEvent(this.dialog, 'beforeclose', { returnValue: returnValue });
        return allowed && !jqEvent.isDefaultPrevented();
    }

    _resolveClosePromise() {
        if (this._closeResolver) {
            const resolve = this._closeResolver;
            this._closeResolver = null;
            this._closePromise = null;
            resolve(this.dialog.returnValue);
        }
    }

    // show()/showModal() resolve with the dialog's returnValue once it closes.
    _openPromise() {
        const self = this;
        // A dialog reopened during its exit animation must not stay in the
        // closing state.
        $(this.dialog).removeClass('dialogify--closing');
        if (!this._closePromise) {
            this._closePromise = new Promise(function (resolve) {
                self._closeResolver = resolve;
            });
        }
        return this._closePromise;
    }

    // public methods
    showModal() {
        if (this.options.backgroundScroll === false) {
            preventScroll();
        }
        const promise = this._openPromise();
        nativeDialogCall(this.dialog, 'showModal');
        dispatchDomEvent(this.dialog, 'show');
        $(this).triggerHandler('show');
        return promise;
    }

    show() {
        if (this.options.backgroundScroll === false) {
            preventScroll();
        }
        const promise = this._openPromise();
        nativeDialogCall(this.dialog, 'show');
        dispatchDomEvent(this.dialog, 'show');
        $(this).triggerHandler('show');
        return promise;
    }

    // Show the dialog anchored next to `anchor` instead of centred.
    showAt(anchor, options) {
        const $anchor = $(anchor);
        if (!$anchor.length) {
            return this.show();
        }

        if (options == null || typeof options != 'object') {
            options = {};
        }

        this._anchor = $anchor[0];
        this._anchorOptions = options;
        $(this.dialog).addClass('dialogify--popover').removeClass('fixed');

        const promise = this.show();
        this.reposition();

        const self = this;
        this._anchorListener = function () {
            self.reposition();
        };
        window.addEventListener('scroll', this._anchorListener, true);
        window.addEventListener('resize', this._anchorListener);

        // A popover is not modal, so there is no backdrop to catch clicks.
        // Dismiss it when anything outside it is clicked, including the anchor
        // that opened it. Bound on the next tick so the click that triggered
        // showAt() does not immediately close it again.
        if (this.options.closable !== false) {
            this._outsideListener = function (e) {
                if (self.dialog.contains(e.target)) {
                    return;
                }
                const onAnchor = options.toggle !== false && self._anchor.contains(e.target);
                if (!dispatchDomEvent(self.dialog, 'cancel')) {
                    return;
                }
                // Clicking the anchor again toggles the popover shut. The click
                // is swallowed so the handler that called showAt() does not run
                // and immediately reopen it; a click on a different trigger is
                // left alone, so that one closes this popover and opens its own.
                if (onAnchor) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
                self.close();
            };
            this._outsideTimer = window.setTimeout(function () {
                if (self._outsideListener) {
                    window.document.addEventListener('click', self._outsideListener, true);
                }
            }, 0);
        }

        return promise;
    }

    // Recompute the anchored position. Flips to the opposite side when the
    // preferred placement would overflow the viewport.
    reposition() {
        if (!this._anchor || !this.dialog.open) {
            return this;
        }

        const options = this._anchorOptions || {};
        const offset = options.offset === undefined ? 8 : options.offset;
        const align = options.align || 'start';
        const rect = this._anchor.getBoundingClientRect();
        const box = this.dialog.getBoundingClientRect();
        const viewportWidth = window.innerWidth || 0;
        const viewportHeight = window.innerHeight || 0;

        let placement = options.placement || 'bottom';
        if (placement == 'bottom' && rect.bottom + offset + box.height > viewportHeight) {
            placement = 'top';
        } else if (placement == 'top' && rect.top - offset - box.height < 0) {
            placement = 'bottom';
        } else if (placement == 'right' && rect.right + offset + box.width > viewportWidth) {
            placement = 'left';
        } else if (placement == 'left' && rect.left - offset - box.width < 0) {
            placement = 'right';
        }

        let top;
        let left;
        if (placement == 'top' || placement == 'bottom') {
            top = placement == 'bottom' ? rect.bottom + offset : rect.top - offset - box.height;
            left = alignAxis(align, rect.left, rect.width, box.width);
        } else {
            left = placement == 'right' ? rect.right + offset : rect.left - offset - box.width;
            top = alignAxis(align, rect.top, rect.height, box.height);
        }

        left = clamp(left, 0, Math.max(0, viewportWidth - box.width));
        top = clamp(top, 0, Math.max(0, viewportHeight - box.height));

        $(this.dialog)
            .attr('data-placement', placement)
            .css({
                position: 'fixed',
                top: `${Math.round(top)}px`,
                left: `${Math.round(left)}px`,
                right: 'auto',
                bottom: 'auto',
                transform: 'none',
                margin: 0
            });

        return this;
    }

    _teardownAnchor() {
        if (this._anchorListener) {
            window.removeEventListener('scroll', this._anchorListener, true);
            window.removeEventListener('resize', this._anchorListener);
            this._anchorListener = null;
        }
        if (this._outsideTimer) {
            window.clearTimeout(this._outsideTimer);
            this._outsideTimer = null;
        }
        if (this._outsideListener) {
            window.document.removeEventListener('click', this._outsideListener, true);
            this._outsideListener = null;
        }
        this._anchor = null;
    }

    // Flag the dialog as closing *before* it actually closes. The native
    // `close` event is queued as a task, so between `close()` and the handler
    // the dialog has already lost its `open` attribute and would be hidden by
    // `display: none`. A paint landing in that gap makes the dialog blink out
    // and back in at full opacity before the exit animation runs.
    _markClosing() {
        if (this.dialog.open) {
            $(this.dialog).addClass('dialogify--closing');
        }
    }

    close(returnValue) {
        if (!this._fireBeforeClose(returnValue)) {
            return this;
        }
        this._markClosing();
        nativeDialogCall(this.dialog, 'close', returnValue === undefined ? [] : [returnValue]);
        return this;
    }

    isOpen() {
        return this.dialog.open;
    }

    on(event, handler) {
        $(this).on(event, handler);
        return this;
    }

    off(event, handler) {
        $(this).off(event, handler);
        return this;
    }

    // Replace the dialog body, keeping the title and buttons in place.
    setContent(content) {
        if (content instanceof window.Node || content instanceof $) {
            this.$body.empty().append(content);
        } else {
            this.$body.html(content == null ? '' : content);
        }
        return this;
    }

    getContent() {
        return this.$body.html();
    }

    // Load new body content over ajax, showing the loading state while in flight.
    load(url, data) {
        const self = this;
        let requestUrl = url;

        try {
            const parsed = new URL(url, window.location.href);
            const params = data || {};
            Object.keys(params).forEach(function (key) {
                parsed.searchParams.append(key, params[key]);
            });
            requestUrl = parsed.toString();
        } catch {
            // keep the original url if it is not a valid URL
        }

        this.setLoading(true);

        return window
            .fetch(requestUrl, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
            .then(function (response) {
                return response.text();
            })
            .then(function (html) {
                self.setContent(html);
                self.setLoading(false);
                if (self.options.ajaxComplete) {
                    self.options.ajaxComplete.call(self);
                }
                return self;
            })
            .catch(function (error) {
                self.setLoading(false);
                throw error;
            });
    }

    // Toggle a loading overlay over the dialog content.
    setLoading(loading) {
        if (loading === false) {
            this.$content.find('.dialogify__loading').remove();
            $(this.dialog).removeClass('is-loading');
            return this;
        }

        if (!this.$content.find('.dialogify__loading').length) {
            const label = typeof loading == 'string' ? loading : getLocale().loading;
            this.$content.append(
                $('<div>')
                    .addClass('dialogify__loading')
                    .attr({ role: 'status', 'aria-live': 'polite' })
                    .append($('<img>').attr({ src: LOADING_IMAGE, alt: label }))
            );
            $(this.dialog).addClass('is-loading');
        }

        return this;
    }

    isLoading() {
        return this.$content.find('.dialogify__loading').length > 0;
    }

    // Run native form validation, reporting the first invalid field.
    validate() {
        const form = this.$form[0];
        if (!form || typeof form.reportValidity != 'function') {
            return true;
        }
        return form.reportValidity();
    }

    formData() {
        const form = this.$form[0];
        if (!form || typeof window.FormData != 'function') {
            return null;
        }
        return new window.FormData(form);
    }

    // Plain-object view of the form, with repeated fields collected into arrays.
    formValues() {
        const data = this.formData();
        if (!data) {
            return {};
        }

        const values = {};
        data.forEach(function (value, key) {
            if (Object.prototype.hasOwnProperty.call(values, key)) {
                if (!Array.isArray(values[key])) {
                    values[key] = [values[key]];
                }
                values[key].push(value);
            } else {
                values[key] = value;
            }
        });
        return values;
    }

    // set title
    title(title) {
        const titleId = `${this.id}_title`;
        let $titleBox = $('<h5>')
            .addClass('dialogify_title')
            .attr('id', titleId)
            .append(
                '<img alt="" aria-hidden="true" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/PjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iJiN4NTcxNjsmI3g1QzY0O18xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDEyIDEwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxMiAxMDsiIHhtbDpzcGFjZT0icHJlc2VydmUiPjxnPjxyZWN0IHk9IjEiIHN0eWxlPSJmaWxsOiM4RDhEOEQ7IiB3aWR0aD0iMyIgaGVpZ2h0PSIzIi8+PHJlY3QgeT0iNyIgc3R5bGU9ImZpbGw6IzhEOEQ4RDsiIHdpZHRoPSIzIiBoZWlnaHQ9IjMiLz48cmVjdCB4PSIzIiB5PSI0IiBzdHlsZT0iZmlsbDojOEQ4RDhEOyIgd2lkdGg9IjMiIGhlaWdodD0iMyIvPjwvZz48L3N2Zz4=">'
            )
            .append(title);

        if (this.$content.find('.dialogify_title').length) {
            this.$content.find('.dialogify_title').replaceWith($titleBox);
        } else {
            this.$content.prepend($titleBox);
        }

        // Give assistive technology an accessible name for the dialog.
        $(this.dialog).attr('aria-labelledby', titleId);

        return this;
    }

    // Build a single button from its definition object.
    _createButton(definition, fallbackId) {
        const self = this;

        if (typeof definition == 'string') {
            const $existing = $(definition);
            return { id: $existing.attr('id') || fallbackId, $button: $existing };
        }

        if (definition == null || typeof definition != 'object') {
            definition = {};
        }

        const $btn = $('<button type="button">')
            .addClass('btn btn-insert')
            .addClass(definition.type || '')
            .data('click', definition.click);

        if (definition.type == Dialogify.BUTTON_PRIMARY && this.options.useDialogForm !== false) {
            $btn.attr('type', 'submit');
        }

        if (definition.focused) {
            $btn.prop('autofocus', true);
        }

        if (definition.disabled) {
            $btn.disable();
        }

        if (definition.loadingText) {
            $btn.attr('data-loading-text', definition.loadingText);
        }

        $btn.text(definition.text || getLocale().close);
        $btn.click(function (e) {
            if (typeof $(this).data('click') == 'function') {
                $(this).data('click').call(self, e);
            }
        });

        return { id: definition.id || fallbackId, $button: $btn };
    }

    // Return the button box, creating it if the dialog has none yet.
    _buttonBox(position) {
        let $buttonBox = this.$content.find('.btn-box');
        if (!$buttonBox.length) {
            $buttonBox = $('<div>')
                .addClass('btn-box')
                .addClass(position || 'text-right');
            this.$content.append($buttonBox);
        }
        return $buttonBox;
    }

    // set buttons
    buttons(buttons, options) {
        if (!Array.isArray(buttons)) {
            buttons = [];
        }

        if (options == null || typeof options != 'object') {
            options = {};
        }

        this.$buttonList = {};

        let $buttonBox = $('<div>')
            .addClass('btn-box')
            .addClass(options.position || 'text-right');

        for (let i = 0; i < buttons.length; i++) {
            const built = this._createButton(buttons[i], i);
            this.$buttonList[built.id] = built.$button;
            $buttonBox.append(built.$button);
        }

        if (this.$content.find('.btn-box').length) {
            this.$content.find('.btn-box').replaceWith($buttonBox);
        } else {
            this.$content.append($buttonBox);
        }

        return this;
    }

    // Append a single button without rebuilding the whole button box.
    addButton(button, options) {
        if (options == null || typeof options != 'object') {
            options = {};
        }

        if (this.$buttonList == null) {
            this.$buttonList = {};
        }

        const $buttonBox = this._buttonBox(options.position);
        const fallbackId = Object.keys(this.$buttonList).length;
        const built = this._createButton(button, fallbackId);

        this.$buttonList[built.id] = built.$button;

        if (options.prepend) {
            $buttonBox.prepend(built.$button);
        } else {
            $buttonBox.append(built.$button);
        }

        return this;
    }

    getButton(id) {
        return (this.$buttonList && this.$buttonList[id]) || $();
    }

    removeButton(id) {
        const $btn = this.getButton(id);
        if ($btn.length) {
            $btn.remove();
            delete this.$buttonList[id];
        }
        return this;
    }

    // Update an existing button in place. `loading` disables the button and
    // swaps in its data-loading-text, restoring the original text afterwards.
    updateButton(id, changes) {
        const $btn = this.getButton(id);
        if (!$btn.length || changes == null || typeof changes != 'object') {
            return this;
        }

        if (changes.text !== undefined) {
            $btn.text(changes.text);
        }

        if (changes.type !== undefined) {
            $btn.removeClass(`${Dialogify.BUTTON_PRIMARY} ${Dialogify.BUTTON_DANGER}`).addClass(
                changes.type || ''
            );
        }

        if (changes.click !== undefined) {
            $btn.data('click', changes.click);
        }

        if (changes.loadingText !== undefined) {
            $btn.attr('data-loading-text', changes.loadingText);
        }

        if (changes.loading !== undefined) {
            if (changes.loading) {
                if ($btn.data('originalText') === undefined) {
                    $btn.data('originalText', $btn.text());
                }
                const loadingText = $btn.attr('data-loading-text');
                if (loadingText) {
                    $btn.text(loadingText);
                }
                $btn.addClass('is-loading').attr('aria-busy', 'true').disable();
            } else {
                const originalText = $btn.data('originalText');
                if (originalText !== undefined) {
                    $btn.text(originalText);
                    $btn.removeData('originalText');
                }
                $btn.removeClass('is-loading').removeAttr('aria-busy').enable();
            }
        }

        if (changes.disabled !== undefined) {
            if (changes.disabled) {
                $btn.disable();
            } else {
                $btn.enable();
            }
        }

        return this;
    }
}

// constants
Dialogify.counter = 0;

Dialogify.SIZE_LARGE = 'dialogify__autowidth';

Dialogify.BUTTON_CENTER = 'text-center';
Dialogify.BUTTON_LEFT = 'text-left';

Dialogify.BUTTON_PRIMARY = 'btn-primary';
Dialogify.BUTTON_DANGER = 'btn-danger';

Dialogify.LOCALE = {};
Dialogify.LOCALE['zh_TW'] = { ok: '確定', cancel: '取消', close: '關閉', loading: '載入中' };
Dialogify.LOCALE['zh_CN'] = { ok: '确定', cancel: '取消', close: '关闭', loading: '加载中' };
Dialogify.LOCALE['en_US'] = { ok: 'Ok', cancel: 'Cancel', close: 'Close', loading: 'Loading' };

Dialogify.POSITION_LEFT = 'left';
Dialogify.POSITION_RIGHT = 'right';
Dialogify.POSITION_TOP = 'top';
Dialogify.POSITION_BOTTOM = 'bottom';

Dialogify.TOAST_INFO = 'info';
Dialogify.TOAST_SUCCESS = 'success';
Dialogify.TOAST_WARNING = 'warning';
Dialogify.TOAST_ERROR = 'error';

Dialogify.TOAST_TOP_LEFT = 'top-left';
Dialogify.TOAST_TOP_CENTER = 'top-center';
Dialogify.TOAST_TOP_RIGHT = 'top-right';
Dialogify.TOAST_BOTTOM_LEFT = 'bottom-left';
Dialogify.TOAST_BOTTOM_CENTER = 'bottom-center';
Dialogify.TOAST_BOTTOM_RIGHT = 'bottom-right';

// Registry for declarative event handlers referenced by name from markup,
// e.g. <dialog is="bahamut-dialogify" onshow="myHandler">.
Dialogify.handlers = {};

// Build a Dialogify instance around an existing <dialog> element instead of
// creating a new one. Used by the custom element to adopt author markup.
Dialogify.adopt = function (dialog, source, options, setupOptions) {
    const instance = Object.create(Dialogify.prototype);
    instance._setup(dialog, source, options, setupOptions);
    return instance;
};

// static methods
Dialogify.alert = function (message, options) {
    if (options == null || typeof options != 'object') {
        options = {};
    }

    if (options.dialogOptions == null || typeof options.dialogOptions != 'object') {
        options.dialogOptions = {};
    }

    return new Promise((resolve) => {
        new Dialogify(`<p>${message}</p>`, options.dialogOptions)
            .buttons(
                [
                    {
                        type: Dialogify.BUTTON_DANGER,
                        click: function (e) {
                            options.close && options.close.call(this);
                            resolve();
                            this.close();
                        }
                    }
                ],
                { position: Dialogify.BUTTON_CENTER }
            )
            .on('cancel', function () {
                options.close && options.close.call(this);
                resolve();
            })
            .showModal();
    });
};

Dialogify.confirm = function (message, options) {
    const config = getConfig();
    if (options == null || typeof options != 'object') {
        options = {};
    }

    if (options.dialogOptions == null || typeof options.dialogOptions != 'object') {
        options.dialogOptions = {};
    }

    return new Promise((resolve) => {
        new Dialogify(`<p>${message}</p>`, options.dialogOptions)
            .buttons([
                {
                    text: Dialogify.LOCALE[config.locale].cancel,
                    click: function (e) {
                        options.cancel && options.cancel.call(this);
                        resolve(false);
                        this.close();
                    }
                },
                {
                    text: Dialogify.LOCALE[config.locale].ok,
                    type: Dialogify.BUTTON_PRIMARY,
                    focused: true,
                    click: function (e) {
                        options.ok && options.ok.call(this);
                        resolve(true);
                        this.close();
                    }
                }
            ])
            .on('cancel', function () {
                options.cancel && options.cancel.call(this);
                resolve(false);
            })
            .showModal();
    });
};

Dialogify.prompt = function (message, options) {
    const config = getConfig();
    if (options == null || typeof options != 'object') {
        options = {};
    }

    if (options.dialogOptions == null || typeof options.dialogOptions != 'object') {
        options.dialogOptions = {};
    }

    let placeholder = options.placeholder ? options.placeholder : '';
    let value = options.value ? options.value : '';
    let $input = $('<input>')
        .attr('type', 'text')
        .addClass('text-field dialogify-prompt-input')
        .attr('placeholder', placeholder)
        .attr('value', value);
    let $html = $('<div>').html(`<p>${message}</p>`);
    $html.append($input);

    return new Promise((resolve) => {
        new Dialogify($html.html(), options.dialogOptions)
            .buttons([
                {
                    text: Dialogify.LOCALE[config.locale].cancel,
                    click: function (e) {
                        options.cancel && options.cancel.call(this);
                        resolve(null);
                        this.close();
                    }
                },
                {
                    text: Dialogify.LOCALE[config.locale].ok,
                    type: Dialogify.BUTTON_PRIMARY,
                    click: function (e) {
                        let value = this.$content.find('.dialogify-prompt-input').val();
                        options.ok && options.ok.call(this, value);
                        resolve(value);
                        this.close();
                    }
                }
            ])
            .on('cancel', function () {
                options.cancel && options.cancel.call(this);
                resolve(null);
            })
            .showModal();
    });
};

Dialogify.closeAll = function () {
    $('dialog.dialogify').each(function () {
        if (this.open) {
            $(this).addClass('dialogify--closing');
        }
        nativeDialogCall(this, 'close');
    });
};

// Lightweight auto-dismissing notification. Toasts are non-modal dialogs kept
// in a fixed corner container so several can stack.
Dialogify.toast = function (message, options) {
    if (options == null || typeof options != 'object') {
        options = {};
    }

    const position =
        TOAST_POSITIONS.indexOf(options.position) >= 0 ? options.position : 'top-right';
    const duration = options.duration === undefined ? 3000 : options.duration;
    const type = options.type || Dialogify.TOAST_INFO;

    const dialogOptions = Object.assign(
        {
            closable: false,
            useDialogForm: false,
            backgroundScroll: true,
            fixed: false,
            variant: 'toast'
        },
        options.dialogOptions
    );

    const toast = new Dialogify(message, dialogOptions);
    $(toast.dialog).addClass(`dialogify--toast-${type}`).attr('role', 'status');

    if (options.title) {
        toast.title(options.title);
    }

    if (options.closable) {
        $(toast.dialog)
            .addClass('dialogify--toast-closable')
            .append(
                $('<button type="button">')
                    .addClass('dialogify__toast-close')
                    .attr('aria-label', getLocale().close)
                    .text('\u00d7')
                    .on('click', function () {
                        toast.close();
                    })
            );
    }

    $(toast.dialog).appendTo(toastContainer(position));

    let timer = null;
    const clearTimer = function () {
        if (timer) {
            window.clearTimeout(timer);
            timer = null;
        }
    };

    if (duration > 0) {
        timer = window.setTimeout(function () {
            toast.close();
        }, duration);

        // Keep the toast on screen while the pointer rests on it.
        $(toast.dialog)
            .on('mouseenter', clearTimer)
            .on('mouseleave', function () {
                clearTimer();
                timer = window.setTimeout(function () {
                    toast.close();
                }, duration);
            });
    }

    toast.on('close', function () {
        clearTimer();
    });

    // A closing toast holds its slot until the exit animation ends, which would
    // make the rest of the stack jump when it is finally removed. Collapse the
    // slot over the same period so the toasts below slide up instead.
    toast._onClosing = function () {
        collapseToastSlot(toast.dialog);
    };

    // Runs after the exit animation, once the instance close handler has
    // detached the toast, so an emptied container is pruned in the same tick.
    toast._onExit = function () {
        $(toast.dialog).remove();
        pruneToastContainers();
    };

    const promise = toast.show();
    toast.promise = promise;
    return toast;
};

function collapseToastSlot(el) {
    const container = el.parentNode;
    if (!container || typeof el.animate != 'function') {
        return;
    }

    // Match the exit animation the stylesheet just applied; it is zero under
    // `prefers-reduced-motion`, where the toast disappears at once anyway.
    const duration = parseFloat(window.getComputedStyle(el).animationDuration) * 1000;
    const height = el.getBoundingClientRect().height;
    if (!duration || !height) {
        return;
    }

    const gap = parseFloat(window.getComputedStyle(container).rowGap) || 0;
    el.animate(
        [
            { height: `${height}px`, marginBlockEnd: '0px' },
            { height: '0px', marginBlockEnd: `-${gap}px` }
        ],
        { duration: duration, easing: 'ease-in', fill: 'forwards' }
    );
}

function toastContainer(position) {
    const id = `dialogify-toasts-${position}`;
    let $container = $(`#${id}`);
    if (!$container.length) {
        $container = $('<div>')
            .attr('id', id)
            .addClass(`dialogify-toast-container dialogify-toast-container--${position}`)
            .appendTo('body');
    }
    return $container;
}

function pruneToastContainers() {
    $('.dialogify-toast-container').each(function () {
        if (!$(this).children().length) {
            $(this).remove();
        }
    });
}

function preventScroll() {
    // 防止body滾動
    $('body').css({
        overflow: 'hidden',
        'padding-right': window.innerWidth - document.documentElement.clientWidth
    });
}

function roundCssTransformMatrix(el) {
    el.style.transform = '';

    let mx = window.getComputedStyle(el, null).getPropertyValue('transform') || false;

    if (mx) {
        let values = mx.replace(/[ ()]|matrix/g, '').split(',');
        values[4] = Math.ceil(values[4]);
        values[5] = Math.ceil(values[5]);

        $(el).css('transform', `matrix(${values.join()})`);
    }
}

// Inject the bundled CSS unless a #dialogifyCss stylesheet is already present.
// Link a standalone dialogify.css with id="dialogifyCss" before this script to
// disable the injection (e.g. for custom theming).
if (typeof document !== 'undefined' && !$('#dialogifyCss').length) {
    $('<style>').attr({ type: 'text/css', id: 'dialogifyCss' }).html('__css__').appendTo('head');
}

$.fn.extend({
    enable: function () {
        if ($(this).hasClass('btn btn-insert')) {
            $(this).prop('disabled', false).removeClass('is-disabled');
        }
    },
    disable: function () {
        if ($(this).hasClass('btn btn-insert')) {
            $(this).prop('disabled', true).addClass('is-disabled');
        }
    }
});

// Expose as a browser global for the classic <script> usage.
if (typeof window !== 'undefined') {
    window.Dialogify = Dialogify;
}

export default Dialogify;
