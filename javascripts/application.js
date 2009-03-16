if (!window.console) window.console = { log: function() {} };
var config = new Cfg();
config.get_cookie();
config.refresh(settings.refresh);
