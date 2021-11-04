// config-prefs.js
// install/defaults/pref/config-prefs.js
// see https://github.com/k08045kk/userChrome.js

// Use the AutoConfig function
// see https://support.mozilla.org/en-US/kb/customizing-firefox-using-autoconfig
pref("general.config.filename", "config.js");
pref("general.config.obscure_value", 0);

// Enable the sandbox (default: release:true / esr:false)
// see https://www.mozilla.org/en-US/firefox/62.0/releasenotes/
pref("general.config.sandbox_enabled", false);

