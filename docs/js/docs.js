/* Dialogify documentation site behaviour: theme, language, navigation and the
   live demos. Written as a plain script so the page needs no build step. */
(function () {
    'use strict';

    const THEME_KEY = 'dialogify-docs-theme';
    const LANG_KEY = 'dialogify-docs-lang';
    const THEMES = ['auto', 'light', 'dark'];

    /* --- theme --------------------------------------------------------- */

    const root = document.documentElement;

    function currentTheme() {
        const value = root.dataset.theme;
        return THEMES.indexOf(value) >= 0 ? value : 'auto';
    }

    function applyTheme(theme) {
        root.dataset.theme = theme;
        try {
            if (theme === 'auto') {
                localStorage.removeItem(THEME_KEY);
            } else {
                localStorage.setItem(THEME_KEY, theme);
            }
        } catch {
            /* storage can be blocked */
        }

        document.querySelectorAll('[data-theme-icon]').forEach(function (icon) {
            icon.hidden = icon.dataset.themeIcon !== theme;
        });

        const dark = theme === 'dark' || (theme === 'auto' && prefersDark.matches);

        // highlight.js ships one stylesheet per theme, so they are swapped
        // rather than re-declared.
        document.querySelectorAll('[data-hljs]').forEach(function (sheet) {
            sheet.disabled = (sheet.dataset.hljs === 'dark') !== dark;
        });

        // The star button is an iframe: its colour scheme is baked in when it
        // renders, so it has to be rebuilt on every change.
        renderGitHubButtons(dark ? 'dark' : 'light');
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    prefersDark.addEventListener('change', function () {
        if (currentTheme() === 'auto') {
            applyTheme('auto');
        }
    });

    document.querySelector('[data-theme-toggle]').addEventListener('click', function () {
        applyTheme(THEMES[(THEMES.indexOf(currentTheme()) + 1) % THEMES.length]);
    });

    function renderGitHubButtons(scheme) {
        const host = document.querySelector('[data-gh-buttons]');
        if (!host) {
            return;
        }

        if (!host.dataset.template) {
            host.dataset.template = host.innerHTML;
        }

        if (!window.GitHubButton || !window.GitHubButton.render) {
            // buttons.js is async: try again once it has landed.
            clearTimeout(renderGitHubButtons.retry);
            renderGitHubButtons.retry = setTimeout(function () {
                renderGitHubButtons(scheme);
            }, 100);
            return;
        }

        host.innerHTML = host.dataset.template;
        host.querySelectorAll('.github-button').forEach(function (anchor) {
            // buttons.js expects a full scheme map, not a bare keyword.
            anchor.setAttribute(
                'data-color-scheme',
                'no-preference: ' + scheme + '; light: ' + scheme + '; dark: ' + scheme + ';'
            );
            window.GitHubButton.render(anchor);
        });
    }

    // buttons.js renders on load; re-render once it is available so the very
    // first paint also matches the current theme.
    window.addEventListener('load', function () {
        applyTheme(currentTheme());
    });

    /* --- language ------------------------------------------------------ */

    const dictionary = window.DIALOGIFY_DOCS_EN || {};
    const originals = new Map();
    let lang = 'zh-TW';

    function captureOriginals() {
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            originals.set(el, el.innerHTML);
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
            originals.set(el.dataset.i18nPlaceholder, el.placeholder);
        });
    }

    function applyLang(next) {
        lang = next === 'en' ? 'en' : 'zh-TW';
        const english = lang === 'en';

        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            const key = el.dataset.i18n;
            if (!english) {
                el.innerHTML = originals.get(el);
                return;
            }

            if (Object.prototype.hasOwnProperty.call(dictionary, key)) {
                el.innerHTML = dictionary[key];
            } else {
                // Leaving the Chinese in place is better than blanking the page.
                console.warn('[docs] missing English string:', key);
            }
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
            const key = el.dataset.i18nPlaceholder;
            el.placeholder = english && dictionary[key] ? dictionary[key] : originals.get(key);
        });

        document.documentElement.lang = english ? 'en' : 'zh-Hant-TW';
        document.title = english ? dictionary['page.title'] : originals.get('page.title');

        // Replacing innerHTML wipes the highlighting, so code blocks are redone.
        document.querySelectorAll('code[data-i18n]').forEach(function (code) {
            if (window.hljs) {
                delete code.dataset.highlighted;
                code.classList.remove('hljs');
                window.hljs.highlightElement(code);
            }
        });

        document.querySelectorAll('[data-lang]').forEach(function (button) {
            button.setAttribute('aria-pressed', String(button.dataset.lang === lang));
        });

        try {
            localStorage.setItem(LANG_KEY, lang);
        } catch {
            /* storage can be blocked */
        }

        buildNav();
    }

    document.querySelectorAll('[data-lang]').forEach(function (button) {
        button.addEventListener('click', function () {
            applyLang(button.dataset.lang);
        });
    });

    function initialLang() {
        const fromQuery = new URLSearchParams(location.search).get('lang');
        if (fromQuery === 'en' || fromQuery === 'zh-TW') {
            return fromQuery;
        }
        try {
            return localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'zh-TW';
        } catch {
            return 'zh-TW';
        }
    }

    /* --- navigation ---------------------------------------------------- */

    const navList = document.querySelector('[data-nav]');
    const tocList = document.querySelector('[data-toc]');

    function buildNav() {
        navList.innerHTML = '';
        document.querySelectorAll('.content section[id]').forEach(function (section) {
            const heading = section.querySelector('h2');
            if (!heading) {
                return;
            }

            const item = document.createElement('li');
            item.appendChild(link('#' + section.id, heading.textContent.trim()));

            const subs = section.querySelectorAll('h3[id]');
            if (subs.length) {
                const sublist = document.createElement('ul');
                sublist.className = 'sidebar__sub';
                subs.forEach(function (sub) {
                    const subItem = document.createElement('li');
                    subItem.appendChild(link('#' + sub.id, sub.textContent.trim()));
                    sublist.appendChild(subItem);
                });
                item.appendChild(sublist);
            }

            navList.appendChild(item);
        });

        buildToc();
    }

    function link(href, text) {
        const anchor = document.createElement('a');
        anchor.href = href;
        anchor.textContent = text;
        return anchor;
    }

    function buildToc() {
        if (!tocList) {
            return;
        }

        tocList.innerHTML = '';
        const active = document.querySelector('.sidebar a[aria-current]');
        const sectionId = active
            ? active.getAttribute('href').slice(1)
            : (document.querySelector('.content section[id]') || {}).id;
        const section = sectionId && document.getElementById(sectionId);
        const target = section && section.closest ? section.closest('section[id]') : null;
        if (!target) {
            return;
        }

        target.querySelectorAll('h3[id]').forEach(function (heading) {
            const item = document.createElement('li');
            item.appendChild(link('#' + heading.id, heading.textContent.trim()));
            tocList.appendChild(item);
        });
    }

    // Highlight whichever heading is closest to the top of the viewport.
    const headings = function () {
        return Array.prototype.slice.call(
            document.querySelectorAll('.content section[id], .content h3[id]')
        );
    };

    let ticking = false;
    function updateCurrent() {
        ticking = false;
        const offset = 120;
        let current = null;

        headings().forEach(function (element) {
            if (element.getBoundingClientRect().top <= offset) {
                current = element;
            }
        });

        const id = current ? current.id : null;
        let changed = false;

        document.querySelectorAll('.sidebar a, .toc a').forEach(function (anchor) {
            const match = anchor.getAttribute('href') === '#' + id;
            if (match !== anchor.hasAttribute('aria-current')) {
                changed = true;
            }
            if (match) {
                anchor.setAttribute('aria-current', 'true');
            } else {
                anchor.removeAttribute('aria-current');
            }
        });

        if (changed) {
            buildToc();
            updateTocCurrent();
        }
    }

    function updateTocCurrent() {
        const offset = 120;
        let current = null;
        document.querySelectorAll('.content h3[id]').forEach(function (heading) {
            if (heading.getBoundingClientRect().top <= offset) {
                current = heading;
            }
        });

        document.querySelectorAll('.toc a').forEach(function (anchor) {
            if (current && anchor.getAttribute('href') === '#' + current.id) {
                anchor.setAttribute('aria-current', 'true');
            } else {
                anchor.removeAttribute('aria-current');
            }
        });
    }

    window.addEventListener(
        'scroll',
        function () {
            if (!ticking) {
                ticking = true;
                window.requestAnimationFrame(function () {
                    updateCurrent();
                    updateTocCurrent();
                });
            }
        },
        { passive: true }
    );

    /* --- sidebar filter and mobile drawer ------------------------------ */

    const filter = document.querySelector('[data-filter]');
    const filterEmpty = document.querySelector('[data-filter-empty]');

    filter.addEventListener('input', function () {
        const term = filter.value.trim().toLowerCase();
        let visible = 0;

        navList.querySelectorAll(':scope > li').forEach(function (item) {
            const own = item.querySelector('a').textContent.toLowerCase();
            let show = !term || own.indexOf(term) >= 0;

            item.querySelectorAll('.sidebar__sub li').forEach(function (sub) {
                const match = !term || sub.textContent.toLowerCase().indexOf(term) >= 0 || show;
                sub.hidden = !match;
                if (match && term) {
                    show = true;
                }
            });

            item.hidden = !show;
            if (show) {
                visible++;
            }
        });

        filterEmpty.hidden = visible > 0;
    });

    const sidebar = document.getElementById('sidebar');
    const menuButton = document.querySelector('[data-toggle-sidebar]');

    menuButton.addEventListener('click', function () {
        const open = sidebar.toggleAttribute('data-open');
        menuButton.setAttribute('aria-expanded', String(open));
    });

    sidebar.addEventListener('click', function (event) {
        if (event.target.tagName === 'A') {
            sidebar.removeAttribute('data-open');
            menuButton.setAttribute('aria-expanded', 'false');
        }
    });

    /* --- code blocks --------------------------------------------------- */

    function decorateCode() {
        document.querySelectorAll('pre > code').forEach(function (code) {
            if (window.hljs) {
                window.hljs.highlightElement(code);
            }

            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'copy-button';
            button.textContent = 'Copy';
            button.addEventListener('click', function () {
                navigator.clipboard.writeText(code.textContent).then(function () {
                    button.textContent = 'Copied';
                    button.dataset.copied = '';
                    setTimeout(function () {
                        button.textContent = 'Copy';
                        delete button.dataset.copied;
                    }, 1400);
                });
            });
            code.parentNode.appendChild(button);
        });
    }

    /* --- theme token table --------------------------------------------- */

    const TOKENS = [
        ['--dialogify-surface', '#fff', 'token.surface'],
        ['--dialogify-text', '#464646', 'token.text'],
        ['--dialogify-heading', '#00555f', 'token.heading'],
        ['--dialogify-muted', '#a6a6a6', 'token.muted'],
        ['--dialogify-divider', '#e0e6e8', 'token.divider'],
        ['--dialogify-link', '#117e96', 'token.link'],
        ['--dialogify-link-hover', '#126e7d', 'token.linkHover'],
        ['--dialogify-focus-ring', '#117e96', 'token.focus'],
        ['--dialogify-icon-filter', 'none', 'token.iconFilter'],
        ['--dialogify-shadow', '—', 'token.shadow'],
        ['--dialogify-loading-overlay', 'rgba(255,255,255,.75)', 'token.loading'],
        ['--dialogify-button-bg', '#e5e5e5', 'token.buttonBg'],
        ['--dialogify-button-hover-bg', '#dcdcdc', 'token.buttonHover'],
        ['--dialogify-button-text', '#a6a6a6', 'token.buttonText'],
        ['--dialogify-primary', '#117e96', 'token.primary'],
        ['--dialogify-primary-hover', '#126e7d', 'token.primaryHover'],
        ['--dialogify-on-primary', '#fff', 'token.onPrimary'],
        ['--dialogify-danger', '#f44336', 'token.danger'],
        ['--dialogify-danger-hover', '#de2427', 'token.dangerHover'],
        ['--dialogify-on-danger', '#fff', 'token.onDanger'],
        ['--dialogify-danger-shadow', '—', 'token.dangerShadow'],
        ['--dialogify-field-bg', '#fff', 'token.fieldBg'],
        ['--dialogify-field-border', '#d9d9d9', 'token.fieldBorder'],
        ['--dialogify-field-text', '#00555f', 'token.fieldText'],
        ['--dialogify-field-focus-border', '#117e96', 'token.fieldFocus'],
        ['--dialogify-field-placeholder', '#b3b3b3', 'token.placeholder'],
        ['--dialogify-error', '#de2427', 'token.error'],
        ['--dialogify-toast-info', '#117e96', 'token.toastInfo'],
        ['--dialogify-toast-success', '#2f9e44', 'token.toastSuccess'],
        ['--dialogify-toast-warning', '#e8a33d', 'token.toastWarning'],
        ['--dialogify-toast-error', '#de2427', 'token.toastError'],
        ['--dialogify-toast-close', '#8d8d8d', 'token.toastClose'],
        ['--dialogify-toast-close-hover', '#464646', 'token.toastCloseHover'],
        ['--dialogify-backdrop', '#000', 'token.backdrop'],
        ['--dialogify-backdrop-opacity', '0.7', 'token.backdropOpacity'],
        ['--dialogify-z-index', '1000', 'token.z'],
        ['--dialogify-toast-z-index', '1010', 'token.toastZ']
    ];

    const TOKEN_LABELS_ZH = {
        'token.surface': '燈箱背景',
        'token.text': '內文文字',
        'token.heading': '標題與關閉鈕',
        'token.muted': '次要文字',
        'token.divider': '分隔線 <code>&lt;hr&gt;</code>',
        'token.link': '內容中的連結',
        'token.linkHover': '連結 hover',
        'token.focus': '<code>:focus-visible</code> 外框',
        'token.iconFilter': '內建圖示的濾鏡',
        'token.shadow': '燈箱陰影',
        'token.loading': '<code>setLoading()</code> 遮罩',
        'token.buttonBg': '一般按鈕',
        'token.buttonHover': '一般按鈕 hover',
        'token.buttonText': '一般按鈕文字',
        'token.primary': '<code>BUTTON_PRIMARY</code>',
        'token.primaryHover': '<code>BUTTON_PRIMARY</code> hover',
        'token.onPrimary': '<code>BUTTON_PRIMARY</code> 文字',
        'token.danger': '<code>BUTTON_DANGER</code>',
        'token.dangerHover': '<code>BUTTON_DANGER</code> hover',
        'token.onDanger': '<code>BUTTON_DANGER</code> 文字',
        'token.dangerShadow': '<code>.btn-danger-shadow</code>',
        'token.fieldBg': '<code>.text-field</code> 背景',
        'token.fieldBorder': '<code>.text-field</code> 邊框',
        'token.fieldText': '<code>.text-field</code> 文字',
        'token.fieldFocus': '<code>.text-field</code> 聚焦邊框',
        'token.placeholder': '<code>.text-field</code> 提示文字',
        'token.error': '<code>.is-error</code> 欄位',
        'token.toastInfo': '吐司狀態條 info',
        'token.toastSuccess': '吐司狀態條 success',
        'token.toastWarning': '吐司狀態條 warning',
        'token.toastError': '吐司狀態條 error',
        'token.toastClose': '吐司關閉鈕',
        'token.toastCloseHover': '吐司關閉鈕 hover',
        'token.backdrop': 'modal 背景遮罩',
        'token.backdropOpacity': 'modal 背景遮罩透明度',
        'token.z': '非 modal 燈箱與浮層',
        'token.toastZ': '吐司容器'
    };

    function buildTokenTable() {
        const body = document.querySelector('[data-tokens]');
        if (!body) {
            return;
        }

        TOKENS.forEach(function (entry) {
            const row = document.createElement('tr');

            const name = document.createElement('td');
            name.innerHTML = '<code>' + entry[0] + '</code>';

            const value = document.createElement('td');
            const isColour = /^#|^rgba?\(/.test(entry[1]);
            value.innerHTML =
                (isColour
                    ? '<span class="swatch" style="background:' + entry[1] + '"></span>'
                    : '') +
                '<code>' +
                entry[1] +
                '</code>';

            const description = document.createElement('td');
            description.dataset.i18n = entry[2];
            description.innerHTML = TOKEN_LABELS_ZH[entry[2]] || entry[2];

            row.append(name, value, description);
            body.appendChild(row);
        });
    }

    /* --- demos --------------------------------------------------------- */

    const t = function (zh, en) {
        return lang === 'en' ? en : zh;
    };

    let toastCorner = 0;

    const demos = {
        hero: function () {
            new Dialogify(
                t(
                    '<p>這就是 Dialogify。內容可以是任意 HTML，' +
                        '底下的按鈕、標題與表單都由 API 控制。</p>',
                    '<p>This is Dialogify. The content is arbitrary HTML, and the ' +
                        'buttons, title and form below are all driven by the API.</p>'
                )
            )
                .title(t('哈囉！', 'Hello!'))
                .buttons([{ type: Dialogify.BUTTON_PRIMARY }])
                .showModal();
        },

        hello: function () {
            new Dialogify('dialog content')
                .title('dialog title')
                .buttons([{ type: Dialogify.BUTTON_PRIMARY }])
                .showModal();
        },

        modal: function () {
            new Dialogify(t('我是 modal，會鎖住頁面。', 'I am modal and block the page.'))
                .title('showModal()')
                .showModal();
        },

        modeless: function () {
            new Dialogify(
                t(
                    '我是 non-modal，頁面照常可以捲動與操作。',
                    'I am non-modal — the page still scrolls and responds.'
                )
            )
                .title('show()')
                .show();
        },

        await: async function () {
            const dialog = new Dialogify(t('確定要送出嗎？', 'Ready to submit?')).buttons([
                {
                    text: 'Yes',
                    type: Dialogify.BUTTON_PRIMARY,
                    click: function () {
                        dialog.close('yes');
                    }
                },
                {
                    text: 'No',
                    click: function () {
                        dialog.close('no');
                    }
                }
            ]);

            const answer = await dialog.showModal();
            Dialogify.toast(
                t('您選了：', 'You picked: ') + (answer || t('（直接關閉）', '(dismissed)')),
                { type: Dialogify.TOAST_INFO }
            );
        },

        setContent: function () {
            const dialog = new Dialogify(t('第一步', 'Step 1'))
                .title(t('設定精靈', 'Setup wizard'))
                .buttons([
                    {
                        text: t('下一步', 'Next'),
                        type: Dialogify.BUTTON_PRIMARY,
                        click: function () {
                            dialog.setContent(
                                '<p>' +
                                    t(
                                        '第二步：內容換掉了，標題與按鈕都還在。',
                                        'Step 2: the body was replaced, the title and buttons stayed.'
                                    ) +
                                    '</p>'
                            );
                        }
                    }
                ]);
            dialog.showModal();
        },

        load: function () {
            const dialog = new Dialogify(t('準備載入…', 'About to load…')).title('load()').show();

            // The docs site is static, so the request is simulated rather than real.
            dialog.setLoading(true);
            setTimeout(function () {
                dialog.setLoading(false);
                dialog.setContent(
                    '<p>' +
                        t(
                            '這裡會是 <code>/ajax/…</code> 回傳的內容。',
                            'This would be the response from <code>/ajax/…</code>.'
                        ) +
                        '</p>'
                );
            }, 1200);
        },

        loading: function () {
            const dialog = new Dialogify(
                t('按下確定後會顯示載入狀態。', 'Press OK to show the loading state.')
            )
                .title('setLoading()')
                .buttons([
                    {
                        text: 'OK',
                        type: Dialogify.BUTTON_PRIMARY,
                        click: function () {
                            dialog.setLoading(true);
                            setTimeout(function () {
                                dialog.setLoading(false);
                            }, 1500);
                        }
                    }
                ]);
            dialog.showModal();
        },

        form: function () {
            const dialog = new Dialogify(
                '<input class="text-field" name="title" required placeholder="' +
                    t('必填欄位', 'Required field') +
                    '">'
            )
                .title(t('新增項目', 'New item'))
                .buttons([
                    {
                        id: 'save',
                        text: t('儲存', 'Save'),
                        type: Dialogify.BUTTON_PRIMARY,
                        loadingText: t('儲存中…', 'Saving…'),
                        click: function () {
                            if (!dialog.validate()) {
                                return;
                            }

                            dialog.updateButton('save', { loading: true });
                            setTimeout(function () {
                                const values = dialog.formValues();
                                dialog.close('saved');
                                Dialogify.toast(t('已儲存：', 'Saved: ') + values.title, {
                                    type: Dialogify.TOAST_SUCCESS
                                });
                            }, 900);
                        }
                    }
                ]);
            dialog.showModal();
        },

        buttons: function () {
            const dialog = new Dialogify(t('要刪除這筆資料嗎？', 'Delete this record?')).buttons(
                [
                    {
                        text: t('取消', 'Cancel'),
                        click: function () {
                            dialog.close();
                        }
                    },
                    {
                        id: 'del',
                        text: t('刪除', 'Delete'),
                        type: Dialogify.BUTTON_DANGER,
                        loadingText: t('刪除中…', 'Deleting…'),
                        click: function () {
                            dialog.updateButton('del', { loading: true });
                            setTimeout(function () {
                                dialog.close();
                                Dialogify.toast(t('已刪除', 'Deleted'), {
                                    type: Dialogify.TOAST_SUCCESS
                                });
                            }, 900);
                        }
                    }
                ],
                { position: Dialogify.BUTTON_CENTER }
            );
            dialog.showModal();
        },

        buttonState: function () {
            const dialog = new Dialogify(
                t('用底下的按鈕操作按鈕列。', 'Use the buttons below to drive the button row.')
            ).buttons([
                {
                    id: 'target',
                    text: t('目標按鈕', 'Target'),
                    type: Dialogify.BUTTON_PRIMARY,
                    click: function () {}
                },
                {
                    text: t('停用它', 'Disable it'),
                    click: function () {
                        dialog.updateButton('target', { disabled: true });
                    }
                },
                {
                    text: t('忙碌中', 'Busy'),
                    click: function () {
                        dialog.updateButton('target', { loading: true });
                        setTimeout(function () {
                            dialog.updateButton('target', { loading: false });
                        }, 1200);
                    }
                }
            ]);
            dialog.showModal();
        },

        beforeclose: function () {
            let dirty = true;
            const dialog = new Dialogify(
                t(
                    '假設這裡有尚未儲存的變更，試著用 ESC 或關閉鈕關掉它。',
                    'Pretend there are unsaved changes here, then try ESC or the close button.'
                )
            ).title('beforeclose');

            dialog.on('beforeclose', async function (event) {
                if (!dirty) {
                    return;
                }

                event.preventDefault();
                if (
                    await Dialogify.confirm(
                        t('要放棄尚未儲存的變更嗎？', 'Discard your unsaved changes?')
                    )
                ) {
                    dirty = false;
                    dialog.close();
                }
            });

            dialog.showModal();
        },

        drawer: function (button) {
            new Dialogify(
                '<h4>' +
                    t('篩選條件', 'Filters') +
                    '</h4><p>' +
                    t('抽屜會從指定的邊緣滑入。', 'A drawer slides in from the edge you pick.') +
                    '</p>',
                { position: button.dataset.position }
            ).showModal();
        },

        toast: function (button) {
            const type = button.dataset.type;
            Dialogify.toast(
                t('這是一則 ' + type + ' 通知', 'This is a ' + type + ' notification'),
                { type: type, closable: true }
            );
        },

        toastPosition: function () {
            const corners = [
                Dialogify.TOAST_TOP_LEFT,
                Dialogify.TOAST_TOP_CENTER,
                Dialogify.TOAST_BOTTOM_LEFT,
                Dialogify.TOAST_BOTTOM_CENTER,
                Dialogify.TOAST_BOTTOM_RIGHT,
                Dialogify.TOAST_TOP_RIGHT
            ];
            const position = corners[toastCorner++ % corners.length];
            Dialogify.toast(position, { position: position });
        },

        popover: function (button) {
            // The library swallows a click on the anchor of an open popover, so
            // reaching this handler always means "open". Clicking a different
            // trigger closes the previous one through the same outside-click
            // path before this runs.
            new Dialogify(
                '<strong>' +
                    t('錨定浮層', 'Anchored popover') +
                    '</strong><p>' +
                    t(
                        '它會跟著錨點捲動，空間不足時自動翻面。',
                        'It follows the anchor on scroll and flips when space runs out.'
                    ) +
                    '</p>',
                { useDialogForm: false }
            ).showAt(button, { placement: 'bottom', align: 'start', offset: 8 });
        },

        alert: function () {
            Dialogify.alert(t('這是 alert。', 'This is an alert.'));
        },

        confirm: async function () {
            const ok = await Dialogify.confirm(t('要繼續嗎？', 'Shall we continue?'));
            Dialogify.toast(String(ok), {
                type: ok ? Dialogify.TOAST_SUCCESS : Dialogify.TOAST_WARNING
            });
        },

        prompt: async function () {
            const answer = await Dialogify.prompt(t('您的暱稱？', 'What is your name?'), {
                placeholder: t('請輸入', 'Type here')
            });
            Dialogify.toast(answer === null ? 'null' : answer);
        },

        closeAll: function () {
            new Dialogify(t('一號燈箱', 'Dialog one')).show();
            new Dialogify(t('二號燈箱', 'Dialog two')).show();
            setTimeout(function () {
                Dialogify.closeAll();
                Dialogify.toast(t('全部關閉了', 'All closed'));
            }, 1200);
        },

        declarative: function () {
            let dialog = document.getElementById('demo-declarative');
            if (!dialog) {
                const host = document.createElement('div');
                host.innerHTML =
                    '<dialog is="bahamut-dialogify" id="demo-declarative" dialog-title="Hello">' +
                    t('這個燈箱寫在 HTML 裡 ', 'This dialog is written in HTML ') +
                    '<b>bold text</b><button ok></button><button cancel></button></dialog>';
                dialog = host.firstElementChild;
                document.body.appendChild(dialog);
            }

            if (typeof dialog.showModal !== 'function' || !dialog.dialogify) {
                Dialogify.alert(
                    t(
                        '這個瀏覽器不支援客製化內建元素，請載入選用的 custom-elements 套件。',
                        'This browser has no customized built-in elements; load the optional custom-elements bundle.'
                    )
                );
                return;
            }

            dialog.showModal();
        },

        darkDialog: function () {
            const previous = root.dataset.theme;
            root.dataset.theme = 'dark';
            applyTheme('dark');

            new Dialogify(
                t(
                    '<p>這是 <code>data-theme="dark"</code> 下的燈箱。關閉後會還原原本的設定。</p>',
                    '<p>This is the dialog under <code>data-theme="dark"</code>. Closing it restores your setting.</p>'
                )
            )
                .title(t('暗色主題', 'Dark theme'))
                .buttons([{ type: Dialogify.BUTTON_PRIMARY }])
                .showModal()
                .then(function () {
                    applyTheme(THEMES.indexOf(previous) >= 0 ? previous : 'auto');
                });
        }
    };

    document.addEventListener('click', function (event) {
        const button = event.target.closest('[data-demo]');
        if (!button) {
            return;
        }

        event.preventDefault();
        const demo = demos[button.dataset.demo];
        if (demo) {
            demo(button);
        }
    });

    /* --- boot ---------------------------------------------------------- */

    originals.set('page.title', document.title);
    buildTokenTable();
    captureOriginals();
    applyTheme(currentTheme());
    applyLang(initialLang());
    decorateCode();
    updateCurrent();
    updateTocCurrent();
})();
