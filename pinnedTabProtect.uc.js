// ==UserScript==
// @name          pinnedTabProtect.uc.js
// @description   ピン留めタブを保護する。
//                保護は、クローズ処理を中断してタブを維持する機能です。
//                保護は、「ロック」と異なり、タブ内のページ移動を抑制する機能はありません。
// @include       main
// @charset       UTF-8
// @author        toshi (https://github.com/k08045kk)
// @license       MIT License | https://opensource.org/licenses/MIT
// @compatibility 115+
// @version       1
// @since         1 - 20230902 - 初版
// @see           https://github.com/k08045kk/userChrome.js
// ==/UserScript==

(function() {
  // オリジナルの関数を保存
  const removeTab = gBrowser.removeTab;
  
  // see chrome://browser/content/tabbrowser.js
  gBrowser.removeTab = function(aTab, aParams) {
    if (aTab.getAttribute('pinned') === 'true') {
      return;
    }
    removeTab.call(this, aTab, aParams);
  };
}());