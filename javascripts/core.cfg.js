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
var Cfg = function(options) {
  options = options || {};
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
  "\"http://twitter.com/{screen_name}\">{screen_name}<" +
  "/a>\n  </div>\n  <div class=\"message\">{text}</div" +
  ">\n  <div class=\"link\">\n    <a target=\"_blank\"" +
  " href=\"http://twitter.com/{screen_name}/status/{id" +
  "}\" class=\"ago\" title=\"{created_at}\">\n      {c" +
  "reated_at_ago}\n    </a>\n  </div>\n  <div class=\"" +
  "source\">\n    via {source}\n  </div>\n</li>";
  this.status_link =
  "<a href=\"http://twitter.com/{name}/statuses/{id}\"" +
  " target=\"_blank\">@{name}</a>";
  this.profile_link =
  "<a href=\"http://twitter.com/{name}\" target=\"_bla" +
  "nk\">@{name}</a>";
  this.root = jQuery(options.root || '#content');

  var that = this;
  jQuery("#configuration input[type='checkbox']").click(function(event) {
    var checkbox = event.target;
    if (checkbox.checked) {
      that.add_box(checkbox.name, settings.urls[checkbox.id], false).load();
    } else {
      jQuery.log("Unload ", settings.urls[checkbox.id]);
      that.unload(settings.urls[checkbox.id]);
    }
  });
  jQuery("#search_button").click(function(event) {
    event.preventDefault(); event.stopPropagation();
    var field = jQuery('input', jQuery(this).parents('dl'))[0];
    var box = that.add_box("Search: " + field.value, settings.urls.search_url.supplant({query: encodeURIComponent(field.value)}), "removable");
    box.load();
  });
  jQuery("#group_button").click(function(event) {
    event.preventDefault(); event.stopPropagation();
    var field = jQuery('input', jQuery(this).parents('dl'))[0];
    var custom_query = 'from:' + jQuery('#screennames').val().replace(/[,\s]+$/, '').split(/[,\s]+/).join(' OR from:');
    var box = that.add_box(field.value, settings.urls.search_url.supplant({query: encodeURIComponent(custom_query)}), "removable");
    box.load();
  });
  jQuery('.configure').click(function() { 
    (jQuery("#configuration:visible")[0] ? $(this).html("show settings") : $(this).html("hide settings"));
    jQuery("#configuration").toggle('fast');
  });
  jQuery('#save_settings').click(function(event) {
    event.preventDefault(); event.stopPropagation();
    that.with_twitter_id(function(user_id, user_login) {
      that.save_user(user_id, user_login, jQuery('#save_settings_name').val());
      jQuery('#load_settings_name').val(jQuery('#save_settings_name').val());
      window.location.hash = jQuery('#save_settings_name').val();
    });
  });
  jQuery('#load_settings').click(function(event) {
    event.preventDefault(); event.stopPropagation();
    that.with_twitter_id(function(user_id, user_login) {
      that.load_user(user_id, user_login, jQuery('#load_settings_name').val());
      jQuery('#save_settings_name').val(jQuery('#load_settings_name').val());
      window.location.hash = jQuery('#load_settings_name').val();
    });
  });
  var match = window.location.hash.match(/^#(.+)$/);
  if (match) jQuery('#load_settings_name,#save_settings_name').val(match[1]);
  jQuery('#screennames,#group').focus(function() {
    if (! that.friends_names) {
      that.friends_names = [];
      jQuery.getJSON(settings.urls.friends_url, function(json) {
        jQuery(json).each(function(index, ele) { that.friends_names.push(ele.screen_name); });
        that.set_autocomplete(that.friends_names, "undo");
        var field = jQuery('#screennames')[0];
        if (document.activeElement == field) { field.blur(); field.focus(); }
      });
    }
  });
  jQuery('#clear_button').click(function() {
    if (confirm("This removes ALL standard, searches & groups sections. Proceed?")) {
      jQuery.cookie('little_boxes', null, { expires: 365 });
      window.location.reload(true);
    }
  });
}

Cfg.prototype.with_twitter_id = function(callback_fn) {
  jQuery.getJSON(settings.urls.user_timeline_url, function(json) {
    jQuery.log("with_twitter_id = ", json);
    callback_fn(json[0].user.id, json[0].user.screen_name);
  });
}

Cfg.prototype.save_user = function(user_id, user_login, secret) {
  var that = this;
  var data = { settings: jQuery.cookie('little_boxes'), secret: secret };
  jQuery.post(settings.urls.user_save_url.supplant({screen_name: user_login}), data, function(json) {
    jQuery.log("json = ", json);
    if (! json.user) alert("Oops, there were problems saving your settings " + json.error);
    jQuery('.configure').click();
  }, 'json');
}

Cfg.prototype.load_user = function(user_id, user_login, secret) {
  var that = this;
  jQuery.getJSON(settings.urls.user_load_url.supplant({screen_name: user_login, secret: secret}), function(json) {
    jQuery.log("json = ", json);
    if (json.user) {
      clearTimeout(that.refresh_timeout);
      jQuery(that.active_boxes).each(function(index, cfg) { that.unload(cfg.url); });
      that.get_cookie(json.user.settings);
      that.refresh(settings.refresh);
      jQuery('.configure').click();
    } else {
      alert("Oops, there were problems loading your settings " + json.error);
    }
  });
}

Cfg.prototype.set_autocomplete = function(new_array, undo_earlier) {
  if (undo_earlier) jQuery('#screennames').unautocomplete();
  jQuery.log("set autocomplete", new_array.length, new_array);
  $("#screennames").autocomplete(new_array, {
    multiple: true,
    mustMatch: false,
    matchContains: true,
    autoFill: true
  });
}

Cfg.prototype.add_box = function(atitle, aurl, aremovable, asince_id, aread_id) {
  var new_box = null;
  jQuery(this.active_boxes).each(function(index, old_box) {
    if (old_box.url == aurl) new_box = old_box
  });
  if (!new_box) {
    new_box = new Box(atitle, aurl, aremovable, asince_id, aread_id);
    this.active_boxes.push(new_box);
    this.active_boxes_hash[new_box.element_id] = new_box;
    jQuery("#configuration input[name='" + new_box.element_id + "']").each(function(index, checkbox) {
      checkbox.checked = true;
    });
  }
  this.set_cookie();
  return new_box;
}

Cfg.prototype.unload = function(box_url) {
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

Cfg.prototype.autofit_width = function() {
  var that = this;
  var len = jQuery('div.box').length;
  if (len > 2) jQuery('div.box').css({ width: ((100 / len) - 2)  + '%' });
  var maxheight = 0;
  jQuery('div.box h2').
    css({height: ''}).
    each(function(index, h2) {
      var newheight = jQuery(h2).height();
      maxheight = (maxheight > newheight ? maxheight : newheight);
    }).
    css({height: maxheight + 'px'});
}

Cfg.prototype.refresh = function(interval) {
  var that = this;
  if (that.refresh_timeout) clearTimeout(that.refresh_timeout);
  jQuery(this.active_boxes).each(function(index, box) {
    setTimeout(function() { box.load(); }, index * 2000);
  });
  var now = new Date();
  jQuery("#last_updated_at").html(
    "Last updated: " +
    (now.getHours() < 10 ? '0' : '') + now.getHours() + ":" +
    (now.getMinutes() < 10 ? '0' : '') + now.getMinutes()
  );
  that.refresh_timeout = setTimeout(function() { that.refresh(interval); }, (this.active_boxes.length * 2000) + interval);
}

Cfg.prototype.set_cookie = function() {
  var cookie_array = []
  jQuery(this.active_boxes).each(function(index, box) {
    cookie_array.push([box.title, box.url, box.removable, box.since_id, box.read_id].join('>'));
  })
  jQuery.cookie('little_boxes', cookie_array.join('<'), { expires: 365 });
  jQuery.log("cookie set:", cookie_array.join('<'));
}

Cfg.prototype.get_cookie = function(some_cookie) {
  var that = this;
  var rows = (some_cookie || jQuery.cookie('little_boxes'));
  jQuery.log("cookie get:", rows);
  if (rows) jQuery.each(rows.split('<'), function(index, row) {
    var values = row.split('>');
    that.add_box.apply(that, values);
  });
}
