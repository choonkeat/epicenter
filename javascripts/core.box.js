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
var Box = function(atitle, aurl, aremovable, asince_id, aread_id) {
  console.log("Box.new", arguments);
  this.title = atitle;
  this.element_id = atitle.replace(/\W+/g, '-');
  var suffix = "";
  while (jQuery('#' + this.element_id + suffix).length > 0) {
    suffix = (suffix * 1) + 1;
  }
  this.element_id = this.element_id + suffix;
  this.url = aurl;
  this.removable = (aremovable && aremovable != "false");
  this.since_id = asince_id;
  this.read_id = aread_id;
  this.json = [];
}

Box.prototype.ele = function() {
  return jQuery('#' + this.element_id);
}

Box.prototype.read_button = function() {
  return jQuery('button.read', this.ele());
}

Box.prototype.remove_button = function() {
  return jQuery('button.remove', this.ele());
}

Box.prototype.create = function() {
  var that = this;
  config.root.append(config.box_html.supplant({element_id: this.element_id, title: this.title}));
  if (! this.removable) {
    this.remove_button().remove();
  } else {
    this.remove_button().click(function(event) {
      event.preventDefault();
      event.stopPropagation();
      config.unload(that.url);
    });
  }

  this.read_button().click(function(event) {
    event.preventDefault();
    event.stopPropagation();
    if (jQuery('ol li.unread', that.ele()).length > 0) {
      jQuery('ol li', that.ele()).removeClass('unread', 'slow');
      that.mark_read();
    } else {
      jQuery('ol li', that.ele()).addClass('unread');
      that.mark_read('');
    }
  });

  that.ol = jQuery('#' + that.element_id + ' ol');
  that.add_item = function(new_item) {
    if (that.last_inserted) {
      that.last_inserted.after(new_item);
    } else if (that.ol.children()[0]) {
      that.ol.prepend(new_item);
    } else {
      that.ol.append(new_item);
    }
    that.last_inserted = new_item;
    return new_item;
  }
}

Box.prototype.mark_read = function(some_id) {
  if (some_id != null) {
    this.read_id = some_id;
  } else if (this.json && this.json[0]) {
    this.read_id = this.json[0].id;
  }
  config.set_cookie();
}

Box.prototype.mark_since = function(some_id) {
  if (some_id) {
    this.since_id = some_id;
  } else if (this.json && this.json[0]) {
    this.since_id = this.json[0].id;
  }
  config.set_cookie();
}

Box.prototype.load = function() {
  var that = this;
  if (! that.url) return;
  var first_load = (!that.ele()[0]);
  var composite_url = that.url;
  if (first_load) {
    console.log("create", that.url);
    that.create();
  } else if (that.since_id) {
    composite_url += '&since_id=' + that.since_id;
  } else if (that.read_id) {
    composite_url += '&since_id=' + that.read_id;
  }
  jQuery.getJSON(composite_url, function(json) {
    json = ((json && json.results) || json);
    json.unshift(0, 0);
    that.json.splice.apply(that.json, json);
    that.json.splice(settings.max_json);
    that.last_inserted = null;
    $(json.splice(2)).each(function() { that.render_tweet.apply(that, arguments); } );
    jQuery('li:gt(19)', that.ol).remove();
    jQuery('li .ago', that.ol).each(function(index, link) { jQuery(link).html(that.time_ago(link.title)); });
    that.mark_since();
    if (that.read_id) jQuery('li.tweet-' + that.read_id, that.ol).removeClass('unread').nextAll().removeClass('unread');
  });
}

Box.prototype.unload = function() {
  this.remove_button().unbind('click');
  this.ele().remove();
}

Box.prototype.time_ago = function(str) {
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

Box.prototype.render_tweet = function(index, item) {
  var that = this;
  item.created_at_ago = '#';
  if (! item.user) item.user = { screen_name: item.from_user, name: item.from_user }
  var new_item = jQuery(config.tweet_html.supplant(item).supplant(item.user));
  that.add_item(new_item);
  item.html_element = new_item[0];
  if (! item.source) jQuery('.source', new_item).remove();
}

Box.add_before_hook = function(hook) {
  var old_method = Box.prototype.render_tweet;
  Box.prototype.render_tweet = function() {
    hook.apply(this, arguments);
    return old_method.apply(this, arguments);
  }
}

Box.add_after_hook = function(hook) {
  var old_method = Box.prototype.render_tweet;
  Box.prototype.render_tweet = function() {
    var value = old_method.apply(this, arguments);
    hook.apply(this, arguments);
    return value;
  }
}
