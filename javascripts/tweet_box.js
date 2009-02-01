/*
  Epicenter Javascript library
  Copyright (C) 2009 Chew Choon Keat

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
var TweetBox = function(atitle, aurl, aremovable, asince_id, aread_id) {
  console.log("TweetBox.new", arguments);
  this.title = atitle; this.element_id = atitle.replace(/\W+/, '-');
  this.url = aurl;
  this.removable = (aremovable && aremovable != "false");
  this.since_id = null; // asince_id;
  this.read_id = aread_id;
}

TweetBox.prototype.ele = function() {
  return jQuery('#' + this.element_id);
}

TweetBox.prototype.read_button = function() {
  return jQuery('button.read', this.ele());
}

TweetBox.prototype.remove_button = function() {
  return jQuery('button.remove', this.ele());
}

TweetBox.prototype.create = function() {
  var that = this;
  config.root.append(config.box_html.supplant({element_id: this.element_id, title: this.title}));
  this.ele().click(function(event) {
    var li = jQuery(event.target).parents('li');
    if (li.length < 1) li = jQuery(event.target);
    li.children('.link a').click();
  });
  if (! this.removable) {
    this.remove_button().remove();
  } else {
    this.remove_button().click(function(event) {
      event.preventDefault();
      config.unload(that.url);
    });
  }
  
  this.read_button().click(function(event) {
    event.preventDefault();
    that.mark_read();
    if (jQuery('ol li.unread', that.ele()).length > 0) {
      // jQuery('ol li:visible:lt(10)', that.ele()).removeClass('unread', 'slow');
      jQuery('ol li', that.ele()).removeClass('unread', 'slow');
    } else {
      jQuery('ol li', that.ele()).toggleClass('unread');
    }
  });
}

TweetBox.prototype.mark_read = function(some_id) {
  if (some_id) {
    this.read_id = some_id;
  } else if (this.json && this.json[0]) {
    this.read_id = this.json[0].id;
  }
}

TweetBox.prototype.mark_since = function(some_id) {
  if (some_id) {
    this.since_id = some_id;
  } else if (this.json && this.json[0]) {
    this.since_id = this.json[0].id;
  }
}

TweetBox.prototype.load = function(everything) {
  var that = this;

  if (! that.ele()[0]) that.create();
  var ol = jQuery('ol', that.ele());
  var composite_url = that.url + (that.url.match(/\?/) ? '&' : '?') + 'callback=?';
  composite_url += '&count=190';
  if (everything) {
    // no limit
    ol.html("");
  } else if (that.since_id) {
    composite_url += '&since_id=' + that.since_id;
  // } else if (that.read_id) {
  //   composite_url += '&since_id=' + that.read_id;
  }
  console.log("load", this.title, composite_url);
  jQuery.getJSON(composite_url, function(json) {
    window.last_json = json; // debug
    json = ((json && json.results) || json);
    if (! json[0]) return;
    that.json = json;
    $(that.json).each(function(index, ele) {
      ele.created_at_ago = '#';
      if (ele.source) ele.source = ele.source.replace(/^<a /, '<a target="_blank" ');
      ele.text = ele.text.replace(/(\w+:\/\/\S+)/, '<a href="$1" target="_blank">$1</a>');
      if (ele.in_reply_to_screen_name) {
        // link to reply or profile, based on api data
        var replace_with = (ele.in_reply_to_status_id ? config.status_link : config.profile_link).supplant({
          name:ele.in_reply_to_screen_name,
          id: (ele.in_reply_to_status_id || '')
        });
        ele.text = ele.text.replace('@' + ele.in_reply_to_screen_name, replace_with);
      } else {
        // no api info, guesstimating
        ele.text = ele.text.replace(/(@(\w+))/, config.profile_link.supplant({ name: "$2"}));
      }
      
      if (! ele.user) ele.user = { screen_name: ele.from_user, name: ele.from_user }
      var new_ele = jQuery(config.tweet_html.supplant(ele).supplant(ele.user));
      if (that.since_id) {
        ol.prepend(new_ele);
      } else {
        ol.append(new_ele);
      }
      if (! ele.source) jQuery('.source', new_ele).remove();
      if (ele.in_reply_to_status_id) {
        setTimeout(function() {
          var in_reply_to = jQuery('.tweet-' + ele.in_reply_to_status_id, ol);
          if (in_reply_to.length > 0) {
            in_reply_to.append(new_ele);
          }
        }, 500);
      }
    }); // end json.each
    jQuery('li:gt(19)', ol).remove();
    jQuery('li .ago', ol).each(function(index, link) { jQuery(link).html(that.time_ago(link.title)); });
    that.mark_since();
    if (that.read_id) jQuery('li.tweet-' + that.read_id, ol).removeClass('unread').nextAll().removeClass('unread');
  });
}

TweetBox.prototype.unload = function() {
  this.remove_button().unbind('click');
  this.ele().remove();
}

TweetBox.prototype.time_ago = function(str) {
  function quantity(num, unit) {
    return parseInt(num) + " " + unit + (num >= 2 ? "s" : "");
  }
  var diff_minutes = ((new Date()).getTime() - Date.parse(str)) / 1000 / 60;
  if (diff_minutes < 1) {
    return "moments ago";
  } else if (diff_minutes < 60) {
    return quantity(diff_minutes, "minute") + ' ago';
  } else if (diff_minutes < 1440) {
    return quantity((diff_minutes / 60), "hour") + ' ago';
  } else if (diff_minutes < 43200) {
    return quantity((diff_minutes / 1440), "day") + ' ago';
  } else {
    return quantity((diff_minutes / 43200), "month") + ' ago';
  }
}
