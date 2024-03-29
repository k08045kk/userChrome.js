// skip first line
// see https://support.mozilla.org/en-US/kb/customizing-firefox-using-autoconfig

/**
 * @name          config.js
 *                install/config.js
 * @description   Use the AutoConfig method to load userChrome.js.
 * @charset       UTF-8
 * @author        toshi (https://github.com/k08045kk)
 + @license       MIT License | https://opensource.org/licenses/MIT
 * @compatibility 115+ (Firefox / Thunderbird)
 *                It supports the latest ESR.
 * @version       0.6
 * @since         0.1 - 20211104 - First edition
 * @since         0.2 - 20211122 - Second edition
 * @since         0.3 - 20230608 - Third edition
 * @since         0.4 - 20230724 - Fourth edition
 * @since         0.5 - 20230902 - Fifth edition
// @since         0.6 - 20240225 - fix console is not defined
 * @see           https://github.com/k08045kk/userChrome.js
 */
(function() {
  // Note: To avoid character encoding problems, only ASCII codes are used in this file.
  // Note: Use the same filename as config.js as the other userChrome.js AutoConfig methods.
  //       This also has the effect of overwriting files that are no longer needed.
  //       This is also the case for config-pref.js.
  
  try {
    const debug = (msg) => {
      Components.classes["@mozilla.org/consoleservice;1"]
                .getService(Components.interfaces.nsIConsoleService)
                .logStringMessage(msg);
      // Firefox 123: console.log(): Error: console is not defined
    };
    
    // 1. Initalize
    //const {Services} = Components.utils.import('resource://gre/modules/Services.jsm');
    // Note: Supports v117 (Supports deletion of Services.jsm)
    //       Doesn't work on esr102.
    
    //const {console} = Components.utils.import('resource://gre/modules/Console.jsm');
    //debug('[AutoConfig] console debug: v0.6 (config.js)');
    //debug('[AutoConfig] globalThis', globalThis);
    
    if (Services.appinfo.inSafeMode) {
      //debug('[AutoConfig] safe mode.');
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
      //debug('[AutoConfig] fileURL:', fileURL);
      // Note: Use the last modified date to prevent the use of the previous cache.
      
/**   // a. import method at startup ------------------------------------------
      Components.utils.import(fileURL);
      
      // Note: Can be loaded from the chrome/resource path.
      //       see https://w.atwiki.jp/fxext/pages/56.html
/**/  // b. sub-script method at startup --------------------------------------
      const principal = Services.scriptSecurityManager.getSystemPrincipal();
      const options = {
        freshZone: true,
        sandboxName: 'userChrome.js',
        wantComponents: true,
        wantExportHelpers: false,
        wantGlobalProperties: [],
        wantXrays: true,
      };
      const sandbox = Components.utils.Sandbox(principal, options);
      Services.scriptloader.loadSubScript(fileURL, sandbox);
/**   // c. sub-script method at window load ----------------------------------
      const onLoad = function(event) {
        const doc = event.originalTarget;
        const win = doc && doc.defaultView;
        if (!(win && 'isChromeWindow' in win)) { return; }
        if (!(win.location.protocol == 'chrome:' || win.location.protocol == 'about:')) { return; }
        Services.scriptloader.loadSubScript(fileURL, win);
      };
      Services.obs.addObserver(function(subject, topic, data) {
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
