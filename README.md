# Dialogify
A javascript plugin for creating dialog/lightbox, implements with HTMLDialogElement.

## Basic usage
```javascript
new Dialogify('dialog content')
    .title('dialog title')
    .buttons([{type:Dialogify.BUTTON_PRIMARY}])
    .showModal();
```

![basic dialogify](https://raw.githubusercontent.com/OneupNetwork/dialogify/master/docs/img/screenshot1.png)

# Demo
[https://oneupnetwork.github.io/dialogify/](https://oneupnetwork.github.io/dialogify/)

# Dependencies
* [jQuery](https://jquery.com/)
* [dialog-polyfill](https://github.com/GoogleChrome/dialog-polyfill) - for compatible with old browser

# Browser compatibility
All modern browser and IE11

# Designed by
[Phoebe](https://github.com/Phoebe1226)

# TODO
- [x] implements Alert Confirm Prompt and others...
- [x] fixes css
- [ ] more options
- [x] use gulp
- [ ] api documents
- [x] event
- [x] browser compatibility

# License
MIT