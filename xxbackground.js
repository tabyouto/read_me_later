chrome.browserAction.setBadgeBackgroundColor({color: '#8BC34A'});

function saveBookmark(title, url, timestamp) {

	timestamp = typeof timestamp !== 'undefined' ? timestamp : Date.now();

	title = title.replace(/"/g, '');
	title = title.replace(/&quot;/g, '');
	title = title.replace(/\\n|\\r\\n|\\r/g, '');
	title = timestamp + ' ' + title;
	
	// check if url already saved
	chrome.storage.local.get(function(savedBookmarks){
		var keys = Object.keys(savedBookmarks);
		for (var i = 0; i < keys.length; i++) {
		    var savedUrl = savedBookmarks[keys[i]];
		    if (url === savedUrl) {
		    	console.log("url already saved. doing nothing...");
		    	chrome.storage.local.get('displayNotifications', function(obj) {
					if (obj.displayNotifications != false) {
						showBookmarkAlreadySavedNotification();
					}
				});
		    	return null;
		    }
		}

		var bookmark = {};
		bookmark[title] = url;
		chrome.storage.local.set(bookmark, function() {
			chrome.storage.local.get('displayNotifications', function(obj) {
				if (obj.displayNotifications != false) {
					showBookmarkNotification();
				}
			});
			console.log('Page ' + title + ' (' + url + ') saved to VIEW LATER');
			incrementLinksCountBadge();
		});
		chrome.storage.sync.set(bookmark); //远程同步
		console.log("saved the following bookmark");
		console.log(bookmark);
	});

	return title;
}

function showBookmarkAlreadySavedNotification() {
	var opt = {
		type: "basic",
		title: "Page not saved!",
		message: "Page is already saved",
		iconUrl: "icon.png"
	}
	chrome.notifications.create('', opt, function() {
		console.log('notification created');
	});
}

function showBookmarkNotification() {
	var opt = {
		type: "basic",
		title: "Page saved!",
		message: "Page has been saved to VIEW LATER",
		iconUrl: "icon.png"
	}
	chrome.notifications.create('', opt, function() {
		console.log('notification created');
	});
}

var propsPage = {
	"title": "View page later",
	"contexts": ["page"],
	"onclick": function(info, tab) { 
		chrome.storage.local.get('closeTab', function(obj) {
			if (obj.closeTab != false) {
				chrome.tabs.remove(tab.id);
			}
		});
		saveBookmark(tab.title, tab.url);
	}
};

var propsLink = {
	"title": "View link later",
	"contexts": ["link"],
	"onclick": function(info, tab) {
		$.ajax( info.linkUrl )
			.done(function(html) {
				// create pseudo div
				var div = document.createElement('div');
				div.innerHTML = html; 
				
				// get title
				var title = $(div).find('title').text();
				
				saveBookmark(title, info.linkUrl);
			});
	}
};

// set up context menus
chrome.contextMenus.create(propsPage, function() {
	if (chrome.extension.lastError) {
		console.log("error creating contextmenu for page: " + chrome.extension.lastError.message);
	}
});
chrome.contextMenus.create(propsLink, function() {
	if (chrome.extension.lastError) {
		console.log("error creating contextmenu for link: " + chrome.extension.lastError.message);
	}
});

// allow hotkey support
chrome.commands.onCommand.addListener(function(command) {	
	if ('view-page-later' == command) {
		chrome.tabs.getSelected(null, function(tab) {
			chrome.storage.sync.get('closeTab', function(obj) {
			if (obj.closeTab != false) {
				chrome.tabs.remove(tab.id);
			}
			});
			saveBookmark(tab.title, tab.url);
		});
	} else if ('open-latest-page' == command) {
		chrome.storage.sync.get(function(bookmarks) {
			var bookmarksCount = Object.keys(bookmarks).length;
			var key = Object.keys(bookmarks)[bookmarksCount-5];
			var urlToOpen =  bookmarks[key];
			
			chrome.storage.sync.get('removeLink', function(obj) {
				if (obj.removeLink == true) {
					decrementLinksCountBadge();
					chrome.storage.sync.remove(key);
				}
			});

			chrome.storage.sync.get('alwaysOpenLinkInCurrentTab', function(obj) {
				if (obj.alwaysOpenLinkInCurrentTab == true) {
					chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        				chrome.tabs.update(tabs[0].id, {url: urlToOpen});
    				});
				} else {
					chrome.tabs.create({url: urlToOpen});
				}
			});
		});
	} else {
		console.log('Command:', command + ' not handled.');
	}
});

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	console.log("received message: " + request + " from " + sender);
	if (request.syncViewLater != null) {
		syncViewLater();
		sendResponse('sync ok');
	} else if (request.saveBookmarkUrl != null && request.saveBookmarkUrl != "") {
		var title = saveBookmark(request.saveBookmarkTitle, request.saveBookmarkUrl, request.saveBookmarkTimestamp);
		sendResponse(title);
	}
});

function setCurrentLinksCountBadge() {
	chrome.storage.sync.get(function(bookmarks) {
		var keys = Object.keys(bookmarks);
		var linkCount = Object.keys(bookmarks).length;

		// minus 4, because i have 4 options saved
		linkCount -= 4
		
		console.log('linkCount: ' + linkCount);
		if (linkCount > 0) {
			chrome.browserAction.setBadgeText({text: '' + linkCount});
		}
	});
}

function syncViewLater() {
	console.log("SYNCING VIEW LATER...")
	chrome.storage.sync.get(function(settings) {

		// add or update new links & settings to local storage
		var keys = Object.keys(settings);
		keys.forEach(function(key) {
			var setting = {};
			setting[key] = settings[key];
			chrome.storage.local.set(setting);
		});

		// remove old links & settings to local storage
		chrome.storage.local.get(function(localSettings) {
			var keysLocal = Object.keys(localSettings);
			keysLocal.forEach(function(keyLocal) {
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
		chrome.browserAction.setBadgeBackgroundColor({color: '#8BC34A'});
		setCurrentLinksCountBadge();

		console.log("SYNCING VIEW LATER... COMPLETE");
	});
}

function decrementLinksCountBadge() {
	chrome.browserAction.getBadgeText({}, function(result) { 
		result--;
		if (result > 0) {
			chrome.browserAction.setBadgeText({text: '' + result});
		} else {
			chrome.browserAction.setBadgeText({text: ''});
		}
	});
}

function incrementLinksCountBadge() {
	chrome.browserAction.getBadgeText({}, function(result) { 
		result++;
		chrome.browserAction.setBadgeText({text: '' + result});
	});
}

function logStorageLocal() {
	chrome.storage.local.get(function(values){console.log(values);});
}

function logStorageSync() {
	chrome.storage.sync.get(function(values){console.log(values);});
}

// DO STUFF WHEN CHROME STARTS
chrome.runtime.onStartup.addListener(function() { 
	// sync
	setInterval(syncViewLater, 10000);

	// set up default settings
	chrome.storage.sync.get('closeTab', function(obj) {
		if (Object.keys(obj).length == 0) { 
			chrome.storage.local.set({'closeTab': true});
			chrome.storage.sync.set({'closeTab': true});
		}
	});
	chrome.storage.sync.get('removeLink', function(obj) {
		if (Object.keys(obj).length == 0) { 
			chrome.storage.local.set({'removeLink': false});
			chrome.storage.sync.set({'removeLink': false});
		}
	});
	chrome.storage.sync.get('displayNotifications', function(obj) {
		if (Object.keys(obj).length == 0) { 
			chrome.storage.local.set({'displayNotifications': true});
			chrome.storage.sync.set({'displayNotifications': true});
		}
	});
	chrome.storage.sync.get('alwaysOpenLinkInCurrentTab', function(obj) {
		if (Object.keys(obj).length == 0) { 
			chrome.storage.local.set({'alwaysOpenLinkInCurrentTab': false});
			chrome.storage.sync.set({'alwaysOpenLinkInCurrentTab': false});
		}
	});
});
