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
var TweetCfg = function(options) {
  this.active_boxes = [];
  this.active_boxes_hash = {};
  this.box_html =
  "<div id='{element_id}' class='box'>\n  <h2>\n    {t" +
  "itle}\n    <button class=\"read\">mark all read</bu" +
  "tton>\n    <button class=\"remove\">close</button>" +
  "\n  </h2>\n  <ol></ol>\n</div>";
  this.tweet_html =
  "<li class=\"tweet tweet-{id} unread\">\n  <div clas" +
  "s=\"author\">\n    <img src=\"{profile_image_url}\"" +
  " />\n  </div>\n  <div class=\"name\" title=\"{name}" +
  " : {description}\">\n    <a target=\"_blank\" href=" +
  "\"http://twitter.com/{screen_name}\">\n      {scree" +
  "n_name}\n    </a>\n  </div>\n  <div class=\"message" +
  "\">\n    {text}\n  </div>\n  <div class=\"link\">\n" +
  "    <a target=\"_blank\" href=\"http://twitter.com/" +
  "{screen_name}/status/{id}\" class=\"ago\" title=\"{" +
  "created_at}\">\n      {created_at_ago}\n    </a>\n " +
  " </div>\n  <div class=\"source\">\n    via {source}" +
  "\n  </div>\n</li>";
  this.status_link =
  "<a href=\"http://twitter.com/{name}/statuses/{id}\"" +
  " target=\"_blank\">@{name}</a>";
  this.profile_link =
  "<a href=\"http://twitter.com/{name}\" target=\"_bla" +
  "nk\">@{name}</a>";
  this.root = jQuery('#content');

  var that = this;
  jQuery("#configuration input[type='checkbox']").change(function(event) {
    var checkbox = event.target;
    if (checkbox.checked) {
      that.load_box(that.add_box(checkbox.name, checkbox.title, false)); 
    } else {
      that.unload(checkbox.title);
    }
  });
  jQuery("#search_button").click(function(event) {
    event.preventDefault();
    that.load_box(that.add_box("Search: " + jQuery('#search').val(), jQuery('#search')[0].title + encodeURIComponent(jQuery('#search').val()), true));
  });
  jQuery("#group_button").click(function(event) {
    event.preventDefault();
  });
  jQuery('.configure').click(function() { jQuery("#configuration").toggle('fast'); });
}

TweetCfg.prototype.add_box = function(atitle, aurl, aremovable, asince_id, aread_id) {
  var new_box = null;
  jQuery(this.active_boxes).each(function(index, old_box) {
    if (old_box.url == aurl) new_box = old_box
  });
  if (!new_box) {
    new_box = new TweetBox(atitle, aurl, aremovable, asince_id, aread_id);
    this.active_boxes.push(new_box);
    this.active_boxes_hash[new_box.element_id] = new_box;
    jQuery("#configuration input[name='" + new_box.element_id + "']").each(function(index, checkbox) {
      checkbox.checked = true;
    });
  }
  this.set_cookie();
  return new_box;
}

TweetCfg.prototype.unload = function(box_url) {
  var box_index = null;
  jQuery(this.active_boxes).each(function(index, cfg) {
    if (cfg.url == box_url) box_index = index;
  });
  if (box_index != null) {
    var box = this.active_boxes[box_index];
    box.unload();
    this.active_boxes.splice(box_index, 1);
    this.active_boxes_hash[box.element_id] = null;
  }
  this.set_cookie();
}

TweetCfg.prototype.load_box = function(box) {
  // http://apiwiki.twitter.com/REST+API+Documentation#RateLimiting
  var max_msec = 3600 * 1000;
  var max_count = 100;
  
  var now = new Date();
  if (! this.calls) this.calls = [now];
  while ((now - this.calls[this.calls.length-1]) > max_msec) {
    var old = this.calls.pop();
    console.log("popped old: ", old, this.calls.length);
  }
  if (this.calls.length < max_count) {
    this.calls.push(now);
    box.load();
  } else {
    console.log("throttling", this.calls[this.calls.length-1]);
  }
}

TweetCfg.prototype.refresh = function(interval) {
  var that = this;
  jQuery(this.active_boxes).each(function(index, box) {
    that.load_box(box);
  });
  if (interval) {
    that.refresh_timeout = setTimeout(function() { that.refresh(interval); }, interval);
  }
}

TweetCfg.prototype.set_cookie = function() {
  var cookie_array = []
  jQuery(this.active_boxes).each(function(index, box) {
    cookie_array.push([box.title, box.url, box.removable, box.since_id, box.read_id].join('>'));
  })
  jQuery.cookie('little_boxes', cookie_array.join('<'), { expires: 365 });
}

TweetCfg.prototype.get_cookie = function() {
  var that = this;
  var rows = jQuery.cookie('little_boxes');
  if (rows) jQuery.each(rows.split('<'), function(index, row) {
    var values = row.split('>');
    that.add_box.apply(that, values);
  });
}
