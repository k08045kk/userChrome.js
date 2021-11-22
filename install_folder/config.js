// skip first line
// see https://support.mozilla.org/en-US/kb/customizing-firefox-using-autoconfig

/**
 * @name          config.js
 *                install/config.js
 * @description   Use the AutoConfig method to load userChrome.js.
 * @charset       UTF-8
 * @author        toshi (https://github.com/k08045kk)
 + @license       MIT License | https://opensource.org/licenses/MIT
 * @compatibility 91+ (Firefox / Thunderbird)
 *                It supports the latest ESR.
 * @version       0.2
 * @since         0.1 - 20211104 - First edition
 * @since         0.2 - 20211122 - Second edition
 * @see           https://github.com/k08045kk/userChrome.js
 */
(() => {
  'use strict';
  // Note: To avoid character encoding problems, only ASCII codes are used in this file.
  // Note: Use the same filename as config.js as the other userChrome.js AutoConfig methods.
  //       This also has the effect of overwriting files that are no longer needed.
  //       This is also the case for config-pref.js.
  
  try {
    // 1. Initalize
    const {Services} = Components.utils.import('resource://gre/modules/Services.jsm');
    
    //const {console} = Components.utils.import('resource://gre/modules/Console.jsm');
    //console.log('[AutoConfig] console debug: v0.1 (config.js)');
    //console.log('[AutoConfig] globalThis', globalThis);
    
    if (Services.appinfo.inSafeMode) {
      //console.log('[AutoConfig] safe mode.');
      return;
    }
    
    
    // 2. Load userChrome.js at startup
    const file = Services.dirsvc.get('UChrm', Components.interfaces.nsIFile);
    file.append('userChrome.js');
    if (file.exists() && file.isFile()) {
      const fileURL = Services.io.getProtocolHandler('file')
                                 .QueryInterface(Components.interfaces.nsIFileProtocolHandler)
                                 .getURLSpecFromActualFile(file) + '?' + file.lastModifiedTime;
      //const fileURL = Services.io.newFileURI(file).spec + '?' + file.lastModifiedTime;
      //console.log('[AutoConfig] fileURL:', fileURL);
      // Note: Use the last modified date to prevent the use of the previous cache.
      
/**   // a. import method at startup ------------------------------------------
      Components.utils.import(fileURL);
/**/  // b. sub-script method at startup --------------------------------------
      const principal = Services.scriptSecurityManager.getSystemPrincipal();
      const sandbox = Components.utils.Sandbox(principal, {
        freshZone: true,
        sandboxName: 'userChrome.js',
        wantComponents: true,
        wantExportHelpers: false,
        wantGlobalProperties: ['ChromeUtils'],
        wantXrays: true,
      });
      Services.scriptloader.loadSubScript(fileURL, sandbox);
/**   // c. sub-script method at window load ----------------------------------
      const onLoad = (event) => {
        const doc = event.originalTarget;
        const win = doc && doc.defaultView;
        if (!(win && 'isChromeWindow' in win)) { return; }
        if (!(win.location.protocol == 'chrome:' || win.location.protocol == 'about:')) { return; }
        Services.scriptloader.loadSubScript(fileURL, win);
      };
      Services.obs.addObserver((subject, topic, data) => {
        const win = subject;
        if (!(win && 'isChromeWindow' in win)) { return; }
        win.addEventListener('load', onLoad, {capture:true, passive:true});
      }, 'domwindowopened', false);
/**/  // ----------------------------------------------------------------------
    } else {
      Components.utils.reportError('[AutoConfig] file not found. ('+file.path+')');
    }
  } catch (e) { Components.utils.reportError(e); }
  // Note: To avoid displaying a dialog when an error occurs, enclose it in try catch.
  //       If an error occurs, the process will be aborted without outputting a dialog.
  //       Errors are output to the development tools.
})();
