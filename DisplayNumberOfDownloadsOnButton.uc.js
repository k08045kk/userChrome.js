// ==UserScript==
// @name          DisplayNumberOfDownloadsOnButton.uc.js
// @description   Display the number of downloads on the downloads button.
// @description:ja  ダウンロード数をダウンロードボタンに表示する。
// @include       main
// @charset       UTF-8
// @author        toshi (https://github.com/k08045kk)
// @license       MIT License | https://opensource.org/licenses/MIT
// @compatibility 106+
// @version       2
// @since         1 - 20221107 - 初版
// @since         2 - 20221121 - 二版（#downloadsPanel 方式を追加）
// @see           https://github.com/k08045kk/userChrome.js
// ==/UserScript==

// [特記]
// 本スクリプトは、推測したダウンロード数を表示します。
// 本スクリプトが表示するダウンロード数は、正確ではありません。
// 常に正確なダウンロード数を求めるならば、別の方法を検討してください。

// 補足：Firefox 起動時にダウンロードボタンが設置済みである必要があります。
// 補足：プライベートウィンドウは、未対応。
//     （現状は、通常・プライベートが個別に動作するもよう）

const key = 'DisplayNumberOfDownloadsOnButton.uc.js';
const share = Services[key] = Services[key] || {windowId:0, data:{count:0}};
const windowId = share.windowId++;


window.addEventListener('load', function() {
  const button = document.getElementById('downloads-button');
  if (!button) {
    // ウィンドウオープン時にダウンロードボタンが設置されていない
    return;
  }
  
  
  // バッジを変更する
  const label = button.querySelector('.toolbarbutton-badge');
  const setBadgeText = function(text) {
    const attention = button.getAttribute('attention');
    if (text === 0 || attention !== '') {
      text = '';
    }
    if (text != label.textContent) {
      label.textContent = text;
      label.style.backgroundColor = text !== '' ? 'blueviolet' : '';
    }
    // 補足：通常のバッジ
    //       attention=info 危険なファイルのダウンロード（丸アイコン）
    //       attention=warning 不明（三角アイコン）
    //       attention=severe 不明（丸アイコン）
    //       テキストではなく、図形で表される
  };
  
  
  // 属性変更を監視する
  let _progress,
      _notification;
  const callback = function(mutationsList, observer) {
    const progress = button.getAttribute('progress');
    const notification = button.getAttribute('notification');
    if (progress === 'true') {
      if (_notification === notification) {
        if (share.data.count === 0) {
          // ありえない（といいな）
          share.data.count = 1;
        }
      } else if (notification === 'start') {
        if (_progress === '') {
          if (share.data.count === 0) {
            share.data.count++;
          }
          // １個目（開始）は、全ウィンドウに通知されるため
        } else {
          share.data.count++;
          // 以降（開始・終了）は、アクティブウィンドウのみに通知されるため
        }
      } else if (notification === 'finish') {
        if (share.data.count > 0) {
          share.data.count--;
        }
      }
      _notification = notification;
    } else {
      // ありえない（といいな）
      share.data.count = 0;
    }
    _progress = progress;
    setBadgeText(share.data.count);
    
    //console.log(windowId, share.data.count, progress, notification);
    // 補足：start / finish が 同時 or 連続 に発生するとカウントがズレる。
    // 補足：ダウンロード失敗が発生るとカウントがズレる。
  };
  const config = {attributes:true, childList:false, subtree:false};
  const observer = new MutationObserver(callback);
  observer.observe(button, config);
  
  
  // ダウンロードパネルで補正する
  button.addEventListener('click', function(event) {
    const downloads = document.querySelectorAll('#downloadsListBox > .download-state[state="0"]');
    const summary = document.getElementById('downloadsSummaryDescription');
    if (summary.value) {
      share.data.count = downloads.length + (summary.value.match(/\d+/)[0] - 0);
      setBadgeText(share.data.count);
    }
    
    // 補足：初回クリック時まではダウンロードパネルが未初期化
  });
  
  // 補足：設置済みでも load 前には、ダウンロードボタンが存在しない可能性がある。
  // 補足：「about:downloads」から取得すれば正確なダウンロード数が取得できる。
  //       ただし、属性監視より面倒そうなため、今回は取りやめとする。
});
