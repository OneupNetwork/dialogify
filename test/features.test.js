import { describe, it, expect, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import Dialogify from '../src/js/dialogify.js';

const TAG = 'bahamut-dialogify';

function mount(html) {
    const host = document.createElement('div');
    host.innerHTML = html;
    const el = host.firstElementChild;
    document.body.appendChild(el);
    return el;
}

afterEach(() => {
    document.querySelectorAll('dialog').forEach((d) => {
        // Closing rather than just detaching lets each dialog run its own
        // teardown, so state shared across instances — the background scroll
        // lock in particular — does not leak into the next test.
        if (d.open) {
            d.close();
        }
        d.remove();
    });
    document.querySelectorAll('.dialogify-toast-container').forEach((c) => c.remove());
    Dialogify.handlers = {};
    vi.useRealTimers();
});

describe('accessibility', () => {
    it('links the title to the dialog with aria-labelledby', () => {
        const d = new Dialogify('content').title('My dialog');
        const titleId = d.dialog.getAttribute('aria-labelledby');

        expect(titleId).toBeTruthy();
        expect(d.dialog.querySelector(`#${titleId}`).textContent).toContain('My dialog');
    });

    it('keeps aria-labelledby pointing at the title after it is replaced', () => {
        const d = new Dialogify('content').title('First').title('Second');
        const titleId = d.dialog.getAttribute('aria-labelledby');

        expect(d.dialog.querySelectorAll('.dialogify_title').length).toBe(1);
        expect(d.dialog.querySelector(`#${titleId}`).textContent).toContain('Second');
    });

    it('gives the close button a role, tabindex and accessible name', () => {
        window.dialogifyConfig = { locale: 'en_US' };
        const d = new Dialogify('content');
        const close = d.dialog.querySelector('.dialogify__close');

        expect(close.getAttribute('role')).toBe('button');
        expect(close.getAttribute('tabindex')).toBe('0');
        expect(close.getAttribute('aria-label')).toBe('Close');
        delete window.dialogifyConfig;
    });

    it('closes when the close button is activated with the keyboard', () => {
        const d = new Dialogify('content', { useDialogForm: false });
        d.show();

        const close = d.dialog.querySelector('.dialogify__close');
        close.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

        expect(d.isOpen()).toBe(false);
    });

    it('marks decorative images as hidden and labels the loading image', () => {
        const d = new Dialogify('content').title('t');

        expect(d.dialog.querySelector('.dialogify_title img').getAttribute('alt')).toBe('');
        expect(d.dialog.querySelector('.dialogify__close img').getAttribute('alt')).toBe('');

        d.setLoading(true);
        expect(d.dialog.querySelector('.dialogify__loading img').getAttribute('alt')).toBeTruthy();
    });
});

describe('promise from show/showModal', () => {
    it('resolves with the return value when closed', async () => {
        const d = new Dialogify('content', { useDialogForm: false });
        const promise = d.showModal();

        d.close('saved');

        await expect(promise).resolves.toBe('saved');
    });

    it('resolves for the declarative element too', async () => {
        const el = mount(`<dialog is="${TAG}" use-dialog-form="false">a</dialog>`);
        const promise = el.show();

        el.close('done');

        await expect(promise).resolves.toBe('done');
    });

    it('creates a fresh promise for each open', async () => {
        const el = mount(`<dialog is="${TAG}" use-dialog-form="false">a</dialog>`);

        const first = el.show();
        el.close('one');
        await expect(first).resolves.toBe('one');

        const second = el.show();
        el.close('two');
        await expect(second).resolves.toBe('two');
    });
});

describe('beforeclose', () => {
    it('can veto a programmatic close', () => {
        const d = new Dialogify('content', { useDialogForm: false });
        d.show();
        d.on('beforeclose', (e) => e.preventDefault());

        d.close();
        expect(d.isOpen()).toBe(true);
    });

    it('allows the close when not prevented', () => {
        const d = new Dialogify('content', { useDialogForm: false });
        d.show();
        const spy = vi.fn();
        d.on('beforeclose', spy);

        d.close();
        expect(spy).toHaveBeenCalled();
        expect(d.isOpen()).toBe(false);
    });

    it('vetoes the close button path', () => {
        const d = new Dialogify('content', { useDialogForm: false });
        d.show();
        d.on('beforeclose', (e) => e.preventDefault());

        d.dialog.querySelector('.dialogify__close').click();
        expect(d.isOpen()).toBe(true);
    });

    it('vetoes the declarative ok button path', () => {
        const el = mount(
            `<dialog is="${TAG}" use-dialog-form="false">a<button ok></button></dialog>`
        );
        el.show();
        el.addEventListener('beforeclose', (e) => e.preventDefault());

        el.querySelector('button[ok]').click();
        expect(el.open).toBe(true);
    });

    it('vetoes the dialog form submit path', () => {
        const d = new Dialogify('content');
        d.show();
        d.on('beforeclose', (e) => e.preventDefault());

        const event = new window.Event('submit', { bubbles: true, cancelable: true });
        d.$form[0].dispatchEvent(event);

        expect(event.defaultPrevented).toBe(true);
    });

    it('is observable as a DOM event on the element', () => {
        const el = mount(`<dialog is="${TAG}" use-dialog-form="false">a</dialog>`);
        const spy = vi.fn();
        el.addEventListener('beforeclose', spy);

        el.show();
        el.close();

        expect(spy).toHaveBeenCalled();
        expect(el.open).toBe(false);
    });

    it('supports the onbeforeclose property returning false', () => {
        const el = mount(`<dialog is="${TAG}" use-dialog-form="false">a</dialog>`);
        el.show();
        el.onbeforeclose = () => false;

        el.close();
        expect(el.open).toBe(true);
    });

    it('supports onbeforeclose="handlerName" in markup', () => {
        Dialogify.handlers.blockClose = () => false;
        const el = mount(
            `<dialog is="${TAG}" use-dialog-form="false" onbeforeclose="blockClose">a</dialog>`
        );
        el.show();

        el.close();
        expect(el.open).toBe(true);
    });
});

describe('content updates', () => {
    it('replaces the body with setContent', () => {
        const d = new Dialogify('original').title('keep me');
        d.setContent('<b>updated</b>');

        expect(d.getContent()).toBe('<b>updated</b>');
        expect(d.dialog.querySelector('.dialogify_title')).toBeTruthy();
    });

    it('accepts a DOM node and keeps its listeners', () => {
        const d = new Dialogify('original');
        const node = document.createElement('button');
        node.type = 'button';
        const onClick = vi.fn();
        node.addEventListener('click', onClick);

        d.setContent(node);
        d.dialog.querySelector('.dialogify__body button').click();

        expect(onClick).toHaveBeenCalled();
    });

    it('does not disturb the buttons', () => {
        const d = new Dialogify('original').buttons([{ id: 'ok', text: 'Ok' }]);
        d.setContent('new');

        expect(d.getButton('ok').length).toBe(1);
        expect(d.dialog.querySelector('.btn-box')).toBeTruthy();
    });

    it('setContent works on the declarative element', () => {
        const el = mount(`<dialog is="${TAG}">old</dialog>`);
        el.setContent('new content');

        expect(el.querySelector('.dialogify__body').textContent).toBe('new content');
    });
});

describe('loading state', () => {
    it('toggles the loading overlay', () => {
        const d = new Dialogify('content');

        expect(d.isLoading()).toBe(false);
        d.setLoading(true);
        expect(d.isLoading()).toBe(true);
        expect(d.dialog.querySelector('.dialogify__loading')).toBeTruthy();

        d.setLoading(false);
        expect(d.isLoading()).toBe(false);
        expect(d.dialog.querySelector('.dialogify__loading')).toBeNull();
    });

    it('does not stack multiple overlays', () => {
        const d = new Dialogify('content');
        d.setLoading(true).setLoading(true);

        expect(d.dialog.querySelectorAll('.dialogify__loading').length).toBe(1);
    });

    it('loads new content over ajax and clears the loading state', async () => {
        const fetchSpy = vi
            .spyOn(window, 'fetch')
            .mockResolvedValue({ text: () => Promise.resolve('<p>loaded</p>') });

        const d = new Dialogify('content');
        await d.load('/ajax/thing', { id: 7 });

        expect(fetchSpy.mock.calls[0][0]).toContain('id=7');
        expect(d.getContent()).toBe('<p>loaded</p>');
        expect(d.isLoading()).toBe(false);

        fetchSpy.mockRestore();
    });

    it('clears the loading state when the request fails', async () => {
        const fetchSpy = vi.spyOn(window, 'fetch').mockRejectedValue(new Error('boom'));

        const d = new Dialogify('content');
        await expect(d.load('/ajax/thing')).rejects.toThrow('boom');
        expect(d.isLoading()).toBe(false);

        fetchSpy.mockRestore();
    });
});

describe('form integration', () => {
    it('collects form values', () => {
        const d = new Dialogify('<input name="title" value="hello">');
        expect(d.formValues()).toEqual({ title: 'hello' });
    });

    it('collects repeated fields into an array', () => {
        const d = new Dialogify('<input name="tag" value="a"><input name="tag" value="b">');
        expect(d.formValues()).toEqual({ tag: ['a', 'b'] });
    });

    it('returns an empty object when there is no form', () => {
        const d = new Dialogify('<input name="title" value="hello">', { useDialogForm: false });
        expect(d.formValues()).toEqual({});
        expect(d.formData()).toBeNull();
    });

    it('validate() passes when the form has no invalid fields', () => {
        const d = new Dialogify('<input name="title" value="hello">');
        expect(d.validate()).toBe(true);
    });

    it('validate() returns true when the dialog has no form', () => {
        const d = new Dialogify('content', { useDialogForm: false });
        expect(d.validate()).toBe(true);
    });

    it('formValues works on the declarative element', () => {
        const el = mount(`<dialog is="${TAG}"><input name="q" value="term"></dialog>`);
        expect(el.formValues()).toEqual({ q: 'term' });
    });
});

describe('button api', () => {
    it('adds a button to an existing button box', () => {
        const d = new Dialogify('content').buttons([{ id: 'a', text: 'A' }]);
        d.addButton({ id: 'b', text: 'B' });

        expect(d.dialog.querySelectorAll('.btn-box .btn').length).toBe(2);
        expect(d.getButton('b').text()).toBe('B');
    });

    it('creates the button box when the dialog has none', () => {
        const d = new Dialogify('content');
        d.addButton({ id: 'a', text: 'A' });

        expect(d.dialog.querySelector('.btn-box')).toBeTruthy();
        expect(d.getButton('a').length).toBe(1);
    });

    it('prepends when asked', () => {
        const d = new Dialogify('content').buttons([{ id: 'a', text: 'A' }]);
        d.addButton({ id: 'b', text: 'B' }, { prepend: true });

        const texts = [...d.dialog.querySelectorAll('.btn-box .btn')].map((b) => b.textContent);
        expect(texts).toEqual(['B', 'A']);
    });

    it('removes a button', () => {
        const d = new Dialogify('content').buttons([{ id: 'a', text: 'A' }]);
        d.removeButton('a');

        expect(d.dialog.querySelectorAll('.btn-box .btn').length).toBe(0);
        expect(d.getButton('a').length).toBe(0);
    });

    it('updates text, type and disabled state', () => {
        const d = new Dialogify('content').buttons([{ id: 'a', text: 'A' }]);
        d.updateButton('a', { text: 'B', type: Dialogify.BUTTON_DANGER, disabled: true });

        const $btn = d.getButton('a');
        expect($btn.text()).toBe('B');
        expect($btn.hasClass(Dialogify.BUTTON_DANGER)).toBe(true);
        expect($btn.hasClass('is-disabled')).toBe(true);
    });

    it('applies and restores the loading state', () => {
        const d = new Dialogify('content').buttons([
            { id: 'save', text: 'Save', loadingText: 'Saving...' }
        ]);

        d.updateButton('save', { loading: true });
        let $btn = d.getButton('save');
        expect($btn.text()).toBe('Saving...');
        expect($btn.hasClass('is-loading')).toBe(true);
        expect($btn.attr('aria-busy')).toBe('true');
        expect($btn.prop('disabled')).toBe(true);

        d.updateButton('save', { loading: false });
        $btn = d.getButton('save');
        expect($btn.text()).toBe('Save');
        expect($btn.hasClass('is-loading')).toBe(false);
        expect($btn.attr('aria-busy')).toBeUndefined();
        expect($btn.prop('disabled')).toBe(false);
    });

    it('replaces the click handler', () => {
        const first = vi.fn();
        const second = vi.fn();
        const d = new Dialogify('content').buttons([{ id: 'a', text: 'A', click: first }]);

        d.updateButton('a', { click: second });
        d.getButton('a').trigger('click');

        expect(first).not.toHaveBeenCalled();
        expect(second).toHaveBeenCalled();
    });

    it('registers declarative buttons in the button list', () => {
        const el = mount(
            `<dialog is="${TAG}">a<button ok id="confirm"></button><button danger>Del</button></dialog>`
        );

        expect(el.getButton('confirm').length).toBe(1);
        expect(el.getButton(1).text()).toBe('Del');

        el.updateButton('confirm', { text: 'Yes' });
        expect(el.querySelector('#confirm').textContent).toBe('Yes');
    });

    it('honours the declarative loading-text attribute', () => {
        const el = mount(
            `<dialog is="${TAG}">a<button ok id="save" loading-text="Saving...">Save</button></dialog>`
        );

        el.updateButton('save', { loading: true });
        expect(el.querySelector('#save').textContent).toBe('Saving...');
        expect(el.querySelector('#save').disabled).toBe(true);

        el.updateButton('save', { loading: false });
        expect(el.querySelector('#save').textContent).toBe('Save');
        expect(el.querySelector('#save').disabled).toBe(false);
    });
});

describe('drawer', () => {
    it('applies the drawer classes for a position option', () => {
        const d = new Dialogify('content', { position: 'right' });

        expect(d.dialog.classList.contains('dialogify--drawer')).toBe(true);
        expect(d.dialog.classList.contains('dialogify--right')).toBe(true);
    });

    it('ignores an unknown position', () => {
        const d = new Dialogify('content', { position: 'nowhere' });
        expect(d.dialog.classList.contains('dialogify--drawer')).toBe(false);
    });

    it('supports the position attribute on the element', () => {
        const el = mount(`<dialog is="${TAG}" position="bottom">a</dialog>`);

        expect(el.classList.contains('dialogify--drawer')).toBe(true);
        expect(el.classList.contains('dialogify--bottom')).toBe(true);
    });

    it('still behaves like a normal dialog', () => {
        const d = new Dialogify('content', { position: 'left', useDialogForm: false });
        d.show();
        expect(d.isOpen()).toBe(true);
        d.close();
        expect(d.isOpen()).toBe(false);
    });
});

describe('toast', () => {
    it('shows a toast in a corner container', () => {
        const toast = Dialogify.toast('Saved');

        const container = document.querySelector('.dialogify-toast-container--top-right');
        expect(container).toBeTruthy();
        expect(container.contains(toast.dialog)).toBe(true);
        expect(toast.isOpen()).toBe(true);
        expect(toast.dialog.classList.contains('dialogify--toast')).toBe(true);
        expect(toast.dialog.textContent).toContain('Saved');
    });

    it('has no close button or backdrop form by default', () => {
        const toast = Dialogify.toast('Saved');

        expect(toast.dialog.querySelector('.dialogify__close')).toBeNull();
        expect(toast.dialog.querySelector('form')).toBeNull();
    });

    it('applies the type modifier and role', () => {
        const toast = Dialogify.toast('Oops', { type: Dialogify.TOAST_ERROR });

        expect(toast.dialog.classList.contains('dialogify--toast-error')).toBe(true);
        expect(toast.dialog.getAttribute('role')).toBe('status');
    });

    it('auto dismisses after the duration', () => {
        vi.useFakeTimers();
        const toast = Dialogify.toast('Saved', { duration: 1000 });

        expect(toast.isOpen()).toBe(true);
        vi.advanceTimersByTime(1000);
        expect(toast.isOpen()).toBe(false);
    });

    it('stays open when duration is 0', () => {
        vi.useFakeTimers();
        const toast = Dialogify.toast('Sticky', { duration: 0 });

        vi.advanceTimersByTime(10000);
        expect(toast.isOpen()).toBe(true);
    });

    it('can be dismissed with its close button', () => {
        const toast = Dialogify.toast('Saved', { duration: 0, closable: true });
        toast.dialog.querySelector('.dialogify__toast-close').click();

        expect(toast.isOpen()).toBe(false);
    });

    it('stacks several toasts in the same container', () => {
        Dialogify.toast('one', { duration: 0 });
        Dialogify.toast('two', { duration: 0 });

        const container = document.querySelector('.dialogify-toast-container--top-right');
        expect(container.querySelectorAll('dialog').length).toBe(2);
    });

    it('uses separate containers per position', () => {
        Dialogify.toast('one', { duration: 0 });
        Dialogify.toast('two', { duration: 0, position: 'bottom-left' });

        expect(document.querySelectorAll('.dialogify-toast-container').length).toBe(2);
    });

    it('removes the container once the last toast closes', () => {
        const toast = Dialogify.toast('one', { duration: 0 });
        toast.close();

        expect(document.querySelector('.dialogify-toast-container')).toBeNull();
    });

    it('supports a title', () => {
        const toast = Dialogify.toast('body text', { duration: 0, title: 'Heads up' });
        expect(toast.dialog.querySelector('.dialogify_title').textContent).toContain('Heads up');
    });

    it('exposes a constant for every supported position', () => {
        const constants = [
            Dialogify.TOAST_TOP_LEFT,
            Dialogify.TOAST_TOP_CENTER,
            Dialogify.TOAST_TOP_RIGHT,
            Dialogify.TOAST_BOTTOM_LEFT,
            Dialogify.TOAST_BOTTOM_CENTER,
            Dialogify.TOAST_BOTTOM_RIGHT
        ];

        expect(constants).toEqual([
            'top-left',
            'top-center',
            'top-right',
            'bottom-left',
            'bottom-center',
            'bottom-right'
        ]);

        constants.forEach((position) => {
            Dialogify.toast('x', { duration: 0, position });
            expect(
                document.querySelector(`.dialogify-toast-container--${position}`)
            ).not.toBeNull();
        });
    });

    it('collapses its slot in step with the exit animation', () => {
        const toast = Dialogify.toast('one', { duration: 0 });
        const dialog = toast.dialog;
        const container = dialog.parentNode;
        const calls = [];

        dialog.getBoundingClientRect = () => ({ width: 200, height: 45 });
        dialog.animate = (keyframes, timing) => {
            calls.push({ keyframes, timing });
            return { finished: new Promise(() => {}) };
        };

        const original = window.getComputedStyle.bind(window);
        const spy = vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
            if (el === dialog) return { animationDuration: '0.22s' };
            if (el === container) return { rowGap: '10px' };
            return original(el);
        });

        toast.close();
        spy.mockRestore();

        expect(calls.length).toBe(1);
        expect(calls[0].timing.duration).toBe(220);
        expect(calls[0].keyframes).toEqual([
            { height: '45px', marginBlockEnd: '0px' },
            { height: '0px', marginBlockEnd: '-10px' }
        ]);
    });

    it('does not collapse the slot when the exit animation is off', () => {
        const toast = Dialogify.toast('one', { duration: 0 });
        const dialog = toast.dialog;
        const calls = [];

        dialog.getBoundingClientRect = () => ({ width: 200, height: 45 });
        dialog.animate = (keyframes) => {
            calls.push(keyframes);
            return { finished: new Promise(() => {}) };
        };

        const original = window.getComputedStyle.bind(window);
        const spy = vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
            if (el === dialog) return { animationDuration: '0s' };
            return original(el);
        });

        toast.close();
        spy.mockRestore();

        expect(calls.length).toBe(0);
    });
});

describe('anchored popover', () => {
    function anchorAt(rect) {
        const anchor = document.createElement('button');
        anchor.id = 'anchor';
        document.body.appendChild(anchor);
        anchor.getBoundingClientRect = () => ({
            top: rect.top,
            left: rect.left,
            right: rect.left + rect.width,
            bottom: rect.top + rect.height,
            width: rect.width,
            height: rect.height
        });
        return anchor;
    }

    afterEach(() => {
        document.querySelectorAll('#anchor').forEach((a) => a.remove());
    });

    it('positions the dialog below the anchor by default', () => {
        const anchor = anchorAt({ top: 100, left: 50, width: 80, height: 20 });
        const d = new Dialogify('content', { useDialogForm: false });
        d.dialog.getBoundingClientRect = () => ({ width: 200, height: 100 });

        d.showAt(anchor);

        expect(d.dialog.classList.contains('dialogify--popover')).toBe(true);
        expect(d.dialog.getAttribute('data-placement')).toBe('bottom');
        expect(d.dialog.style.top).toBe('128px');
        expect(d.dialog.style.left).toBe('50px');
    });

    it('flips above the anchor when there is no room below', () => {
        const anchor = anchorAt({ top: 700, left: 50, width: 80, height: 20 });
        const d = new Dialogify('content', { useDialogForm: false });
        d.dialog.getBoundingClientRect = () => ({ width: 200, height: 300 });

        d.showAt(anchor, { placement: 'bottom' });

        expect(d.dialog.getAttribute('data-placement')).toBe('top');
    });

    it('supports center alignment', () => {
        const anchor = anchorAt({ top: 100, left: 100, width: 100, height: 20 });
        const d = new Dialogify('content', { useDialogForm: false });
        d.dialog.getBoundingClientRect = () => ({ width: 50, height: 40 });

        d.showAt(anchor, { align: 'center' });

        expect(d.dialog.style.left).toBe('125px');
    });

    it('repositions itself as the anchor scrolls away', () => {
        const anchor = anchorAt({ top: 100, left: 50, width: 80, height: 20 });
        const d = new Dialogify('content', { useDialogForm: false });
        d.dialog.getBoundingClientRect = () => ({ width: 200, height: 100 });

        d.showAt(anchor, { placement: 'bottom' });
        expect(d.dialog.style.top).toBe('128px');

        // The page scrolls down by 400, taking the anchor above the fold.
        anchor.getBoundingClientRect = () => ({
            top: -300,
            left: 50,
            right: 130,
            bottom: -280,
            width: 80,
            height: 20
        });
        window.dispatchEvent(new Event('scroll'));

        expect(d.dialog.style.top).toBe('-272px');
    });

    it('nudges the dialog back inside the viewport', () => {
        const anchor = anchorAt({ top: 100, left: 980, width: 10, height: 10 });
        const d = new Dialogify('content', { useDialogForm: false });
        d.dialog.getBoundingClientRect = () => ({ width: 100, height: 40 });

        d.showAt(anchor);

        // 980 would overflow the 1024px viewport, so it is pulled back.
        expect(d.dialog.style.left).toBe('924px');
    });

    it('follows an anchor that has scrolled out of view', () => {
        const anchor = anchorAt({ top: -300, left: 50, width: 80, height: 20 });
        const d = new Dialogify('content', { useDialogForm: false });
        d.dialog.getBoundingClientRect = () => ({ width: 200, height: 100 });

        d.showAt(anchor, { placement: 'bottom' });

        // Off screen with the anchor rather than parked against the edge.
        expect(d.dialog.getAttribute('data-placement')).toBe('bottom');
        expect(d.dialog.style.top).toBe('-272px');
    });

    it('stays attached when the anchor leaves the viewport sideways', () => {
        const anchor = anchorAt({ top: 100, left: -500, width: 10, height: 10 });
        const d = new Dialogify('content', { useDialogForm: false });
        d.dialog.getBoundingClientRect = () => ({ width: 100, height: 40 });

        d.showAt(anchor);

        // Touching the anchor's right edge, not clamped to 0.
        expect(d.dialog.style.left).toBe('-490px');
    });

    it('detaches its reposition listeners on close', () => {
        const addSpy = vi.spyOn(window, 'addEventListener');
        const removeSpy = vi.spyOn(window, 'removeEventListener');

        const anchor = anchorAt({ top: 10, left: 10, width: 10, height: 10 });
        const d = new Dialogify('content', { useDialogForm: false });
        d.dialog.getBoundingClientRect = () => ({ width: 10, height: 10 });

        d.showAt(anchor);
        expect(addSpy).toHaveBeenCalledWith('resize', expect.any(Function));

        d.close();
        expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));

        addSpy.mockRestore();
        removeSpy.mockRestore();
    });

    it('falls back to a normal show when the anchor is missing', () => {
        const d = new Dialogify('content', { useDialogForm: false });
        d.showAt('#does-not-exist');

        expect(d.isOpen()).toBe(true);
        expect(d.dialog.classList.contains('dialogify--popover')).toBe(false);
    });

    it('reads anchor and placement attributes on the element', () => {
        anchorAt({ top: 100, left: 50, width: 80, height: 20 });
        const el = mount(
            `<dialog is="${TAG}" use-dialog-form="false" anchor="#anchor" placement="right">a</dialog>`
        );
        el.getBoundingClientRect = () => ({ width: 100, height: 50 });

        el.showAt();

        expect(el.classList.contains('dialogify--popover')).toBe(true);
        expect(el.getAttribute('data-placement')).toBe('right');
    });

    it('closes on a click outside the popover', async () => {
        const anchor = anchorAt({ top: 10, left: 10, width: 10, height: 10 });
        const d = new Dialogify('content', { useDialogForm: false });
        d.dialog.getBoundingClientRect = () => ({ width: 10, height: 10 });

        d.showAt(anchor);
        await new Promise((r) => setTimeout(r, 0));

        document.body.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

        expect(d.isOpen()).toBe(false);
    });

    it('closes when the anchor that opened it is clicked again', async () => {
        const anchor = anchorAt({ top: 10, left: 10, width: 10, height: 10 });
        const d = new Dialogify('content', { useDialogForm: false });
        d.dialog.getBoundingClientRect = () => ({ width: 10, height: 10 });

        d.showAt(anchor);
        await new Promise((r) => setTimeout(r, 0));

        anchor.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

        expect(d.isOpen()).toBe(false);
    });

    it('is not closed by the click that opened it', () => {
        const anchor = anchorAt({ top: 10, left: 10, width: 10, height: 10 });
        const d = new Dialogify('content', { useDialogForm: false });
        d.dialog.getBoundingClientRect = () => ({ width: 10, height: 10 });

        anchor.addEventListener('click', () => d.showAt(anchor));
        anchor.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

        expect(d.isOpen()).toBe(true);
    });

    it('stays open when the click is inside the popover', async () => {
        const anchor = anchorAt({ top: 10, left: 10, width: 10, height: 10 });
        const d = new Dialogify('content', { useDialogForm: false });
        d.dialog.getBoundingClientRect = () => ({ width: 10, height: 10 });

        d.showAt(anchor);
        await new Promise((r) => setTimeout(r, 0));

        d.$content
            .find('.dialogify__body')[0]
            .dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

        expect(d.isOpen()).toBe(true);
    });

    it('does not install the outside listener when closable is false', async () => {
        const anchor = anchorAt({ top: 10, left: 10, width: 10, height: 10 });
        const d = new Dialogify('content', { useDialogForm: false, closable: false });
        d.dialog.getBoundingClientRect = () => ({ width: 10, height: 10 });

        d.showAt(anchor);
        await new Promise((r) => setTimeout(r, 0));

        document.body.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

        expect(d.isOpen()).toBe(true);
    });

    it('swallows the anchor click so the trigger does not reopen it', async () => {
        const anchor = anchorAt({ top: 10, left: 10, width: 10, height: 10 });
        let opened = 0;
        let current;
        anchor.addEventListener('click', () => {
            opened++;
            current = new Dialogify('content', { useDialogForm: false });
            current.dialog.getBoundingClientRect = () => ({ width: 10, height: 10 });
            current.showAt(anchor);
        });

        anchor.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
        await new Promise((r) => setTimeout(r, 0));
        expect(opened).toBe(1);
        expect(current.isOpen()).toBe(true);

        // second click toggles it shut without the trigger running again
        anchor.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
        expect(opened).toBe(1);
        expect(current.isOpen()).toBe(false);

        // a third click opens a fresh one
        anchor.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
        await new Promise((r) => setTimeout(r, 0));
        expect(opened).toBe(2);
        expect(current.isOpen()).toBe(true);
    });

    it('lets a click on a different anchor close this one and open that one', async () => {
        const first = anchorAt({ top: 10, left: 10, width: 10, height: 10 });
        const second = anchorAt({ top: 10, left: 90, width: 10, height: 10 });
        let opened = 0;
        second.addEventListener('click', () => opened++);

        const d = new Dialogify('content', { useDialogForm: false });
        d.dialog.getBoundingClientRect = () => ({ width: 10, height: 10 });
        d.showAt(first);
        await new Promise((r) => setTimeout(r, 0));

        second.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

        expect(d.isOpen()).toBe(false);
        expect(opened).toBe(1);
    });

    it('keeps closing on the anchor click when toggle is false', async () => {
        const anchor = anchorAt({ top: 10, left: 10, width: 10, height: 10 });
        let clicks = 0;
        anchor.addEventListener('click', () => clicks++);

        const d = new Dialogify('content', { useDialogForm: false });
        d.dialog.getBoundingClientRect = () => ({ width: 10, height: 10 });
        d.showAt(anchor, { toggle: false });
        await new Promise((r) => setTimeout(r, 0));

        anchor.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

        expect(d.isOpen()).toBe(false);
        expect(clicks).toBe(1);
    });
});

describe('backdrop click', () => {
    function rectFor(el, rect) {
        el.getBoundingClientRect = () => ({
            top: rect.top,
            left: rect.left,
            right: rect.left + rect.width,
            bottom: rect.top + rect.height,
            width: rect.width,
            height: rect.height
        });
    }

    function clickDialog(d, x, y) {
        d.dialog.dispatchEvent(
            new window.MouseEvent('click', { bubbles: true, clientX: x, clientY: y })
        );
    }

    it('closes when the click lands outside the dialog box', () => {
        const d = new Dialogify('content', { useDialogForm: false });
        rectFor(d.dialog, { top: 100, left: 100, width: 200, height: 200 });
        d.showModal();

        clickDialog(d, 10, 10);

        expect(d.isOpen()).toBe(false);
    });

    it('stays open when an empty area of the dialog itself is clicked', () => {
        const d = new Dialogify('content', {
            useDialogForm: false,
            position: Dialogify.POSITION_RIGHT
        });
        rectFor(d.dialog, { top: 0, left: 800, width: 420, height: 800 });
        d.showModal();

        // bottom of a tall drawer whose content only fills the top
        clickDialog(d, 900, 700);

        expect(d.isOpen()).toBe(true);
    });

    it('does not close when closable is false', () => {
        const d = new Dialogify('content', { useDialogForm: false, closable: false });
        rectFor(d.dialog, { top: 100, left: 100, width: 200, height: 200 });
        d.showModal();

        clickDialog(d, 10, 10);

        expect(d.isOpen()).toBe(true);
    });
});

describe('exit animation', () => {
    it('keeps the dialog in the dom until its exit animation ends', async () => {
        const d = new Dialogify('content', { position: Dialogify.POSITION_RIGHT });
        let finish;
        d.dialog.getAnimations = () => [{ finished: new Promise((resolve) => (finish = resolve)) }];

        d.showModal();
        d.close();

        expect(d.dialog.classList.contains('dialogify--closing')).toBe(true);
        expect(document.body.contains(d.dialog)).toBe(true);

        finish();
        await new Promise((r) => setTimeout(r, 0));

        expect(document.body.contains(d.dialog)).toBe(false);
    });

    it('marks the dialog as closing before the native close runs', () => {
        const d = new Dialogify('content', { position: Dialogify.POSITION_RIGHT });
        d.dialog.getAnimations = () => [{ finished: new Promise(() => {}) }];
        d.showModal();

        let closingAtNativeClose = null;
        const nativeClose = window.HTMLDialogElement.prototype.close;
        window.HTMLDialogElement.prototype.close = function (...args) {
            closingAtNativeClose = this.classList.contains('dialogify--closing');
            return nativeClose.apply(this, args);
        };
        try {
            d.close();
        } finally {
            window.HTMLDialogElement.prototype.close = nativeClose;
        }

        expect(closingAtNativeClose).toBe(true);
    });

    it('removes the dialog at once when nothing is animating', () => {
        const d = new Dialogify('content', { position: Dialogify.POSITION_RIGHT });
        d.dialog.getAnimations = () => [];

        d.showModal();
        d.close();

        expect(document.body.contains(d.dialog)).toBe(false);
    });

    it('drops the closing state when the dialog is reopened', async () => {
        const d = new Dialogify('content', {
            position: Dialogify.POSITION_RIGHT,
            autoRemove: false
        });
        d.dialog.getAnimations = () => [{ finished: new Promise(() => {}) }];

        d.showModal();
        d.close();
        expect(d.dialog.classList.contains('dialogify--closing')).toBe(true);

        d.showModal();

        expect(d.dialog.classList.contains('dialogify--closing')).toBe(false);
        expect(d.isOpen()).toBe(true);
    });

    it('prunes the toast container only after the toast has animated out', async () => {
        const toast = Dialogify.toast('hi');
        let finish;
        toast.dialog.getAnimations = () => [
            { finished: new Promise((resolve) => (finish = resolve)) }
        ];

        toast.close();

        expect(document.querySelector('.dialogify-toast-container')).not.toBe(null);

        finish();
        await new Promise((r) => setTimeout(r, 0));

        expect(document.querySelector('.dialogify-toast-container')).toBe(null);
    });
});

describe('background scroll lock', () => {
    const html = document.documentElement;
    const body = document.body;

    // The viewport reads its overflow from <html> only when that is not
    // `visible`; by default the value comes from <body>, which is where the
    // lock has to land. jsdom reports no scrollbar (innerWidth === clientWidth),
    // so the gutter compensation stays out of the way of these assertions.
    afterEach(() => {
        html.style.overflow = '';
        html.style.removeProperty('scrollbar-gutter');
        html.style.paddingRight = '';
        body.style.overflow = '';
    });

    it('freezes the page behind a modal dialog by default', () => {
        const d = new Dialogify('content');
        d.showModal();

        expect(body.style.overflow).toBe('hidden');
        d.close();
    });

    it('releases the page once the dialog closes', () => {
        const d = new Dialogify('content');
        d.showModal();
        d.close();

        expect(body.style.overflow).toBe('');
    });

    it('honours backgroundScroll: true on a modal dialog', () => {
        const d = new Dialogify('content', { backgroundScroll: true });
        d.showModal();

        expect(body.style.overflow).toBe('');
    });

    it('leaves the page alone for a non-modal dialog', () => {
        const d = new Dialogify('content');
        d.show();

        expect(body.style.overflow).toBe('');
    });

    it('freezes the page for a non-modal dialog that opts in', () => {
        const d = new Dialogify('content', { backgroundScroll: false });
        d.show();

        expect(body.style.overflow).toBe('hidden');
        d.close();
    });

    it('does not lock toasts out of the page', () => {
        Dialogify.toast('hi');

        expect(body.style.overflow).toBe('');
    });

    it('keeps the page frozen until the last stacked dialog closes', () => {
        const first = new Dialogify('first');
        const second = new Dialogify('second');
        first.showModal();
        second.showModal();

        second.close();
        expect(body.style.overflow).toBe('hidden');

        first.close();
        expect(body.style.overflow).toBe('');
    });

    it('restores whatever the page had set itself', () => {
        body.style.overflow = 'scroll';

        const d = new Dialogify('content');
        d.showModal();
        expect(body.style.overflow).toBe('hidden');

        d.close();
        expect(body.style.overflow).toBe('scroll');
    });

    it('locks the root element when the viewport reads its overflow from it', () => {
        html.style.overflow = 'scroll';

        const d = new Dialogify('content');
        d.showModal();

        // Locking <body> here would leave the viewport scrollable, and would
        // turn <body> into a scroll container of its own.
        expect(html.style.overflow).toBe('hidden');
        expect(body.style.overflow).toBe('');

        d.close();
        expect(html.style.overflow).toBe('scroll');
    });
});

describe('stacking', () => {
    // The built stylesheet is committed, so it can be asserted directly; jsdom
    // never loads it, which rules out a getComputedStyle test.
    const css = readFileSync('src/css/dialogify.css', 'utf8');

    it('stacks non-modal dialogs and toasts above ordinary page chrome', () => {
        expect(css).toContain('z-index:var(--dialogify-z-index, 1000)');
        expect(css).toContain('z-index:var(--dialogify-toast-z-index, 1010)');
    });

    it('keeps the polyfill backdrop just below its dialog', () => {
        expect(css).toContain('z-index:calc(var(--dialogify-z-index, 1000) - 1)');
    });

    it('never declares the custom properties itself, so a page override wins', () => {
        expect(css).not.toMatch(/--dialogify(-toast)?-z-index\s*:/);
    });
});

describe('theming', () => {
    const css = readFileSync('src/css/dialogify.css', 'utf8');

    // Everything after the light rules; the dark rules only add declarations.
    const darkBlock = css.slice(css.indexOf('[data-theme=dark]'));

    it('reads every colour through a custom property with the light value as fallback', () => {
        expect(css).toContain('background-color:var(--dialogify-surface, #fff)');
        expect(css).toContain('color:var(--dialogify-text, #464646)');
        expect(css).toContain('background:var(--dialogify-toast-success, #2f9e44)');
    });

    it('never declares a theme property outside of [data-theme]', () => {
        const beforeDark = css.slice(0, css.indexOf('[data-theme=dark]'));
        expect(beforeDark).not.toMatch(/--dialogify-[a-z-]+\s*:/);
    });

    it('only sets custom properties in the dark rules, so specificity is unchanged', () => {
        const declarations = darkBlock.match(/[{;]\s*([a-z-]+)\s*:/g) || [];
        expect(declarations.length).toBeGreaterThan(0);
        for (const declaration of declarations) {
            expect(declaration.replace(/^[{;]\s*/, '').startsWith('--dialogify-')).toBe(true);
        }
    });

    it('is opt-in: dark styling never applies without a data-theme attribute', () => {
        const media = css.match(/@media\(prefers-color-scheme:dark\)\{([^}]*)\{/);
        expect(media).not.toBeNull();
        expect(media[1]).toContain('[data-theme=auto]');
    });

    it('re-tints every built-in icon instead of swapping it', () => {
        // the fill is baked into the inline SVGs, so CSS cannot recolour them
        const tinted = css.match(/[^{}]*\{[^{}]*--dialogify-icon-filter, none\)/g) || [];
        const selectors = tinted.map((rule) => rule.split('{')[0].trim());
        expect(selectors).toEqual([
            '.dialogify .dialogify__close img',
            '.dialogify .dialogify__loading img',
            '.dialogify img.dialogify-ajax-loading',
            '.dialogify h5.dialogify_title img'
        ]);
        expect(darkBlock).toContain('--dialogify-icon-filter: invert(1) hue-rotate(180deg)');
    });
});
