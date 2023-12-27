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
  let dont_show_desc_rules = document.getElementById('dont_show_desc_rules').checked;
  let disable_agg_sort = document.getElementById('disable_agg_sort').checked;
  let iplinks = [];
  $(".iplink").each(function(index){
      let name = $(".iplink_name", $(this)).val();
      let template = $(".iplink_template", $(this)).val();
      let local = $(".iplink_local", $(this)).is(':checked');
      iplinks.push({name, template, local});
  });
   
  let hashlinks = [];
  $(".hashlink").each(function(index){
      let name = $(".hashlink_name", $(this)).val();
      let template = $(".hashlink_template", $(this)).val();
      hashlinks.push({name, template});
  });
 

  let options = {vt_api_key, iplinks, hashlinks, dont_show_save_event_icons, dont_show_desc_rules, disable_agg_sort};
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

      if(items.options.hasOwnProperty('dont_show_desc_rules')){
        document.getElementById('dont_show_desc_rules').checked = items.options['dont_show_desc_rules'];
      }
      else{
        document.getElementById('dont_show_desc_rules').checked = false;
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
        $("#iplinks_container").append(getNewRow(e.name, e.template, e.local ? "checked" : ""));
      });
  
      //$("#iplinks_container").append(getNewEmptyRow());

      $(".delete_row").click(function() {
        $(this).parent().remove();
      });

      hashlinks = items.options['hashlinks'];
      console.log(iplinks);

      hashlinks.forEach(e => {
        $("#hashlinks_container").append(getNewHashRow(e.name, e.template));
      });
  
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
});

$("#addhashrow").click(function(){
  $("#hashlinks_container").append(getNewEmptyHashRow());
  $(".delete_row").click(function() {
    $(this).parent().remove();
  });
});


function getNewEmptyRow(){
  let newrow = `<div class="iplink">` +
  `<label for="name">Название: </label>` +
  `<input type="text" class="iplink_name"/>` +
  `<label for="template">Шаблон: </label>` +
  `<input type="text" class="iplink_template" placeholder="https://your-favorite-ip-check-service.net/api/path/\${ip}/info"/>` +
  `<input type="checkbox" class="iplink_local" title="Использовать для private-адресов">` +
  `<span class="delete_row" title="Удалить">❌</span>` +
  `</div>`;
  return newrow;
}


function getNewRow(name, template, checked){
  let newrow = `<div class="iplink">` +
  `<label for="name">Название: </label>` +
  `<input id="name" type="text" class="iplink_name" value="${name}"/>` +
  `<label for="template">Шаблон: </label>` +
  `<input id="template" type="text" class="iplink_template" value="${template}" placeholder="https://your-favorite-ip-check-service.net/api/path/\${ip}/info"/>` +
  `<input type="checkbox" class="iplink_local" title="Использовать для private-адресов" ${checked}>` +
  `<span class="delete_row" title="Удалить">❌</span>` +
  `</div>`;
  return newrow;
}


function getNewEmptyHashRow(){
  let newrow = `<div class="hashlink">` +
  `<label for="name">Название: </label>` +
  `<input type="text" class="hashlink_name"/>` +
  `<label for="template">Шаблон: </label>` +
  `<input type="text" class="hashlink_template" placeholder="https://your-favorite-ip-check-service.net/api/path/\${hash}/info"/>` +
  `<span class="delete_row" title="Удалить">❌</span>` +
  `</div>`;
  return newrow;
}


function getNewHashRow(name, template){
  let newrow = `<div class="hashlink">` +
  `<label for="name">Название: </label>` +
  `<input id="name" type="text" class="hashlink_name" value="${name}"/>` +
  `<label for="template">Шаблон: </label>` +
  `<input id="template" type="text" class="hashlink_template" value="${template}" placeholder="https://your-favorite-ip-check-service.net/api/path/\${hash}/info"/>` +
  `<span class="delete_row" title="Удалить">❌</span>` +
  `</div>`;
  return newrow;
}


document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
