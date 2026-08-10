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
import Dialogify, { getLocale, dispatchDomEvent } from './core.js';

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
    'ajax-prefix': 'ajaxPrefix',
    position: 'position'
};

const BUTTON_SELECTOR =
    'button[ok], button[cancel], button[close], button[primary], button[danger]';

const EVENT_ATTRIBUTES = ['onshow', 'onclose', 'oncancel', 'onbeforeclose'];

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

    const locale = getLocale();

    const position = element.getAttribute('buttons-position');
    const $buttonBox = $('<div>')
        .addClass('btn-box')
        .addClass(position ? `text-${position}` : 'text-right');

    // Declarative buttons join $buttonList so getButton()/updateButton() work
    // on them exactly like programmatic ones.
    instance.$buttonList = instance.$buttonList || {};
    let index = 0;

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

        // Normalise the declarative loading-text attribute onto the same
        // data attribute updateButton() reads for programmatic buttons.
        const loadingText = $button.attr('loading-text');
        if (loadingText && !$button.attr('data-loading-text')) {
            $button.attr('data-loading-text', loadingText);
        }

        if ($button.is('[ok], [cancel], [close]')) {
            const isCancel = $button.is('[cancel]');
            $button.on('click', function () {
                // Route through close() so beforeclose can veto the close.
                if (isCancel && !dispatchDomEvent(element, 'cancel')) {
                    return;
                }
                instance.close();
            });
        }

        instance.$buttonList[$button.attr('id') || index] = $button;
        index++;

        $buttonBox.append(this);
    });

    instance.$content.append($buttonBox);
}

// The attribute is resolved when the event fires rather than at bind time, so
// handlers declared later in the page (or swapped at runtime) still work, and
// changing the attribute takes effect immediately.
function bindDeclarativeHandlers(element) {
    EVENT_ATTRIBUTES.forEach(function (attr) {
        const type = attr.slice(2);
        element.addEventListener(type, function (event) {
            const handler = resolveHandler(element.getAttribute(attr));
            if (!handler) {
                return;
            }
            // Returning false cancels the event, matching inline handler semantics.
            if (handler.call(element, event) === false) {
                event.preventDefault();
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

        get onbeforeclose() {
            return this._onbeforecloseHandler || null;
        }

        set onbeforeclose(handler) {
            if (this._onbeforecloseWrapper) {
                this.removeEventListener('beforeclose', this._onbeforecloseWrapper);
                this._onbeforecloseWrapper = null;
            }

            this._onbeforecloseHandler = typeof handler == 'function' ? handler : null;

            if (this._onbeforecloseHandler) {
                const self = this;
                this._onbeforecloseWrapper = function (event) {
                    if (self._onbeforecloseHandler.call(self, event) === false) {
                        event.preventDefault();
                    }
                };
                this.addEventListener('beforeclose', this._onbeforecloseWrapper);
            }
        }

        show() {
            this._initDialogify();
            return this._dialogifyInstance.show();
        }

        showModal() {
            this._initDialogify();
            return this._dialogifyInstance.showModal();
        }

        // Show anchored next to another element, e.g. a dropdown or popover.
        showAt(anchor, options) {
            this._initDialogify();
            return this._dialogifyInstance.showAt(
                anchor === undefined ? this._defaultAnchor() : anchor,
                options === undefined ? this._defaultAnchorOptions() : options
            );
        }

        reposition() {
            this._initDialogify();
            this._dialogifyInstance.reposition();
            return this;
        }

        _defaultAnchor() {
            const selector = this.getAttribute('anchor');
            return selector ? window.document.querySelector(selector) : null;
        }

        _defaultAnchorOptions() {
            const options = {};
            const placement = this.getAttribute('placement');
            const align = this.getAttribute('align');
            const offset = this.getAttribute('offset');

            if (placement) {
                options.placement = placement;
            }
            if (align) {
                options.align = align;
            }
            if (offset !== null && offset !== '' && !isNaN(Number(offset))) {
                options.offset = Number(offset);
            }
            return options;
        }

        isOpen() {
            return this.open;
        }

        // Routed through the instance so beforeclose can veto this path too.
        // The instance calls the native close via HTMLDialogElement.prototype,
        // so this override does not recurse.
        close(returnValue) {
            if (!this._dialogifyInstance) {
                window.HTMLDialogElement.prototype.close.apply(
                    this,
                    returnValue === undefined ? [] : [returnValue]
                );
                return;
            }
            this._dialogifyInstance.close(returnValue);
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

        addButton(button, options) {
            this._initDialogify();
            this._dialogifyInstance.addButton(button, options);
            return this;
        }

        removeButton(id) {
            this._initDialogify();
            this._dialogifyInstance.removeButton(id);
            return this;
        }

        updateButton(id, changes) {
            this._initDialogify();
            this._dialogifyInstance.updateButton(id, changes);
            return this;
        }

        getButton(id) {
            this._initDialogify();
            return this._dialogifyInstance.getButton(id);
        }

        setContent(content) {
            this._initDialogify();
            this._dialogifyInstance.setContent(content);
            return this;
        }

        getContent() {
            this._initDialogify();
            return this._dialogifyInstance.getContent();
        }

        load(url, data) {
            this._initDialogify();
            return this._dialogifyInstance.load(url, data);
        }

        setLoading(loading) {
            this._initDialogify();
            this._dialogifyInstance.setLoading(loading);
            return this;
        }

        isLoading() {
            this._initDialogify();
            return this._dialogifyInstance.isLoading();
        }

        validate() {
            this._initDialogify();
            return this._dialogifyInstance.validate();
        }

        formData() {
            this._initDialogify();
            return this._dialogifyInstance.formData();
        }

        formValues() {
            this._initDialogify();
            return this._dialogifyInstance.formValues();
        }

        on(event, handler) {
            this._initDialogify();
            this._dialogifyInstance.on(event, handler);
            return this;
        }

        off(event, handler) {
            this._initDialogify();
            this._dialogifyInstance.off(event, handler);
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
