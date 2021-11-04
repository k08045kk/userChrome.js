/**
 * @name          userChrome.jsm
 *                profile/chrome/userChrome.jsm
 * @description   This is a script loader for user-created ChromeScript.
 * @charset       UTF-8
 * @author        toshi (https://github.com/k08045kk)
 + @license       MIT License | https://opensource.org/licenses/MIT
 * @compatibility 91+ (Firefox / Thunderbird)
 *                It supports the latest ESR.
 * @version       0.1
 * @since         0.1 - 20211104 - 初版
 * @see           https://github.com/k08045kk/userChrome.js
 */
'use strict';

const EXPORTED_SYMBOLS = ['UserChromeJS'];

ChromeUtils.defineModuleGetter(this, 'Services', 'resource://gre/modules/Services.jsm');
ChromeUtils.defineModuleGetter(this, 'OS', 'resource://gre/modules/osfile.jsm');
ChromeUtils.defineModuleGetter(this, 'console', 'resource://gre/modules/Console.jsm');

// -------------------- config --------------------
// デバッグモード (default:false)
// デバッグモードでは、ログを出力します。
const DEBUG_MODE = false;

// ChromeScript を再利用する (default:true)
// 再利用しない場合、 ChromeScript のデバッグ作業で役立ちます。
const REUSE = true;

// サブディレクトリ (default:[''])
// ChromeScript をサブディレクトリに分散配置できます。
// ChromeScript の実行順を制御できます。
// 例: ['', 'SubScript', 'UCJSFiles']
const SUB_DIRECOTRYS = [''];

// mainLocation (default:null)
// null: 自動設定 / string: 独自設定（自動設定が効かない環境で使用する）
// 例: 'chrome://browser/content/browser.xhtml'
const MAIN_LOCATION = null;
// --------------------/config --------------------


var UserChromeJS = {
  _promise: null, 
  _scripts: null, 
  _observed: false, 
  _observedInWindow: false, 
  isUserChromeJS: true, 
  debugMode: DEBUG_MODE, 
  reuse: REUSE, 
  subDirectorys: SUB_DIRECOTRYS, 
  mainLocation: MAIN_LOCATION, 
  disableChromeLocations: [
    'chrome://global/content/commonDialog.xhtml', 
    'chrome://global/content/selectDialog.xhtml', 
    'chrome://global/content/alerts/alert.xhtml', 
    //'chrome://extensions/content/dummy.xhtml', 
    //'chrome://browser/content/webext-panels.xhtml', 
  ],
  disableAboutLocations: [
    'about:blank', 'about:home', 'about:newtab', 'about:welcome', 
  ],
  
  __isTarget: (win) => {
    return !!(win && 'isChromeWindow' in win);
  },
  __isWindow: (win) => {
    return !!(win && win.isChromeWindow && win === win.parent);
  },
  __isFrame: (win) => {
    return !!((win && 'isChromeWindow' in win) && !(win && win.isChromeWindow && win === win.parent));
  },
  __getMainLocation: (defaultValue) => {
    const win = Services.wm.getMostRecentBrowserWindow();
    return win ? win.location.href
               : defaultValue;
    // Note: Firefox: chrome://browser/content/browser.xhtml
    //       Thunderbird: chrome://messenger/content/messenger.xhtml
    //       SeaMonkey: chrome://navigator/content/navigator.xul
  },
  __readFile: async (file) => {
    const uint8array = await OS.File.read(file.path);   // Uint8Array(UTF-8) <- File(UTF-8)
    return new TextDecoder().decode(uint8array);        // String(UTF-16) <- Uint8Array(UTF-8)
  },
  
  // ChromeScript を解析する
  _parse: async function(file) {
    const startTime = Date.now();
    
    const allMetaRe = new RegExp('^// ==UserScript==([\\s\\S]*?)^// ==/UserScript==','m');
    const content = await this.__readFile(file);
    const meta = (content.match(allMetaRe) || ['',''])[1];
    
    /** @class ChromeScriptMeta */
    const details = {
      //file: file,
      name: file.leafName,
      //path: file.path,
      url: OS.Path.toFileURI(file.path) + '?' + file.lastModifiedTime,
      //content: content,
      //meta: meta,
      includes: [],
      excludes: [],
      includemain: false,
      excludemain: false,
      noframes: false,
      charset: 'UTF-8',         // 未サポート（utf-8）
      runat: 'document-end',    // 未サポート（document-start, document-end, document-idle）
      grants: [],               // 未サポート（none）
      executed: false,
    };
    // Note: @charset をサポートしません。 UTF-8 のみをサポートします。
    //       （ですが、 @charset を記載しておくことをおすすめします）
    // Note: @include 未指定の場合、 main を設定します。
    // Note: @include main は、 MAIN_LOCATION を設定します。
    // TODO: 要検討 @charset, @run-at, @grant
    
    const metas = ['include','exclude','noframes','charset','run-at','grant'];
    const metaFindRe = new RegExp('^// @('+metas.join('|')+')([^\\S\\n\\r].*)?$', 'gm');
    const include2regexp = (pattern) => {
      // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
      pattern = String(pattern).replace(/[.+?^${}()|[\]\\]/g, '\\$&')
                               .replace(/[*]/g, '.*');
      return new RegExp('^'+pattern+'$', 'i');
    };
    for (let m; m=metaFindRe.exec(meta); ) {
      const key = m[1];
      const value = m[2] ? m[2].trim() : '';
      //this.debugMode && console.log(key, value);
      switch (key) {
      case 'include':
      case 'exclude':
        if (value == 'main') { details[key+value] = true; break; }
        if (value == '') { break; }
        details[key+'s'].push(include2regexp(value));
        break;
      case 'charset':   details[key] = value;       break;
      case 'noframes':  details[key] = !value;      break;
      case 'run-at':    details['runat'] = value;   break;
      case 'grant':     details[key+'s'].push(key); break;
      }
    }
    if (!details.includes.length) { details.includemain = true; }
    if (!details.grants.length || details.grants.indexOf('none') != -1) { details.grants = null; }
    
    const elapsedTime = Date.now() - startTime;
    this.debugMode && console.log('[userChrome.jsm] _parse():', details.name, elapsedTime+'ms');
    //this.debugMode && console.log(details);
    return details;
  },
  
  // ChromeScript を（解析のために）読み込む
  _load: async function() {
    this.debugMode && console.log('[userChrome.jsm] _load():');
    const startTime = Date.now();
    
    const promises = [];
    for (let sub of this.subDirectorys) {
      const directory = Services.dirsvc.get('UChrm', Components.interfaces.nsIFile);
      directory.append(sub);
      if (directory.exists() && directory.isDirectory()) {
        this.debugMode && console.log('[userChrome.jsm] _load: '+sub);
        const files = directory.directoryEntries
                               .QueryInterface(Components.interfaces.nsISimpleEnumerator);
        while (files.hasMoreElements()) {
          const file = files.getNext()
                            .QueryInterface(Components.interfaces.nsIFile);
          if (file.isFile() && file.isReadable() && /\.uc\.js$/i.test(file.leafName)) {
            promises.push(this._parse(file));
          }
        }
      }
    }
    const onError = (e) => { Components.utils.reportError(e); return e; };
    const scripts = await Promise.all(promises.map(promise => promise.catch(onError)));
    
    const elapsedTime = Date.now() - startTime;
    this.debugMode && console.log('[userChrome.jsm] _load:', elapsedTime+'ms');
    return scripts.filter(script => !(script instanceof Error));
  },
  
  // ChromeScript を実行する
  _exec: async function(target, script) {
    try {
      Services.scriptloader.loadSubScript(script.url, target/*, script.charset*/);
    } catch (e) {
      Components.utils.reportError(e);
    } finally {
      script.executed = true;
    }
  },
  
  /**
   * 再構築する
   * ChromeScript の事前読み込みを開始します。
   */
  rebuild: function() {
    if (this.reuse) {
      this._promise = this._load();
      this._scripts = null;
    }
  },
  
  /**
   * ChromeScript のメタデータ配列を取得する
   * @return {ChromeScriptMeta[]} ChromeScript のメタデータ配列
   */
  get: async function() {
    if (this.reuse) {
      if (!this._scripts) {
        this._promise = this._promise 
                     || this._load();
        this._scripts = await this._promise;
      }
      return this._scripts;
    }
    return await this._load();
  },
  
  /**
   * window で ChromeScript を実行する
   * @param {ChromeWindow|Window} win - window （ウィンドウ・フレーム）
   * @param {ChromeScriptMeta[]} scripts - ChromeScript のメタデータ配列
   * @param {Object} [option={}] - オプション
   */
  exec: async function(win, scripts, option = {}) {
    if (!this.__isTarget(win)) { return; }
    if (!(win.location.protocol == 'chrome:' || win.location.protocol == 'about:')) { return; }
    if (this.disableChromeLocations.indexOf(win.location.href) != -1) { return; }
    if (this.disableAboutLocations.indexOf(win.location.href) != -1) { return; }
    
    this.mainLocation = this.mainLocation 
                     || this.__getMainLocation(win.location.href);
    scripts = scripts
           || await this.get();
    const isMain = this.mainLocation == win.location.href;
    const isFrame = 'frame' in option ? option.frame : this.__isFrame(win);
    
    this.debugMode && console.log('[userChrome.jsm] exec():', win, scripts);
    for (let script of scripts) {
      const isIncludeMain = script.includemain && isMain;
      const isExcludeMain = script.excludemain && isMain;
      if (isFrame && script.noframes) {
        
      } else if (isExcludeMain || script.excludes.some(re => re.test(win.location.href))) {
        //this.debugMode && console.log('[userChrome.jsm] exclude: '+script.name);
      } else if (isIncludeMain || script.includes.some(re => re.test(win.location.href))) {
        this.debugMode && console.log('[userChrome.jsm] exec: '+script.name/*, script.charset*/);
        await this._exec(win, script);
      } else {
        
      }
    }
    // Note: script は、順に実行します。並行実行ではなく、実行順を保証します。
    //       実行順に依存する ChromeScript がある場合、
    //       SUB_DIRECOTRYS やファイル名を利用して実行順を制御してください。
  },
  
  /**
   * ウィンドウで開始する
   * 開始後、ウィンドウとフレームで ChromeScript を実行する。
   * @param {ChromeWindow} win - window （ウィンドウ）
   */
  startInWindow: function(win) {
    if (this._observed) { return; }
    this._observedInWindow = true;
    // TODO: 単一ウィンドウでの複数実行の阻止
    
    this.debugMode && console.log('[userChrome.jsm] startInWindow():', win);
    if (!this.__isWindow(win)) { return; }
    if (!(win.location.protocol == 'chrome:')) { return; }
    if (this.disableChromeLocations.indexOf(win.location.href) != -1) { return; }
    
    let promise = this.get()
                      .then(async (scripts) => {
      await this.exec(win, scripts, {frame:false});
      return scripts;
    });
    let scripts = null;
    // Note: ウィンドウとフレームで ChromeScript の実行順序を保証します。（window -> frame[n]）
    // Note: ウィンドウとフレームで同じ ChromeScript を保証します。
    //       ウィンドウと別ウィンドウで同じ ChromeScript を保証しません。
    
    const startInFrame = async (event) => {
      const doc = event.originalTarget;
      const win = doc && doc.defaultView;
      this.debugMode && console.log('[userChrome.jsm] startInFrame():', win);
      if (!this.__isFrame(win)) { return; }
      
      scripts = scripts
             || await promise;
      await this.exec(win, scripts, {frame:true});
    };
    win.document.addEventListener('load', startInFrame, {capture:true, passive:true});
    
    // Note: 呼び出しサンプル
    //       Services.obs.addObserver((subject, topic, data) => {
    //         const win = subject;
    //         win.addEventListener('load', (event) => {
    //           const doc = event.originalTarget;
    //           UserChromeJS.startInWindow(doc && doc.defaultView);
    //         }, {capture:true, passive:true});
    //       }, 'domwindowopened', false);
  },
  
  /**
   * 開始する
   * 開始後、 すべてのウィンドウとフレームで ChromeScript を実行する。
   */
  start: function() {
    if (this._observed || this._observedInWindow) { return; }
    this._observed = true;
    
    this.debugMode && console.log('[userChrome.jsm] start():');
    const onTargetLoad = async (event) => {
      const doc = event.originalTarget;
      const win = doc && doc.defaultView;
      await this.exec(win);
      // Note: ウィンドウとフレームで ChromeScript の実行順序を保証しません。
      // Note: ウィンドウとフレームで同じ ChromeScript を保証しません。
    };
    const onWindowOpend = (subject, topic, data) => {
      this.debugMode && console.log('[userChrome.jsm] onWindowOpend():', subject, topic, data);
      const win = subject;
      if (!this.__isWindow(win)) { return; }
      // Note: win.location.href == 'about:blank' -> true
      
      win.addEventListener('DOMContentLoaded', onTargetLoad, {capture:true, passive:true});
    };
    Services.obs.addObserver(onWindowOpend, 'domwindowopened', false);
  },
  
  /**
   * 初期化する
   */
  init: function() {
    this.debugMode && console.log('[userChrome.jsm] init():');
    if (!(this._promise || this._scripts)) {
      this.rebuild();
    }
  },
  
  // Note: Window / Frame （ウィンドウとフレーム）の区別
  //       Target: win && 'isChromeWindow' in win
  //         Window: win && win.isChromeWindow && win === win.parent
  //         Frame: (win && 'isChromeWindow' in win) && !(win && win.isChromeWindow && win === win.parent)
  //         RootTarget: win && 'isChromeWindow' in win && win === win.parent
  //           RootWindow: win && win.isChromeWindow === true && win === win.parent
  //           RootContent: win && win.isChromeWindow === false && win === win.parent
  //       （Target は、 Window と Frame である。 Sandbox / BackstagePass ではない）
  
  // Note: window / document のイベント伝搬
  //       domwindowopened 時に、 document へ登録したリスナーは、パージされる。
  //       document で Window の load イベントをリッスンしない。
  //       document で Frame / Image の load イベントを（キャプチャのみ）リッスンする。
  //       window / document で Window / Frame の DOMContentLoaded イベントをリッスンする。
  
  // TODO: 要調査 Overlay, UCJS Loader, 拡張機能
  // TODO: GM 関数に類似する機能を提供する？
};
