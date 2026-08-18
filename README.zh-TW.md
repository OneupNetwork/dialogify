# Dialogify

[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/OneupNetwork/dialogify/ci.yml?branch=master)](https://github.com/OneupNetwork/dialogify/actions/workflows/ci.yml)
[![NPM Version](https://img.shields.io/npm/v/%40oneup_network%2Fdialogify)](https://www.npmjs.com/package/@oneup_network/dialogify)
[![GitHub License](https://img.shields.io/github/license/OneupNetwork/dialogify)](LICENSE)

以原生 `<dialog>` 元素打造的燈箱套件。

[English](README.md)

繁重的工作交給瀏覽器 — top layer、backdrop、焦點鎖定與 <kbd>Esc</kbd>
關閉全都由 `<dialog>` 原生提供。Dialogify 補上外圍的部分：標題列、按鈕列、ajax
內容、表單，以及 drawer、toast 與 anchored popover。

**[說明文件與線上範例 →](https://oneupnetwork.github.io/dialogify/)**

![basic dialogify](docs/img/screenshot1.png)

## 安裝

```bash
npm install @oneup_network/dialogify jquery
```

jQuery 屬於 **peer dependency**，請與 dialogify 一併安裝。

### 瀏覽器

```html
<script src="path/to/jquery.min.js"></script>
<script src="path/to/dialogify.min.js"></script>
```

瀏覽器版會直接讀取全域的 jQuery。

### 模組（ESM / CommonJS）

```javascript
import Dialogify from '@oneup_network/dialogify';
```

### 樣式

每個建置產物都已內嵌 CSS，不需要另外引入樣式表。若想自行調整樣式，可在載入
dialogify 前先以 `id="dialogifyCss"` 連結獨立的
`@oneup_network/dialogify/css`，此時就不會再注入內嵌樣式。

## 基本用法

以鏈式呼叫組出燈箱後開啟。`show()` 與 `showModal()` 會回傳 promise，並在燈箱
關閉時以 `returnValue` resolve。

```javascript
new Dialogify('dialog content')
    .title('dialog title')
    .buttons([{ type: Dialogify.BUTTON_PRIMARY }])
    .showModal();
```

`alert`、`confirm` 與 `prompt` 都有一行搞定的替代方案：

```javascript
await Dialogify.alert('Alert!!');

if (await Dialogify.confirm('Yes or no?')) {
    // ...
}

const answer = await Dialogify.prompt('Question?');
```

燈箱也可以直接寫在頁面裡，做成
[customized built-in element](https://developer.mozilla.org/docs/Web/API/Web_components/Using_custom_elements#customized_built-in_elements)，
設定以屬性表示，整套 API 都掛在該元素上：

```html
<dialog is="bahamut-dialogify" dialog-title="Hello">
    dialog content <b>bold text</b>
    <button ok></button>
    <button cancel></button>
</dialog>
```

```javascript
document.querySelector('dialog[is="bahamut-dialogify"]').showModal();
```

## 說明文件

其餘內容都在說明文件站上，每項功能都附有可實際操作的範例：

| 主題                                                                         | 內容                                                |
| ---------------------------------------------------------------------------- | --------------------------------------------------- |
| [快速開始](https://oneupnetwork.github.io/dialogify/#getting-started)        | 安裝並開啟第一個燈箱                                |
| [核心概念](https://oneupnetwork.github.io/dialogify/#concepts)               | modal 與非 modal、鏈式呼叫、promise、生命週期       |
| [建立燈箱](https://oneupnetwork.github.io/dialogify/#create)                 | 所有建構選項                                        |
| [內容操作](https://oneupnetwork.github.io/dialogify/#content-api)            | 標題、HTML 內容、ajax 載入、載入狀態                |
| [表單](https://oneupnetwork.github.io/dialogify/#forms)                      | 驗證與取回欄位值                                    |
| [按鈕](https://oneupnetwork.github.io/dialogify/#buttons)                    | 按鈕定義與執行期控制                                |
| [事件](https://oneupnetwork.github.io/dialogify/#events)                     | `show`、`close`、`cancel` 與攔截關閉                |
| [Drawer、toast、popover](https://oneupnetwork.github.io/dialogify/#variants) | 側邊抽屜、通知訊息與錨定浮層                        |
| [快捷方法](https://oneupnetwork.github.io/dialogify/#shortcuts)              | `alert`、`confirm`、`prompt`、`toast`               |
| [宣告式用法](https://oneupnetwork.github.io/dialogify/#declarative)          | `<dialog is="bahamut-dialogify">`、屬性、按鈕、事件 |
| [樣式主題](https://oneupnetwork.github.io/dialogify/#theming)                | 自訂屬性、暗色主題、`z-index`                       |
| [語系](https://oneupnetwork.github.io/dialogify/#locale)                     | 內建語言與自行擴充                                  |
| [API 參考](https://oneupnetwork.github.io/dialogify/#api)                    | 所有方法、選項與常數                                |

燈箱內容是以 **HTML** 插入的，因此排版可以很自由，但所有來自使用者的資料都必須
先做跳脫處理。

## 瀏覽器支援

支援原生 `<dialog>` 元素的瀏覽器：Chrome 94+、Firefox 98+ 與 Safari 15.4+。建置
產物的目標為 `es2022`。

另有兩個 optional bundle 可補足缺口，兩者都必須在 dialogify **之前**載入：

```html
<!-- 舊版瀏覽器的 <dialog> -->
<script src="path/to/dialog-polyfill.min.js"></script>
<!-- Safari 的 customized built-in elements（也就是 `is="..."`） -->
<script src="path/to/custom-elements.min.js"></script>
<script src="path/to/dialogify.min.js"></script>
```

## 相依套件

- [jQuery](https://jquery.com/) — peer dependency，`>=3.0.0`（含 jQuery 4）

## 視覺設計

[Phoebe](https://github.com/Phoebe1226)

## 參與開發

```bash
npm install
npm run build
npm test
```

Fork 專案、從 master 開新 branch，然後發 pull request。歡迎一起參與。

