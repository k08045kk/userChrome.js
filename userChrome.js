// ==UserScript==
// @name          userChrome.js
//                profile/chrome/userChrome.js
// @description   userChrome.js loads a user-created ChromeScript.
//                It supports multiple calling patterns that may call userChrome.js.
// @include       *
// @noframes      
// @charset       UTF-8
// @author        toshi (https://github.com/k08045kk)
// @license       MIT License | https://opensource.org/licenses/MIT
// @compatibility 91+ (Firefox / Thunderbird)
//                It supports the latest ESR.
// @version       0.2
// @since         0.1 - 20211104 - 初版
// @since         0.2 - 20211122 - 二版
// @see           https://github.com/k08045kk/userChrome.js
// ==/UserScript==

const EXPORTED_SYMBOLS = [];
(() => {
  'use strict';
  
  // 1. Initalize
  const properties = ['ChromeUtils'].filter(property => !globalThis[property]);
  properties.length && Components.utils.importGlobalProperties(properties);
  
  const {Services} = ChromeUtils.import('resource://gre/modules/Services.jsm');
  
  //const {console} = ChromeUtils.import('resource://gre/modules/Console.jsm');
  //console.log('[userChrome.js] console debug: v0.1');
  //console.log('[userChrome.js] globalThis', globalThis);
  
  if (Services.appinfo.inSafeMode) {
    //console.log('[userChrome.js] safe mode.');
    return;
  }
  
  const loadScript = (type, name) => {
    let module = null;
    const file = Services.dirsvc.get('UChrm', Components.interfaces.nsIFile);
    file.append(name);
    if (file.exists() && file.isFile()) {
      const fileURL = Services.io.getProtocolHandler('file')
                                 .QueryInterface(Components.interfaces.nsIFileProtocolHandler)
                                 .getURLSpecFromActualFile(file) + '?' + file.lastModifiedTime;
      //const fileURL = Services.io.newFileURI(file).spec + '?' + file.lastModifiedTime;
      //console.log('[userChrome.js] fileURL:', fileURL);
      // Note: Use the last modified date to prevent the use of the previous cache.
      
      try {
        switch (type) {
        case 'import':
          module = ChromeUtils.import(fileURL);
          break;
        case 'sub-script':
          const principal = Services.scriptSecurityManager.getSystemPrincipal();
          const sandbox = Components.utils.Sandbox(principal, {
            freshZone: true,
            sandboxName: name,
            wantComponents: true,
            wantExportHelpers: false,
            wantGlobalProperties: ['ChromeUtils'],
            wantXrays: true,
          });
          Services.scriptloader.loadSubScript(fileURL, sandbox);
          module = sandbox;
          break;
        }
      } catch (e) { Components.utils.reportError(e); }
    } else {
      Components.utils.reportError('[userChrome.js] file not found. ('+file.path+')');
    }
    return module;
  };
  const loadJSM = (name) => { return loadScript('import', name); };
  const loadJS = (name) => {  return loadScript('sub-script', name); }
  
  const isWindowLoad = 'isChromeWindow' in globalThis;
  const isStartup = !isWindowLoad;
  
  
  // 2. Load ChromeScript at startup
  if (isStartup) {
    //loadJS('userChrome.startup.js');
    //...
    // Note: Write a ChromeScript to be loaded manually.
    //       Load it in userChrome.js to reduce the need to rewrite config.js.
  }
  
  
  // 3. Load userChrome.jsm
  if (isStartup || !Services.ucjs) {
    const {UserChromeJS} = loadJSM('userChrome.jsm') || {UserChromeJS:null};
    if (UserChromeJS) {
      UserChromeJS.init();
      if (isStartup) {
        UserChromeJS.start();
      }
      if (!('ucjs' in Services)) {
        Services.ucjs = UserChromeJS;
        // Note: Does it matter if I add it to Services?
      }
    }
  }
  if (isWindowLoad && Services.ucjs && Services.ucjs.isUserChromeJS) {
    const win = globalThis.window;
    Services.ucjs.startInWindow(win);
  }
})();
