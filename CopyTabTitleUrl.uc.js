// ==UserScript==
// @name          CopyTabTitleUrl.uc.js
// @description   タブコンテキストメニューから、タイトルとURLをコピーする。
// @include       main
// @charset       UTF-8
// @author        toshi (https://github.com/k08045kk)
// @license       MIT License | https://opensource.org/licenses/MIT
// @compatibility 69+
// @version       5
// @since         1 - 20180212 - 初版
// @since         2 - 20180212 - 「CopyTabTitleAndURL.uc.js」から名称変更
// @since         3 - 20190905 - Firefox69対応 createElement → createXULElement に置換
// @since         4 - 20201122 - 「タイトルとURLをコピー」を追加
// @since         4 - 20201122 - リファクタリング
// @since         5 - 20210910 - メタデータ修正
// @since         5 - 20211008 - メタデータ修正
// @see           https://github.com/k08045kk/userChrome.js
// @see           https://www.bugbugnow.net/2018/02/CopyTabTitleAndURL.uc.js.html
// ==/UserScript==

(function() {
  // クリップボードコピー
  const copyToClipboard = function(text) {
    Cc['@mozilla.org/widget/clipboardhelper;1'].getService(Ci.nsIClipboardHelper).copyString(text);
  };
  // copyToClipboard('['+title+']('+url+')');             // Markdown
  // copyToClipboard('<a href="'+url+'">'+title+'</a>');  // Hyperlink
  
  
  // タイトルとURLをコピー
  const m0 = document.createXULElement('menuitem');
  m0.setAttribute('id', 'context-copytab-titleurl');
  m0.setAttribute('label', 'タイトルとURLをコピー');
  m0.addEventListener('command', function() {
    const title = TabContextMenu.contextTab.linkedBrowser.contentTitle;
    const url = TabContextMenu.contextTab.linkedBrowser.currentURI.spec;
    copyToClipboard(title+'\n'+url);
  });
  
  // タイトルをコピー
  const m1 = document.createXULElement('menuitem');
  m1.setAttribute('id', 'context-copytab-title');
  m1.setAttribute('label', 'タイトルをコピー');
  m1.addEventListener('command', function() {
    const title = TabContextMenu.contextTab.linkedBrowser.contentTitle;
    copyToClipboard(title);
  });
  
  // URLをコピー
  const m2 = document.createXULElement('menuitem');
  m2.setAttribute('id', 'context-copytab-url');
  m2.setAttribute('label', 'URLをコピー');
  m2.addEventListener('command', function() {
    const url = TabContextMenu.contextTab.linkedBrowser.currentURI.spec;
    copyToClipboard(url);
  });
  
  // セパレータ
  const ms = document.createXULElement('menuseparator');
  ms.setAttribute('id', 'context-copytab-sep');
  
  // メニューバーの最上部に要素を追加
  // タイトルとURLをコピー
  // タイトルをコピー
  // URLをコピー
  // セパレータ
  const tabContextMenu = document.getElementById('tabContextMenu');
  tabContextMenu.insertBefore(ms, tabContextMenu.firstChild);
  tabContextMenu.insertBefore(m2, tabContextMenu.firstChild);
  tabContextMenu.insertBefore(m1, tabContextMenu.firstChild);
  tabContextMenu.insertBefore(m0, tabContextMenu.firstChild);
}());