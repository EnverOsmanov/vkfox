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
i18n["uk"] = {
"chat":function(d){return "чат"},
"news":function(d){return "новини"},
"buddies":function(d){return "люди"},
"my":function(d){return "мої"},
"friends_nominative":function(d){return "друзів"},
"groups_nominative":function(d){return "груп"},
"Private message":function(d){return "Особисте повідомлення"},
"Wall post":function(d){return "Повідомлення на стіні"},
"Search":function(d){return "Ім'я або Прізвище"},
"Male":function(d){return "Чоловіки"},
"Female":function(d){return "Жінки"},
"Offline":function(d){return "Не в мережі"},
"Bookmarked":function(d){return "У закладках"},
"Monitor online status":function(d){return "Слідкувати за онлайн статусом"},
"Mark as read":function(d){return "Відзначити прочитаним"},
"Your message wasn't read":function(d){return "Ваше повідомлення не прочитано"},
"Like":function(d){return "Подобається"},
"Show history":function(d){return "Показати історію"},
"Open in New Tab":function(d){return "Відкрити у новому вікні"},
"unsubscribe":function(d){return "відписатися"},
"more...":function(d){return "далі"},
"Comment":function(d){return "Коментувати"},
"Liked":function(d){return "Сподобалось"},
"Reposted":function(d){return "Поділився записом"},
"New friends:":function(d){return "Нові друзі:"},
"started following you":function(d){return "хоче додати у друзі"},
"friend request accepted":function(d){return "заявка у друзі підтверджена"},
"sent a message":function(d){return i18n.v(d,"NAME")+" "+i18n.s(d,"GENDER",{"male":"надіслав","female":"надіслала","other":"надіслав"})+" повідомлення"},
"is online":function(d){return i18n.s(d,"GENDER",{"male":"з'явився","female":"з'явилася","other":"з'явився"})+" в мережі"},
"is_online_short":function(d){return i18n.s(d,"GENDER",{"male":"з'явився","female":"з'явилася","other":"з'явився"})},
"went offline":function(d){return i18n.s(d,"GENDER",{"male":"вийшов","female":"вийшла","other":"вийшов"})+" з мережі"},
"went_offline_short":function(d){return i18n.s(d,"GENDER",{"male":"вийшов","female":"вийшла","other":"вийшов"})},
"left a comment":function(d){return i18n.v(d,"NAME")+" "+i18n.s(d,"GENDER",{"male":"залишив","female":"залишила","other":"залишив"})+" коментар"},
"mentioned you":function(d){return i18n.s(d,"GENDER",{"male":"згадав","female":"згадала","other":"згадав"})+" вас"},
"posted on your wall":function(d){return i18n.s(d,"GENDER",{"male":"написав","female":"написала","other":"написав"})+" на стіні"},
"liked your comment":function(d){return i18n.s(d,"GENDER",{"male":"оцінив","female":"оцінила","other":"оцінив"})+" ваш коментар"},
"liked your post":function(d){return i18n.s(d,"GENDER",{"male":"оцінив","female":"оцінила","other":"оцінив"})+" вашу запис"},
"liked your photo":function(d){return i18n.s(d,"GENDER",{"male":"оцінив","female":"оцінила","other":"оцінив"})+" ваше фото"},
"liked your video":function(d){return i18n.s(d,"GENDER",{"male":"оцінив","female":"оцінила","other":"оцінив"})+" ваше відео"},
"shared your post":function(d){return i18n.s(d,"GENDER",{"male":"поділився","female":"поділилася","other":"поділився"})+" вашим записом"},
"shared your photo":function(d){return i18n.s(d,"GENDER",{"male":"поділився","female":"поділилася","other":"поділився"})+" вашим фото"},
"shared your video":function(d){return i18n.s(d,"GENDER",{"male":"поділився","female":"поділилася","other":"поділився"})+" вашим відео"},
"notifications":function(d){return "повідомлення"},
"force online":function(d){return "бути завжди он-лайн"},
"sound":function(d){return "звук"},
"signal":function(d){return "сигнал"},
"volume":function(d){return "гучність"},
"popups":function(d){return "спливаючі вікна"},
"show all":function(d){return "показати усе"},
"hide":function(d){return "приховати"},
"show text":function(d){return "показувати текст"},
"Yandex search":function(d){return "Яндекс пошук"},
"install_noun":function(d){return "установка"},
"install_verb":function(d){return "встановити"},
"skip":function(d){return "пропустити"},
"login":function(d){return "авторизувати"},
"accept":function(d){return "прийняти"},
"no":function(d){return "ні"},
"close":function(d){return "закрити"},
"Authorize VKfox with Vkontakte":function(d){return "Перш за все, необхідно авторизуватися у VKfox. Якщо ви це робите у перше, вам буде необхідно дозволити доступ до вашої сторінки."},
"Accept license agreement":function(d){return "Встановлюючи даний додаток ви погоджуєтесь з усіма правилами, умовами та інформацією нашої <a anchor='http://vkfox.io/license'>ліцензійної угоди.</a>"},
"Install Yandex search":function(d){return "Будь ласка, підтримайте подальший розвиток VKfox та встановіть новий Яндекс пошук."},
"Thank you!":function(d){return "Дякуємо, установка додатку закінчена. Вікно може бути закрито."}};
return g["i18n"] = i18n;
})(this);