/**
 * dialogify
 * https://github.com/OneupNetwork/dialogify
 */
(function($, window, dialogPolyfill, undefined){
    'use strict';

    var Dialogify = function(source, options){
        var dialog = window.document.createElement('dialog');
        dialogPolyfill.registerDialog(dialog);

        if (options == null || typeof options != 'object') {
            options = {};
        }

        this.options = options;

        var ajaxPrefix = options.ajaxPrefix === undefined ? '/ajax/' : options.ajaxPrefix;

        var self = this;
        var content;
        var ajax = false;
        if (source.charAt(0) == '#') {
            content = $(source).html();
        } else if(source.indexOf(ajaxPrefix) == 0){
            var loadingSvg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMzZweCcgaGVpZ2h0PSczNnB4JyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCIgY2xhc3M9InVpbC1kZWZhdWx0Ij48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0ibm9uZSIgY2xhc3M9ImJrIj48L3JlY3Q+PHJlY3QgIHg9JzQ2LjUnIHk9JzQwJyB3aWR0aD0nNycgaGVpZ2h0PScyMCcgcng9JzUnIHJ5PSc1JyBmaWxsPScjMDA5NDk5JyB0cmFuc2Zvcm09J3JvdGF0ZSgwIDUwIDUwKSB0cmFuc2xhdGUoMCAtMzApJz4gIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9J29wYWNpdHknIGZyb209JzEnIHRvPScwJyBkdXI9JzFzJyBiZWdpbj0nMHMnIHJlcGVhdENvdW50PSdpbmRlZmluaXRlJy8+PC9yZWN0PjxyZWN0ICB4PSc0Ni41JyB5PSc0MCcgd2lkdGg9JzcnIGhlaWdodD0nMjAnIHJ4PSc1JyByeT0nNScgZmlsbD0nIzAwOTQ5OScgdHJhbnNmb3JtPSdyb3RhdGUoMzAgNTAgNTApIHRyYW5zbGF0ZSgwIC0zMCknPiAgPGFuaW1hdGUgYXR0cmlidXRlTmFtZT0nb3BhY2l0eScgZnJvbT0nMScgdG89JzAnIGR1cj0nMXMnIGJlZ2luPScwLjA4MzMzMzMzMzMzMzMzMzMzcycgcmVwZWF0Q291bnQ9J2luZGVmaW5pdGUnLz48L3JlY3Q+PHJlY3QgIHg9JzQ2LjUnIHk9JzQwJyB3aWR0aD0nNycgaGVpZ2h0PScyMCcgcng9JzUnIHJ5PSc1JyBmaWxsPScjMDA5NDk5JyB0cmFuc2Zvcm09J3JvdGF0ZSg2MCA1MCA1MCkgdHJhbnNsYXRlKDAgLTMwKSc+ICA8YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSdvcGFjaXR5JyBmcm9tPScxJyB0bz0nMCcgZHVyPScxcycgYmVnaW49JzAuMTY2NjY2NjY2NjY2NjY2NjZzJyByZXBlYXRDb3VudD0naW5kZWZpbml0ZScvPjwvcmVjdD48cmVjdCAgeD0nNDYuNScgeT0nNDAnIHdpZHRoPSc3JyBoZWlnaHQ9JzIwJyByeD0nNScgcnk9JzUnIGZpbGw9JyMwMDk0OTknIHRyYW5zZm9ybT0ncm90YXRlKDkwIDUwIDUwKSB0cmFuc2xhdGUoMCAtMzApJz4gIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9J29wYWNpdHknIGZyb209JzEnIHRvPScwJyBkdXI9JzFzJyBiZWdpbj0nMC4yNXMnIHJlcGVhdENvdW50PSdpbmRlZmluaXRlJy8+PC9yZWN0PjxyZWN0ICB4PSc0Ni41JyB5PSc0MCcgd2lkdGg9JzcnIGhlaWdodD0nMjAnIHJ4PSc1JyByeT0nNScgZmlsbD0nIzAwOTQ5OScgdHJhbnNmb3JtPSdyb3RhdGUoMTIwIDUwIDUwKSB0cmFuc2xhdGUoMCAtMzApJz4gIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9J29wYWNpdHknIGZyb209JzEnIHRvPScwJyBkdXI9JzFzJyBiZWdpbj0nMC4zMzMzMzMzMzMzMzMzMzMzcycgcmVwZWF0Q291bnQ9J2luZGVmaW5pdGUnLz48L3JlY3Q+PHJlY3QgIHg9JzQ2LjUnIHk9JzQwJyB3aWR0aD0nNycgaGVpZ2h0PScyMCcgcng9JzUnIHJ5PSc1JyBmaWxsPScjMDA5NDk5JyB0cmFuc2Zvcm09J3JvdGF0ZSgxNTAgNTAgNTApIHRyYW5zbGF0ZSgwIC0zMCknPiAgPGFuaW1hdGUgYXR0cmlidXRlTmFtZT0nb3BhY2l0eScgZnJvbT0nMScgdG89JzAnIGR1cj0nMXMnIGJlZ2luPScwLjQxNjY2NjY2NjY2NjY2NjdzJyByZXBlYXRDb3VudD0naW5kZWZpbml0ZScvPjwvcmVjdD48cmVjdCAgeD0nNDYuNScgeT0nNDAnIHdpZHRoPSc3JyBoZWlnaHQ9JzIwJyByeD0nNScgcnk9JzUnIGZpbGw9JyMwMDk0OTknIHRyYW5zZm9ybT0ncm90YXRlKDE4MCA1MCA1MCkgdHJhbnNsYXRlKDAgLTMwKSc+ICA8YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSdvcGFjaXR5JyBmcm9tPScxJyB0bz0nMCcgZHVyPScxcycgYmVnaW49JzAuNXMnIHJlcGVhdENvdW50PSdpbmRlZmluaXRlJy8+PC9yZWN0PjxyZWN0ICB4PSc0Ni41JyB5PSc0MCcgd2lkdGg9JzcnIGhlaWdodD0nMjAnIHJ4PSc1JyByeT0nNScgZmlsbD0nIzAwOTQ5OScgdHJhbnNmb3JtPSdyb3RhdGUoMjEwIDUwIDUwKSB0cmFuc2xhdGUoMCAtMzApJz4gIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9J29wYWNpdHknIGZyb209JzEnIHRvPScwJyBkdXI9JzFzJyBiZWdpbj0nMC41ODMzMzMzMzMzMzMzMzM0cycgcmVwZWF0Q291bnQ9J2luZGVmaW5pdGUnLz48L3JlY3Q+PHJlY3QgIHg9JzQ2LjUnIHk9JzQwJyB3aWR0aD0nNycgaGVpZ2h0PScyMCcgcng9JzUnIHJ5PSc1JyBmaWxsPScjMDA5NDk5JyB0cmFuc2Zvcm09J3JvdGF0ZSgyNDAgNTAgNTApIHRyYW5zbGF0ZSgwIC0zMCknPiAgPGFuaW1hdGUgYXR0cmlidXRlTmFtZT0nb3BhY2l0eScgZnJvbT0nMScgdG89JzAnIGR1cj0nMXMnIGJlZ2luPScwLjY2NjY2NjY2NjY2NjY2NjZzJyByZXBlYXRDb3VudD0naW5kZWZpbml0ZScvPjwvcmVjdD48cmVjdCAgeD0nNDYuNScgeT0nNDAnIHdpZHRoPSc3JyBoZWlnaHQ9JzIwJyByeD0nNScgcnk9JzUnIGZpbGw9JyMwMDk0OTknIHRyYW5zZm9ybT0ncm90YXRlKDI3MCA1MCA1MCkgdHJhbnNsYXRlKDAgLTMwKSc+ICA8YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSdvcGFjaXR5JyBmcm9tPScxJyB0bz0nMCcgZHVyPScxcycgYmVnaW49JzAuNzVzJyByZXBlYXRDb3VudD0naW5kZWZpbml0ZScvPjwvcmVjdD48cmVjdCAgeD0nNDYuNScgeT0nNDAnIHdpZHRoPSc3JyBoZWlnaHQ9JzIwJyByeD0nNScgcnk9JzUnIGZpbGw9JyMwMDk0OTknIHRyYW5zZm9ybT0ncm90YXRlKDMwMCA1MCA1MCkgdHJhbnNsYXRlKDAgLTMwKSc+ICA8YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSdvcGFjaXR5JyBmcm9tPScxJyB0bz0nMCcgZHVyPScxcycgYmVnaW49JzAuODMzMzMzMzMzMzMzMzMzNHMnIHJlcGVhdENvdW50PSdpbmRlZmluaXRlJy8+PC9yZWN0PjxyZWN0ICB4PSc0Ni41JyB5PSc0MCcgd2lkdGg9JzcnIGhlaWdodD0nMjAnIHJ4PSc1JyByeT0nNScgZmlsbD0nIzAwOTQ5OScgdHJhbnNmb3JtPSdyb3RhdGUoMzMwIDUwIDUwKSB0cmFuc2xhdGUoMCAtMzApJz4gIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9J29wYWNpdHknIGZyb209JzEnIHRvPScwJyBkdXI9JzFzJyBiZWdpbj0nMC45MTY2NjY2NjY2NjY2NjY2cycgcmVwZWF0Q291bnQ9J2luZGVmaW5pdGUnLz48L3JlY3Q+PC9zdmc+';
            content = '<div class="dialogify-ajax-content"><img class="dialogify-ajax-loading" src="' + loadingSvg + '"></div>';
            ajax = true;
        } else {
            content = source;
        }

        content  = '<div class="dialogify__body">' + content + '</div>';

        var widthClass = options.size || 'dialogify__fixedwidth';
        var dialogClass = 'dialogify';
        if (options.fixed !== false) {
            dialogClass += ' fixed';
        }

        var dialogHtml = '<div class="dialogify__content ' + widthClass + '"><div></div></div>';

        if (options.useDialogForm !== false) {
            var edgeSubmitIssue = /(?:edge|iPad)/i.test(window.navigator.userAgent) ? ' onsubmit="return false;"' : '';
            dialogHtml = '<form method="dialog"' + edgeSubmitIssue + '>' + dialogHtml + '</form>';
        }

        this.id = 'dialogify_' + (++Dialogify.counter);

        // create dialog element
        $(dialog).attr('id', this.id)
            .addClass(dialogClass)
            .append(dialogHtml)
            .on('close', function(e){
                $(self).triggerHandler('close');
                $(this).remove();
            })
            .on('cancel', function(e){
                $(self).triggerHandler('cancel');
                if (options.closable === false) {
                    e.preventDefault();
                }
            })
            .click(function(e){
                if (options.closable !== false && e.target == dialog) {
                    $(self).triggerHandler('cancel');
                    dialog.close();
                }
            })
            .appendTo('body');

        // close button
        if (options.closable !== false) {
            var closeButtonImage = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMTYgMTYiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDE2IDE2OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PHN0eWxlIHR5cGU9InRleHQvY3NzIj4uc3Qwe2ZpbGw6IzA1NTY2Njt9PC9zdHlsZT48cmVjdCB4PSIzLjEiIHk9IjEiIGNsYXNzPSJzdDAiIHdpZHRoPSIxLjciIGhlaWdodD0iMSIvPjxyZWN0IHg9IjIuMSIgeT0iMi4xIiBjbGFzcz0ic3QwIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIi8+PHJlY3QgeD0iMSIgeT0iMy4xIiBjbGFzcz0ic3QwIiB3aWR0aD0iMSIgaGVpZ2h0PSIxLjciLz48cmVjdCB4PSIxIiB5PSIxMS4xIiBjbGFzcz0ic3QwIiB3aWR0aD0iMSIgaGVpZ2h0PSIxLjciLz48cmVjdCB4PSIyLjEiIHk9IjEyLjkiIGNsYXNzPSJzdDAiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiLz48cmVjdCB4PSIzLjEiIHk9IjEzLjkiIGNsYXNzPSJzdDAiIHdpZHRoPSIxLjciIGhlaWdodD0iMSIvPjxnPjxyZWN0IHg9IjQuOSIgY2xhc3M9InN0MCIgd2lkdGg9IjYuMyIgaGVpZ2h0PSIxIi8+PC9nPjxyZWN0IHg9IjQuOSIgeT0iMTUiIGNsYXNzPSJzdDAiIHdpZHRoPSI2LjMiIGhlaWdodD0iMSIvPjxyZWN0IHk9IjQuOSIgY2xhc3M9InN0MCIgd2lkdGg9IjEiIGhlaWdodD0iNi4zIi8+PHJlY3QgeD0iMTEuMSIgeT0iMSIgY2xhc3M9InN0MCIgd2lkdGg9IjEuNyIgaGVpZ2h0PSIxIi8+PHJlY3QgeD0iMTIuOSIgeT0iMi4xIiBjbGFzcz0ic3QwIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIi8+PHJlY3QgeD0iMTMuOSIgeT0iMy4xIiBjbGFzcz0ic3QwIiB3aWR0aD0iMSIgaGVpZ2h0PSIxLjciLz48cmVjdCB4PSIxMy45IiB5PSIxMS4xIiBjbGFzcz0ic3QwIiB3aWR0aD0iMSIgaGVpZ2h0PSIxLjciLz48cmVjdCB4PSIxMi45IiB5PSIxMi45IiBjbGFzcz0ic3QwIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIi8+PHJlY3QgeD0iMTEuMSIgeT0iMTMuOSIgY2xhc3M9InN0MCIgd2lkdGg9IjEuNyIgaGVpZ2h0PSIxIi8+PHJlY3QgeD0iMTUiIHk9IjQuOSIgY2xhc3M9InN0MCIgd2lkdGg9IjEiIGhlaWdodD0iNi4zIi8+PHBvbHlnb24gY2xhc3M9InN0MCIgcG9pbnRzPSI5LjcsMy44IDkuNyw0LjkgOC43LDQuOSA4LjcsNS45IDcuMyw1LjkgNy4zLDQuOSA2LjMsNC45IDYuMywzLjggMy44LDMuOCAzLjgsNS4yIDQuOSw1LjIgNC45LDYuMyA1LjksNi4zIDUuOSw3LjMgNyw3LjMgNyw4LjMgNS45LDguMyA1LjksOS40IDQuOSw5LjQgNC45LDEwLjQgMy44LDEwLjQgMy44LDEwLjggMy44LDExLjggNi4zLDExLjggNi4zLDEwLjggNy4zLDEwLjggNy4zLDkuNyA4LjcsOS43IDguNywxMC44IDkuNywxMC44IDkuNywxMS44IDEyLjIsMTEuOCAxMi4yLDEwLjQgMTEuMSwxMC40IDExLjEsOS40IDEwLjEsOS40IDEwLjEsOC4zIDksOC4zIDksNy4zIDEwLjEsNy4zIDEwLjEsNi4zIDExLjEsNi4zIDExLjEsNS4yIDEyLjIsNS4yIDEyLjIsNC45IDEyLjIsMy44ICIvPjwvc3ZnPg==';
            var closeButtonClassName = '';
            var closeButtonStyle = {};

            var closeButton = options.closeButton || config.closeButton;
            if (closeButton != null && typeof closeButton == 'object') {
                closeButtonImage = closeButton.image || closeButtonImage;
                closeButtonClassName = closeButton.className || closeButtonClassName;
                closeButtonStyle = closeButton.style || closeButtonStyle;
            }

            var $closeImage = $('<img>').attr('src', closeButtonImage);
            var $closeButton = $('<a>').addClass('dialogify__close')
                .css(closeButtonStyle)
                .append($closeImage)
                .click(function(e){
                    $(dialog).triggerHandler('cancel');
                    dialog.close();
                });

            if (closeButtonClassName) {
                $closeButton.addClass(closeButtonClassName);
            }

            $(dialog).append($closeButton);
        }

        // custom style
        var dialogConfig = options.dialog || config.dialog;
        if (dialogConfig != null && typeof dialogConfig == 'object') {
            $(dialog).css(dialogConfig.style || {});
            if (dialogConfig.className) {
                $(dialog).addClass(dialogConfig.className);
            }

            var $dialogContent = $(dialog).find('.dialogify__content');
            $dialogContent.css(dialogConfig.contentStyle || {});
            if (dialogConfig.contentClassName) {
                $dialogContent.addClass(dialogConfig.contentClassName);
            }
        }

        // append content
        this.$content = $(dialog).find('.dialogify__content > div');
        this.$content.append(content);

        // ajax content
        if (ajax) {
            $.get(source, options.ajaxData || {}, function(resp){
                if (options.ajaxComplete) {
                    options.ajaxComplete.call(self);
                }

                self.$content.find('.dialogify-ajax-content').html(resp);
            }, 'html');
        }

        // public methods
        this.showModal = function(){
            dialog.showModal();
            $(this).triggerHandler('show');
        };

        this.show = function(){
            dialog.show();
            $(this).triggerHandler('show');
        };

        this.close = function(){
            dialog.close();
        };

        this.isOpen = function(){
            return dialog.open;
        };

        this.on = function(event, handler){
            $(this).on(event, handler);
            return this;
        };

        // fix blurry render in some browser
        // see also https://stackoverflow.com/a/42256897/3188956
        new ResizeSensor(dialog, function(){
            roundCssTransformMatrix(dialog);
        });
    };

    // set title
    Dialogify.prototype.title = function(title){
        var $titleBox = $('<h5>').addClass('dialogify_title')
            .append('<img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/PjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iJiN4NTcxNjsmI3g1QzY0O18xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDEyIDEwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxMiAxMDsiIHhtbDpzcGFjZT0icHJlc2VydmUiPjxnPjxyZWN0IHk9IjEiIHN0eWxlPSJmaWxsOiM4RDhEOEQ7IiB3aWR0aD0iMyIgaGVpZ2h0PSIzIi8+PHJlY3QgeT0iNyIgc3R5bGU9ImZpbGw6IzhEOEQ4RDsiIHdpZHRoPSIzIiBoZWlnaHQ9IjMiLz48cmVjdCB4PSIzIiB5PSI0IiBzdHlsZT0iZmlsbDojOEQ4RDhEOyIgd2lkdGg9IjMiIGhlaWdodD0iMyIvPjwvZz48L3N2Zz4=">')
            .append(title);

        if (this.$content.find('.dialogify_title').length) {
            this.$content.find('.dialogify_title').replaceWith($titleBox);
        } else {
            this.$content.prepend($titleBox);
        }

        return this;
    }

    // set buttons
    Dialogify.prototype.buttons = function(buttons, options){
        if (!Array.isArray(buttons)) {
            buttons = [];
        }

        if (options == null || typeof options != 'object') {
            options = {};
        }

        this.$buttonList = {};

        var $buttonBox = $('<div>')
            .addClass('btn-box')
            .addClass(options.position || 'text-right');

        var self = this;
        for (var i = 0;i < buttons.length;i++){
            if (typeof buttons[i] == 'string') {
                var $btn = $(buttons[i]);
                var btnId = $btn.attr('id') || i;
                this.$buttonList[btnId] = $btn;
                $buttonBox.append($btn);
            } else {
                if (buttons[i] == null || typeof buttons[i] != 'object') {
                    buttons[i] = {};
                }

                var $btn = $('<button type="button">')
                    .addClass('btn btn-insert')
                    .addClass(buttons[i].type || '')
                    .data('click', buttons[i].click);

                if (buttons[i].type == Dialogify.BUTTON_PRIMARY && this.options.useDialogForm !== false) {
                    $btn.attr('type', 'submit');
                }

                if (buttons[i].focused) {
                    $btn.prop('autofocus', true);
                }

                if (buttons[i].disabled) {
                    $btn.disable();
                }

                $btn.text(buttons[i].text || Dialogify.LOCALE[config.locale].close);
                $btn.click(function(e){
                    if (typeof $(this).data('click') == 'function') {
                        $(this).data('click').call(self, e);
                    }
                });

                this.$buttonList[buttons[i].id || i] = $btn;
                $buttonBox.append($btn);
            }
        }

        if (this.$content.find('.btn-box').length) {
            this.$content.find('.btn-box').replaceWith($buttonBox);
        } else {
            this.$content.append($buttonBox);
        }

        return this;
    }

    // constants
    Dialogify.counter = 0;

    Dialogify.SIZE_LARGE = 'dialogify__autowidth';

    Dialogify.BUTTON_CENTER = 'text-center';
    Dialogify.BUTTON_LEFT = 'text-left';

    Dialogify.BUTTON_PRIMARY = 'btn-primary';
    Dialogify.BUTTON_DANGER = 'btn-danger';

    Dialogify.LOCALE = {};
    Dialogify.LOCALE['zh_TW'] = {ok: '確定', cancel: '取消', close: '關閉'};
    Dialogify.LOCALE['zh_CN'] = {ok: '确定', cancel: '取消', close: '关闭'};
    Dialogify.LOCALE['en_US'] = {ok: 'Ok', cancel: 'Cancel', close: 'Close'};

    // static methods
    Dialogify.alert = function(message, options){
        if (options == null || typeof options != 'object') {
            options = {};
        }

        new Dialogify('<p>' + message + '</p>')
            .buttons([{
                type: Dialogify.BUTTON_DANGER,
                click: function(e){
                    options.close && options.close.call(this);
                    this.close();
                }
            }], {position: Dialogify.BUTTON_CENTER})
            .on('cancel', function(){
                options.close && options.close.call(this);
            })
            .showModal();
    };

    Dialogify.confirm = function(message, options){
        if (options == null || typeof options != 'object') {
            options = {};
        }

        new Dialogify('<p>' + message + '</p>')
            .buttons([
                {
                    text: Dialogify.LOCALE[config.locale].cancel,
                    click: function(e){
                        options.cancel && options.cancel.call(this);
                        this.close();
                    }
                },
                {
                    text: Dialogify.LOCALE[config.locale].ok,
                    type: Dialogify.BUTTON_PRIMARY,
                    focused: true,
                    click: function(e){
                        options.ok && options.ok.call(this);
                        this.close();
                    }
                }
            ])
            .on('cancel', function(){
                options.cancel && options.cancel.call(this);
            })
            .showModal();
    };

    Dialogify.prompt = function(message, options){
        if (options == null || typeof options != 'object') {
            options = {};
        }

        var placeholder = options.placeholder ? ' placeholder="' + options.placeholder + '"' : '';
        var $html = $('<div>').html('<p>' + message + '</p>');
        $html.append('<input type="text" class="text-field dialogify-prompt-input"' + placeholder + '>');

        new Dialogify($html.html())
            .buttons([
                {
                    text: Dialogify.LOCALE[config.locale].cancel,
                    click: function(e){
                        options.cancel && options.cancel.call(this);
                        this.close();
                    }
                },
                {
                    text: Dialogify.LOCALE[config.locale].ok,
                    type: Dialogify.BUTTON_PRIMARY,
                    click: function(e){
                        var value = this.$content.find('.dialogify-prompt-input').val();
                        options.ok && options.ok.call(this, value);
                        this.close();
                    }
                }
            ])
            .on('cancel', function(){
                options.cancel && options.cancel.call(this);
            })
            .showModal();
    };

    Dialogify.closeAll = function(){
        $('dialog[id^=dialogify_]').each(function(){
            this.close();
        });
    };

    function roundCssTransformMatrix(el){
        el.style.transform = '';

        var mx = window.getComputedStyle(el, null);
        mx = mx.getPropertyValue('transform') ||
             mx.getPropertyValue('-webkit-transform') ||
             mx.getPropertyValue('-moz-transform') ||
             mx.getPropertyValue('-ms-transform') ||
             mx.getPropertyValue('-o-transform') || false;

        if (mx) {
            var values = mx.replace(/[ \(\)]|matrix/g, '').split(',');
            values[4] = Math.ceil(values[4]);
            values[5] = Math.ceil(values[5]);

            $(el).css('transform', 'matrix(' + values.join() + ')');
        }
    }

    // global config
    var config = window.dialogifyConfig;
    if (config == null || typeof config != 'object') {
        config = {};
    }

    // default global config
    config.locale = config.locale || 'zh_TW';

    // inject css
    if (!$('#dialogifyCss').length) {
        $('<style>')
            .attr({type: 'text/css', id: 'dialogifyCss'})
            .html('@@include(addslashes("src/css/dialogify.css"))')
            .appendTo('head')
    }

    $.fn.extend({
        enable: function(){
            if ($(this).hasClass('btn btn-insert')) {
                $(this).prop('disabled', false).removeClass('is-disabled');
            }
        },
        disable: function(){
            if ($(this).hasClass('btn btn-insert')) {
                $(this).prop('disabled', true).addClass('is-disabled');
            }
        }
    });

    window.Dialogify = Dialogify;
})(jQuery, window, dialogPolyfill);
