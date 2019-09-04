// ==UserScript==
// @name          CopyTabTitleUrl.uc.js
// @description   タブコンテキストメニューから選択しているタブのタイトルとURLをコピーする
// @include       main
// @charset       UTF-8
// @author        toshi(https://www.bugbugnow.net/)
// @license       MIT License
// @version       3
// @see           1 - 初版
// @see           2 - 「CopyTabTitleAndURL.uc.js」から名称変更
// @see           3.20190905 - Firefox69対応 createElement → createXULElement に置換
// ==/UserScript==

(function () {
  // タブのタイトルをコピー
  var mt = document.createXULElement("menuitem");
  mt.setAttribute("id", "context-copytab-title");
  mt.setAttribute("label", "タブのタイトルをコピー");
  mt.addEventListener('command', function() {
    var title = TabContextMenu.contextTab.linkedBrowser.contentTitle;
    var clipboard = Cc['@mozilla.org/widget/clipboardhelper;1']
                      .getService(Ci.nsIClipboardHelper);
    clipboard.copyString(title);
  });
  
  // タブのURLをコピー
  var mi = document.createXULElement("menuitem");
  mi.setAttribute("id", "context-copytab-url");
  mi.setAttribute("label", "タブのURLをコピー");
  mi.addEventListener('command', function() {
      var url = TabContextMenu.contextTab.linkedBrowser.currentURI.spec;
      var clipboard = Cc['@mozilla.org/widget/clipboardhelper;1']
                        .getService(Ci.nsIClipboardHelper);
      clipboard.copyString(url);
  });
  
  // セパレータ
  var ms = document.createXULElement("menuseparator");
  ms.setAttribute('id', 'context-copytab-sep');
  
  // メニューバーの最上部に要素を追加
  // タブのタイトルをコピー
  // タブのURLをコピー
  // セパレータ
  var tabContextMenu = document.getElementById("tabContextMenu");
  tabContextMenu.insertBefore(ms, tabContextMenu.firstChild);
  tabContextMenu.insertBefore(mi, tabContextMenu.firstChild);
  tabContextMenu.insertBefore(mt, tabContextMenu.firstChild);
}());