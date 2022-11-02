# Dialogify
A javascript plugin for creating dialog, implements with HTMLDialogElement.

## Basic usage
```javascript
new Dialogify('dialog content')
    .title('dialog title')
    .buttons([{type:Dialogify.BUTTON_PRIMARY}])
    .showModal();

// alternate alert, confirm and prompt
(async function() {
    await Dialogify.alert('Alert!!');

    if (await Dialogify.confirm('Yes or no？')) {
        // blah..
    }

    const answer = await Dialogify.prompt('Question？');
    // if (answer == blah...)
})();
```

![basic dialogify](docs/img/screenshot1.png)

## Usage and examples
[https://oneupnetwork.github.io/dialogify/](https://oneupnetwork.github.io/dialogify/)

## Dependencies
* [jQuery](https://jquery.com/)

## Browser compatibility
All modern browser

## Designed by
[Phoebe](https://github.com/Phoebe1226)

## Contribute
* Fork & clone this repo
    ```
    npm install
    npm run build
    ```
* Create branch and commit your changes
* Open a pull request

Feel free to contribute

## License
MIT
