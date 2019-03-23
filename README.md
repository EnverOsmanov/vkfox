VKfox
=========
VKfox is a browser extension targeted for Firefox and Chromium-based browsers (Google Chrome, Opera, etc.).

Available for download:
 [Firefox](https://addons.mozilla.org/ru/firefox/addon/vkfoxx/),
 [Google Chrome](https://chrome.google.com/webstore/detail/vkfoxx/jiopicfpmajlonjbckpdejadefhgmakc).

Our group in VK - [vkfoxy](https://vk.com/vkfoxy).


## For developers
1) First of all you need to bundle source code to unpacked extension.

* To bundle extension:

```
npm install
npm run bundleProd
````
Look to `target/firefox` directory.

<hr>

* To bundle in **developer** mode (with *hot-reload* etc...):
```
npm install
npm run bundle
````

---

2) To run unpacked extension in Firefox Developer Edition:
````
npm run ffoxMac
````