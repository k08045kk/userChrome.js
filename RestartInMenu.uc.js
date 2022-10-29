// ==UserScript==
// @name          RestartInMenu.uc.js
// @description   Restart from the menu (main menu / app menu).
// @include       main
// @charset       UTF-8
// @author        toshi (https://github.com/k08045kk)
// @license       MIT License | https://opensource.org/licenses/MIT
// @compatibility 78+
// @version       0.4
// @since         0.1 - 20210924 - 初版
// @since         0.2 - 20210926 - Thunderbird対応
// @since         0.3 - 20210926 - リファクタリング
// @since         0.4 - 20211031 - Firefox78対応
// @see           https://github.com/k08045kk/userChrome.js
// @see           https://www.bugbugnow.net/2021/09/firefox-restart-in-menu.html
// ==/UserScript==

(() => {
  // -------------------- config --------------------
  const MENU_ITEM_LABEL_NAME = 'Restart';
  // --------------------/config --------------------
  
  
  const cmd_restart = (event) => {
    // see chrome://global/content/aboutProfiles.js
    const Ci = Components.interfaces;
    const flags = Ci.nsIAppStartup.eRestart | Ci.nsIAppStartup.eAttemptQuit;
    Services.startup.quit(flags);
  };
  
  // File menu (Main menu)
  try {
    let filemenu = document.getElementById('menu_FileRestartItem');
    const filequit = document.getElementById('menu_FileQuitItem');
    if (filemenu == null && filequit) {
      filemenu = document.createXULElement('menuitem');
      filemenu.setAttribute('id', 'menu_FileRestartItem');
      filemenu.setAttribute('label', MENU_ITEM_LABEL_NAME);
      filemenu.setAttribute('accesskey', 'r');
      filemenu.addEventListener('command', cmd_restart);
      
      filequit.parentNode.insertBefore(filemenu, filequit);
    }
  } catch (e) { Components.utils.reportError(e); }
  
  // App menu (Hamburger menu)
  try {
    const target = document.getElementById('appMenu-popup')            // Firefox91/Thunderbird91
                || document.getElementById('appmenu-popup');           // ???
    const observer = new MutationObserver((mutationsList, observer) => {
      let appmenu = document.getElementById('appMenu-restart-button');
      const appquit = document.getElementById('appMenu-quit-button2') // Firefox91
                   || document.getElementById('appMenu-quit-button')  // Firefox78
                   || document.getElementById('appMenu-quit')         // Thunderbird??
                   || document.getElementById('appmenu-quit');        // Thunderbird91
      if (appmenu == null && appquit) {
        appmenu = document.createXULElement('toolbarbutton');
        appmenu.setAttribute('id', 'appMenu-restart-button');
        appmenu.setAttribute('class', 'subviewbutton');
        appmenu.setAttribute('label', MENU_ITEM_LABEL_NAME);
        appmenu.addEventListener('command', cmd_restart);
        
        appquit.parentNode.insertBefore(appmenu, appquit);
        
        observer.disconnect();
      }
    });
    observer.observe(target, {attributes:true});
  } catch (e) { Components.utils.reportError(e); }
})();