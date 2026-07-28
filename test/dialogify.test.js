import { describe, it, expect, afterEach } from 'vitest';
import Dialogify from '../src/js/dialogify.js';

function currentDialog() {
    const dialogs = document.querySelectorAll('dialog[id^="dialogify_"]');
    return dialogs[dialogs.length - 1];
}

function clickButton(dialog, selector) {
    const button = dialog.querySelector(selector);
    button.click();
    return button;
}

afterEach(() => {
    document.querySelectorAll('dialog[id^="dialogify_"]').forEach((dialog) => dialog.remove());
});

describe('Dialogify constructor', () => {
    it('creates a <dialog> in the DOM with the content wrapped in a body', () => {
        const instance = new Dialogify('plain text');
        const dialog = currentDialog();

        expect(dialog).toBeTruthy();
        expect(instance.dialog).toBe(dialog);
        expect(dialog.querySelector('.dialogify__body').textContent).toContain('plain text');
    });

    it('treats the content as HTML (documented feature)', () => {
        new Dialogify('<strong class="marker">bold</strong>');
        const dialog = currentDialog();

        const marker = dialog.querySelector('.marker');
        expect(marker).toBeTruthy();
        expect(marker.tagName).toBe('STRONG');
    });

    it('adds a close button by default and omits it when closable is false', () => {
        new Dialogify('a');
        expect(currentDialog().querySelector('.dialogify__close')).toBeTruthy();

        new Dialogify('b', { closable: false });
        expect(currentDialog().querySelector('.dialogify__close')).toBeNull();
    });

    it('wraps content in a dialog form by default', () => {
        new Dialogify('a');
        expect(currentDialog().querySelector('form[method="dialog"]')).toBeTruthy();

        new Dialogify('b', { useDialogForm: false });
        expect(currentDialog().querySelector('form')).toBeNull();
    });
});

describe('title()', () => {
    it('renders a title and replaces it on a second call', () => {
        const instance = new Dialogify('content').title('First');
        let title = currentDialog().querySelector('.dialogify_title');
        expect(title.textContent).toContain('First');

        instance.title('Second');
        expect(currentDialog().querySelectorAll('.dialogify_title').length).toBe(1);
        expect(currentDialog().querySelector('.dialogify_title').textContent).toContain('Second');
    });
});

describe('buttons()', () => {
    it('renders buttons with text and type classes', () => {
        new Dialogify('content').buttons([
            { text: 'Save', type: Dialogify.BUTTON_PRIMARY },
            { text: 'Delete', type: Dialogify.BUTTON_DANGER }
        ]);

        const buttons = currentDialog().querySelectorAll('.btn-box .btn');
        expect(buttons.length).toBe(2);
        expect(buttons[0].textContent).toBe('Save');
        expect(buttons[0].classList.contains('btn-primary')).toBe(true);
        expect(buttons[1].classList.contains('btn-danger')).toBe(true);
    });

    it('invokes the click callback with the instance as context', () => {
        let context = null;
        const instance = new Dialogify('content').buttons([
            {
                text: 'Ok',
                click() {
                    context = this;
                }
            }
        ]);

        clickButton(currentDialog(), '.btn');
        expect(context).toBe(instance);
    });
});

describe('open/close lifecycle', () => {
    it('reflects the open state via isOpen()', () => {
        const instance = new Dialogify('content', { useDialogForm: false });
        expect(instance.isOpen()).toBe(false);

        instance.show();
        expect(instance.isOpen()).toBe(true);

        instance.close();
        expect(instance.isOpen()).toBe(false);
    });
});

describe('static helpers', () => {
    it('alert resolves when the button is clicked', async () => {
        const promise = Dialogify.alert('Heads up', {
            dialogOptions: { useDialogForm: false }
        });

        clickButton(currentDialog(), '.btn-danger');
        await expect(promise).resolves.toBeUndefined();
    });

    it('confirm resolves true on OK and false on cancel', async () => {
        const okPromise = Dialogify.confirm('Sure?', {
            dialogOptions: { useDialogForm: false }
        });
        clickButton(currentDialog(), '.btn-primary');
        await expect(okPromise).resolves.toBe(true);

        const cancelPromise = Dialogify.confirm('Sure?', {
            dialogOptions: { useDialogForm: false }
        });
        clickButton(currentDialog(), '.btn-box .btn:first-child');
        await expect(cancelPromise).resolves.toBe(false);
    });

    it('prompt resolves with the entered value', async () => {
        const promise = Dialogify.prompt('Name?', {
            dialogOptions: { useDialogForm: false }
        });

        const dialog = currentDialog();
        dialog.querySelector('.dialogify-prompt-input').value = 'Ada';
        clickButton(dialog, '.btn-primary');

        await expect(promise).resolves.toBe('Ada');
    });

    it('closeAll closes every open dialog', () => {
        const a = new Dialogify('a', { useDialogForm: false });
        const b = new Dialogify('b', { useDialogForm: false });
        a.show();
        b.show();
        expect(a.isOpen()).toBe(true);
        expect(b.isOpen()).toBe(true);

        Dialogify.closeAll();
        expect(a.isOpen()).toBe(false);
        expect(b.isOpen()).toBe(false);
    });
});

describe('runtime config', () => {
    it('reads window.dialogifyConfig for each call (confirm locale)', () => {
        window.dialogifyConfig = { locale: 'en_US' };
        Dialogify.confirm('Sure?', { dialogOptions: { useDialogForm: false } });

        const buttons = currentDialog().querySelectorAll('.btn-box .btn');
        expect(buttons[0].textContent).toBe('Cancel');
        expect(buttons[1].textContent).toBe('Ok');

        delete window.dialogifyConfig;
    });
});
