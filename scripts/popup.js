(function() {
  $('.add-url').on('click',function() {
	  /**
       * get current active tab info
       */
      chrome.tabs.query({active: true},function(tab) {
        chrome.extension.sendMessage({saveBookmarkTitle: tab.title, saveBookmarkUrl: tab.url},function(title) {
          console.log(title)
        });
        chrome.storage.local.get(function(item) {
          console.log(item)
        })
        //    chrome.storage.local.set({'value': tab.title}, function() {
        //  // Notify that we saved.
        //  message('Settings saved');
        //});
    })
  })
})()