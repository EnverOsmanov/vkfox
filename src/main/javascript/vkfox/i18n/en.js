(function(g){
var i18n = {lc:{"en":function(n){return n===1?"one":"other"},"ru":function(n){
  if ((n % 10) == 1 && (n % 100) != 11) {
    return 'one';
  }
  if ((n % 10) >= 2 && (n % 10) <= 4 &&
      ((n % 100) < 12 || (n % 100) > 14) && n == Math.floor(n)) {
    return 'few';
  }
  if ((n % 10) === 0 || ((n % 10) >= 5 && (n % 10) <= 9) ||
      ((n % 100) >= 11 && (n % 100) <= 14) && n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"uk":function(n){
  if ((n % 10) == 1 && (n % 100) != 11) {
    return 'one';
  }
  if ((n % 10) >= 2 && (n % 10) <= 4 &&
      ((n % 100) < 12 || (n % 100) > 14) && n == Math.floor(n)) {
    return 'few';
  }
  if ((n % 10) === 0 || ((n % 10) >= 5 && (n % 10) <= 9) ||
      ((n % 100) >= 11 && (n % 100) <= 14) && n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
}},
c:function(d,k){if(!d)throw new Error("MessageFormat: Data required for '"+k+"'.")},
n:function(d,k,o){if(isNaN(d[k]))throw new Error("MessageFormat: '"+k+"' isn't a number.");return d[k]-(o||0)},
v:function(d,k){i18n.c(d,k);return d[k]},
p:function(d,k,o,l,p){i18n.c(d,k);return d[k] in p?p[d[k]]:(k=i18n.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){i18n.c(d,k);return d[k] in p?p[d[k]]:p.other}};
i18n["en"] = {
"chat":function(d){return "chat"},
"news":function(d){return "news"},
"buddies":function(d){return "buddies"},
"my":function(d){return "my"},
"friends_nominative":function(d){return "friends"},
"groups_nominative":function(d){return "groups"},
"Private message":function(d){return "Private message"},
"Wall post":function(d){return "Wall post"},
"Search":function(d){return "First or last name"},
"Male":function(d){return "Male"},
"Female":function(d){return "Female"},
"Offline":function(d){return "Offline"},
"Bookmarked":function(d){return "Bookmarked"},
"Monitor online status":function(d){return "Monitor online status"},
"Mark as read":function(d){return "Mark as read"},
"Your message wasn't read":function(d){return "Your message wasn't read"},
"Like":function(d){return "Like"},
"Show history":function(d){return "Show history"},
"Open in New Tab":function(d){return "Open in New Tab"},
"unsubscribe":function(d){return "unsubscribe"},
"more...":function(d){return "more"},
"Comment":function(d){return "Comment"},
"Liked":function(d){return "Liked"},
"Reposted":function(d){return "Reposted"},
"New friends:":function(d){return "New friends:"},
"started following you":function(d){return "started following you"},
"friend request accepted":function(d){return "friend request accepted"},
"sent a message":function(d){return i18n.v(d,"NAME")+" sent a message"},
"is online":function(d){return "is online"},
"is_online_short":function(d){return "appeared"},
"went offline":function(d){return "went offline"},
"went_offline_short":function(d){return "went"},
"left a comment":function(d){return i18n.v(d,"NAME")+" left a comment"},
"mentioned you":function(d){return "mentioned you"},
"posted on your wall":function(d){return "posted on your wall"},
"liked your comment":function(d){return "liked your comment"},
"liked your post":function(d){return "liked your post"},
"liked your photo":function(d){return "liked your photo"},
"liked your video":function(d){return "liked your video"},
"shared your post":function(d){return "shared your post"},
"shared your photo":function(d){return "shared your photo"},
"shared your video":function(d){return "shared your video"},
"notifications":function(d){return "notifications"},
"force online":function(d){return "Be always online"},
"sound":function(d){return "sound"},
"signal":function(d){return "signal"},
"volume":function(d){return "volume"},
"popups":function(d){return "popups"},
"show text":function(d){return "show message text"},
"show all":function(d){return "show all"},
"hide":function(d){return "show less"},
"Yandex search":function(d){return "Yandex search"},
"install_noun":function(d){return "install"},
"install_verb":function(d){return "install"},
"skip":function(d){return "skip"},
"login":function(d){return "login"},
"accept":function(d){return "accept"},
"no":function(d){return "no"},
"close":function(d){return "close"},
"Authorize VKfox with Vkontakte":function(d){return "First you need to authorize VKfox to connect with VK.COM™. If you are doing this for the first time you will be asked to grant access to your account."},
"Accept license agreement":function(d){return "By installing this application you agree to all terms, conditions, and information of the <a anchor='http://vkfox.io/license'>license agreement.</a>"},
"Install Yandex search":function(d){return "Please consider supporting future development of VKfox by installing Yandex search."},
"Thank you!":function(d){return "Thank you, installation is complete! Now this window can be closed."}};
return g["i18n"] = i18n;
})(this);