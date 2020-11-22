// ==UserScript==
// @name          CopyTabTitleUrl.uc.js
// @description   タブコンテキストメニューから、タイトルとURLをコピーする。
// @include       main
// @charset       UTF-8
// @author        toshi (https://github.com/k08045kk)
// @license       MIT License
// @version       4
// @see           1.20180212 - 初版
// @see           2.20180212 - 「CopyTabTitleAndURL.uc.js」から名称変更
// @see           3.20190905 - Firefox69対応 createElement → createXULElement に置換
// @see           4.20201122 - 「タイトルとURLをコピー」を追加
// @see           4.20201122 - リファクタリング
// @see           https://www.bugbugnow.net/2018/02/CopyTabTitleAndURL.uc.js.html
// ==/UserScript==

(function() {
  // クリップボードコピー
  const copyToClipboard = function(text) {
    Cc['@mozilla.org/widget/clipboardhelper;1'].getService(Ci.nsIClipboardHelper).copyString(text);
  };
  
  
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