//    Copyright 2023 Konstantin Grishchenko, Security Experts Community
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.


function save_options() {
  let vt_api_key = document.getElementById('vt-api-key').value;
  let dont_show_save_event_icons = document.getElementById('dont_show_save_event_icons').checked;
  let disable_agg_sort = document.getElementById('disable_agg_sort').checked;
  let iplinks = [];
  $(".iplink").each(function(index){
      let name = $(".iplink_name", $(this)).val();
      let template = $(".iplink_template", $(this)).val();
      iplinks.push({name, template});
  });
   
  let options = {vt_api_key, iplinks, dont_show_save_event_icons, disable_agg_sort};
  chrome.storage.sync.set(
    {options},
    function() {
      let status = document.getElementById('status');
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
      if(items.options.hasOwnProperty('vt-api-key')){
        document.getElementById('vt-api-key').value = items.options['vt_api_key'];
      }

      if(items.options.hasOwnProperty('dont_show_save_event_icons')){
        document.getElementById('dont_show_save_event_icons').checked = items.options['dont_show_save_event_icons'];
      }
      else{
        document.getElementById('dont_show_save_event_icons').checked = false;
      }

      if(items.options.hasOwnProperty('disable_agg_sort')){
        document.getElementById('disable_agg_sort').checked = items.options['disable_agg_sort'];
      }
      else{
        document.getElementById('disable_agg_sort').checked = false;
      }
      
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


