// ==UserScript==
// @name        BookmarkbarNotEditable.uc.js
// @description ブックマークバーをドラッグによる編集不可とする。
//              Shiftキー押下+ドラッグで編集可能とする。
// @include     main
// @charset     UTF-8
// @version     0.3
// @since       0.1 - 20210521 - 初版
// @since       0.2 - 20210524 - ドラッグ時のブックマーククリックを無効化
// @since       0.3 - 20210603 - fix セパレータを編集できる
// ==/UserScript==

(function() {
  const toolbar = document.getElementById('PlacesToolbar');
  const items = ['toolbarbutton','toolbarseparator','menupopup','menu','menuitem','menuseparator'];
  let isInterrup;
  
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
})();