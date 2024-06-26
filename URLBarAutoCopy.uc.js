// ==UserScript==
// @name          URLBarAutoCopy.uc.js
// @description   Automatically copy the URL bar.
// @description:ja  URLバーを自動的にコピーする。
// @include       main
// @charset       UTF-8
// @author        toshi (https://github.com/k08045kk)
// @license       MIT License | https://opensource.org/licenses/MIT
// @compatibility 101+
// @version       0.2
// @since         0.1 - 20220610 - 初版
// @since         0.2 - 20240527 - ページ遷移時は、オートコピーしない
// ==/UserScript==

(function() {
  // URLバーがフォーカスを失った時、
  // 選択文字列があり && クリップボードに変更がないならば
  // URLバーの内容をクリップボードにコピーする
  const urlbar = document.getElementById('urlbar-input');
  let clipboard = null;
  let url = null;
  
  urlbar.addEventListener('focus', async function(event) {
    clipboard = await navigator.clipboard.readText();
    url = gBrowser.selectedBrowser.currentURI.spec;
  });
  
  urlbar.addEventListener('blur', async function(event) {
    const target = event.target;
    const text = target.value.substring(target.selectionStart, target.selectionEnd);
    const viewURL = gBrowser.selectedBrowser.currentURI.spec;
    if (viewURL === url && text.length && clipboard === await navigator.clipboard.readText()) {
      await navigator.clipboard.writeText(text);
    }
  });
})();