// ==UserScript==
// @name          NoStyle.uc.js
// @description   スタイルシートの有効無効をタブコンテキストメニューから選択する。
//                次の機能をタブコンテキストメニューから呼び出す。
//                [メインメニュー] > [表示] > [スタイルシート]
// @include       main
// @charset       UTF-8
// @author        toshi (https://github.com/k08045kk)
// @license       MIT License
// @version       4
// @see           1.20180306 - 初版
// @see           2.20190905 - Firefox69対応 createElement → createXULElement に置換
// @see           3.20200118 - Firefox72対応 messageManager → switchStyleSheet/disableStyle で切換え
// @see           4.20201122 - fix #1 カレントタブ以外のタブコンテキストメニューで正常動作しない
// @see           4.20201122 - リファクタリング
// @see           https://www.bugbugnow.net/2018/03/nostyleucjsuserchromejs.html
// ==/UserScript==

(function() {
  // chrome://browser/content/browser.js: gPageStyleMenu._sendMessageToAll
  function _sendMessageToAll(message, data, browser) {
    let contextsToVisit = [browser.browsingContext];//[gBrowser.selectedBrowser.browsingContext];
    while (contextsToVisit.length) {
      let currentContext = contextsToVisit.pop();
      let global = currentContext.currentWindowGlobal;
      
      if (!global) {
        continue;
      }
      
      let actor = global.getActor("PageStyle");
      actor.sendAsyncMessage(message, data);
      
      contextsToVisit.push(...currentContext.children);
    }
  };
  // chrome://browser/content/browser.js: gPageStyleMenu.switchStyleSheet
  function switchStyleSheet(title, browser) {
    let { permanentKey } = browser;//gBrowser.selectedBrowser;
    let sheetData = this._pageStyleSheets.get(permanentKey);
    if (sheetData && sheetData.filteredStyleSheets) {
      sheetData.authorStyleDisabled = false;
      for (let sheet of sheetData.filteredStyleSheets) {
        sheet.disabled = sheet.title !== title;
      }
    }
    //this._sendMessageToAll("PageStyle:Switch", { title });
    _sendMessageToAll.call(this, "PageStyle:Switch", { title }, browser);
  };
  // chrome://browser/content/browser.js: gPageStyleMenu.disableStyle
  function disableStyle(browser) {
    let { permanentKey } = browser;//gBrowser.selectedBrowser;
    let sheetData = this._pageStyleSheets.get(permanentKey);
    if (sheetData) {
      sheetData.authorStyleDisabled = true;
    }
    //this._sendMessageToAll("PageStyle:Disable", {});
    _sendMessageToAll.call(this, "PageStyle:Disable", {}, browser);
  };
  
  // スタイルシート切換え
  const mi = document.createXULElement('menuitem');
  mi.setAttribute('id', 'context-nostyle');
  mi.setAttribute('label', 'スタイルシート切換え');
  //mi.setAttribute('label', 'Switch stylesheets');
  mi.addEventListener('command', () => {
    const tab = TabContextMenu.contextTab;
    const browser = tab != null
                  ? tab.linkedBrowser                           // 選択したタブ（右クリックしたタブ）
                  : gBrowser.selectedBrowser;                   // カレントタブ
    const style = gPageStyleMenu._getStyleSheetInfo(browser);   // スタイルシート有効無効
    
    if (style.authorStyleDisabled) {
      //gPageStyleMenu.switchStyleSheet(null);
      switchStyleSheet.call(gPageStyleMenu, null, browser);
    } else {
      //gPageStyleMenu.disableStyle();
      disableStyle.call(gPageStyleMenu, browser);
    }
    // #1: gPageStyleMenuの関数を無理やり置き換えて対応する
    //     ただし、gPageStyleMenuの実装に強く依存するようになる
  });
  
  // メニュー呼び出しイベント（右クリック時）
  document.addEventListener('popupshowing', () => {
    // ラベルを変更する
    const tab = TabContextMenu.contextTab;
    const browser = tab != null
                  ? tab.linkedBrowser                           // 選択したタブ（右クリックしたタブ）
                  : gBrowser.selectedBrowser;                   // カレントタブ
    const style = gPageStyleMenu._getStyleSheetInfo(browser);   // スタイルシート有効無効
    
    if (style.authorStyleDisabled) {
      mi.setAttribute('label', 'スタイルシートを有効化');
      //mi.setAttribute('label', 'Enable stylesheets');
    } else {
      mi.setAttribute('label', 'スタイルシートを無効化');
      //mi.setAttribute('label', 'Disable stylesheets');
    }
  });
  
  // セパレータ
  const ms = document.createXULElement('menuseparator');
  ms.setAttribute('id', 'context-nostyle-sep');
  
  // タブコンテキストメニューの最下部に要素を追加
  const tabContextMenu = document.getElementById('tabContextMenu');
  tabContextMenu.appendChild(ms);
  tabContextMenu.appendChild(mi);
}());