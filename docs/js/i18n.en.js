/* English strings for the documentation site.
   The page ships with Traditional Chinese in the markup; this file only holds
   the English replacements, keyed by the data-i18n attribute. */
window.DIALOGIFY_DOCS_EN = {
    'page.title': 'Dialogify — a dialog toolkit built on &lt;dialog&gt;',
    skip: 'Skip to content',
    try: 'Try it',
    'toc.title': 'On this page',
    'nav.toggle': 'Toggle navigation',
    'nav.theme': 'Switch theme',
    'nav.filter': 'Filter sections…',
    'nav.noMatch': 'No matching section',
    'footer.design': 'Designed by',
    'footer.license': 'Licensed',

    'hero.lead':
        'A dialog toolkit built on the native <code>&lt;dialog&gt;</code> element. It covers modal dialogs, drawers, toasts, anchored popovers and forms, and can also be written declaratively in HTML.',
    'hero.try': 'Try it now',
    'hero.start': 'Get started',
    'hero.api': 'API reference',

    'start.h': 'Getting started',
    'start.install.h': 'Installation',
    'start.install.p':
        'jQuery is a <strong>peer dependency</strong> — install it alongside dialogify, or load it globally before the browser bundle.',
    'start.browser.h': 'Browser (global build)',
    'start.browser.p': 'The browser build injects its own CSS, so no extra stylesheet is required.',
    'start.module.h': 'Module (ESM / CommonJS)',
    'start.hello.h': 'Your first dialog',

    'concepts.h': 'Core concepts',
    'concepts.modal.h': 'Modal and non-modal',
    'concepts.modal.p':
        '<code>showModal()</code> promotes the dialog to the browser top layer, where it always paints above the page, and handles focus trapping and <kbd>ESC</kbd> for you. <code>show()</code> leaves it in the normal stacking context, so the page stays usable.',
    'concepts.modal.try': 'Open a modal',
    'concepts.modeless.try': 'Open a non-modal',
    'concepts.chain.h': 'Chaining and promises',
    'concepts.chain.p':
        'Configuration methods return the instance so they can be chained; <code>show()</code> and <code>showModal()</code> return a promise that settles with <code>returnValue</code> once the dialog closes.',
    'concepts.life.h': 'Lifecycle',
    'concepts.life.p':
        'A dialog built with <code>new Dialogify()</code> is removed from the DOM once it closes (keep it with <code>autoRemove: false</code>); a declarative dialog written in HTML is never removed, so it can be shown again.',

    'create.h': 'Creating a dialog',
    'create.ctor.h': 'Constructor',
    'create.ctor.p':
        '<code>content</code> is an HTML string. When it starts with <code>ajaxPrefix</code> (<code>/ajax/</code> by default), the content is fetched from that URL instead.',
    'create.options.h': 'Options',
    'create.config.h': 'Global configuration',
    'create.config.p':
        '<code>window.dialogifyConfig</code> is read on every call, so changes take effect immediately.',

    'opt.size': 'Set to <code>Dialogify.SIZE_LARGE</code> to grow with the content',
    'opt.closable': 'Show the close button in the corner',
    'opt.closeButton':
        'Custom close button <code>image</code>, <code>className</code> and <code>style</code>',
    'opt.fixed': 'Pin to the viewport with <code>position: fixed</code>',
    'opt.bgScroll': 'Allow the page behind the dialog to scroll',
    'opt.autoRemove': 'Remove the dialog from the DOM once it closes',
    'opt.useForm': 'Wrap the content in <code>&lt;form method="dialog"&gt;</code>',
    'opt.position':
        'Turns the dialog into a drawer; <code>left</code> / <code>right</code> / <code>top</code> / <code>bottom</code>',
    'opt.ajaxPrefix': 'Prefix that marks the content as an ajax URL',
    'opt.ajaxData': 'Parameters sent with the ajax request',
    'opt.ajaxComplete': 'Called once the ajax content is in; <code>this</code> is the instance',

    'content.h': 'Working with content',
    'content.basic.h': 'Title and body',
    'content.ajax.h': 'Loading over ajax',
    'content.loading.h': 'Loading state',
    'content.xss':
        '<strong>Security:</strong> the content is rendered as HTML — that is a deliberate feature, so markup and components can be dropped straight in. Always escape or sanitize untrusted or user-supplied input first to avoid XSS.',

    'forms.h': 'Forms',
    'forms.p':
        'The content is wrapped in <code>&lt;form method="dialog"&gt;</code> by default, so native validation and <code>FormData</code> work out of the box.',
    'forms.validate':
        'Runs native validation, returns whether it passed and reports the first invalid field',
    'forms.values': 'Returns a plain object; repeated fields become arrays',
    'forms.data':
        'Returns a <code>FormData</code>, or <code>null</code> when <code>useDialogForm</code> is <code>false</code>',

    'buttons.h': 'Buttons',
    'buttons.define.h': 'Defining buttons',
    'buttons.position':
        'The second argument takes a <code>position</code> of <code>Dialogify.BUTTON_LEFT</code> or <code>Dialogify.BUTTON_CENTER</code>; the default is right-aligned.',
    'buttons.manage.h': 'Managing them at runtime',
    'btn.text': 'Button label; falls back to the localized default',
    'btn.type':
        '<code>Dialogify.BUTTON_PRIMARY</code> or <code>Dialogify.BUTTON_DANGER</code>; omit for the default style',
    'btn.id': 'Used to address the button from <code>updateButton()</code> and friends',
    'btn.click': 'Click handler; without one the button closes the dialog',
    'btn.loadingText': 'Label shown while the button is busy',

    'events.h': 'Events',
    'ev.show': 'After the dialog is shown',
    'ev.beforeclose': 'Fires before every kind of close; cancel it to keep the dialog open',
    'ev.close': 'After the dialog closes (native event)',
    'ev.cancel': 'When it is closed with <kbd>ESC</kbd> (native event)',
    'events.before.h': 'Intercepting a close',
    'events.before.p':
        '<code>beforeclose</code> covers buttons, the close button, <kbd>ESC</kbd>, a backdrop click, a <code>&lt;form method="dialog"&gt;</code> submit and <code>close()</code> itself.',

    'variants.h': 'Drawers, toasts and popovers',
    'variants.drawer.h': 'Drawer',
    'variants.drawer.p':
        'With <code>position</code> set, the dialog slides in from that edge instead of being centred.',
    'variants.toast.h': 'Toast',
    'variants.toast.p':
        'A lightweight, auto-dismissing notification. Toasts are non-modal and stack in a fixed corner container, so they never block the page. Hovering one pauses its timer.',
    'variants.toast.pos': 'Move it around',
    'variants.toast.ret':
        '<code>Dialogify.toast()</code> returns the dialog instance, so <code>close()</code> and the usual events are available.',
    'variants.popover.h': 'Anchored popover',
    'variants.popover.p':
        '<code>showAt()</code> positions a non-modal dialog next to another element, for dropdowns and popover cards. It flips to the opposite side when the preferred placement would overflow, and follows the anchor on scroll and resize.',
    'variants.popover.other': 'A different anchor',
    'variants.popover.dismiss':
        'A popover is dismissed by a click anywhere outside it. Clicking the anchor that opened it toggles it shut, and that click is swallowed so it is not immediately reopened. Clicking a <em>different</em> trigger is left alone, so it closes this popover and opens its own.',
    'variants.anim.h': 'Animation',
    'variants.anim.p':
        'Drawers slide in and out from their edge, toasts fade and scale, and popovers fade in place. The exit animation runs after the dialog has closed, so a dialog with <code>autoRemove</code> stays in the DOM until it finishes. A closing toast collapses its own height at the same time, so the toasts below slide up instead of jumping. All of it is disabled under <code>prefers-reduced-motion: reduce</code>.',

    'shortcuts.h': 'Shortcuts',
    'shortcuts.p':
        'Drop-in replacements for the browser <code>alert</code>, <code>confirm</code> and <code>prompt</code>, all promise-based.',
    'shortcuts.opts':
        'All three take a second argument: <code>ok</code>, <code>cancel</code> and <code>close</code> are per-button callbacks, and <code>dialogOptions</code> is handed straight to the dialog constructor (for example <code>{ dialogOptions: { size: Dialogify.SIZE_LARGE } }</code>). <code>prompt()</code> also accepts <code>placeholder</code> and <code>value</code>. <code>confirm()</code> resolves to <code>true</code> / <code>false</code>; <code>prompt()</code> resolves to the entered text or <code>null</code>.',

    'decl.h': 'Declarative usage',
    'decl.p':
        'Besides the programmatic API, a dialog can be written directly in HTML as a <a href="https://developer.mozilla.org/docs/Web/API/Web_components/Using_custom_elements#customized_built-in_elements">customized built-in element</a>. It is registered as soon as dialogify loads.',
    'decl.name':
        'The element name is prefixed because the spec requires a hyphen in a custom element name — <code>is="dialogify"</code> is not valid. Note also that a declarative dialog is <strong>not</strong> removed from the DOM when it closes, so it can be shown again.',
    'decl.attr.h': 'Options as attributes',
    'attr.title': 'Dialog title (<code>title</code> is the native tooltip attribute)',
    'attr.size':
        '<code>large</code> maps to <code>SIZE_LARGE</code>; any other value is used as-is',
    'attr.position': 'Drawer edge',
    'attr.closable': 'Show the close button',
    'attr.fixed': 'Use <code>position: fixed</code>',
    'attr.bgScroll': 'Allow the page behind to scroll',
    'attr.useForm': 'Wrap the content in a form',
    'attr.src': 'Load the content from this URL instead of the inline markup',
    'attr.ajaxPrefix': 'Prefix used to resolve <code>src</code>',
    'attr.options': 'Any option at once, as JSON',
    'attr.buttonsPos': '<code>left</code> / <code>center</code> / <code>right</code> (default)',
    'attr.anchor': 'Selector for the anchor element used by <code>showAt()</code>',
    'attr.place': 'Placement, alignment and gap for an anchored popover',
    'decl.bool':
        '<strong>Careful:</strong> attributes are strings, so these booleans are <strong>value-based</strong>, not presence-based: write <code>closable="false"</code> to disable. A bare attribute, <code>"true"</code>, or any other value means <code>true</code>. This differs from standard HTML boolean attributes.',
    'decl.objOpts':
        'Options that cannot be expressed as attributes (callbacks, style objects) can be assigned before the dialog is first shown:',
    'decl.btn.h': 'Buttons',
    'decl.btn.p':
        'Add a <code>&lt;button&gt;</code> with one of the marker attributes inside the content. They are collected into a button box that matches the programmatic <code>buttons()</code> output. Without text, a localized default is used.',
    'decl.btn.cancel': '✅ (also fires <code>cancel</code>)',
    'decl.btn.selfclose':
        'Write <code>&lt;button ok&gt;&lt;/button&gt;</code>, not <code>&lt;button ok /&gt;</code>. Self-closing syntax is not valid for HTML elements and makes the parser nest the following siblings.',
    'decl.btn.js':
        'Declarative buttons join the button list too, so they can be driven from JavaScript. Give them an <code>id</code> to address them by name (otherwise they are keyed by index), and a <code>loading-text</code> for their busy state.',
    'decl.ev.h': 'Events',
    'decl.ev.p':
        '<code>close</code> and <code>cancel</code> are native <code>&lt;dialog&gt;</code> events; <code>show</code> and <code>beforeclose</code> are dispatched by dialogify. They can all be bound in the usual ways.',
    'decl.ev.inline':
        'They can also be bound in markup. <code>onclose</code> and <code>oncancel</code> are native inline handlers and behave exactly as the browser defines. In addition, dialogify resolves a <strong>function name</strong> on <code>onshow</code>, <code>onclose</code>, <code>oncancel</code> and <code>onbeforeclose</code>:',
    'decl.ev.lookup':
        'The name is looked up in <code>Dialogify.handlers</code> first, then on <code>window</code> (dotted paths are supported), and it is resolved when the event fires — so handlers may be defined after the markup. Values that are not plain identifiers are ignored by dialogify and left to the browser native inline handler support, so no code is ever evaluated by dialogify itself.',
    'decl.safari.h': 'Safari support',
    'decl.safari.p':
        'Customized built-in elements are not supported in Safari/WebKit, so <code>&lt;dialog is="bahamut-dialogify"&gt;</code> is never upgraded there. An optional bundle of <a href="https://github.com/ungap/custom-elements">@ungap/custom-elements</a> ships with dialogify; load it <strong>before</strong> dialogify to enable the declarative syntax. It is a no-op in browsers that already support the feature, and the programmatic API works everywhere without it.',

    'theme.h': 'Theming',
    'theme.p':
        'Every colour in the stylesheet is read through a CSS custom property, so you can retheme the dialog without fighting selectors.',
    'theme.fallback':
        'The library <strong>never declares</strong> these properties itself — the light values are only <code>var()</code> fallbacks — so your declaration wins regardless of source order, even though the browser build injects its stylesheet last.',
    'theme.dark.h': 'Dark theme',
    'theme.dark.p':
        'A dark palette ships with the stylesheet, behind <code>data-theme</code>. The attribute can sit on any ancestor of the dialog (usually <code>&lt;html&gt;</code>) and can be flipped at runtime.',
    'theme.dark.try': 'Open a dark dialog',
    'theme.absent': 'absent',
    'theme.dark.absent': 'Light (the default, unchanged from earlier releases)',
    'theme.light': 'Light',
    'theme.darkv': 'Dark',
    'theme.auto': 'Follows <code>prefers-color-scheme</code>',
    'theme.optin':
        'Dark mode is <strong>opt-in on purpose</strong>: without the attribute the dialog stays light even when the visitor system is set to dark, so an existing site never changes appearance on upgrade. Use <code>data-theme="auto"</code> to follow the system.',
    'theme.override':
        'The dark rules only set custom properties, never a real declaration, so if you already ship your own overrides for <code>.dialogify</code> they keep winning by source order. Be aware that anything your stylesheet leaves alone will pick up the dark palette, which can mix the two; declare <code>--dialogify-*</code> properties instead of rules if you want full control.',
    'theme.icons':
        'The built-in icons are single-colour SVGs with the fill baked in, so they are re-tinted with <code>--dialogify-icon-filter</code> rather than swapped. This also applies to a custom <code>closeButton.image</code>; set it to <code>none</code> to opt out.',
    'theme.z.h': 'Stacking (z-index)',
    'theme.z.p':
        '<code>showModal()</code> promotes a dialog to the browser top layer, where <code>z-index</code> does not apply. Everything else — <code>show()</code>, <code>showAt()</code> popovers and toasts — stays in the normal stacking context and has to out-stack the rest of the page. The defaults are deliberately high so a toast is not hidden behind a sticky header.',
    'z.dialog': 'Non-modal dialogs and popovers',
    'z.toast': 'The toast container',
    'theme.tokens.h': 'All theme properties',
    'theme.tokens.sum': 'Show the full list',

    'a11y.h': 'Accessibility',
    'a11y.title':
        '<code>title()</code> links the heading to the dialog with <code>aria-labelledby</code>.',
    'a11y.close':
        'The close button is exposed as a button, is keyboard focusable, activates with <kbd>Enter</kbd> / <kbd>Space</kbd>, and is labelled from the locale.',
    'a11y.icons':
        'Decorative icons are hidden from assistive technology; the loading indicator and toasts announce themselves with <code>role="status"</code>.',
    'a11y.busy': 'Buttons in their loading state are marked <code>aria-busy</code>.',
    'a11y.motion': 'Animations are disabled under <code>prefers-reduced-motion</code>.',
    'a11y.focus':
        'Focus trapping and focus restoration for modal dialogs come from the native <code>&lt;dialog&gt;</code> element itself.',

    'locale.h': 'Locale',
    'locale.p':
        '<code>zh_TW</code> (the default), <code>zh_CN</code> and <code>en_US</code> ship with the library. The locale drives the default button labels, the close button label and the loading text.',

    'browser.h': 'Browser support',
    'browser.p':
        'Every browser with a native <code>&lt;dialog&gt;</code> element: Chrome 94+, Firefox 98+, Safari 15.4+. The bundles are built for <code>es2022</code>.',
    'browser.polyfill':
        'Older browsers can load the optional dialog-polyfill bundle. Load it <strong>before</strong> dialogify; it exposes <code>window.dialogPolyfill</code>, which dialogify detects at runtime.',
    'browser.deps':
        'The only dependency is <a href="https://jquery.com/">jQuery</a> (a peer dependency, <code>&gt;=3.0.0</code>, jQuery 4 included).',

    'api.h': 'API reference',
    'api.instance.h': 'Instance methods',
    'api.show': 'Show as non-modal; resolves when it closes',
    'api.showModal': 'Show as a modal; resolves when it closes',
    'api.showAt': 'Show anchored to another element',
    'api.reposition': 'Recompute the anchored position',
    'api.close': 'Close the dialog (fires <code>beforeclose</code>)',
    'api.isOpen': 'Whether the dialog is open',
    'api.title': 'Set the dialog title',
    'api.setContent': 'Replace the body, keeping title and buttons',
    'api.getContent': 'The current body HTML',
    'api.load': 'Load the body over ajax, with a loading state',
    'api.loading': 'Toggle or query the loading overlay',
    'api.validate': 'Run native form validation',
    'api.form': 'Read the dialog form',
    'api.buttons': 'Set the buttons',
    'api.addButton': 'Append (or <code>prepend</code>) one button',
    'api.updateButton': 'Update a button in place',
    'api.button': 'Remove or fetch a button',
    'api.on': 'Bind or unbind an event',
    'api.static.h': 'Static members',
    'api.shortcuts': 'Promise-based shortcuts',
    'api.toast': 'Show a toast; returns the dialog instance',
    'api.closeAll': 'Close every open dialog',
    'api.handlers': 'Lookup table for declarative inline handlers',
    'api.locale': 'Locale strings; extend as needed',
    'api.const1': 'Size and button style constants',
    'api.const2': 'Button box alignment constants',
    'api.const3': 'Drawer edge constants',
    'api.const4': 'Toast style constants',
    'api.const5': 'The six toast position constants',

    'th.option': 'Option',
    'th.type': 'Type',
    'th.default': 'Default',
    'th.desc': 'Description',
    'th.method': 'Method',
    'th.field': 'Field',
    'th.event': 'Event',
    'th.cancelable': 'Cancelable',
    'th.attr': 'Attribute',
    'th.style': 'Style',
    'th.closes': 'Closes the dialog',
    'th.prop': 'Custom property',
    'th.applies': 'Applies to',
    'th.result': 'Result',
    'th.member': 'Member',
    'style.primary': 'Primary',
    'style.default': 'Default',
    'style.danger': 'Danger',

    /* code samples */
    'code.module':
        "import Dialogify from '@oneup_network/dialogify';\n" +
        '\n' +
        '// when you want the standalone stylesheet:\n' +
        "// import '@oneup_network/dialogify/css';",

    'code.modal':
        "new Dialogify('I am modal and block the page').showModal();\n" +
        "new Dialogify('I am non-modal, the page still works').show();",

    'code.await':
        "const dialog = new Dialogify('Ready to submit?').buttons([\n" +
        "    { text: 'Yes', type: Dialogify.BUTTON_PRIMARY, click: () =&gt; dialog.close('yes') },\n" +
        "    { text: 'No', click: () =&gt; dialog.close('no') }\n" +
        ']);\n' +
        '\n' +
        "const answer = await dialog.showModal(); // 'yes' or 'no'",

    'code.config':
        'window.dialogifyConfig = {\n' +
        "    locale: 'zh_TW',        // zh_TW (default) / zh_CN / en_US\n" +
        '    closeButton: {          // shared by every dialog\n' +
        "        className: 'my-close'\n" +
        '    }\n' +
        '};',

    'code.setContent':
        "const dialog = new Dialogify('Step 1').title('Setup wizard').show();\n" +
        '\n' +
        "dialog.setContent('&lt;p&gt;Step 2&lt;/p&gt;'); // body only, title and buttons stay\n" +
        'dialog.getContent();                // the current body HTML',

    'code.ajax':
        '// loaded on construction\n' +
        "new Dialogify('/ajax/detail', { ajaxData: { id: 7 } }).showModal();\n" +
        '\n' +
        '// loaded later, with a loading state while it runs\n' +
        "await dialog.load('/ajax/step2', { id: 7 });",

    'code.loading':
        'dialog.setLoading(true); // dims the body and spins\n' +
        'dialog.setLoading(false);\n' +
        'dialog.isLoading();',

    'code.form':
        'const dialog = new Dialogify(\'&lt;input class="text-field" name="title" required&gt;\').buttons([\n' +
        '    {\n' +
        "        id: 'save',\n" +
        "        text: 'Save',\n" +
        '        type: Dialogify.BUTTON_PRIMARY,\n' +
        "        loadingText: 'Saving...',\n" +
        '        click: async () =&gt; {\n' +
        '            if (!dialog.validate()) {\n' +
        '                return; // reports the first invalid field\n' +
        '            }\n' +
        '\n' +
        "            dialog.updateButton('save', { loading: true });\n" +
        "            await save(dialog.formValues()); // { title: '...' }\n" +
        "            dialog.close('saved');\n" +
        '        }\n' +
        '    }\n' +
        ']);',

    'code.buttons':
        "new Dialogify('Delete this record?')\n" +
        '    .buttons(\n' +
        '        [\n' +
        "            { text: 'Cancel', click: () =&gt; dialog.close() },\n" +
        "            { id: 'del', text: 'Delete', type: Dialogify.BUTTON_DANGER, loadingText: 'Deleting…' }\n" +
        '        ],\n' +
        '        { position: Dialogify.BUTTON_CENTER }\n' +
        '    )\n' +
        '    .showModal();',

    'code.buttonManage':
        "dialog.addButton({ id: 'more', text: 'More' });\n" +
        "dialog.addButton({ id: 'first', text: 'First' }, { prepend: true });\n" +
        "dialog.updateButton('more', { text: 'Fewer', type: Dialogify.BUTTON_DANGER, disabled: true });\n" +
        "dialog.updateButton('save', { loading: true }); // spins, disables, swaps in loadingText\n" +
        "dialog.removeButton('more');\n" +
        "dialog.getButton('save'); // the jQuery object for that button",

    'code.beforeclose':
        "dialog.on('beforeclose', async (event) =&gt; {\n" +
        '    if (isDirty) {\n' +
        '        event.preventDefault();\n' +
        "        if (await Dialogify.confirm('Discard your unsaved changes?')) {\n" +
        '            isDirty = false;\n' +
        '            dialog.close();\n' +
        '        }\n' +
        '    }\n' +
        '});',

    'code.drawer':
        "new Dialogify('&lt;h4&gt;Filters&lt;/h4&gt;', { position: Dialogify.POSITION_RIGHT }).showModal();",

    'code.toast':
        "Dialogify.toast('Saved');\n" +
        '\n' +
        "Dialogify.toast('Could not save', {\n" +
        '    type: Dialogify.TOAST_ERROR,     // TOAST_INFO (default) / TOAST_SUCCESS / TOAST_WARNING\n' +
        "    position: 'bottom-right',        // or Dialogify.TOAST_BOTTOM_RIGHT, default top-right\n" +
        '    duration: 5000,                  // 0 keeps it open\n' +
        "    title: 'Error',\n" +
        '    closable: true\n' +
        '});',

    'code.popover':
        "new Dialogify('&lt;ul&gt;…&lt;/ul&gt;', { useDialogForm: false }).showAt('#menu-button', {\n" +
        "    placement: 'bottom', // top | bottom | left | right\n" +
        "    align: 'start',      // start | center | end\n" +
        '    offset: 8,\n' +
        '    toggle: true         // clicking the anchor again closes it, default true\n' +
        '});\n' +
        '\n' +
        '// Note: closable: false drops the close button in the corner and, with it,\n' +
        '// the click-outside dismissal — only close() can shut the popover then.',

    'code.shortcuts':
        "await Dialogify.alert('Alert!!');\n" +
        '\n' +
        "if (await Dialogify.confirm('Shall we continue?')) {\n" +
        '    // ...\n' +
        '}\n' +
        '\n' +
        "const answer = await Dialogify.prompt('What is your name?', { placeholder: 'Type here', value: '' });\n" +
        '\n' +
        'Dialogify.closeAll(); // close every dialog that is open',

    'code.declButtons':
        '&lt;dialog is="bahamut-dialogify"&gt;\n' +
        '    Delete this record?\n' +
        '    &lt;button cancel&gt;&lt;/button&gt;\n' +
        '    &lt;button danger onclick="doDelete()"&gt;Delete&lt;/button&gt;\n' +
        '&lt;/dialog&gt;',

    'code.declForm':
        '&lt;dialog is="bahamut-dialogify"&gt;\n' +
        '    &lt;input class="text-field" name="title" required /&gt;\n' +
        '    &lt;button ok id="save" loading-text="Saving…"&gt;Save&lt;/button&gt;\n' +
        '&lt;/dialog&gt;',

    'code.declEvents':
        "dialog.addEventListener('show', () =&gt; {});\n" +
        'dialog.onshow = () =&gt; {};\n' +
        'dialog.onclose = () =&gt; {};\n' +
        '\n' +
        "dialog.addEventListener('beforeclose', (e) =&gt; e.preventDefault()); // keeps it open\n" +
        'dialog.onbeforeclose = () =&gt; false;                                // same thing',

    'code.handlers':
        'Dialogify.handlers.myHandler = function () {\n' +
        '    // this is the dialog element\n' +
        '};',

    'code.locale':
        "window.dialogifyConfig = { locale: 'en_US' };\n" +
        '\n' +
        '// extend or override as needed\n' +
        "Dialogify.LOCALE.ja_JP = { ok: 'OK', cancel: 'キャンセル', close: '閉じる', loading: '読み込み中' };\n" +
        "window.dialogifyConfig = { locale: 'ja_JP' };",

    'token.surface': 'Dialog background',
    'token.text': 'Body text',
    'token.heading': 'Title and close button',
    'token.muted': 'Secondary text',
    'token.divider': 'The <code>&lt;hr&gt;</code> rule',
    'token.link': 'Links in the body',
    'token.linkHover': 'Links on hover',
    'token.focus': '<code>:focus-visible</code> outlines',
    'token.iconFilter': 'Filter applied to the built-in icons',
    'token.shadow': 'Dialog shadow',
    'token.loading': 'The <code>setLoading()</code> overlay',
    'token.buttonBg': 'Default button',
    'token.buttonHover': 'Default button on hover',
    'token.buttonText': 'Default button label',
    'token.primary': '<code>BUTTON_PRIMARY</code>',
    'token.primaryHover': '<code>BUTTON_PRIMARY</code> on hover',
    'token.onPrimary': '<code>BUTTON_PRIMARY</code> label',
    'token.danger': '<code>BUTTON_DANGER</code>',
    'token.dangerHover': '<code>BUTTON_DANGER</code> on hover',
    'token.onDanger': '<code>BUTTON_DANGER</code> label',
    'token.dangerShadow': '<code>.btn-danger-shadow</code>',
    'token.fieldBg': '<code>.text-field</code> background',
    'token.fieldBorder': '<code>.text-field</code> border',
    'token.fieldText': '<code>.text-field</code> text',
    'token.fieldFocus': '<code>.text-field</code> border on focus',
    'token.placeholder': '<code>.text-field</code> placeholder',
    'token.error': '<code>.is-error</code> fields',
    'token.toastInfo': 'Toast status bar, info',
    'token.toastSuccess': 'Toast status bar, success',
    'token.toastWarning': 'Toast status bar, warning',
    'token.toastError': 'Toast status bar, error',
    'token.toastClose': 'Toast close button',
    'token.toastCloseHover': 'Toast close button on hover',
    'token.backdrop': 'Modal backdrop',
    'token.backdropOpacity': 'Modal backdrop opacity',
    'token.z': 'Non-modal dialogs and popovers',
    'token.toastZ': 'The toast container'
};
