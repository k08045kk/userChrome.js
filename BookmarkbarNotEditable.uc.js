// ==UserScript==
// @name        BookmarkbarNotEditable.uc.js
// @description ブックマークバーをドラッグによる編集不可とする。
//              Shiftキー押下+ドラッグで編集可能とする。
// @include     main
// @charset     UTF-8
// @version     0.2
// @since       0.1 - 20210521 - 初版
// @since       0.2 - 20210524 - ドラッグ時のブックマーククリックを無効化
// ==/UserScript==

(function() {
  // 親要素を判定
  const checkParentElement = function(element, id) {
    for (; element; element=element.parentElement) {
      if (element.id == id) {
        return true;
      }
    }
    return false;
  };
  
  // ドラッグ開始（編集開始）を無効化
  document.addEventListener('dragstart', function(e) {
    if (e.target 
     && !e.shiftKey
     && checkParentElement(e.target, 'PlacesToolbar') 
     && ~['menuitem','menu','toolbarbutton'].indexOf(e.target.tagName)) {
      e.preventDefault();
    }
  }, true);
  
  // ドラッグ時（編集不可時）のブックマーククリックを無効化
  let x = 0;
  let y = 0;
  document.addEventListener('mousedown', function(e) {
    x = e.clientX;
    y = e.clientY;
  });
  document.addEventListener('mouseup', function(e) {
    if (e.clientX != x && e.clientY != y
     && e.target 
     && checkParentElement(e.target, 'PlacesToolbar') 
     && ~['menuitem','menu','toolbarbutton'].indexOf(e.target.tagName)) {
      e.preventDefault();
    }
  }, true);
})();