/*
 * You'd need to implement your own server-side component, and configure it
 * like settings.urls.big_url = "http://myserver.com/bigurls?url={query}"
 *
 * For example, in Rails:
 *  url = URI.parse(params[:url])
 *  res = Net::HTTP.start(url.host, url.port) {|http|
 *    http.get([url.path, url.query].compact.join('?'), "User-Agent" => request.user_agent)
 *  }
 *  render :text => res['location']
 */
(function() {
  function bigurl_onhover(event) {
    var link = this;
    if (!link.title && link.href && link.href.match(/(is\.gd|tinyurl\.com|bit\.ly|snipurl\.com)\//)) {
      $.get(settings.urls.big_url.supplant({query: encodeURIComponent(link.href)}), function(expanded_url) {
        link.href = link.title = expanded_url;
        var match = expanded_url.match(/^\w+\:\/\/(.+)$/);
        if (match[1]) link.innerHTML = '&raquo;' + match[1].substring(0, link.innerHTML.length-4) + '&laquo;';
      });
    }
  }
  $('.box .message a').live('mouseover', bigurl_onhover);
})();