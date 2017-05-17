chrome.browserAction.setBadgeBackgroundColor({color: '#1B8AFA'});

chrome.extension.onMessage.addListener(function (request, sender, callback) {
	if (request.saveBookmarkUrl != null && request.saveBookmarkUrl != "") {
		var title = _do.saveBookmark(request.saveBookmarkTitle, request.saveBookmarkUrl, request.timestamp);
		callback(title);
	}
});


chrome.runtime.onStartup.addListener(function () {
	// sync
	setInterval(function() {
		_do.syncExtension();
	}, 10000);

	// set up default settings
	//chrome.storage.sync.get('closeTab', function(obj) {
	//	if (Object.keys(obj).length == 0) {
	//		chrome.storage.local.set({'closeTab': true});
	//		chrome.storage.sync.set({'closeTab': true});
	//	}
	//});
	chrome.storage.sync.get('removeLink', function (obj) {
		if (Object.keys(obj).length == 0) {
			chrome.storage.local.set({'removeLink': false});
			chrome.storage.sync.set({'removeLink': false});
		}
	});
	chrome.storage.sync.get('displayNotifications', function (obj) {
		if (Object.keys(obj).length == 0) {
			chrome.storage.local.set({'displayNotifications': true});
			chrome.storage.sync.set({'displayNotifications': true});
		}
	});
	//chrome.storage.sync.get('alwaysOpenLinkInCurrentTab', function(obj) {
	//	if (Object.keys(obj).length == 0) {
	//		chrome.storage.local.set({'alwaysOpenLinkInCurrentTab': false});
	//		chrome.storage.sync.set({'alwaysOpenLinkInCurrentTab': false});
	//	}
	//});
});


var _do = {
	saveBookmark: function (title, url, timestamp) {
		var that = this;
		timestamp = typeof timestamp !== 'undefined' ? timestamp : Date.now();

		title = title.replace(/"/g, '');
		title = title.replace(/&quot;/g, '');
		title = title.replace(/\\n|\\r\\n|\\r/g, '');
		title = timestamp + ' ' + title;

		// check if url already saved
		chrome.storage.local.get(function (savedBookmarks) {
			var keys = Object.keys(savedBookmarks);

			for (var i = 0; i < keys.length; i++) {
				var savedUrl = savedBookmarks[keys[i]];
				if (url === savedUrl) {
					console.log("url already saved. doing nothing...");
					chrome.storage.local.get('displayNotifications', function (obj) {
						if (obj.displayNotifications != false) {
							that.alreadySavedNotification();
						}
					});
					return null;
				}
			}

			var bookmark = {};
			bookmark[title] = url;
			chrome.storage.local.set(bookmark, function () {
				chrome.storage.local.get('displayNotifications', function (obj) {
					if (obj.displayNotifications != false) {
						that.showBookmarkNotification();
					}
				});
				console.log('Page ' + title + ' (' + url + ') saved to VIEW LATER');
				that.showCountBadge();
			});
			chrome.storage.sync.set(bookmark); //同步
			console.log("saved the following bookmark");
			console.log(bookmark);
		});

		return title;
	},
	alreadySavedNotification: function () {
		var that = this;
		var opt = {
			type: "basic",
			title: "Page not saved!",
			message: "Page is already saved on READ ME LATER!",
			iconUrl: "icon.png"
		};
		chrome.notifications.create('vcId_custom', opt, function () {
			console.log('notification created');
		});
		setTimeout(function() {
			that.clearNotification();
		},1500);
	},
	showBookmarkNotification: function() {
		var that = this;
		var opt = {
			type: "basic",
			title: "Page saved!",
			message: "Page has been saved on READ ME LATER!",
			iconUrl: "icon.png"
		};
		chrome.notifications.create('vcId_custom', opt, function () {
			console.log('notification created');
		});
		setTimeout(function() {
			that.clearNotification();
		},1500);
	},
	clearNotification: function() {
		chrome.notifications.clear('vcId_custom',function(){});
	},
	showCountBadge: function () {
		chrome.browserAction.getBadgeText({}, function (result) {
			result++;
			chrome.browserAction.setBadgeText({text: '' + result});
		});
	},
	syncExtension: function () {
		console.log("loading...");
		chrome.storage.sync.get(function (settings) {

			// add or update new links & settings to local storage
			var keys = Object.keys(settings);
			keys.forEach(function (key) {
				var setting = {};
				setting[key] = settings[key];
				chrome.storage.local.set(setting);
			});

			// remove old links & settings to local storage
			chrome.storage.local.get(function (localSettings) {
				var keysLocal = Object.keys(localSettings);
				keysLocal.forEach(function (keyLocal) {
					var c = keyLocal.charAt(0);
					var isDigit = (c >= '0' && c <= '9');
					if (isDigit) {
						if ($.inArray(keyLocal, keys) == -1) {
							chrome.storage.local.remove(keyLocal);
						}
					}
				});
			});

			// set badge info
			chrome.browserAction.setBadgeBackgroundColor({color: '#1B8AFA'});
			that.setCurrentLinksCountBadge();

			console.log("SYNCING VIEW LATER... COMPLETE");
		});
	},
	setCurrentLinksCountBadge: function() {
		chrome.storage.sync.get(function(bookmarks) {
			var keys = Object.keys(bookmarks);
			var linkCount = Object.keys(bookmarks).length;

			// minus 4, because i have 4 options saved
			//linkCount -= 4

			console.log('linkCount: ' + linkCount);
			if (linkCount > 0) {
				chrome.browserAction.setBadgeText({text: '' + linkCount});
			}
		});
	}
}