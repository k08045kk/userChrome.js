// skip first line
// see https://support.mozilla.org/en-US/kb/customizing-firefox-using-autoconfig

/**
 * @name          config.js
 *                install/config.js
 * @description   Use the AutoConfig method to load userChrome.js.
 *                userChrome.js will be loaded only once at startup.
 * @charset       UTF-8
 * @author        toshi (https://github.com/k08045kk)
 + @license       MIT License | https://opensource.org/licenses/MIT
 * @compatibility 91+ (Firefox / Thunderbird)
 *                It supports the latest ESR.
 * @version       0.1
 * @since         0.1 - 20211104 - First edition
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
      // Note: Extensions will not work in Safe Mode, and ChromeScript should not work either.
    }
    
    
    // 2. Load userChrome.js at startup
    const file = Services.dirsvc.get('UChrm', Components.interfaces.nsIFile);
    file.append('userChrome.js');
    if (file.exists() && file.isFile() && file.isReadable()) {
      const fileURL = Services.io.getProtocolHandler('file')
                                 .QueryInterface(Components.interfaces.nsIFileProtocolHandler)
                                 .getURLSpecFromActualFile(file) + '?' + file.lastModifiedTime;
      //const fileURL = Services.io.newFileURI(file).spec + '?' + file.lastModifiedTime;
      //console.log('[AutoConfig] fileURL:', fileURL);
      // Note: Use the last modified date to prevent the use of the previous cache.
      
 /*   // a. import method -----------------------------------------------------
      Components.utils.import(fileURL);
 /*/  // b. sub-script method -------------------------------------------------
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
//*/  // ----------------------------------------------------------------------
    }
  } catch (e) { Components.utils.reportError(e); }
  // Note: To avoid displaying a dialog when an error occurs, enclose it in try catch.
  //       If an error occurs, the process will be aborted without outputting a dialog.
  //       Errors are output to the development tools.
})();
