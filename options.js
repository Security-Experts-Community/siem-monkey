function save_options() {
  var vt_api_key = document.getElementById('vt-api-key').value;
  let iplinks = [];
  $(".iplink").each(function(index){
      let name = $(".iplink_name", $(this)).val();
      let template = $(".iplink_template", $(this)).val();
      iplinks.push({name, template});
  });
   
  var options = {vt_api_key, iplinks};
  chrome.storage.sync.set(
    {options},
    function() {
      var status = document.getElementById('status');
      status.textContent = 'Настройки сохранены';
      setTimeout(function() {
        status.textContent = '';
      }, 750);
    });
}
  

function restore_options() {
    let iplinks = [];
    chrome.storage.sync.get(
      "options",
      function(items) {
      document.getElementById('vt-api-key').value = items.options['vt_api_key'];
      iplinks = items.options['iplinks'];
      console.log(iplinks);

      iplinks.forEach(e => {
        $("#iplinks_container").append(getNewRow(e.name, e.template));
      });
  
      $("#iplinks_container").append(getNewEmptyRow());

      $(".delete_row").click(function() {
        $(this).parent().remove();
      });

    });
}


$("#addrow").click(function(){
  $("#iplinks_container").append(getNewEmptyRow());
  $(".delete_row").click(function() {
    $(this).parent().remove();
  });
})


function getNewEmptyRow(){
  let newrow = `<div class="iplink">` +
  `<label for="name">Название: </label>` +
  `<input type="text" class="iplink_name"/>` +
  `<label for="template">Шаблон: </label>` +
  `<input type="text" class="iplink_template" placeholder="https://your-favorite-ip-check-service.net/api/path/\${ip}/info"/>` +
  `<span class="delete_row" title="Удалить">❌</span>` +
  `</div>`;
  return newrow;
}


function getNewRow(name, template){
  let newrow = `<div class="iplink">` +
  `<label for="name">Название: </label>` +
  `<input id="name" type="text" class="iplink_name" value="${name}"/>` +
  `<label for="template">Шаблон: </label>` +
  `<input id="template" type="text" class="iplink_template" value="${template}" placeholder="https://your-favorite-ip-check-service.net/api/path/\${ip}/info"/>` +
  `<span class="delete_row" title="Удалить">❌</span>` +
  `</div>`;
  return newrow;
}


document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);


