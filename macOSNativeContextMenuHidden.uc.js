// ==UserScript==
// @name          macOSNativeContextMenuHidden.uc.js
// @description   Apply CSS hiding to native context menus in macOS.
//                It assumes that the user is using userChrome.menus.css.
//                Native context menu in macOS (widget.macos.native-context-menus).
//                Native context menus have been supported by default since Firefox90.
// @include       main
// @charset       UTF-8
// @author        toshi (https://github.com/k08045kk)
// @license       MIT License | https://opensource.org/licenses/MIT
// @version       1
// @since         1 - 20211120 - 初版
// @see           https://github.com/k08045kk/userChrome.js
// @see           https://github.com/k08045kk/userChrome.menus.css
// ==/UserScript==

(function() {
  document.addEventListener('popupshowing', (event) => {
    const menupopup = event.target;
    const query = 'menupopup, menugroup, menuitem, menu, menuseparator, toolbarbutton';
    menupopup.querySelectorAll(query).forEach((item) => {
      const cssStyleDeclaration = window.getComputedStyle(item, null);
      const display = cssStyleDeclaration.getPropertyValue('display');
      item.hidden = display == 'none';
      // Note: macOS のネイティブコンテキストメニューでは、CSSが適用されないため、
      //       hidden 属性で非表示にする。
      // Note: 対象コンテキストメニューを事前に削除（display: none !import;）する必要があります。
      //       （userChrome.menus.css の使用を前提としています）
    });
  });
  // Note: 問題が発生した場合、問題を指摘してください。
  //       作者は、MacOS版 Firefox を愛用していないため、問題に気づくことはありません。
}());
