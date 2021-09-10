// ==UserScript==
// @name        BookmarkbarNotEditable.uc.js
// @description ブックマークツールバーのドラッグによる編集不可とする。
//              ただし、Shiftキー+ドラッグで編集可能とする。
// @include     main
// @charset     UTF-8
// @author      toshi (https://github.com/k08045kk)
// @license     MIT License | https://opensource.org/licenses/MIT
// @version     1.0
// @since       0.1 - 20210521 - 初版
// @since       0.2 - 20210524 - ドラッグ時のブックマーククリックを無効化
// @since       0.3 - 20210603 - fix セパレータを編集できる
// @since       1.0 - 20210910 - リリース版（GitHub追加、ライセンス設定）
// @see         https://github.com/k08045kk/userChrome.js
// @see         https://www.bugbugnow.net/2021/05/bookmarkbar-not-editable-uc-js.html
// ==/UserScript==

(function() {
  const toolbar = document.getElementById('PlacesToolbar');
  const items = ['toolbarbutton','toolbarseparator','menupopup','menu','menuitem','menuseparator'];
  let isInterrup = false;
  
  // ドラッグ開始を無効化（Shift+ドラッグ開始は、有効とする）
  toolbar.addEventListener('dragstart', function(e) {
    if (!e.shiftKey && ~items.indexOf(e.target.tagName)) {
      isInterrup = true;
      e.preventDefault();
    }
  }, true);
  
  // ドラッグ時のブックマーククリックを無効化
  toolbar.addEventListener('mousedown', function(e) {
    isInterrup = false;
  });
  toolbar.addEventListener('mouseup', function(e) {
    if (isInterrup) {
      e.preventDefault();
    }
  });
  
  // 備考：イベント発生順（dragstartは、mousedown後のマウス移動で発生する）
  //       mousedown > dragstart > mouseup
})();