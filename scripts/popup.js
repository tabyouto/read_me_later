(function () {
	var later = {
		init: function () {
			this.loadBookMarke(this.bindUI);
		},
		loadBookMarke: function (callback) {
			var that = this;
			chrome.storage.local.get(function (bookmarks) {

				var counter = 0;
				$.each(Object.keys(bookmarks), function (index, title) {
					if (/^\d/.test(title)) {
						title = title.replace("\n", "");
						counter++;
						var displayedTitle = title.slice(13);
						var url = bookmarks[title];
						$('.list-wrap ul').prepend('<li>' +
							'<a data-tooltip="' + url + '" href="' + url + '"><img src="' + that.getFavIcon(url) + '">' + displayedTitle + '</a>' +
							'<button class="icon iconfont icon-delete" data-key="' + title + '"></button></li>');
					}
				});

				if (counter != 0) {
					chrome.browserAction.setBadgeText({text: '' + counter});
				} else {
					chrome.browserAction.setBadgeText({text: ''});
				}

				callback && callback();
			})
		},
		getDomain: function (url) {
			var matches, domain;
			try {
				matches = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
				domain = matches && matches[1];  // domain will be null if no match is found
			} catch (e) {
				return null;
			}
			return domain;
		},
		convertImgToBase64: function (url, callback) {
			var img = new Image();
			img.crossOrigin = 'Anonymous';
			img.onload = function () {
				var canvas = document.createElement('CANVAS');
				var ctx = canvas.getContext('2d');
				canvas.height = 20;
				canvas.width = 20;
				ctx.drawImage(this, 0, 0);
				var dataURL = canvas.toDataURL('image/png');
				callback(dataURL);
				canvas = null;
			};
			img.src = url;
		},
		getFavIcon: function (url) {
			var domain = this.getDomain(url);
			if (domain != null) {
				var base64EncodedFavIcon = localStorage.getItem(domain);
				if (base64EncodedFavIcon != null) {
					console.log('found base64 img for ' + domain);
					return base64EncodedFavIcon;
				}
				console.log('did not find base64 img for ' + domain);
				this.convertImgToBase64('http://www.google.com/s2/favicons?domain_url=' + url, function (base64Img) {
					localStorage.setItem(domain, base64Img);
					return base64Img;
				});
			}
			return 'http://www.google.com/s2/favicons?domain_url=' + url;
		},
		decreaseCountBage: function() {
			chrome.browserAction.getBadgeText({}, function(result) {
				alert(result);
				result--;
				if (result > 0) {
					chrome.browserAction.setBadgeText({text: '' + result});
				} else {
					chrome.browserAction.setBadgeText({text: ''});
				}
			});
		},
		bindUI: function () {
			var that = this;
			var $addBtn = $('.add-url');
			var $delBtn = $('.icon-delete');
			$addBtn.on('click', function () {
				/**
				 * get current active tab info
				 */
				chrome.tabs.query({active: true, currentWindow: true}, function (tab) {
					console.log(tab)
					console.log(tab.url)
					chrome.extension.sendMessage({
						saveBookmarkTitle: tab[0].title,
						saveBookmarkUrl: tab[0].url
					}, function (title) {
						if (title === null) {
							return;
						}

						var displayedTitle = title.slice(13);
						alert(that.getFavIcon(tab[0].url));
						$('.list-wrap ul').prepend('<li>' +
							'<a data-tooltip="' + tab[0].url + '" href="' + tab[0].url + '"><img src="' + that.getFavIcon(tab[0].url) + '">' + displayedTitle + '</a>' +
							'<button class="icon iconfont icon-delete" data-key="' + title + '"></button></li>');
					});
				})
			});

			$delBtn.on('click', function () {
				console.log('deleting');
				var key = $(this).data('key');
				chrome.storage.local.remove(key);
				chrome.storage.sync.remove(key);
				$(this).parent().fadeOut(150, function () {
					$(this).remove();
					that.decreaseCountBage();
				});
			})
		}
	};

	later.init();
})();