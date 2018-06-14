/**
 * dialogify
 * https://github.com/porksteak/dialogify
 */
(function($, window, dialogPolyfill){
    'use strict';

    var Dialogify = function(source, options){
        var dialog = window.document.createElement('dialog');
        dialogPolyfill.registerDialog(dialog);

        if (options == null || typeof options != 'object') {
            options = {};
        }

        var content = source.charAt(0) == '#' ? $(source).html() : source;
        content  = '<div class="dialogify__body">' + content + '</div>';

        var widthClass = options.size || 'dialogify__fixedwidth';
        var dialogClass = 'dialogify';
        if (options.fixed !== false) {
            dialogClass += ' fixed';
        }

        var dialogHtml = '<form method="dialog"><div class="dialogify__content ' + widthClass + '"><div></div></div></form>';

        this.id = 'dialogify_' + (++Dialogify.counter);

        $(dialog).attr('id', this.id)
            .addClass(dialogClass)
            .append(dialogHtml).append($closeButton)
            .on('close', function(e){
                $(this).remove();
            })
            .on('cancel', function(e){
                if (options.closable === false) {
                    e.preventDefault();
                }
            })
            .click(function(e){
                if (options.closable !== false && e.target == dialog) {
                    dialog.close();
                }
            })
            .appendTo('body');

        if (options.closable !== false) {
            var $closeButton = $('<a>').addClass('dialogify__close')
                .append('<img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMTYgMTYiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDE2IDE2OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PHN0eWxlIHR5cGU9InRleHQvY3NzIj4uc3Qwe2ZpbGw6IzA1NTY2Njt9PC9zdHlsZT48cmVjdCB4PSIzLjEiIHk9IjEiIGNsYXNzPSJzdDAiIHdpZHRoPSIxLjciIGhlaWdodD0iMSIvPjxyZWN0IHg9IjIuMSIgeT0iMi4xIiBjbGFzcz0ic3QwIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIi8+PHJlY3QgeD0iMSIgeT0iMy4xIiBjbGFzcz0ic3QwIiB3aWR0aD0iMSIgaGVpZ2h0PSIxLjciLz48cmVjdCB4PSIxIiB5PSIxMS4xIiBjbGFzcz0ic3QwIiB3aWR0aD0iMSIgaGVpZ2h0PSIxLjciLz48cmVjdCB4PSIyLjEiIHk9IjEyLjkiIGNsYXNzPSJzdDAiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiLz48cmVjdCB4PSIzLjEiIHk9IjEzLjkiIGNsYXNzPSJzdDAiIHdpZHRoPSIxLjciIGhlaWdodD0iMSIvPjxnPjxyZWN0IHg9IjQuOSIgY2xhc3M9InN0MCIgd2lkdGg9IjYuMyIgaGVpZ2h0PSIxIi8+PC9nPjxyZWN0IHg9IjQuOSIgeT0iMTUiIGNsYXNzPSJzdDAiIHdpZHRoPSI2LjMiIGhlaWdodD0iMSIvPjxyZWN0IHk9IjQuOSIgY2xhc3M9InN0MCIgd2lkdGg9IjEiIGhlaWdodD0iNi4zIi8+PHJlY3QgeD0iMTEuMSIgeT0iMSIgY2xhc3M9InN0MCIgd2lkdGg9IjEuNyIgaGVpZ2h0PSIxIi8+PHJlY3QgeD0iMTIuOSIgeT0iMi4xIiBjbGFzcz0ic3QwIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIi8+PHJlY3QgeD0iMTMuOSIgeT0iMy4xIiBjbGFzcz0ic3QwIiB3aWR0aD0iMSIgaGVpZ2h0PSIxLjciLz48cmVjdCB4PSIxMy45IiB5PSIxMS4xIiBjbGFzcz0ic3QwIiB3aWR0aD0iMSIgaGVpZ2h0PSIxLjciLz48cmVjdCB4PSIxMi45IiB5PSIxMi45IiBjbGFzcz0ic3QwIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIi8+PHJlY3QgeD0iMTEuMSIgeT0iMTMuOSIgY2xhc3M9InN0MCIgd2lkdGg9IjEuNyIgaGVpZ2h0PSIxIi8+PHJlY3QgeD0iMTUiIHk9IjQuOSIgY2xhc3M9InN0MCIgd2lkdGg9IjEiIGhlaWdodD0iNi4zIi8+PHBvbHlnb24gY2xhc3M9InN0MCIgcG9pbnRzPSI5LjcsMy44IDkuNyw0LjkgOC43LDQuOSA4LjcsNS45IDcuMyw1LjkgNy4zLDQuOSA2LjMsNC45IDYuMywzLjggMy44LDMuOCAzLjgsNS4yIDQuOSw1LjIgNC45LDYuMyA1LjksNi4zIDUuOSw3LjMgNyw3LjMgNyw4LjMgNS45LDguMyA1LjksOS40IDQuOSw5LjQgNC45LDEwLjQgMy44LDEwLjQgMy44LDEwLjggMy44LDExLjggNi4zLDExLjggNi4zLDEwLjggNy4zLDEwLjggNy4zLDkuNyA4LjcsOS43IDguNywxMC44IDkuNywxMC44IDkuNywxMS44IDEyLjIsMTEuOCAxMi4yLDEwLjQgMTEuMSwxMC40IDExLjEsOS40IDEwLjEsOS40IDEwLjEsOC4zIDksOC4zIDksNy4zIDEwLjEsNy4zIDEwLjEsNi4zIDExLjEsNi4zIDExLjEsNS4yIDEyLjIsNS4yIDEyLjIsNC45IDEyLjIsMy44ICIvPjwvc3ZnPg==">')
                .click(function(e){
                    dialog.close();
                });

            $(dialog).append($closeButton);
        }

        this.$container = $(dialog).find('.dialogify__content > div');
        this.$container.append(content);

        this.showModal = function(){
            dialog.showModal();
        };

        this.show = function(){
            dialog.show();
        };

        this.close = function(){
            dialog.close();
        };
    };

    Dialogify.prototype.title = function(title){
        var $titleBox = $('<h5>').addClass('dialogify_title')
            .append('<img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/PjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iJiN4NTcxNjsmI3g1QzY0O18xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDEyIDEwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxMiAxMDsiIHhtbDpzcGFjZT0icHJlc2VydmUiPjxnPjxyZWN0IHk9IjEiIHN0eWxlPSJmaWxsOiM4RDhEOEQ7IiB3aWR0aD0iMyIgaGVpZ2h0PSIzIi8+PHJlY3QgeT0iNyIgc3R5bGU9ImZpbGw6IzhEOEQ4RDsiIHdpZHRoPSIzIiBoZWlnaHQ9IjMiLz48cmVjdCB4PSIzIiB5PSI0IiBzdHlsZT0iZmlsbDojOEQ4RDhEOyIgd2lkdGg9IjMiIGhlaWdodD0iMyIvPjwvZz48L3N2Zz4=">')
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

        var $buttonBox = $('<div>')
            .addClass('btn-box')
            .addClass(options.position || 'text-right');

        var self = this;
        for (var i = 0;i < buttons.length;i++){
            if (typeof buttons[i] == 'string') {
                $buttonBox.append(buttons[i]);
            } else {
                if (buttons[i] == null || typeof buttons[i] != 'object') {
                    buttons[i] = {};
                }

                var $btn = $('<button type="button">')
                    .addClass('btn btn-insert')
                    .addClass(buttons[i].type || '')
                    .data('click', buttons[i].click);

                if (buttons[i].type == Dialogify.BUTTON_PRIMARY) {
                    $btn.attr('type', 'submit');
                }

                if (buttons[i].disabled) {
                    $btn.prop('disabled', true).addClass('is-disabled');
                }

                $btn.text(buttons[i].text || '關閉');
                $btn.click(function(e){
                    if (typeof $(this).data('click') == 'function') {
                        $(this).data('click').call(self, e);
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
        new Dialogify(message, {closable: false})
            .buttons([{type: Dialogify.BUTTON_PRIMARY}], {position: Dialogify.BUTTON_CENTER})
            .showModal();
    };

    Dialogify.confirm = function(message, ok, cancel){
        new Dialogify(message)
            .buttons([
                {
                    text: '取消',
                    click: function(e){
                        this.close(false);
                        cancel && cancel();
                    }
                },
                {
                    text: '確定',
                    type: Dialogify.BUTTON_PRIMARY,
                    click: function(e){
                        this.close(true);
                        ok && ok();
                    }
                }
            ])
            .showModal();
    };

    // inject css
    if (!$('#dialogifyCss').length) {
        $('<style>')
            .attr({type: 'text/css', id: 'dialogifyCss'})
            .html('@@include(addslashes("src/css/dialogify.css"))')
            .appendTo('head')
    }

    window.Dialogify = Dialogify;
})(jQuery, window, dialogPolyfill);
