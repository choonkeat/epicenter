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
    $('.message a', this).each(function(index, link) {
      if (!link.title && link.href && link.href.match(/(is\.gd|tinyurl\.com|bit\.ly|snipurl\.com|twurl\.nl|poprl\.com)\//)) {
        link.title = link.href;
        $.getJSON(settings.urls.big_url.supplant({query: encodeURIComponent(link.href)}), function(json) {
          link.href = link.title = json.tinyurl;
          var match = json.tinyurl.match(/^\w+\:\/\/(.+)$/);
          if (match[1]) link.innerHTML = '&raquo;' + match[1].substring(0, link.innerHTML.length-4) + '&laquo;';
        });
      }
    });
  }
  $('.box .tweet').live('mouseover', bigurl_onhover);
})();
