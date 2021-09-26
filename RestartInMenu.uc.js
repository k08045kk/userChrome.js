// ==UserScript==
// @name          RestartInMenu.uc.js
// @description   Restart from the menu (main menu / app menu).
// @include       main
// @charset       UTF-8
// @author        toshi (https://github.com/k08045kk)
// @license       MIT License | https://opensource.org/licenses/MIT
// @compatibility 91+
// @version       0.2
// @since         0.1 - 20210924 - 初版
// @since         0.2 - 20210926 - Thunderbird対応
// @see           https://github.com/k08045kk/userChrome.js
// @see           https://www.bugbugnow.net/2021/09/firefox-restart-in-menu.html
// ==/UserScript==

(function() {
  // -- config --
  const MENU_ITEM_LABEL_NAME = 'Restart';
  
  
  
  const cmd_restart = function(event) {
    // Restart
    Services.startup.quit(Ci.nsIAppStartup.eRestart | Ci.nsIAppStartup.eAttemptQuit);
  };
  
  // File menu (Main menu)
  try {
    const filemenu = document.createXULElement('menuitem');
    filemenu.setAttribute('id', 'menu_FileRestartItem');
    filemenu.setAttribute('label', MENU_ITEM_LABEL_NAME);
    filemenu.setAttribute('accesskey', 'r');
    filemenu.addEventListener('command', cmd_restart);
    
    const filequit = document.getElementById('menu_FileQuitItem');
    filequit.parentNode.insertBefore(filemenu, filequit);
  } catch (e) {}
  
  // App menu (Hamburger menu)
  try {
    const observer = new MutationObserver(function(mutationsList, observer) {
      const appquit = document.getElementById('appMenu-quit-button2') // Firefox
                   || document.getElementById('appmenu-quit');        // Thunderbird
      if (appquit) {
        const appmenu = document.createXULElement('toolbarbutton');
        appmenu.setAttribute('id', 'appMenu-restart-button');
        appmenu.setAttribute('class', 'subviewbutton');
        appmenu.setAttribute('label', MENU_ITEM_LABEL_NAME);
        appmenu.addEventListener('command', cmd_restart);
        
        appquit.parentNode.insertBefore(appmenu, appquit);
        
        observer.disconnect();
      }
    });
    observer.observe(document.getElementById('appMenu-popup'), {attributes:true});
  } catch (e) {}
})();