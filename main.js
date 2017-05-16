/** GOOGLE ANALYTICS START */
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-46061668-2']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.	getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);

  // initialize
  setTimeout(init);
})();
/** GOOGLE ANALYTICS END */

function init() {
	setupStrings();
	allowLinks();
	loadBookmarks();
	showChangelog();

	$('#version').click(function(e) {
		$('#changelogDialog').modal();
		return false;
	});
	
	$('#addButton').click(function() {
		chrome.tabs.getSelected(null, function(tab) {
			chrome.extension.sendMessage({saveBookmarkTitle: tab.title, saveBookmarkUrl: tab.url}, 
				function(title) {
					console.log("response from background received: " + title);
					
					if (title === null) {return;}

					var displayedTitle = title.slice(13);
					$('#bookmarksContainer').prepend(	'<tr class="bookmark">' +
																'<td style="max-width:640px;">' +
																	'<div class="viewBookmark truncate tooltipped" data-position="top" data-delay="500" data-tooltip="'+tab.url+'" data-key="'+title+'" data-url="'+tab.url+'"><img style="height:15px" src="'+getFavIcon(tab.url)+'">'+displayedTitle+'</div>' +
																'</td>' +
																'<td class="right-align">' +
																	'<button data-key="' + title + '" class="deleteBookmark waves-effect btn-flat right-align"><i class="tiny mdi-action-delete"></i></button>' +
																'</td>'+
															'</tr>');

					setupDeleteBookmarkHandler();
					setupViewBookmarkHandler();
					$('.tooltipped').tooltip();

					// close current tab if option selected
					chrome.storage.local.get('closeTab', function(obj) {if (obj.closeTab != false) { chrome.tabs.remove(tab.id);}});
				}
			)
		});
	});	

	$('#filterText').keyup(function() {
		var inputText = $(this).val().toLowerCase();
		$('.viewBookmark').each(function() {
			var bookmarkTitle = $(this).attr('data-key').toLowerCase();
			var bookmarkUrl = $(this).attr('data-url').toLowerCase();
			if (bookmarkTitle.indexOf(inputText) <= -1 && bookmarkUrl.indexOf(inputText) <= -1) {
				$(this).parent().parent().hide();
			} else {
				$(this).parent().parent().show();
			}
		});
	});

	$('#configButton').click(function() {
		var url = "/options.html";
		chrome.tabs.create({url: url});
	});

	$('#syncButton').click(function() {
		chrome.extension.sendMessage({syncViewLater: true}, function(response) {
			console.log(response);
			$('#bookmarksContainer').empty();
			loadBookmarks();
		});
	});

	/* prevent middle mouse click scrolling */
	$('body').mousedown(function(e){if(e.button==1)return false});
}

function loadBookmarks() {
	chrome.storage.local.get(function(bookmarks) {

		var counter = 0;
		$.each(Object.keys(bookmarks), function(index, title) {
			if (/^\d/.test(title)) {
				title = title.replace("\n", "");
				counter++;
				var displayedTitle = title.slice(13);
				var url = bookmarks[title];

				$('#bookmarksContainer').prepend(	'<tr class="bookmark" draggable="true">' +
														'<td style="max-width:640px;">' +
															'<div class="viewBookmark truncate tooltipped" data-position="top" data-delay="500" data-tooltip="'+url+'" data-key="' + title + '" data-url="'+url+'"><img style="height:15px" src="'+getFavIcon(url)+'">'+displayedTitle+'</div>' +
														'</td>' +
														'<td class="right-align">' +
															'<button data-key="' + title + '" class="deleteBookmark waves-effect btn-flat right-align"><i class="tiny mdi-action-delete"></i></button>' +
														'</td>'+
													'</tr>');
			}
		});
		
		if (counter != 0) {
			chrome.browserAction.setBadgeText({text: '' + counter});
		} else {
			chrome.browserAction.setBadgeText({text: ''});
		}

		setupDeleteBookmarkHandler();

		setupViewBookmarkHandler();

		$('.bookmark').each(function() {
			this.addEventListener('dragstart', function() {drag(event)}, false);
			this.addEventListener('dragend', function() {dragEnd(event)}, false);
		});

		$('.viewBookmark').each(function() {
			this.addEventListener('dragover', function() {allowDrop(event)}, false);
			this.addEventListener('dragenter', function() {dragEnter(event)}, false);
			this.addEventListener('dragleave', function() {dragLeave(event)}, false);
			this.addEventListener('drop', function() {drop(event)}, false);
		});

		$('.tooltipped').tooltip();

		$('#loadingGif').hide();
	});
}

function setupDeleteBookmarkHandler() {
	$('.deleteBookmark').click(function() {
		var button = $(this);
		var key = button.attr('data-key');
		chrome.storage.local.remove(key);
		chrome.storage.sync.remove(key);
		button.parent().parent().fadeOut(150, function() {
			$(this).remove();
			decrementLinksCountBadge();
		});
	});
}

function setupViewBookmarkHandler() {
	$('.viewBookmark').mouseup(function(e) {
        var url = $(this).attr('data-url');
		var key = $(this).attr('data-key');

		// remove link automatically when clicked
		chrome.storage.local.get('removeLink', function(obj) {
			if (obj.removeLink == true) {
				$(this).parent().parent().remove();
				decrementLinksCountBadge();
				chrome.storage.local.remove(key);
				chrome.storage.sync.remove(key);
			}
		});

		if (e.which == 1) {
			// if left mouse clicked
			chrome.storage.local.get('alwaysOpenLinkInCurrentTab', function(obj) {
				if (obj.alwaysOpenLinkInCurrentTab == true) {
					chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	       				chrome.tabs.update(tabs[0].id, {url: url});
	       				window.close();
	    			});
				} else {
					chrome.tabs.create({url: url});
				}
			});
		} else if (e.which == 2) {
			// if middle mouse clicked
			chrome.tabs.create({url: url, active: false});
		}
	});
}

function allowLinks() {
	$('a').click(function(){
		chrome.tabs.create({url: $(this).attr('href')});
		return false;
	});
}

function getDomain(url) {
	var matches, domain;
	try {
		matches = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
		domain = matches && matches[1];  // domain will be null if no match is found
	} catch (e) { return null; }
	return domain;
}

function getFavIcon(url) {
	var domain = getDomain(url);
	if (domain != null) {
		var base64EncodedFavIcon = localStorage.getItem(domain);
		if (base64EncodedFavIcon != null) {
			console.log('found base64 img for ' + domain);
			return base64EncodedFavIcon;
		} 
		console.log('did not find base64 img for ' + domain);
		convertImgToBase64('http://www.google.com/s2/favicons?domain_url=' + url, function(base64Img){
			localStorage.setItem(domain, base64Img);
			return base64Img;
		});
	}
	return 'http://www.google.com/s2/favicons?domain_url=' + url;
}

function convertImgToBase64(url, callback){
	var img = new Image();
	img.crossOrigin = 'Anonymous';
	img.onload = function(){
	    var canvas = document.createElement('CANVAS');
	    var ctx = canvas.getContext('2d');
		canvas.height = 15;
		canvas.width = 15;
	  	ctx.drawImage(this,0,0);
	  	var dataURL = canvas.toDataURL('image/png');
	  	callback(dataURL);
	  	canvas = null; 
	};
	img.src = url;
}

function logLocalStorage() {
	for (var i = 0; i < localStorage.length; i++) { 
		var key = localStorage.key(i);
		var val = localStorage.getItem(key);
    	console.log(key + ' -> ' + val);
	}
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

function setupStrings() {
	$('#optionsText').html(chrome.i18n.getMessage('options'));
	$('#addButton').attr('data-tooltip', chrome.i18n.getMessage('add_current_page'))
	$('#deleteText').html(chrome.i18n.getMessage('delete'));
	$('#linkText').html(chrome.i18n.getMessage('link'));
	$('#filterText').attr('placeholder', chrome.i18n.getMessage('filter'));
}

function showChangelog() {
	chrome.storage.local.get('changelogShown116', function(result) {
		if (result.changelogShown116 != true) {
			$('#changelogDialog').openModal();
			chrome.storage.local.set({'changelogShown116': true});
		}
	});
}

function drag(ev) {
	$(ev.srcElement).css('opacity', '0.4');
	var key = $(ev.srcElement).children().first().children().first().attr('data-key');
	var url = $(ev.srcElement).children().first().children().first().attr('data-url');
	
	ev.dataTransfer.setData('source-key', key);
	ev.dataTransfer.setData('source-url', url);
}

function dragEnd(ev) {
	$(ev.srcElement).css('opacity', '1');
}

function allowDrop(ev) {
	ev.preventDefault();
}
function dragEnter(ev) {
	ev.target.classList.add('dragover');
}
function dragLeave(ev) {
	ev.target.classList.remove('dragover');
}
function drop(ev) {
	ev.preventDefault();
	
	var sourceKey = ev.dataTransfer.getData('source-key');
	var sourceUrl = ev.dataTransfer.getData('source-url');
	
	// del previous
	chrome.storage.local.remove(sourceKey);
	chrome.storage.sync.remove(sourceKey);

	sourceKey = sourceKey.substring(14);

	var to = $(ev.toElement).attr('data-key');
	var toTime = to.substring(0,13);
	var newTime = +toTime + 1;

	chrome.extension.sendMessage({saveBookmarkTitle: sourceKey, saveBookmarkUrl: sourceUrl, saveBookmarkTimestamp: newTime}, function(title) { 
		console.log('new position saved!');
		setTimeout(function() { $('.bookmark').remove(); }, 100);
		setTimeout(loadBookmarks, 100);
	});
}