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

    /** The dialog content wrapper (title, body and buttons). */
    $content: JQueryLike;

    /** The dialog body, i.e. the content area without title and buttons. */
    $body: JQueryLike;

    /** The `<form method="dialog">` wrapper, empty when `useDialogForm` is false. */
    $form: JQueryLike;

    /** Buttons by id (or index when no id was given). */
    $buttonList: Record<string, JQueryLike>;

    /** Set (or replace) the dialog title. */
    title(title: string): this;

    /** Set (or replace) the dialog buttons. */
    buttons(
        buttons: Array<Dialogify.ButtonConfig | string>,
        options?: Dialogify.ButtonBoxOptions
    ): this;

    /** Append a single button without rebuilding the whole button box. */
    addButton(
        button: Dialogify.ButtonConfig | string,
        options?: Dialogify.AddButtonOptions
    ): this;

    /** Remove a button by id (or index). */
    removeButton(id: string | number): this;

    /** Update an existing button in place. */
    updateButton(id: string | number, changes: Dialogify.ButtonChanges): this;

    /** Get a button by id (or index). Returns an empty set when not found. */
    getButton(id: string | number): JQueryLike;

    /**
     * Open the dialog as a modal.
     *
     * Resolves with the dialog's `returnValue` once it closes.
     */
    showModal(): Promise<string>;

    /**
     * Open the dialog (non-modal).
     *
     * Resolves with the dialog's `returnValue` once it closes.
     */
    show(): Promise<string>;

    /**
     * Open the dialog (non-modal) anchored next to another element, for
     * dropdown and popover style UI. Falls back to `show()` when the anchor
     * cannot be found.
     */
    showAt(
        anchor: Element | string | null,
        options?: Dialogify.AnchorOptions
    ): Promise<string>;

    /** Recompute the anchored position set by `showAt`. */
    reposition(): this;

    /**
     * Close the dialog.
     *
     * Fires the cancelable `beforeclose` event first; the dialog stays open
     * when a listener calls `preventDefault()`.
     */
    close(returnValue?: string): this;

    /** Whether the dialog is currently open. */
    isOpen(): boolean;

    /** Replace the dialog body, keeping the title and buttons in place. */
    setContent(content: string | Node): this;

    /** The current body HTML. */
    getContent(): string;

    /** Load new body content over ajax, showing the loading state meanwhile. */
    load(url: string, data?: Record<string, unknown>): Promise<Dialogify>;

    /** Toggle the loading overlay. Pass a string to override the label. */
    setLoading(loading: boolean | string): this;

    /** Whether the loading overlay is currently shown. */
    isLoading(): boolean;

    /** Run native form validation, reporting the first invalid field. */
    validate(): boolean;

    /** The dialog form as `FormData`, or `null` when there is no form. */
    formData(): FormData | null;

    /** The dialog form as a plain object; repeated fields become arrays. */
    formValues(): Record<string, string | string[]>;

    /**
     * Subscribe to a dialog event.
     *
     * `beforeclose` is cancelable: call `event.preventDefault()` on the handler
     * argument to keep the dialog open.
     */
    on(event: Dialogify.EventName, handler: (...args: unknown[]) => void): this;

    /** Unsubscribe from a dialog event. */
    off(event: Dialogify.EventName, handler?: (...args: unknown[]) => void): this;
}

/**
 * Minimal structural type for the jQuery objects dialogify exposes, so the
 * typings do not require @types/jquery.
 */
interface JQueryLike {
    readonly length: number;
    [index: number]: HTMLElement;
    text(): string;
    text(value: string): JQueryLike;
    addClass(className: string): JQueryLike;
    removeClass(className?: string): JQueryLike;
    hasClass(className: string): boolean;
    attr(name: string): string | undefined;
    attr(name: string, value: string | number): JQueryLike;
    prop(name: string): unknown;
    prop(name: string, value: unknown): JQueryLike;
    on(event: string, handler: (...args: unknown[]) => void): JQueryLike;
    enable(): void;
    disable(): void;
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
        /**
         * Remove the `<dialog>` element from the DOM when it closes.
         * Defaults to `true` for `new Dialogify()`, and `false` for
         * `<dialog is="bahamut-dialogify">` so author markup is reusable.
         */
        autoRemove?: boolean;
        /**
         * Slide the dialog in from an edge as a drawer instead of centring it.
         * Use `Dialogify.POSITION_LEFT` and friends.
         */
        position?: 'left' | 'right' | 'top' | 'bottom';
        /** Extra `dialogify--{variant}` modifier class, used internally by toasts. */
        variant?: string;
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
        /** Text shown while the button is in its loading state. */
        loadingText?: string;
        click?: (this: Dialogify, event: Event) => void;
    }

    interface ButtonChanges {
        text?: string;
        type?: string;
        disabled?: boolean;
        /** Show the busy state, swapping in `loadingText` and disabling it. */
        loading?: boolean;
        loadingText?: string;
        click?: (this: Dialogify, event: Event) => void;
    }

    interface ButtonBoxOptions {
        /** Alignment class, e.g. `Dialogify.BUTTON_CENTER`. */
        position?: string;
    }

    interface AddButtonOptions extends ButtonBoxOptions {
        /** Insert before the existing buttons instead of after them. */
        prepend?: boolean;
    }

    interface AnchorOptions {
        /** Preferred side, flipped automatically when it would overflow. */
        placement?: 'top' | 'bottom' | 'left' | 'right';
        /** Cross-axis alignment against the anchor. Defaults to `start`. */
        align?: 'start' | 'center' | 'end';
        /** Gap between the anchor and the dialog, in pixels. Defaults to 8. */
        offset?: number;
        /**
         * Whether clicking the anchor again closes the popover instead of
         * letting that click reopen it. Defaults to `true`.
         */
        toggle?: boolean;
    }

    interface ToastOptions {
        /** Auto-dismiss delay in milliseconds. `0` keeps it open. Defaults to 3000. */
        duration?: number;
        /** Corner to stack the toast in. Defaults to `top-right`. */
        position?:
            | 'top-left'
            | 'top-center'
            | 'top-right'
            | 'bottom-left'
            | 'bottom-center'
            | 'bottom-right';
        /** Colour variant, e.g. `Dialogify.TOAST_SUCCESS`. */
        type?: string;
        /** Optional heading shown above the message. */
        title?: string;
        /** Show a dismiss button. */
        closable?: boolean;
        /** Extra options forwarded to the underlying dialog. */
        dialogOptions?: Options;
    }

    /** Events emitted by a dialog. `beforeclose` is cancelable. */
    type EventName = 'show' | 'close' | 'cancel' | 'beforeclose';

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

    const POSITION_LEFT: 'left';
    const POSITION_RIGHT: 'right';
    const POSITION_TOP: 'top';
    const POSITION_BOTTOM: 'bottom';

    const TOAST_INFO: string;
    const TOAST_SUCCESS: string;
    const TOAST_WARNING: string;
    const TOAST_ERROR: string;

    const TOAST_TOP_LEFT: string;
    const TOAST_TOP_CENTER: string;
    const TOAST_TOP_RIGHT: string;
    const TOAST_BOTTOM_LEFT: string;
    const TOAST_BOTTOM_CENTER: string;
    const TOAST_BOTTOM_RIGHT: string;

    const LOCALE: Record<
        string,
        { ok: string; cancel: string; close: string; loading: string }
    >;

    /** Show an alert dialog. Resolves when dismissed. */
    function alert(message: string, options?: StaticDialogOptions): Promise<void>;

    /** Show a confirm dialog. Resolves with the user's choice. */
    function confirm(message: string, options?: StaticDialogOptions): Promise<boolean>;

    /** Show a prompt dialog. Resolves with the entered value or `null`. */
    function prompt(message: string, options?: StaticDialogOptions): Promise<string | null>;

    /**
     * Show a lightweight auto-dismissing notification.
     *
     * The message is treated as HTML, like every other dialogify content.
     */
    function toast(message: string, options?: ToastOptions): Dialogify;

    /** Close all open dialogify dialogs. */
    function closeAll(): void;

    /** Tag name of the customized built-in element: `bahamut-dialogify`. */
    const ELEMENT_NAME: string;

    /**
     * Named handlers referenced declaratively from markup, e.g.
     * `<dialog is="bahamut-dialogify" onshow="myHandler">`.
     * Looked up here first, then on `window` (dotted paths supported).
     */
    const handlers: Record<string, (this: DialogifyElement, event: Event) => void>;

    /**
     * Register the customized built-in element. Called automatically on import.
     * Returns `null` when the environment lacks customized built-in support.
     */
    function defineElement(name?: string): CustomElementConstructor | null;

    /** Build a Dialogify instance around an existing `<dialog>` element. */
    function adopt(
        dialog: HTMLDialogElement,
        source: string,
        options?: Options,
        setupOptions?: { append?: boolean; content?: Node | null }
    ): Dialogify;

    /**
     * A `<dialog is="bahamut-dialogify">` element. Extends the native dialog
     * element with the dialogify API.
     */
    interface DialogifyElement extends HTMLDialogElement {
        /** The backing Dialogify instance (initialised on first access). */
        readonly dialogify: Dialogify;
        /** Options for the backing instance. Assigning merges into them. */
        options: Options;
        /** Handler for the non-native `show` event. */
        onshow: ((this: DialogifyElement, event: Event) => void) | null;
        /**
         * Handler for the cancelable `beforeclose` event. Return `false` (or
         * call `preventDefault()`) to keep the dialog open.
         */
        onbeforeclose:
            | ((this: DialogifyElement, event: Event) => void | boolean)
            | null;
        show(): Promise<string>;
        showModal(): Promise<string>;
        /**
         * Show anchored next to another element. With no arguments the
         * `anchor`, `placement`, `align` and `offset` attributes are used.
         */
        showAt(anchor?: Element | string | null, options?: AnchorOptions): Promise<string>;
        reposition(): this;
        isOpen(): boolean;
        /**
         * Set the dialog title. Named `setTitle` because the native
         * `HTMLElement.title` property is the tooltip string.
         */
        setTitle(title: string): this;
        buttons(buttons: ButtonConfig[], options?: ButtonBoxOptions): this;
        addButton(button: ButtonConfig | string, options?: AddButtonOptions): this;
        removeButton(id: string | number): this;
        updateButton(id: string | number, changes: ButtonChanges): this;
        getButton(id: string | number): JQueryLike;
        setContent(content: string | Node): this;
        getContent(): string;
        load(url: string, data?: Record<string, unknown>): Promise<Dialogify>;
        setLoading(loading: boolean | string): this;
        isLoading(): boolean;
        validate(): boolean;
        formData(): FormData | null;
        formValues(): Record<string, string | string[]>;
        on(event: EventName, handler: (this: Dialogify) => void): this;
        off(event: EventName, handler?: (this: Dialogify) => void): this;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'bahamut-dialogify': Dialogify.DialogifyElement;
    }
}
