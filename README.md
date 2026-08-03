# Dialogify

A javascript plugin for creating dialog, implements with HTMLDialogElement.

## Installation

```bash
npm install @oneup_network/dialogify jquery
```

`jquery` is a **peer dependency** — install it alongside dialogify (or load it
globally before the browser bundle).

### Browser (global build)

```html
<script src="path/to/jquery.min.js"></script>
<script src="path/to/dialogify.min.js"></script>
```

The browser build injects its own CSS, so no extra stylesheet is required.

### Module (ESM / CommonJS)

```javascript
import Dialogify from '@oneup_network/dialogify';
// optionally link the standalone stylesheet: @oneup_network/dialogify/css
```

## Basic usage

```javascript
new Dialogify('dialog content')
    .title('dialog title')
    .buttons([{ type: Dialogify.BUTTON_PRIMARY }])
    .showModal();

// alternate alert, confirm and prompt
(async function () {
    await Dialogify.alert('Alert!!');

    if (await Dialogify.confirm('Yes or no？')) {
        // blah..
    }

    const answer = await Dialogify.prompt('Question？');
    // if (answer == blah...)
})();
```

![basic dialogify](docs/img/screenshot1.png)

## Dialog content is HTML

The `source` passed to `new Dialogify(source)` and the `message` passed to
`Dialogify.alert` / `confirm` / `prompt` are inserted as **HTML** — this is an
intentional feature so you can render rich content:

```javascript
new Dialogify('<img src="hero.png"><p>Rich <strong>HTML</strong> content</p>').showModal();
```

`source` is resolved as follows:

- a string starting with `#` is treated as a selector and its inner HTML is cloned;
- a string starting with the ajax prefix (default `/ajax/`) is fetched and injected;
- any other string is inserted as raw HTML.

> ⚠️ **Security:** because content is rendered as HTML, always escape/sanitize any
> untrusted or user-supplied input before passing it to Dialogify to avoid XSS.

## Declarative usage (`<dialog is="bahamut-dialogify">`)

Besides the programmatic API, a dialog can be written directly in HTML using a
[customized built-in element](https://developer.mozilla.org/docs/Web/API/Web_components/Using_custom_elements#customized_built-in_elements).
The element is registered automatically when dialogify is loaded:

```html
<dialog is="bahamut-dialogify" dialog-title="Hello">
    dialog content <b>bold text</b>
    <button ok></button>
    <button cancel></button>
</dialog>
```

```javascript
const dialog = document.querySelector('dialog[is="bahamut-dialogify"]');
dialog.showModal();
```

The element name is prefixed because the custom elements spec requires a hyphen
in the name — `is="dialogify"` is not a valid custom element name.

Unlike `new Dialogify()`, a declarative dialog is **not** removed from the DOM when
it closes, so it can be shown again.

### Methods

`document.querySelector(...)` returns the element itself, and the dialogify API is
available on it:

| Method                       | Description                      |
| ---------------------------- | -------------------------------- |
| `show()`                     | Show the dialog (non-modal)      |
| `showModal()`                | Show the dialog as a modal       |
| `close(returnValue?)`        | Native `<dialog>` close          |
| `isOpen()`                   | Whether the dialog is open       |
| `setTitle(text)`             | Set the dialog title             |
| `buttons(buttons, options?)` | Add buttons programmatically     |
| `on(event, handler)`         | Bind a dialogify instance event  |
| `.dialogify`                 | The backing `Dialogify` instance |

> `setTitle()` is used instead of `title()` because `HTMLElement.title` is the
> native tooltip property and must keep its standard behaviour.

### Options as attributes

| Attribute           | Option             | Notes                                                         |
| ------------------- | ------------------ | ------------------------------------------------------------- |
| `dialog-title`      | —                  | Dialog title (`title` is the native tooltip)                  |
| `size="large"`      | `size`             | Maps to `Dialogify.SIZE_LARGE`; any other value is used as-is |
| `closable`          | `closable`         | Show the close button                                         |
| `fixed`             | `fixed`            | Use `position: fixed`                                         |
| `background-scroll` | `backgroundScroll` | Allow scrolling behind the dialog                             |
| `use-dialog-form`   | `useDialogForm`    | Wrap content in `<form method="dialog">`                      |
| `src`               | —                  | Load content from this URL instead of the inline markup       |
| `ajax-prefix`       | `ajaxPrefix`       | Ajax prefix used to resolve `src`                             |
| `options='{...}'`   | —                  | Any option as a JSON object                                   |
| `buttons-position`  | —                  | `left` / `center` / `right` (default `right`)                 |

> ⚠️ Because attributes are strings, these booleans are **value-based**, not
> presence-based: use `closable="false"` to disable. A bare attribute, `"true"`,
> or any other value means `true`. This differs from standard HTML boolean
> attributes.

Options that cannot be expressed as attributes (callbacks, style objects) can be
assigned before the dialog is first shown:

```javascript
dialog.options = {
    ajaxComplete() {
        /* ... */
    }
};
```

### Buttons

Add a `<button>` with one of the marker attributes inside the dialog content.
They are collected into a button box that matches the programmatic `buttons()` output:

| Attribute | Style   | Closes the dialog        |
| --------- | ------- | ------------------------ |
| `ok`      | primary | ✅                       |
| `cancel`  | default | ✅ (also fires `cancel`) |
| `close`   | default | ✅                       |
| `primary` | primary | ❌                       |
| `danger`  | danger  | ❌                       |

If the button has no text, a localized default (`Ok` / `Cancel` / `Close`) is used:

```html
<dialog is="bahamut-dialogify">
    Delete this item?
    <button cancel></button>
    <button danger onclick="doDelete()">Delete</button>
</dialog>
```

> Write `<button ok></button>`, not `<button ok />`. Self-closing syntax is not
> valid for HTML elements and makes the parser nest the following siblings.

### Events

`close` and `cancel` are native `<dialog>` events; `show` is dispatched by dialogify.
All three can be bound in the usual ways:

```javascript
dialog.addEventListener('show', () => {});
dialog.onshow = () => {};
dialog.onclose = () => {};
```

They can also be bound in markup. `onclose` and `oncancel` are native inline
handlers and behave exactly as the browser defines. In addition, dialogify
resolves a **function name** on `onshow`, `onclose` and `oncancel`:

```html
<dialog is="bahamut-dialogify" onshow="myHandler" onclose="MyApp.onClose"></dialog>
```

The name is looked up in `Dialogify.handlers` first, then on `window` (dotted
paths are supported), and it is resolved when the event fires — so handlers may be
defined after the markup. Values that are not plain identifiers are ignored by
dialogify and left to the browser's native inline handler support, so no code is
ever evaluated by dialogify itself.

```javascript
Dialogify.handlers.myHandler = function () {
    // `this` is the dialog element
};
```

### Browser support

Customized built-in elements are not supported in Safari/WebKit. Load a polyfill
such as [`@ungap/custom-elements`](https://github.com/ungap/custom-elements)
**before** dialogify to enable the declarative syntax there. The programmatic
API works everywhere without it.

## Optional legacy polyfill

Modern browsers support `<dialog>` natively, so no polyfill is bundled by default.
To support legacy browsers, load the optional polyfill **before** dialogify; it
exposes `window.dialogPolyfill`, which dialogify detects at runtime:

```html
<script src="path/to/dialog-polyfill.min.js"></script>
<script src="path/to/dialogify.min.js"></script>
```

## Usage and examples

[https://oneupnetwork.github.io/dialogify/](https://oneupnetwork.github.io/dialogify/)

## Dependencies

- [jQuery](https://jquery.com/) (peer dependency, `>=3.0.0`)

## Browser compatibility

All modern browser

## Designed by

[Phoebe](https://github.com/Phoebe1226)

## Contribute

- Fork & clone this repo
    ```
    npm install
    npm run build
    ```
- Create branch and commit your changes
- Open a pull request

Feel free to contribute

## License

MIT
