(function(){ window.i18n || (window.i18n = {}) 
var MessageFormat = { locale: {} };
MessageFormat.locale.ru = function (n) {
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
};

window.i18n["ru"] = {}
window.i18n["ru"]["Private message"] = function(d){
var r = "";
r += "Личное сообщение";
return r;
}
window.i18n["ru"]["Wall post"] = function(d){
var r = "";
r += "Сообщение на стене";
return r;
}
window.i18n["ru"]["Filters"] = function(d){
var r = "";
r += "Фильтры";
return r;
}
window.i18n["ru"]["Search"] = function(d){
var r = "";
r += "Имя или Фамилия";
return r;
}
window.i18n["ru"]["Male"] = function(d){
var r = "";
r += "Мужчины";
return r;
}
window.i18n["ru"]["Female"] = function(d){
var r = "";
r += "Женщины";
return r;
}
window.i18n["ru"]["Offline"] = function(d){
var r = "";
r += "Не в сети";
return r;
}
window.i18n["ru"]["Bookmarked"] = function(d){
var r = "";
r += "В закладках";
return r;
}
window.i18n["ru"]["Monitor online status"] = function(d){
var r = "";
r += "Следить за онлайн статусом";
return r;
}
window.i18n["ru"]["Mark as read"] = function(d){
var r = "";
r += "Отметить прочитанным";
return r;
}
window.i18n["ru"]["Like"] = function(d){
var r = "";
r += "Нравится";
return r;
}
window.i18n["ru"]["more..."] = function(d){
var r = "";
r += "далee...";
return r;
}
window.i18n["ru"]["Comment"] = function(d){
var r = "";
r += "Комментировать";
return r;
}
window.i18n["ru"]["Liked"] = function(d){
var r = "";
r += "Понравилось";
return r;
}
window.i18n["ru"]["Reposted"] = function(d){
var r = "";
r += "Поделился записью";
return r;
}
window.i18n["ru"]["New friends:"] = function(d){
var r = "";
r += "Новые друзья:";
return r;
}
window.i18n["ru"]["started following you"] = function(d){
var r = "";
r += "хочет добавить в друзья";
return r;
}
window.i18n["ru"]["sent a message"] = function(d){
var r = "";
if(!d){
throw new Error("MessageFormat: No data passed to function.");
}
r += d["NAME"];
r += " ";
if(!d){
throw new Error("MessageFormat: No data passed to function.");
}
var lastkey_1 = "GENDER";
var k_1=d[lastkey_1];
var off_0 = 0;
var pf_0 = { 
"male" : function(d){
var r = "";
r += "прислал";
return r;
},
"female" : function(d){
var r = "";
r += "прислала";
return r;
},
"other" : function(d){
var r = "";
r += "прислал";
return r;
}
};
r += (pf_0[ k_1 ] || pf_0[ "other" ])( d );
r += " сообщение";
return r;
}
window.i18n["ru"]["is online"] = function(d){
var r = "";
if(!d){
throw new Error("MessageFormat: No data passed to function.");
}
var lastkey_1 = "GENDER";
var k_1=d[lastkey_1];
var off_0 = 0;
var pf_0 = { 
"male" : function(d){
var r = "";
r += "появился";
return r;
},
"female" : function(d){
var r = "";
r += "появилась";
return r;
},
"other" : function(d){
var r = "";
r += "появился";
return r;
}
};
r += (pf_0[ k_1 ] || pf_0[ "other" ])( d );
r += " в сети";
return r;
}
window.i18n["ru"]["went offline"] = function(d){
var r = "";
if(!d){
throw new Error("MessageFormat: No data passed to function.");
}
var lastkey_1 = "GENDER";
var k_1=d[lastkey_1];
var off_0 = 0;
var pf_0 = { 
"male" : function(d){
var r = "";
r += "вышел";
return r;
},
"female" : function(d){
var r = "";
r += "вышла";
return r;
},
"other" : function(d){
var r = "";
r += "вышел";
return r;
}
};
r += (pf_0[ k_1 ] || pf_0[ "other" ])( d );
r += " из сети";
return r;
}
window.i18n["ru"]["left a comment"] = function(d){
var r = "";
if(!d){
throw new Error("MessageFormat: No data passed to function.");
}
r += d["NAME"];
r += " ";
if(!d){
throw new Error("MessageFormat: No data passed to function.");
}
var lastkey_1 = "GENDER";
var k_1=d[lastkey_1];
var off_0 = 0;
var pf_0 = { 
"male" : function(d){
var r = "";
r += "оставил";
return r;
},
"female" : function(d){
var r = "";
r += "оставила";
return r;
},
"other" : function(d){
var r = "";
r += "оставил";
return r;
}
};
r += (pf_0[ k_1 ] || pf_0[ "other" ])( d );
r += " комментарий";
return r;
}
window.i18n["ru"]["mentioned you"] = function(d){
var r = "";
if(!d){
throw new Error("MessageFormat: No data passed to function.");
}
var lastkey_1 = "GENDER";
var k_1=d[lastkey_1];
var off_0 = 0;
var pf_0 = { 
"male" : function(d){
var r = "";
r += "упомянул";
return r;
},
"female" : function(d){
var r = "";
r += "упомянула";
return r;
},
"other" : function(d){
var r = "";
r += "упомянул";
return r;
}
};
r += (pf_0[ k_1 ] || pf_0[ "other" ])( d );
r += " вас";
return r;
}
window.i18n["ru"]["posted on your wall"] = function(d){
var r = "";
if(!d){
throw new Error("MessageFormat: No data passed to function.");
}
var lastkey_1 = "GENDER";
var k_1=d[lastkey_1];
var off_0 = 0;
var pf_0 = { 
"male" : function(d){
var r = "";
r += "написал";
return r;
},
"female" : function(d){
var r = "";
r += "написала";
return r;
},
"other" : function(d){
var r = "";
r += "написал";
return r;
}
};
r += (pf_0[ k_1 ] || pf_0[ "other" ])( d );
r += " на стене";
return r;
}
window.i18n["ru"]["liked your comment"] = function(d){
var r = "";
if(!d){
throw new Error("MessageFormat: No data passed to function.");
}
var lastkey_1 = "GENDER";
var k_1=d[lastkey_1];
var off_0 = 0;
var pf_0 = { 
"male" : function(d){
var r = "";
r += "оценил";
return r;
},
"female" : function(d){
var r = "";
r += "оценила";
return r;
},
"other" : function(d){
var r = "";
r += "оценил";
return r;
}
};
r += (pf_0[ k_1 ] || pf_0[ "other" ])( d );
r += " ваш комментарий";
return r;
}
window.i18n["ru"]["liked your post"] = function(d){
var r = "";
if(!d){
throw new Error("MessageFormat: No data passed to function.");
}
var lastkey_1 = "GENDER";
var k_1=d[lastkey_1];
var off_0 = 0;
var pf_0 = { 
"male" : function(d){
var r = "";
r += "оценил";
return r;
},
"female" : function(d){
var r = "";
r += "оценила";
return r;
},
"other" : function(d){
var r = "";
r += "оценил";
return r;
}
};
r += (pf_0[ k_1 ] || pf_0[ "other" ])( d );
r += " вашу запись";
return r;
}
window.i18n["ru"]["liked your photo"] = function(d){
var r = "";
if(!d){
throw new Error("MessageFormat: No data passed to function.");
}
var lastkey_1 = "GENDER";
var k_1=d[lastkey_1];
var off_0 = 0;
var pf_0 = { 
"male" : function(d){
var r = "";
r += "оценил";
return r;
},
"female" : function(d){
var r = "";
r += "оценила";
return r;
},
"other" : function(d){
var r = "";
r += "оценил";
return r;
}
};
r += (pf_0[ k_1 ] || pf_0[ "other" ])( d );
r += " ваше фото";
return r;
}
window.i18n["ru"]["liked your video"] = function(d){
var r = "";
if(!d){
throw new Error("MessageFormat: No data passed to function.");
}
var lastkey_1 = "GENDER";
var k_1=d[lastkey_1];
var off_0 = 0;
var pf_0 = { 
"male" : function(d){
var r = "";
r += "оценил";
return r;
},
"female" : function(d){
var r = "";
r += "оценила";
return r;
},
"other" : function(d){
var r = "";
r += "оценил";
return r;
}
};
r += (pf_0[ k_1 ] || pf_0[ "other" ])( d );
r += " ваше видео";
return r;
}
window.i18n["ru"]["shared your post"] = function(d){
var r = "";
if(!d){
throw new Error("MessageFormat: No data passed to function.");
}
var lastkey_1 = "GENDER";
var k_1=d[lastkey_1];
var off_0 = 0;
var pf_0 = { 
"male" : function(d){
var r = "";
r += "поделился";
return r;
},
"female" : function(d){
var r = "";
r += "поделилась";
return r;
},
"other" : function(d){
var r = "";
r += "поделился";
return r;
}
};
r += (pf_0[ k_1 ] || pf_0[ "other" ])( d );
r += " вашей записью";
return r;
}
window.i18n["ru"]["shared your photo"] = function(d){
var r = "";
if(!d){
throw new Error("MessageFormat: No data passed to function.");
}
var lastkey_1 = "GENDER";
var k_1=d[lastkey_1];
var off_0 = 0;
var pf_0 = { 
"male" : function(d){
var r = "";
r += "поделился";
return r;
},
"female" : function(d){
var r = "";
r += "поделилась";
return r;
},
"other" : function(d){
var r = "";
r += "поделился";
return r;
}
};
r += (pf_0[ k_1 ] || pf_0[ "other" ])( d );
r += " вашим фото";
return r;
}
window.i18n["ru"]["shared your video"] = function(d){
var r = "";
if(!d){
throw new Error("MessageFormat: No data passed to function.");
}
var lastkey_1 = "GENDER";
var k_1=d[lastkey_1];
var off_0 = 0;
var pf_0 = { 
"male" : function(d){
var r = "";
r += "поделился";
return r;
},
"female" : function(d){
var r = "";
r += "поделилась";
return r;
},
"other" : function(d){
var r = "";
r += "поделился";
return r;
}
};
r += (pf_0[ k_1 ] || pf_0[ "other" ])( d );
r += " вашим видео";
return r;
}
})();