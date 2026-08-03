import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import Dialogify from '../src/js/dialogify.js';

const TAG = 'bahamut-dialogify';

function mount(html) {
    const host = document.createElement('div');
    host.innerHTML = html;
    const el = host.firstElementChild;
    document.body.appendChild(el);
    return el;
}

beforeAll(() => {
    // The element is registered by the entry module on import.
    expect(customElements.get(TAG)).toBeTruthy();
});

afterEach(() => {
    document.querySelectorAll('dialog').forEach((d) => d.remove());
    Dialogify.handlers = {};
});

describe('custom element registration', () => {
    it('upgrades <dialog is="bahamut-dialogify">', () => {
        const el = mount(`<dialog is="${TAG}">hello</dialog>`);
        expect(el instanceof window.HTMLDialogElement).toBe(true);
        expect(typeof el.show).toBe('function');
        expect(el.classList.contains('dialogify')).toBe(true);
    });

    it('keeps the html content of the dialog, including markup', () => {
        const el = mount(`<dialog is="${TAG}">dialog content <b>bold text</b></dialog>`);
        const body = el.querySelector('.dialogify__body');

        expect(body).toBeTruthy();
        expect(body.textContent).toContain('dialog content');
        expect(body.querySelector('b').textContent).toBe('bold text');
    });

    it('preserves listeners bound before upgrade by moving nodes', () => {
        const host = document.createElement('div');
        host.innerHTML = `<dialog is="${TAG}"><span id="probe">x</span></dialog>`;
        const el = host.firstElementChild;
        const probe = el.querySelector('#probe');
        const onClick = vi.fn();
        probe.addEventListener('click', onClick);

        document.body.appendChild(el);
        el.querySelector('#probe').click();

        expect(onClick).toHaveBeenCalled();
    });
});

describe('native methods on the selected element', () => {
    it('supports document.querySelector(...).show() / close()', () => {
        mount(`<dialog is="${TAG}" use-dialog-form="false">content</dialog>`);
        const el = document.querySelector(`dialog[is="${TAG}"]`);

        expect(el.isOpen()).toBe(false);
        el.show();
        expect(el.open).toBe(true);
        el.close();
        expect(el.open).toBe(false);
    });

    it('does not remove itself on close and can be reopened', () => {
        const el = mount(`<dialog is="${TAG}" use-dialog-form="false">content</dialog>`);
        el.show();
        el.close();

        expect(el.isConnected).toBe(true);
        el.show();
        expect(el.open).toBe(true);
    });

    it('exposes the underlying Dialogify instance', () => {
        const el = mount(`<dialog is="${TAG}">content</dialog>`);
        expect(el.dialogify).toBeTruthy();
        expect(el.dialogify.$content).toBeTruthy();
    });
});

describe('options via attributes', () => {
    it('closable="false" removes the close button', () => {
        const withClose = mount(`<dialog is="${TAG}">a</dialog>`);
        expect(withClose.querySelector('.dialogify__close')).toBeTruthy();

        const noClose = mount(`<dialog is="${TAG}" closable="false">b</dialog>`);
        expect(noClose.querySelector('.dialogify__close')).toBeNull();
    });

    it('use-dialog-form="false" skips the form wrapper', () => {
        const withForm = mount(`<dialog is="${TAG}">a</dialog>`);
        expect(withForm.querySelector('form[method="dialog"]')).toBeTruthy();

        const noForm = mount(`<dialog is="${TAG}" use-dialog-form="false">b</dialog>`);
        expect(noForm.querySelector('form')).toBeNull();
    });

    it('size="large" applies the large width class', () => {
        const el = mount(`<dialog is="${TAG}" size="large">a</dialog>`);
        expect(
            el.querySelector('.dialogify__content').classList.contains(Dialogify.SIZE_LARGE)
        ).toBe(true);
    });

    it('dialog-title renders a title', () => {
        const el = mount(`<dialog is="${TAG}" dialog-title="My title">a</dialog>`);
        expect(el.querySelector('.dialogify_title').textContent).toContain('My title');
    });

    it('accepts a JSON options attribute', () => {
        const el = mount(`<dialog is="${TAG}" options='{"closable":false}'>a</dialog>`);
        expect(el.querySelector('.dialogify__close')).toBeNull();
    });
});

describe('declarative buttons', () => {
    it('renders <button ok> and <button cancel> with locale text', () => {
        window.dialogifyConfig = { locale: 'en_US' };
        const el = mount(
            `<dialog is="${TAG}">a<button ok></button><button cancel></button></dialog>`
        );

        const buttons = el.querySelectorAll('.btn-box .btn');
        expect(buttons.length).toBe(2);
        expect(buttons[0].textContent).toBe('Ok');
        expect(buttons[0].classList.contains('btn-primary')).toBe(true);
        expect(buttons[1].textContent).toBe('Cancel');

        delete window.dialogifyConfig;
    });

    it('keeps custom button text and applies style attributes', () => {
        const el = mount(
            `<dialog is="${TAG}">a<button primary>Save</button><button danger>Del</button></dialog>`
        );

        const buttons = el.querySelectorAll('.btn-box .btn');
        expect(buttons[0].textContent).toBe('Save');
        expect(buttons[0].classList.contains('btn-primary')).toBe(true);
        expect(buttons[1].classList.contains('btn-danger')).toBe(true);
    });

    it('ok and cancel buttons close the dialog', () => {
        const el = mount(
            `<dialog is="${TAG}" use-dialog-form="false">a<button ok></button></dialog>`
        );
        el.show();
        expect(el.open).toBe(true);

        el.querySelector('button[ok]').click();
        expect(el.open).toBe(false);
    });

    it('cancel button fires a cancel event', () => {
        const el = mount(
            `<dialog is="${TAG}" use-dialog-form="false">a<button cancel></button></dialog>`
        );
        const onCancel = vi.fn();
        el.addEventListener('cancel', onCancel);

        el.show();
        el.querySelector('button[cancel]').click();

        expect(onCancel).toHaveBeenCalled();
        expect(el.open).toBe(false);
    });

    it('honours buttons-position', () => {
        const el = mount(
            `<dialog is="${TAG}" buttons-position="center">a<button ok></button></dialog>`
        );
        expect(el.querySelector('.btn-box').classList.contains('text-center')).toBe(true);
    });
});

describe('events', () => {
    it('dispatches a real show event for addEventListener', () => {
        const el = mount(`<dialog is="${TAG}" use-dialog-form="false">a</dialog>`);
        const onShow = vi.fn();
        el.addEventListener('show', onShow);

        el.show();
        expect(onShow).toHaveBeenCalled();
    });

    it('supports the onshow property', () => {
        const el = mount(`<dialog is="${TAG}" use-dialog-form="false">a</dialog>`);
        const onShow = vi.fn();
        el.onshow = onShow;

        el.show();
        expect(onShow).toHaveBeenCalled();
        expect(el.onshow).toBe(onShow);
    });

    it('resolves onshow="functionName" from the handler registry', () => {
        const handler = vi.fn();
        Dialogify.handlers.myShowHandler = handler;

        const el = mount(
            `<dialog is="${TAG}" use-dialog-form="false" onshow="myShowHandler">a</dialog>`
        );
        el.show();

        expect(handler).toHaveBeenCalled();
    });

    it('resolves a handler name from a global dotted path', () => {
        const handler = vi.fn();
        window.MyApp = { onDialogShow: handler };

        const el = mount(
            `<dialog is="${TAG}" use-dialog-form="false" onshow="MyApp.onDialogShow">a</dialog>`
        );
        el.show();

        expect(handler).toHaveBeenCalled();
        delete window.MyApp;
    });

    it('ignores inline code in onclose so native handling still applies', () => {
        // Must not throw while resolving a non-identifier value.
        const el = mount(`<dialog is="${TAG}" onclose="alert('close')">a</dialog>`);
        expect(el.dialogify).toBeTruthy();
    });

    it('fires the native close event on close', () => {
        const el = mount(`<dialog is="${TAG}" use-dialog-form="false">a</dialog>`);
        const onClose = vi.fn();
        el.addEventListener('close', onClose);

        el.show();
        el.close();

        expect(onClose).toHaveBeenCalled();
    });
});

describe('interoperability with the programmatic API', () => {
    it('closeAll closes declarative dialogs too', () => {
        const el = mount(`<dialog is="${TAG}" use-dialog-form="false">a</dialog>`);
        const programmatic = new Dialogify('b', { useDialogForm: false });

        el.show();
        programmatic.show();

        Dialogify.closeAll();

        expect(el.open).toBe(false);
        expect(programmatic.isOpen()).toBe(false);
    });

    it('still supports instance events through .on()', () => {
        const el = mount(`<dialog is="${TAG}" use-dialog-form="false">a</dialog>`);
        const onShow = vi.fn();
        el.on('show', onShow);

        el.show();
        expect(onShow).toHaveBeenCalled();
    });
});

describe('late-bound declarative handlers', () => {
    it('resolves onshow="name" at dispatch time, not at upgrade time', () => {
        const el = mount(
            `<dialog is="${TAG}" use-dialog-form="false" onshow="lateHandler">a</dialog>`
        );

        // Handler is registered only after the element has been upgraded.
        const handler = vi.fn();
        Dialogify.handlers.lateHandler = handler;

        el.show();
        expect(handler).toHaveBeenCalled();
    });

    it('picks up a changed onshow attribute', () => {
        const first = vi.fn();
        const second = vi.fn();
        Dialogify.handlers.firstHandler = first;
        Dialogify.handlers.secondHandler = second;

        const el = mount(
            `<dialog is="${TAG}" use-dialog-form="false" onshow="firstHandler">a</dialog>`
        );
        el.show();
        el.close();

        el.setAttribute('onshow', 'secondHandler');
        el.show();

        expect(first).toHaveBeenCalledTimes(1);
        expect(second).toHaveBeenCalledTimes(1);
    });
});

describe('native property compatibility', () => {
    it('keeps HTMLElement.title as the native tooltip string', () => {
        const el = mount(`<dialog is="${TAG}" title="tooltip text">a</dialog>`);

        expect(el.title).toBe('tooltip text');
        el.title = 'changed';
        expect(el.getAttribute('title')).toBe('changed');
    });

    it('sets the dialog title via setTitle()', () => {
        const el = mount(`<dialog is="${TAG}">a</dialog>`);
        el.setTitle('My heading');

        expect(el.querySelector('.dialogify_title').textContent).toContain('My heading');
    });

    it('exposes native open/returnValue', () => {
        const el = mount(`<dialog is="${TAG}" use-dialog-form="false">a</dialog>`);
        el.show();
        el.close('result');

        expect(el.open).toBe(false);
        expect(el.returnValue).toBe('result');
    });
});
