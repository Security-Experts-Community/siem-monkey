function save_options() {
    var vt_api_key = document.getElementById('vt-api-key').value;
    // var newfields = document.getElementById('newfields').checked;
    var options = {vt_api_key/*, newfields*/};
    chrome.storage.sync.set({
      options
    }, function() {
      // Update status to let user know options were saved.
      var status = document.getElementById('status');
      status.textContent = 'Options saved.';
      setTimeout(function() {
        status.textContent = '';
      }, 750);
    });
  }
  
  // Restores select box and checkbox state using the preferences
  // stored in chrome.storage.
  function restore_options() {
    chrome.storage.sync.get(
      "options",
      function(items) {
      document.getElementById('vt-api-key').value = items.options['vt_api_key'];
    });
  }
  document.addEventListener('DOMContentLoaded', restore_options);
  document.getElementById('save').addEventListener('click', save_options);