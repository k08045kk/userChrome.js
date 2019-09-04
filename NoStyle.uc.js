// ==UserScript==
// @name          NoStyle.uc.js
// @description   スタイルシートの有効無効をタブメニューで選択する
// @include       main
// @charset       UTF-8
// @author        toshi(http://www.bugbugnow.net/)
// @license       MIT License
// @version       2
// @see           1.20180306 - 初版
// @see           2.20190905 - Firefox69対応 createElement → createXULElement に置換
// ==/UserScript==

(function () {
  // スタイルシート切換え
  var mi = document.createXULElement("menuitem");
  mi.setAttribute("id", "context-nostyle");
  mi.setAttribute("label", "スタイルシート切換え");
  mi.addEventListener('command', function() {
    let browser = TabContextMenu.contextTab.linkedBrowser;  // 選択したタブ(右クリックしたタブ)
    let style = gPageStyleMenu._getStyleSheetInfo(browser); // スタイルシート有効無効
    let mm = browser.messageManager;
    
    if (style.authorStyleDisabled) {
      mm.sendAsyncMessage("PageStyle:Switch", '');
    } else {
      mm.sendAsyncMessage("PageStyle:Disable");
    }
  });
  
  // メニュー呼び出しイベント(右クリック時)
  document.addEventListener('popupshowing', function handler(event) {
    // タブのみ処理する
    let tab = TabContextMenu.contextTab;
    if (tab == null) {
      return;
    }
    
    // クリックしたタブに応じて、ラベルを変更する
    let browser = tab.linkedBrowser;                        // 選択したタブ(右クリックしたタブ)
    let style = gPageStyleMenu._getStyleSheetInfo(browser); // スタイルシート有効無効
    if (style.authorStyleDisabled) {
      mi.setAttribute("label", "スタイルシートを有効化");
    } else {
      mi.setAttribute("label", "スタイルシートを無効化");
    }
    return;
  }, false);
  
  // セパレータ
  var ms = document.createXULElement("menuseparator");
  ms.setAttribute('id', 'context-nostyle-sep');
  
  // タブメニューバーの最下部に要素を追加
  var tabContextMenu = document.getElementById("tabContextMenu");
  tabContextMenu.appendChild(ms);
  tabContextMenu.appendChild(mi);
}());