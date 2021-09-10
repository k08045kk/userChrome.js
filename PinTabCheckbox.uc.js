// ==UserScript==
// @name        PinTabCheckbox.uc.js
// @description タブコンテキストメニューの[タブのピン留め(を外す)]にチェックボックスを表示する。
// @include     main
// @charset     UTF-8
// @author      toshi (https://github.com/k08045kk)
// @license     MIT License | https://opensource.org/licenses/MIT
// @version     0.1
// @since       0.1.20210811 - 初版
// @see         https://github.com/k08045kk/userChrome.js
// ==/UserScript==

(function() {
  document.getElementById('context_pinTab').setAttribute('type', 'checkbox');
  document.getElementById('context_pinTab').setAttribute('checked', false);
  document.getElementById('context_unpinTab').setAttribute('type', 'checkbox');
  document.getElementById('context_unpinTab').setAttribute('checked', true);
})();