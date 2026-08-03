/**
 * dialogify custom element
 *
 * Registers a customized built-in element so a lightbox can be written
 * declaratively:
 *
 *   <dialog is="bahamut-dialogify" closable="false" onshow="myHandler">
 *       content <b>bold text</b>
 *       <button ok></button>
 *   </dialog>
 */

import $ from 'jquery';
import Dialogify, { getConfig, nativeDialogCall } from './core.js';

export const ELEMENT_NAME = 'bahamut-dialogify';

// attribute name -> boolean option name
const BOOLEAN_ATTRIBUTES = {
    closable: 'closable',
    fixed: 'fixed',
    'background-scroll': 'backgroundScroll',
    'use-dialog-form': 'useDialogForm'
};

// attribute name -> string option name
const STRING_ATTRIBUTES = {
    'ajax-prefix': 'ajaxPrefix'
};

const BUTTON_SELECTOR =
    'button[ok], button[cancel], button[close], button[primary], button[danger]';

const IDENTIFIER_PATTERN = /^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*)*$/;

// Attributes are strings, so `closable="false"` must resolve to false. A bare
// attribute (or "true") means true, matching the intent of the markup.
function parseBooleanAttribute(value) {
    const normalized = String(value).trim().toLowerCase();
    return !(normalized === 'false' || normalized === '0' || normalized === 'no');
}

// Resolve a handler referenced by *name* from markup. Only plain identifier
// paths are accepted, so inline code such as onclose="alert('hi')" is ignored
// here and left to the browser's native inline handler support.
function resolveHandler(value) {
    if (typeof value != 'string') {
        return null;
    }

    const path = value.trim();
    if (!IDENTIFIER_PATTERN.test(path)) {
        return null;
    }

    if (typeof Dialogify.handlers[path] == 'function') {
        return Dialogify.handlers[path];
    }

    let target = window;
    const parts = path.split('.');
    for (let i = 0; i < parts.length; i++) {
        if (target == null) {
            return null;
        }
        target = target[parts[i]];
    }

    return typeof target == 'function' ? target : null;
}

function readOptions(element) {
    const options = {};

    const json = element.getAttribute('options');
    if (json) {
        try {
            const parsed = JSON.parse(json);
            if (parsed != null && typeof parsed == 'object') {
                Object.assign(options, parsed);
            }
        } catch {
            // ignore malformed JSON and fall back to the individual attributes
        }
    }

    Object.keys(BOOLEAN_ATTRIBUTES).forEach(function (attr) {
        if (element.hasAttribute(attr)) {
            options[BOOLEAN_ATTRIBUTES[attr]] = parseBooleanAttribute(element.getAttribute(attr));
        }
    });

    Object.keys(STRING_ATTRIBUTES).forEach(function (attr) {
        if (element.hasAttribute(attr)) {
            options[STRING_ATTRIBUTES[attr]] = element.getAttribute(attr);
        }
    });

    const size = element.getAttribute('size');
    if (size) {
        options.size = size == 'large' ? Dialogify.SIZE_LARGE : size;
    }

    // Author markup belongs to the page, so it must survive being closed.
    options.autoRemove = false;

    return options;
}

// Turn the declarative <button ok> markup into the same structure the
// programmatic buttons() API produces, so styling and behaviour match.
function upgradeButtons(instance, element) {
    const $buttons = instance.$content.find(BUTTON_SELECTOR);
    if (!$buttons.length) {
        return;
    }

    const config = getConfig();
    const locale = Dialogify.LOCALE[config.locale] || Dialogify.LOCALE['zh_TW'];

    const position = element.getAttribute('buttons-position');
    const $buttonBox = $('<div>')
        .addClass('btn-box')
        .addClass(position ? `text-${position}` : 'text-right');

    $buttons.each(function () {
        const $button = $(this);

        if (!$button.attr('type')) {
            $button.attr('type', 'button');
        }

        $button.addClass('btn btn-insert');

        if ($button.is('[ok], [primary]')) {
            $button.addClass(Dialogify.BUTTON_PRIMARY);
        } else if ($button.is('[danger]')) {
            $button.addClass(Dialogify.BUTTON_DANGER);
        }

        if (!$button.text().trim()) {
            if ($button.is('[ok]')) {
                $button.text(locale.ok);
            } else if ($button.is('[cancel]')) {
                $button.text(locale.cancel);
            } else {
                $button.text(locale.close);
            }
        }

        if ($button.prop('disabled')) {
            $button.addClass('is-disabled');
        }

        if ($button.is('[ok], [cancel], [close]')) {
            const isCancel = $button.is('[cancel]');
            $button.on('click', function () {
                if (isCancel) {
                    element.dispatchEvent(
                        new window.CustomEvent('cancel', { bubbles: false, cancelable: true })
                    );
                }
                nativeDialogCall(element, 'close');
            });
        }

        $buttonBox.append(this);
    });

    instance.$content.append($buttonBox);
}

// The attribute is resolved when the event fires rather than at bind time, so
// handlers declared later in the page (or swapped at runtime) still work, and
// changing the attribute takes effect immediately.
function bindDeclarativeHandlers(element) {
    ['onshow', 'onclose', 'oncancel'].forEach(function (attr) {
        const type = attr.slice(2);
        element.addEventListener(type, function (event) {
            const handler = resolveHandler(element.getAttribute(attr));
            if (handler) {
                handler.call(element, event);
            }
        });
    });
}

let DialogifyElement = null;

export function createDialogifyElement() {
    if (DialogifyElement) {
        return DialogifyElement;
    }

    DialogifyElement = class DialogifyElement extends window.HTMLDialogElement {
        connectedCallback() {
            // While the parser is still building the document the children of
            // this element may not exist yet, so defer initialisation. The
            // dialog is not visible until show()/showModal(), so nothing flashes.
            if (window.document.readyState == 'loading') {
                const self = this;
                window.document.addEventListener(
                    'DOMContentLoaded',
                    function () {
                        self._initDialogify();
                    },
                    { once: true }
                );
                return;
            }

            this._initDialogify();
        }

        _initDialogify() {
            if (this._dialogifyInstance || !this.isConnected) {
                return;
            }

            const options = Object.assign(readOptions(this), this._pendingOptions);

            // `src` loads remote content, otherwise the existing children are
            // moved into the dialogify chrome (preserving bound listeners).
            const src = this.getAttribute('src');
            let content = null;
            if (!src) {
                content = window.document.createDocumentFragment();
                while (this.firstChild) {
                    content.appendChild(this.firstChild);
                }
            }

            const instance = Dialogify.adopt(this, src || '', options, {
                append: false,
                content: content
            });

            instance.dialog = this;
            this._dialogifyInstance = instance;

            const title = this.getAttribute('dialog-title');
            if (title) {
                instance.title(title);
            }

            upgradeButtons(instance, this);
            bindDeclarativeHandlers(this);
        }

        // The Dialogify instance backing this element.
        get dialogify() {
            this._initDialogify();
            return this._dialogifyInstance;
        }

        get options() {
            return this._dialogifyInstance
                ? this._dialogifyInstance.options
                : this._pendingOptions || {};
        }

        // Options may be assigned before the element is initialised, which is
        // how complex values (style objects, callbacks) are provided.
        set options(value) {
            if (value == null || typeof value != 'object') {
                return;
            }

            if (this._dialogifyInstance) {
                Object.assign(this._dialogifyInstance.options, value);
            } else {
                this._pendingOptions = Object.assign(this._pendingOptions || {}, value);
            }
        }

        get onshow() {
            return this._onshowHandler || null;
        }

        set onshow(handler) {
            if (this._onshowHandler) {
                this.removeEventListener('show', this._onshowHandler);
            }

            this._onshowHandler = typeof handler == 'function' ? handler : null;

            if (this._onshowHandler) {
                this.addEventListener('show', this._onshowHandler);
            }
        }

        show() {
            this._initDialogify();
            this._dialogifyInstance.show();
        }

        showModal() {
            this._initDialogify();
            this._dialogifyInstance.showModal();
        }

        isOpen() {
            return this.open;
        }

        // Named setTitle, not title: HTMLElement.title is the native tooltip
        // string property and must keep its standard behaviour.
        setTitle(value) {
            this._initDialogify();
            this._dialogifyInstance.title(value);
            return this;
        }

        buttons(buttons, options) {
            this._initDialogify();
            this._dialogifyInstance.buttons(buttons, options);
            return this;
        }

        on(event, handler) {
            this._initDialogify();
            this._dialogifyInstance.on(event, handler);
            return this;
        }
    };

    return DialogifyElement;
}

export function defineDialogifyElement(name) {
    const elementName = name || ELEMENT_NAME;

    if (
        typeof window == 'undefined' ||
        !window.customElements ||
        typeof window.HTMLDialogElement != 'function'
    ) {
        return null;
    }

    if (window.customElements.get(elementName)) {
        return window.customElements.get(elementName);
    }

    const ctor = createDialogifyElement();

    try {
        window.customElements.define(elementName, ctor, { extends: 'dialog' });
    } catch {
        // Browsers without customized built-in support (notably WebKit) throw
        // here; load the optional custom-elements polyfill to enable it.
        return null;
    }

    return ctor;
}
