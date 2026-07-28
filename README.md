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
