VKfox
=========
VKfox is a browser extension targeted for Firefox, <del>Google Chrome and Opera Chromium</del>.

Available for download here: [Firefox](https://addons.mozilla.org/ru/firefox/addon/vkfoxx/)

Our group in VK - [vkfoxy](https://vk.com/vkfoxy).


## For developers
1) First of all you need bundle source code to unpacked extension.

* If you want just bundle extension - run:

```
npm install
npm run bundle
````
Now look to `target/firefox` directory.

<hr>

* If you want to bundle in developer mode (with *hot-reload* etc...) use:
```
npm install
npm run gulp
````

---

After that if you want to start unpacked extension in Firefox Developer Edition:
````
npm run ffoxMac
````