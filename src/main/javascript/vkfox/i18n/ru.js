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
i18n["ru"] = {
"chat":function(d){return "чат"},
"news":function(d){return "новости"},
"buddies":function(d){return "люди"},
"my":function(d){return "мои"},
"friends_nominative":function(d){return "друзей"},
"groups_nominative":function(d){return "групп"},
"Private message":function(d){return "Личное сообщение"},
"Wall post":function(d){return "Сообщение на стене"},
"Search":function(d){return "Имя или Фамилия"},
"Male":function(d){return "Мужчины"},
"Female":function(d){return "Женщины"},
"Offline":function(d){return "Не в сети"},
"Bookmarked":function(d){return "В закладках"},
"Monitor online status":function(d){return "Следить за онлайн статусом"},
"Mark as read":function(d){return "Отметить прочитанным"},
"Your message wasn't read":function(d){return "Ваше сообщение не прочитано"},
"Like":function(d){return "Нравится"},
"Show history":function(d){return "Показать историю"},
"Open in New Tab":function(d){return "Открыть в новом окне"},
"unsubscribe":function(d){return "отписаться"},
"more...":function(d){return "далee"},
"Comment":function(d){return "Комментировать"},
"Liked":function(d){return "Понравилось"},
"Reposted":function(d){return "Поделился записью"},
"New friends:":function(d){return "Новые друзья:"},
"New music:":function(d){return "Добавил аудио"},
"New video:":function(d){return "Добавил видео"},
"started following you":function(d){return "хочет добавить в друзья"},
"friend request accepted":function(d){return "заявка в друзья подтверждена"},
"sent a message":function(d){return i18n.v(d,"NAME")+" "+i18n.s(d,"GENDER",{"male":"прислал","female":"прислала","other":"прислал"})+" сообщение"},
"is online":function(d){return i18n.s(d,"GENDER",{"male":"появился","female":"появилась","other":"появился"})+" в сети"},
"is_online_short":function(d){return i18n.s(d,"GENDER",{"male":"появился","female":"появилась","other":"появился"})},
"went offline":function(d){return i18n.s(d,"GENDER",{"male":"вышел","female":"вышла","other":"вышел"})+" из сети"},
"went_offline_short":function(d){return i18n.s(d,"GENDER",{"male":"вышел","female":"вышла","other":"вышел"})},
"left a comment":function(d){return i18n.v(d,"NAME")+" "+i18n.s(d,"GENDER",{"male":"оставил","female":"оставила","other":"оставил"})+" комментарий"},
"mentioned you":function(d){return i18n.s(d,"GENDER",{"male":"упомянул","female":"упомянула","other":"упомянул"})+" вас"},
"posted on your wall":function(d){return i18n.s(d,"GENDER",{"male":"написал","female":"написала","other":"написал"})+" на стене"},
"liked your comment":function(d){return i18n.s(d,"GENDER",{"male":"оценил","female":"оценила","other":"оценил"})+" ваш комментарий"},
"liked your post":function(d){return i18n.s(d,"GENDER",{"male":"оценил","female":"оценила","other":"оценил"})+" вашу запись"},
"liked your photo":function(d){return i18n.s(d,"GENDER",{"male":"оценил","female":"оценила","other":"оценил"})+" ваше фото"},
"liked your video":function(d){return i18n.s(d,"GENDER",{"male":"оценил","female":"оценила","other":"оценил"})+" ваше видео"},
"shared your post":function(d){return i18n.s(d,"GENDER",{"male":"поделился","female":"поделилась","other":"поделился"})+" вашей записью"},
"shared your photo":function(d){return i18n.s(d,"GENDER",{"male":"поделился","female":"поделилась","other":"поделился"})+" вашим фото"},
"shared your video":function(d){return i18n.s(d,"GENDER",{"male":"поделился","female":"поделилась","other":"поделился"})+" вашим видео"},
"notifications":function(d){return "уведомления"},
"force online":function(d){return "быть всегда он-лайн"},
"sound":function(d){return "звук"},
"signal":function(d){return "сигнал"},
"volume":function(d){return "громкость"},
"popups":function(d){return "всплывающие окна"},
"show text":function(d){return "показывать текст"},
"show all":function(d){return "показать все"},
"hide":function(d){return "скрыть"},
"Yandex search":function(d){return "Яндекс поиск"},
"install_noun":function(d){return "установка"},
"install_verb":function(d){return "установить"},
"skip":function(d){return "пропустить"},
"login":function(d){return "авторизовать"},
"accept":function(d){return "принять"},
"no":function(d){return "нет"},
"close":function(d){return "закрыть"},
"Authorize VKfox with Vkontakte":function(d){return "Прежде всего, необходимо авторизироваться в VKfox. Если вы это делаете в первые вам будет необходимо разрешить доступ к вашей странице."},
"Accept license agreement":function(d){return "Устанавливая данное приложение вы тем самым соглашаетесь со всеми правилами, условиями и информацией нашего <a anchor='http://vkfox.io/license'>лицензионного соглашения.</a>"},
"Install Yandex search":function(d){return "Пожалуйста, поддержите дальнейшее развитие VKfox и установите новый Яндекс поиск."},
"Thank you!":function(d){return "Спасибо, установка приложения окончена. Окно может быть закрыто."}};
return g["i18n"] = i18n;
})(this);