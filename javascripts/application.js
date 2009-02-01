// thanks http://javascript.crockford.com/remedial.html
String.prototype.supplant = function (o) {
  return this.replace(/{([^{}]*)}/g, function (a, b) {
    var r = o[b]; return typeof r === 'string' || typeof r === 'number' ? r : a;
  });
};
if (!window.console) window.console = { log: function() {} };
var config = new TweetCfg();
config.get_cookie();
config.refresh(60 * 1000);
window.onbeforeunload = function (evt) {
  config.set_cookie();
  return null;
}
