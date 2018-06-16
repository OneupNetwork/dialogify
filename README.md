# Dialogify
A javascript plugin for creating dialog/lightbox, implements with HTMLDialogElement.

## Basic usage
```javascript
new Dialogify('dialog content')
    .title('dialog title')
    .buttons([{type:Dialogify.BUTTON_PRIMARY}])
    .show();
```

# Demo
[https://porksteak.github.io/dialogify/](https://porksteak.github.io/dialogify/)

# Dependencies
* [jQuery](https://jquery.com/)
* [dialog-polyfill](https://github.com/GoogleChrome/dialog-polyfill) - for compatible with old browser

# Browser compatibility
All modern browser and IE11

# Designed by
[Phoebe](https://github.com/Phoebe1226)

# TODO
- [x] implements Alert Confirm Prompt and others...
- [ ] fixes css
- [ ] more options
- [x] use gulp
- [ ] api documents
- [x] event
- [x] browser compatibility

# License
MIT