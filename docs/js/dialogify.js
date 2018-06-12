/**
 * dialogify
 * https://github.com/porksteak/dialogify
 */
(function($, window, dialogPloyfill){
    'use strict';

    let Dialogify = function(source, options){
        this._dialog = window.document.createElement('dialog');
        dialogPolyfill.registerDialog(this._dialog);

        if (options == null || typeof options != 'object') {
            options = {};
        }

        let content = source.charAt(0) == '#' ? $(source).html() : source;
        content  = '<div class="dialogify__body">' + content + '</div>';

        var self = this;
        let $closeButton = $('<a>').addClass('dialogify__close')
            .append('<img src="img/pixel-close.svg">')
            .click(function(e){
                self.close();
            });

        let widthClass = options.size || 'dialogify__fixedwidth';
        let dialogClass = 'dialogify pixel-style';
        if (options.fixed !== false) {
            dialogClass += ' fixed';
        }

        let dialogHtml = '<form method="dialog"><div class="dialogify__content ' + widthClass + '"><div></div></div></form>';

        this.id = 'dialogify_' + (++Dialogify.counter);

        $(this._dialog).attr('id', this.id)
            .addClass(dialogClass)
            .append(dialogHtml).append($closeButton)
            .on('close', function(e){
                console.log('dialog:' + $(this).attr('id') + ' close, ' + this.returnValue);
                $(this).remove();
            })
            .appendTo('body');

        this.$container = $(this._dialog).find('.dialogify__content > div');
        this.$container.append(content);
    };

    Dialogify.prototype.showModal = function(){
        closeOpenDialog();
        this._dialog.showModal();
    };
    Dialogify.prototype.show = function(){
        closeOpenDialog();
        this._dialog.show();
    };
    Dialogify.prototype.close = function(){
        this._dialog.close();
    };

    Dialogify.prototype.title = function(title){
        let $titleBox = $('<h5>').addClass('dialogify_title')
            .append('<img src="img/pixel-title.gif">')
            .append(title);

        if (this.$container.find('.dialogify_title').length) {
            this.$container.find('.dialogify_title').replaceWith($titleBox);
        } else {
            this.$container.prepend($titleBox);
        }

        return this;
    }

    Dialogify.prototype.buttons = function(buttons, options){
        if (!Array.isArray(buttons)) {
            buttons = [];
        }

        if (options == null || typeof options != 'object') {
            options = {};
        }

        let $buttonBox = $('<div>')
            .addClass('btn-box')
            .addClass(options.position || 'text-right');

        var self = this;
        for (let i = 0;i < buttons.length;i++){
            if (typeof buttons[i] == 'string') {
                $buttonBox.append(buttons[i]);
            } else {
                if (buttons[i] == null || typeof buttons[i] != 'object') {
                    buttons[i] = {};
                }

                let $btn = $('<button type="button">')
                    .addClass('btn btn-insert')
                    .addClass(buttons[i].type || '');

                if (buttons[i].type == Dialogify.BUTTON_PRIMARY) {
                    $btn.attr('type', 'submit');
                }

                $btn.text(buttons[i].text || '關閉');
                $btn.click(function(e){
                    if (buttons[i].click) {
                        buttons[i].click.call(self, e);
                    }
                });

                $buttonBox.append($btn);
            }
        }

        if (this.$container.find('.btn-box').length) {
            this.$container.find('.btn-box').replaceWith($buttonBox);
        } else {
            this.$container.append($buttonBox);
        }

        return this;
    }

    Dialogify.counter = 0;

    Dialogify.SIZE_LARGE = 'dialogify__autowidth';

    Dialogify.BUTTON_CENTER = 'text-center';
    Dialogify.BUTTON_LEFT = 'text-left';

    Dialogify.BUTTON_PRIMARY = 'btn-primary';
    Dialogify.BUTTON_DANGER = 'btn-danger';

    Dialogify.alert = function(message){

    };

    function closeOpenDialog(){
        if ($('dialog[open]').length) {
            $('dialog[open]').get(0).close();
        }
    }

    window.Dialogify = Dialogify;
})(jQuery, window, dialogPolyfill);
