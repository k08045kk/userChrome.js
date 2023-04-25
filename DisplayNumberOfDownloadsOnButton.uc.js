// ==UserScript==
// @name          DisplayNumberOfDownloadsOnButton.uc.js
// @description   Display the number of downloads on the downloads button.
// @description:ja  ダウンロード数をダウンロードボタンに表示する。
// @include       main
// @charset       UTF-8
// @author        toshi (https://github.com/k08045kk)
// @license       MIT License | https://opensource.org/licenses/MIT
// @compatibility 109+
// @version       6
// @since         1 - 20221107 - 初版
// @since         2 - 20221121 - 二版（#downloadsPanel 方式を追加）
// @since         3 - 20221210 - requestIdleCallback() を導入（初期化に失敗する事例があったため）
// @since         4 - 20221218 - 更に10秒遅らせる（初期化に失敗する事例があったため）
// @since         5 - 20230129 - 再実行の実装
// @since         6 - 20230318 - fix #2 Fijrefox111対応（別ウィンドウでダウンロード開始を通知しない）
// @see           https://github.com/k08045kk/userChrome.js
// ==/UserScript==

// [特記]
// 本スクリプトは、推測したダウンロード数を表示します。
// 本スクリプトが表示するダウンロード数は、正確ではありません。
// 常に正確なダウンロード数を求めるならば、別の方法を検討してください。

// 補足：Firefox 起動時にダウンロードボタンが設置済みである必要があります。
//       Firefox 実行中にダウンロードボタンを撤去しないでください。
// 補足：プライベートウィンドウは、未対応。
//     （現状は、通常・プライベートが個別に動作するもよう）

const key = 'DisplayNumberOfDownloadsOnButton.uc.js';
const share = Services[key] = Services[key] || {windowId:0, data:{count:0}};

window.addEventListener('load', function() {
  window.requestIdleCallback(function onInit(win) {
    win = (win && 'isChromeWindow' in win) ? win : window;
    if (win[key]) {
//console.log('error: restart');
      return;
    }
//console.log('onInit', win);
    
    const button = win.document.getElementById('downloads-button');
    if (!button) {
      // ウィンドウオープン時にダウンロードボタンが設置されていない
//console.log('error: no downloads button');
      return;
    }
    win[key] = {windowId:share.windowId++};
//console.log('start', win[key].windowId);
    
    // バッジを変更する
    const setBadgeText = (win, text) => {
      const button = win.document.getElementById('downloads-button');
      if (!button) { return; }
      
      const label = button.querySelector('.toolbarbutton-badge');
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
    const onUpdate = () => {
      for (const w of Services.wm.getEnumerator(null)) {
        if (w[key]) {
          try {
//console.log('setBadgeText', share.data.count);
            setBadgeText(w, share.data.count);
          } catch (e) {
//console.log(e);
          }
        }
      }
    };
    
    // 属性変更を監視する
    let _progress,
        _notification;
    const callback = (mutationsList, observer) => {
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
      onUpdate();
      
//console.log(win[key].windowId, share.data.count, progress, notification);
      // 補足：start / finish が 同時 or 連続 に発生するとカウントがズレる。
      // 補足：ダウンロード失敗が発生るとカウントがズレる。
    };
    const config = {attributes:true, childList:false, subtree:false};
    const observer = new MutationObserver(callback);
    observer.observe(button, config);
    
    // ダウンロードパネルで補正する
    const correction = () => {
      const downloads = win.document.querySelectorAll('#downloadsListBox > .download-state[state="0"]');
      const summary = win.document.getElementById('downloadsSummaryDescription');
      if (summary.value) {
        share.data.count = downloads.length + (summary.value.match(/\d+/)[0] - 0);
        onUpdate();
      }
    };
    correction();
    
    // 未実行のウィンドウで再実行する
    // 備考：設置直後のウィンドウで動作しない不具合あり、 Firefox 本体の修正待ち
    //       https://bugzilla.mozilla.org/show_bug.cgi?id=1813365
    const restart = () => {
      for (const w of Services.wm.getEnumerator(null)) {
        if (w[key]) { continue; }
        onInit(w);
      }
    };
    restart();
    
    // ボタンクリック時（補正・再実行）
    button.addEventListener('click', (event) => {
      correction();
      restart();
      // 補足：初回クリック時まではダウンロードパネルが未初期化
    });
  });
  
  // 補足：設置済みでも load 前には、ダウンロードボタンが存在しない可能性がある。
  // 補足：「about:downloads」から取得すれば正確なダウンロード数が取得できる。
  //       ただし、属性監視より面倒そうなため、今回は取りやめとする。
});
