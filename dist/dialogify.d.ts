// Type definitions for @oneup_network/dialogify

export as namespace Dialogify;
export = Dialogify;

declare class Dialogify {
    /**
     * Create a dialog.
     *
     * @param source The dialog content. This is treated as **HTML**:
     *   - a string starting with `#` is used as a selector and its inner HTML is cloned;
     *   - a string starting with the ajax prefix (default `/ajax/`) is loaded via fetch;
     *   - any other string is inserted as raw HTML.
     *   Always sanitize untrusted input before passing it here.
     * @param options Per-instance options.
     */
    constructor(source: string, options?: Dialogify.Options);

    /** The underlying native `<dialog>` element. */
    dialog: HTMLDialogElement;

    /** Per-instance options passed to the constructor. */
    options: Dialogify.Options;

    /** Set (or replace) the dialog title. */
    title(title: string): this;

    /** Set (or replace) the dialog buttons. */
    buttons(
        buttons: Array<Dialogify.ButtonConfig | string>,
        options?: Dialogify.ButtonBoxOptions
    ): this;

    /** Open the dialog as a modal. */
    showModal(): void;

    /** Open the dialog (non-modal). */
    show(): void;

    /** Close the dialog. */
    close(): void;

    /** Whether the dialog is currently open. */
    isOpen(): boolean;

    /** Subscribe to a dialog event (`show`, `close`, `cancel`). */
    on(event: string, handler: (...args: unknown[]) => void): this;
}

declare namespace Dialogify {
    interface Options {
        /** Prefix used to detect ajax content sources. Defaults to `/ajax/`. */
        ajaxPrefix?: string;
        /** Query data appended to ajax requests. */
        ajaxData?: Record<string, unknown>;
        /** Called after ajax content has loaded. */
        ajaxComplete?: (this: Dialogify) => void;
        /** Width class, e.g. `Dialogify.SIZE_LARGE`. */
        size?: string;
        /** Use `position: fixed`. Defaults to `true`. */
        fixed?: boolean;
        /** Wrap content in a `<form method="dialog">`. Defaults to `true`. */
        useDialogForm?: boolean;
        /** Show the close button. Defaults to `true`. */
        closable?: boolean;
        /** Prevent background scrolling while open. Set to `false` to allow it. */
        backgroundScroll?: boolean;
        /** Custom close button configuration. */
        closeButton?: CloseButtonConfig;
        /** Custom dialog styling. */
        dialog?: DialogStyleConfig;
    }

    interface CloseButtonConfig {
        image?: string;
        className?: string;
        style?: Record<string, string | number>;
    }

    interface DialogStyleConfig {
        style?: Record<string, string | number>;
        className?: string;
        contentStyle?: Record<string, string | number>;
        contentClassName?: string;
    }

    interface ButtonConfig {
        id?: string | number;
        text?: string;
        type?: string;
        focused?: boolean;
        disabled?: boolean;
        click?: (this: Dialogify, event: Event) => void;
    }

    interface ButtonBoxOptions {
        /** Alignment class, e.g. `Dialogify.BUTTON_CENTER`. */
        position?: string;
    }

    interface StaticDialogOptions {
        dialogOptions?: Options;
        close?: (this: Dialogify) => void;
        ok?: (this: Dialogify, value?: string) => void;
        cancel?: (this: Dialogify) => void;
        placeholder?: string;
        value?: string;
    }

    const counter: number;

    const SIZE_LARGE: string;
    const BUTTON_CENTER: string;
    const BUTTON_LEFT: string;
    const BUTTON_PRIMARY: string;
    const BUTTON_DANGER: string;

    const LOCALE: Record<string, { ok: string; cancel: string; close: string }>;

    /** Show an alert dialog. Resolves when dismissed. */
    function alert(message: string, options?: StaticDialogOptions): Promise<void>;

    /** Show a confirm dialog. Resolves with the user's choice. */
    function confirm(message: string, options?: StaticDialogOptions): Promise<boolean>;

    /** Show a prompt dialog. Resolves with the entered value or `null`. */
    function prompt(message: string, options?: StaticDialogOptions): Promise<string | null>;

    /** Close all open dialogify dialogs. */
    function closeAll(): void;
}
