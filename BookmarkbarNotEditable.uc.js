// ==UserScript==
// @name        BookmarkbarNotEditable.uc.js
// @description ブックマークバーをドラッグによる編集不可とする。
//              Shiftキー押下+ドラッグで編集可能とする。
// @include     main
// @charset     UTF-8
// @version     0.1
// @since       0.1 - 20210521 - 初版
// ==/UserScript==

(function() {
  const checkParentElement = function(element, id) {
    for (; element; element=element.parentElement) {
      if (element.id == id) {
        return true;
      }
    }
    return false;
  };
  
  document.addEventListener('dragstart', function(e) {
    if (e.target 
     && !e.shiftKey
     && checkParentElement(e.target, 'PlacesToolbar') 
     && ~['menuitem','menu','toolbarbutton'].indexOf(e.target.tagName)) {
      e.preventDefault();
    }
  }, true);
})();