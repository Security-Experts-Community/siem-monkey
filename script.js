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


oldHref = document.location.href.split("?")[0];
// inject script in main app and get some info from there. we want window.appConfig
// app locale is stored there
window.appConfig = "";
function injectScript(file_path, tag) {
  var node = document.getElementsByTagName(tag)[0];
  var script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', file_path);
  node.appendChild(script);
}
injectScript(chrome.runtime.getURL('web_accessible_resources.js'), 'body');

window.addEventListener("message", (event) => {
  // We only accept messages from ourselves
  if (event.source !== window) {
    return;
  }

  if (event.data.type && (event.data.type === "FROM_PAGE")) {
    console.log("SIEM Monkey: main page data received: " + event.data.text);
    if (event.data.text.length > 0) {
      window.appConfig = JSON.parse(event.data.text);
    }
  }
}, false);

pt_tags = ["pt-siem-app-root", "pt-nad-root"];
pt_product = false;
siem_bananas = {
  ".mc-sidebar_wide": "old",
  ".mc-sidebar_right": "R24",
  "mc-sidedar-toggle": "R25",
};
siem_ver = "";
prod_name = "";
pt_locale_date_formats = {
  "ru-RU":"d.M.y H:m:s",
  "en-US":"M/d/y H:m:s",
  "user":"",
};
date_format = "";

function get_prod_name() {
  let siem_title_elem = $(
    "body > pt-siem-app-root > pt-siem-header > header > mc-navbar > mc-navbar-container:nth-child(1) > pt-siem-navbar-brand > a > mc-navbar-title"
  );
  let siem_title = siem_title_elem.text();
  let nad_title_elem = $(".mc-navbar-title:first");
  let nad_title = nad_title_elem.text();
  if (siem_title.length > 0 || nad_title.length > 0) {
    return siem_title.length > 0 ? siem_title : nad_title;
  }
  return "";
}

function SearchBananas (selectors, callback, interval, timeout) {
  var time = 0;
  // exit early if not in pt product
  $.each(pt_tags, function(index, tag) {
    if (document.querySelectorAll(tag).length > 0) {
      pt_product = true;
      if (tag == "pt-siem-app-root") {
        monitorSIEMnav();
      }
    }
  })
  if (pt_product == false) {
    console.log("SIEM Monkey: monkey doesn't like it here");
    return;
  }

  var poll = setInterval(function () {
    let prod_name = get_prod_name();
    if (prod_name === "NAD") {
      console.log("SIEM Monkey: NAD is banana!");
      clearInterval(poll);
      callback("NAD");
      return;
    }

    if (typeof timeout !== "undefined" && time >= timeout) {
      clearInterval(poll);
      console.log("SIEM Monkey: monkey wants BANANAS");
      return;
    } else {
      $.each(siem_bananas, function (banana, ver) {
        let bananas_found = 0;
        bananas_found = document.querySelectorAll(banana).length;
        if (bananas_found == 0) {
          // no bananas in DOM. try in shadow DOM
          let legacy_events = $("legacy-events-page");
          if (legacy_events.length === 1) {
            let shadowRoot = legacy_events[0].shadowRoot;
            if (shadowRoot) {
              bananas_found = $(shadowRoot).find(banana).length;
            }
          }
        }
        if (bananas_found > 0) {
          console.log("SIEM Monkey: SIEM is banana!");
          siem_ver = ver;
          clearInterval(poll);
          callback("SIEM");
          return;
        }
      });
    }
    time += interval;
  }, interval);
};

/**
 * Adopting a constructed stylesheet to be used by the document or ShadowRoots 
 * @param {*} doc document or ShadowRoot to adopt
 * @param {*} path CSS file path
 */
function adoptCSS(doc, path) {
  let MonkeyCSS;
  try {
    let css_url = chrome.runtime.getURL(path);
    let xhr = new XMLHttpRequest();
    xhr.onload = function () {
      MonkeyCSS = this.response;
    };
    xhr.open("GET", css_url, false);
    xhr.send();
  } catch (err) {
    console.log("Не удалось прочитать файл " + path);
    return;
  }
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(MonkeyCSS);
  doc.adoptedStyleSheets = [sheet];
}

function siemMonkeyBind(product) {
  // Let's set locale and string formats for date/time conversions
  // TODO: add custom locale format to options
  let pt_locale;
  if (window.appConfig) {
    pt_locale = window.appConfig.locale;
  }
  if (pt_locale_date_formats["user"].length > 0) {
    date_format = pt_locale_date_formats["user"];
    console.log("SIEM Monkey: using custom date format. " + date_format);
  } else if (pt_locale && pt_locale_date_formats[pt_locale]) {
    date_format = pt_locale_date_formats[pt_locale];
    console.log("SIEM Monkey: " + pt_locale + " locale is set by App. Date format is " + date_format);
  } else {
    date_format = pt_locale_date_formats["ru-RU"];
    console.log("SIEM Monkey: Локаль не найдена и не установлена пользователем. Ну и пожалуйста. Ну и будет ru-RU.");
  }
  if (!$("img.monkeydropbtn").length) {
    insertMonkeyIntoUI(product);
  }

  // load CSS in main tree
  let ui_css_path = chrome.runtime.getURL("libs/jquery-ui-1.12.1/jquery-ui.min.monkey.css");
  let ui_css_path2 = chrome.runtime.getURL("siemMonkey.css");
  $('head').append($('<link>')
    .attr("rel","stylesheet")
    .attr("type","text/css")
    .attr("href", ui_css_path));
  $('head').append($('<link>')
    .attr("rel","stylesheet")
    .attr("type","text/css")
    .attr("href", ui_css_path2));

  // Если есть элементы "legacy-overlay" и "legacy-events-page", то мы очутились в 26.1
  // Загружать CSS и вешать обработчик мутаций страницы нужно внутри shadowRoot
  let legacy_overlay = $("legacy-overlay");
  if (legacy_overlay.length === 1) {
    let shadowRoot = legacy_overlay[0].shadowRoot;
    observer.observe(shadowRoot, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
    });
    adoptCSS(shadowRoot, "libs/jquery-ui-1.12.1/jquery-ui.min.monkey.css"); // using jquery-ui css just with embedded images
  }

  let legacy_events_page = $("legacy-events-page");
  if (legacy_events_page.length === 1) {
    let shadowRoot = legacy_events_page[0].shadowRoot;
    observer.observe(shadowRoot, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
    });
    adoptCSS(shadowRoot, "siemMonkey.css");
  } else {
    // Старый добрый UI до 26.0 включительно - вешаем обработчик мутаций прямо на весь document,
    // CSS уже подгружен
    observer.observe(document, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
    });
  }
}

function insertMonkeyIntoUI(product) {
  let siem_title_elem = $("body > pt-siem-app-root > pt-siem-header > header > mc-navbar > mc-navbar-container:nth-child(1) > pt-siem-navbar-brand > a > mc-navbar-title");
  let siem_title = siem_title_elem.text();

  let nad_title_elem = $(".mc-navbar-title:first");
  let nad_title_elem_text = nad_title_elem.text();
  
  if (product === "SIEM") {
    makeSideBarGreatAgain();
    let navbaritem = $(".mc-navbar-logo");
    navbaritem.append(`<img class="monkeydropbtn" width="32" height="32" src="${icondataurl}" alt="" />`);
    $(".monkeydropbtn")
    .delay(100).fadeTo(100,0.5)
    .delay(100).fadeTo(100,1)
    .delay(100).fadeTo(100,0.5)
    .delay(100).fadeTo(100,1)
    .delay(100).fadeTo(100,0.5)
    .delay(100).fadeTo(100,1)
    .delay(3000)
    .animate(
      { deg: 720 + 22.5 },
      {
        duration: 1200,
        step: function(now) {
          $(this).css({ transform: 'rotate(' + now + 'deg)' });
        }
      }
    );
  } else if (product === "NAD") {
    var navbaritem = $(".mc-navbar-logo");
    navbaritem.after(`<img class="monkeydropbtn" width="32" height="32" src="${icondataurl}" alt="" />`);
    $(".monkeydropbtn")
    .delay(100).fadeTo(100,0.5)
    .delay(100).fadeTo(100,1)
    .delay(100).fadeTo(100,0.5)
    .delay(100).fadeTo(100,1)
    .delay(100).fadeTo(100,0.5)
    .delay(100).fadeTo(100,1)
    .delay(3000)
    .animate(
      { deg: 720 + 22.5 },
      {
        duration: 1200,
        step: function(now) {
          $(this).css({ transform: 'rotate(' + now + 'deg)' });
        }
      }
    );
  }
} 


function makeSideBarGreatAgain()
{
  ///pt-icons
  sidebar = $('.mc-sidebar_wide'); //old ui
  if(sidebar.length == 0)
  {
    sidebar = $('.mc-sidebar_right'); //new ui R24
    if(sidebar.length == 0)
    {
      iframe = $('#legacyApplicationFrame'); 
      sidebar = $('.mc-sidebar_right', iframe.contents()); //new ui R25
      if (sidebar.length == 0) {
        // shadowRoot
        let legacy_events = $("legacy-events-page");
        if (legacy_events.length === 1) {
          let shadowRoot = legacy_events[0].shadowRoot;
          if (shadowRoot) {
            sidebar = $(shadowRoot).find('.mc-sidebar_right');
          }
        }
      }
    }
  }
  icons = sidebar.find(".pt-icons").first();
  icons.before(`<img class="blinkAndRemove sidebarWithMonkey" width="16" height="16" src="${icon16dateurl}" alt="" />`)
  sidebar.attr('style', function(i, style){   
      return style && style.replace(/(max-width: )(\d+)(px)/, '$131337$3');
  });
  icons.prev()
  .delay(100).fadeTo(100,0.5)
  .delay(100).fadeTo(100,1)
  .delay(100).fadeTo(100,0.5)
  .delay(100).fadeTo(100,1)
  .delay(100).fadeTo(100,0.5)
  .delay(100).fadeTo(100,1, function(){$(this).hide();});
}

function extractLast( term ) {
  let textbox = null;
  let legacy_overlay = $("legacy-overlay"); // UI 26.1
  if(legacy_overlay.length === 1) {
    let shadowRoot = legacy_overlay[0].shadowRoot;
    textbox = $("events-filter-popover textarea", shadowRoot);
  }
  else {
    textbox = $("events-filter-popover textarea");
  }
 
  let end = textbox[0].selectionStart;
  let result = /\S+$/.exec(textbox[0].value.slice(0, end));
  let lastWord = result ? result[0] : "nonexistent_field";
  return lastWord;
}


let observer = new MutationObserver(async mutations => {
  for(let mutation of mutations) {
      if(mutation.target.parentNode && mutation.target.parentNode.nodeName === 'EVENTS-FILTER-POPOVER'){
        // ━━━━━★. *･｡ﾟ✧⁺
        if(fields.length == 0)
        {
          let msg = await getTaxonomy();
          let fieldsinfo = msg['fields'];
          fields = fieldsinfo.filter(x => x.filterable == true).map(y => y['name']); //не все поля подходят для фильтров 
          fields.push('=');
          fields.push('!=');
          fields.push('>');
          fields.push('<');
          fields.push('>=');
          fields.push('<=');
          fields.push('in');
          fields.push('match');
          fields.push('startswith');
          fields.push('endswith');
          fields.push('contains');
          fields.push('and');
          fields.push('or');
          fields.push('not');
          fields.push('in_subnet');
        }

        ta = $("textarea", mutation.target.parentNode);
        ta.on("keydown", function(event) {
          if (event.keyCode === $.ui.keyCode.TAB && $(this).autocomplete("instance").menu.active) {
            event.preventDefault();
          }
        })
        .autocomplete({
          appendTo: ta.parent(),
          position: {my : "left top", at: `right top`},
          minLength: 1,
          source: function(request, response) {
            response($.ui.autocomplete.filter(fields, extractLast(request.term )));
          },
          focus: function() {
            return false;
          },
          open: function() {
            ta.textareaHelper();
            let XY = ta.textareaHelper("caretPos");
            let x = XY.left + 5;
            let y = XY.top + 20;
            $('.ui-autocomplete', ta.parent()).css('width', '230px'); // 230px хватит всем
            $('.ui-autocomplete', ta.parent()).position({my: "left top", at: `left+${x} top+${y}`, of: ta});
            // click is not triggered somehow. but mousedown is working. trigger click from mousedown
            let items = $(".ui-menu-item", ta.parent());
            items.on("mousedown", function (event) {
              event.preventDefault();
              $(this).click();
            });
          },
          select: function(event, ui) {
            let textbox = $(this);
            let end = textbox[0].selectionStart;
            let start = this.value.lastIndexOf(" ", end);
            let newvalue = this.value.substring(0, start) + " " //старое начало
            + ui.item.value + " "                               //новая середина
            + this.value.substring(end, this.value.length);     //старый конец
            this.value = newvalue;
            return false;
          }
        });
      }

      //Добавляет описание и ссылку на правило в разделе "события"
      if(mutation.target.parentNode && mutation.target.parentNode.parentNode 
        && mutation.target.parentNode.parentNode.nodeName === 'RULES-CARD-LINK'
        && mutation.target.parentNode.className === 'mc-link ng-binding ng-scope'
        && 'options' in options && 'dont_show_desc_rules' in options.options && options.options.dont_show_desc_rules === false){
          
          let correlation_name_node = $(mutation.target.parentNode.parentNode).children('span.mc-link.ng-scope');
          $(mutation.target.parentNode.parentNode).children('span.corr-desc').remove();
          $(mutation.target.parentNode.parentNode).children('i.corr-link').remove();
          
          let correlation_name = correlation_name_node.text();
          let msg = await getCorrelationRuleInfoByName(correlation_name);
          let [correlation_description, correlation_link_to_ptkb] = corr_name_info(msg);

          setTimeout(AddElementIfNotExist, 0, correlation_name_node, correlation_description);
          setTimeout(AddElementIfNotExist, 0, correlation_name_node, correlation_link_to_ptkb);
      }

      //Добавляет описание и ссылку на правило в разделе "инциденты"
      else if(mutation.target.parentNode && ((mutation.target.parentNode.parentNode 
        && mutation.target.parentNode.parentNode.nodeName === 'RULES-CARD-LINK')
        || mutation.target.parentNode.nodeName === 'RULES-CARD-LINK')
        && mutation.target.className === 'mc-link ng-scope'
        && 'options' in options && 'dont_show_desc_rules' in options.options && options.options.dont_show_desc_rules === false){
          
          let correlation_name_node = $(mutation.target.parentNode).children('span.mc-link.ng-scope');
          let correlation_name = correlation_name_node.text();
          let msg = await getCorrelationRuleInfoByName(correlation_name)
          
          let corr_desc_old = $(mutation.target.parentNode).children('span.corr-desc').text()

          if(!corr_desc_old || (corr_desc_old && msg['description'] !== corr_desc_old)){
            $(mutation.target.parentNode).children('span.corr-desc').remove();
            $(mutation.target.parentNode).children('i.corr-link').remove();

            let [correlation_description, correlation_link_to_ptkb] = corr_name_info(msg);
        
            setTimeout(AddElementIfNotExist, 0, correlation_name_node, correlation_description);
            setTimeout(AddElementIfNotExist, 0, correlation_name_node, correlation_link_to_ptkb);
          }  
      }

      for(let addedNode of mutation.addedNodes) {
        // Регистрация обработчиков клика на названия определенных полей в правом сайдбаре (карточка события)
        if (addedNode instanceof Node && (addedNode.className === "mc-dl-conditional ng-scope")) {
              if(addedNode.children.length = 2 && addedNode.children[0].innerHTML === "uuid") {
                if('options' in options &&
                 'dont_show_save_event_icons' in options.options && 
                 options.options.dont_show_save_event_icons == true) {
                  ; //если задана опция "Не показывать кнопки сохранения JSON события", то и не показываем
                }
                else {
                  await uuidChange(addedNode);
                }
                await shareableLinkIconAdd(addedNode);
              } 
              if(addedNode.children.length = 2 && addedNode.children[0].innerHTML.endsWith(".hash")) {
                if('options' in options && 'hashlinks' in options.options && options.options.hashlinks.length > 0) {
                  ObjectHashAdd(addedNode, addedNode.children[0].innerHTML);
                }
                else{
                  CommonFieldClick(addedNode, addedNode.children[0].innerHTML, GetVirusTotalLinkForHash);
                }
                
              }             
              if(addedNode.children.length = 2 && addedNode.children[0].innerHTML === "external_link") {
                CommonFieldClick(addedNode, "external_link", GetExternalLink);
              }
              if(addedNode.children.length = 2 && addedNode.children[0].innerHTML === "task_id") {
                CommonFieldClick(addedNode, "task_id", GetTaskLink);
              }
              if(addedNode.children.length = 2 && addedNode.children[0].innerHTML === "id") {
                CommonFieldClick(addedNode, "id", GetNormalizationSearchLink);
                await fieldAliases(addedNode); 
              }
              if(addedNode.children.length = 2 && addedNode.children[0].innerHTML === "correlation_name") {
                await fieldAliases(addedNode); 
              }
              if(addedNode.children.length = 2 && addedNode.children[0].innerHTML === "src.ip") {
                await ipfieldChangeObserver(addedNode, "src.ip");
              }
              if(addedNode.children.length = 2 && addedNode.children[0].innerHTML === "dst.ip") {
                await ipfieldChangeObserver(addedNode, "dst.ip");
              }
              if(addedNode.children.length = 2 && addedNode.children[0].innerHTML === "object") {
                ProcessHandler(addedNode);  
              }
            }
        }
   }
});


SearchBananas(
  siem_bananas,
  siemMonkeyBind,
  500,
  6000
);

async function GetOptionsFromStorage(){
  options  = await getStorageData('options');
}


const getStorageData = key =>
    new Promise((resolve, reject) =>
        chrome.storage.sync.get(key, result =>
          chrome.runtime.lastError
            ? reject(Error(chrome.runtime.lastError.message))
            : resolve(result)
        )
    )  


function getTaxonomy()
{
  //let siemUrl = window.location.href.split('#',1).slice(0, -1);  
  let siemUrl = window.location.origin;
  let request = $.ajax
  (
      {
          type: "GET",
          url: `${siemUrl}/api/events/v2/events_metadata`,
      }
  );
  return request;
}


function getCorrelationRuleInfoByName(correlation_name)
{
  //let siemUrl = window.location.href.split('#',1).slice(0, -1);  
  let siemUrl = window.location.origin;
  var request = $.ajax
  (
      {
          type: "GET",
          url: `${siemUrl}/api/siem/v2/rules/correlation/${correlation_name}`,
      }
  );
  return request;
}

function corr_name_info(msg) 
{
  let description = msg['description'];
  let objectId = msg['objectId'];

  let correlation_description = $('<span>')
  .addClass('corr-desc')
  .addClass('mc-text-light')
  .text(` (${description})`);

  let correlation_link_to_ptkb = $('<i title="Открыть правило в Knowledge Base">')
  .addClass('pt-icons')
  .addClass('pt-icons-external-link_16')
  .addClass('mc-link__icon')
  .addClass('corr-link')
  .css('margin-left', '4px')
  .css('cursor', 'pointer')
  .click(async function (){
    let siemUrl = window.location.origin;
    let link = `${siemUrl}:8091/#/siem/${objectId}`
    window.open(link, "_blank");
  });

  return [correlation_description, correlation_link_to_ptkb];
};

async function getdata(siemUrl, filter, count, callback, outputelemsuffix="", ttfrom="", ttto="")
{
    if(ttfrom === "")
    {
        tfrom = gtfrom;
    }
    else 
    {
        tfrom = ttfrom;
    }
    if(ttto === "")
    {
        tto = gtto;
    }
    else
    {
        tto = ttto;
    }

    let msg = await getTaxonomy();
    
            let prefields = msg['fields'];
            fields = prefields.filter(x => x.filterable == true).map(y => y['name']);
            fields.push('subevents');
            fields.push('time');

            let params = {"filter":
                            {"select": fields,
                            "where":`${filter}`,
                            "orderBy":[{"field":"time","sortOrder":"descending"}],
                            "groupBy":[],
                            "aggregateBy":[],
                            "distributeBy":[],
                            "top":null,
                            "aliases":{}},
                        "groupValues":null,
                        "timeFrom":tfrom,
                        "timeTo":tto};
            $(`#output${outputelemsuffix}`).text("Ожидайте...");
            let loading = document.createElement("div");
            loading.classList.add("lds-dual-ring");
            $(`#output${outputelemsuffix}`).html(loading); 

            $.ajax({
              type: "POST",
              url: `${siemUrl}/api/events/v2/events?limit=${count}&offset=0`,
              dataType: "json",
              contentType: "application/json; charset=utf-8",
              data: JSON.stringify(params),
              success: function(msg)
              {
                  $(".loading").remove();
                  loading.remove();
                  let events = msg['events'];
                  callback(events, outputelemsuffix);
              },
              error: function(msg)
              {
                $(`#output${outputelemsuffix}`).text("Что-то пошло не так, дерева не будет, может быть в другой раз...");
              }
            });
}


function ProcessHandler(addedNode) {
  $('.monkeymagicicon').remove();

  let hostname_element = $("div[title=\"object\"]", addedNode);
  let value_node = hostname_element.next();
  let value = $(".pt-preserve-white-space", value_node).text().trim("↵");
  //if(value === "process") {

    let value_node_span = $("pdql-fast-filter", value_node);
        
    let ancestors_branch_icon = $(`<span title="Предки процесса...">🦧</span>`);
    let session_tree_icon = $(`<span title="Дерево процессов сессии...">🦍</span>`);
    let descendants_tree_icon = $(`<span title="Потомки процесса...">🐒</span>`)

    ancestors_branch_icon.addClass("monkeymagicicon");
    session_tree_icon.addClass("monkeymagicicon");
    descendants_tree_icon.addClass("monkeymagicicon");
    
    value_node_span.after(descendants_tree_icon);
    value_node_span.after(ancestors_branch_icon);
    value_node_span.after(session_tree_icon);

    //одна ветка в дереве предков процесса
    ancestors_branch_icon.click(function (){
      var commandline = getFieldValueFromSidebar("object.process.cmdline");
      let object_process_guid = getFieldValueFromSidebar("object.process.guid");
      // иногда нужный GUID лежит в поле subject.process.guid
      if(object_process_guid == "") {
        object_process_guid = getFieldValueFromSidebar("subject.process.guid");
        commandline = getFieldValueFromSidebar("subject.process.cmdline");
      }

      w = $(document).width();
      h = $(document).height(); 

      element = $("div[title=\"object\"] + div span.pt-preserve-white-space", addedNode);
      newelem = $('<div>').attr("id", "output").attr("title", `Родители процесса ${commandline}`)
      .dialog(
        {
          height: h - 100,
          width: w - 100,
          close: function(event, ui){
            $(this).empty();
            $(this).remove();
            treeBranchEvents = [];
          }
        }
      ).prev(".ui-dialog-titlebar").css("background","#114e77").css("color", "white");

      let siemUrl = window.location.origin;
      var iframe = $('#legacyApplicationFrame'); 

      count = 1;

      let time = getTimeValueFromSidebar();
      let ttimeto = time + 3600; // на 1 час вперёд

      gtfrom = ttimeto - 86400; // и на сутки назад
      gtto = ttimeto;

      let uuid = getFieldValueFromSidebar("uuid");
      let msgid = getFieldValueFromSidebar("msgid");

      treeBranchEvents = [];

      // Если текущее событие - событие запуска процесса, запускаем процесс построения дерева
      if(msgid === '1' || msgid === '4688') {
        getdata(siemUrl, `uuid = '${uuid}'`, count, processTreeBranch, "", ttimeto - 86400, ttimeto);
      }
      // Иначе ищем доступными средствами соответсвующее событие запуска процесса 
      else {
        getdata(siemUrl,
          `object.process.guid = '${object_process_guid}' and msgid = 1`,
          1, 
          function(e) {
            let uuid = e[0]['uuid'];
            getdata(siemUrl, `uuid in ['${uuid}']`, count, processTreeBranch, "", ttimeto - 86400, ttimeto);
          },
        "",
        ttimeto - 86400, // 1 сутки назад
        ttimeto);
      }
    });

    //дерево процессов сессии
    session_tree_icon.click(function (){
      var commandline = getFieldValueFromSidebar("object.process.cmdline");
      let object_process_guid = getFieldValueFromSidebar("object.process.guid");
      // иногда нужный GUID лежит в поле subject.process.guid
      if(object_process_guid == "") {
        object_process_guid = getFieldValueFromSidebar("subject.process.guid");
        commandline = getFieldValueFromSidebar("subject.process.cmdline");
      }

      w = $(document).width();
      h = $(document).height(); 
      valueNode = $(this).next();
      hostname_value_element = $(".pt-preserve-white-space", valueNode);
      hostname = hostname_value_element.text()
      element = $("div[title=\"object\"] + div span.pt-preserve-white-space", addedNode);
      newelem = $('<div>').attr("id", "output").attr("title",`Родители процесса ${commandline}`)
      .dialog(
        {
          height: h - 100,
          width: w - 100,
          close: function(event, ui){
            $(this).empty();
            $(this).remove();
          }
        }
      ).prev(".ui-dialog-titlebar").css("background","#114e77").css("color", "white");;

      let siemUrl = window.location.origin;
      var iframe = $('#legacyApplicationFrame'); 


      let msgid = getFieldValueFromSidebar("msgid");
      let event_src_host = getFieldValueFromSidebar("event_src.host");
      let processStartMsgid = getFieldValueFromSidebar("msgid"); 

      let session = getFieldValueFromSidebar("object.account.session_id");
      
      let time = getTimeValueFromSidebar();

      
      // ограничение по числу процессов
      // TODO: придумать способ задавать этот параметр при необходимости
      count = 1000;

      let ttimeto = time;
      gtfrom = ttimeto - 86400;
      gtto = ttimeto;
      if(msgid === '1' || msgid === '4688') {
        getdata(siemUrl, `event_src.host = "${event_src_host}" and msgid = "${processStartMsgid}" and object.account.session_id = ${session} and (correlation_name = null)`, count, processTree, "", ttimeto - 86400, ttimeto);
      }
      else {
        getdata(siemUrl,
          `object.process.guid = '${object_process_guid}' and msgid = 1`,
          1, 
          function(e) {
            let event_src_host = e[0]['event_src.host'];
            let processStartMsgid = e[0]['msgid'];
            let session = e[0]['object.account.session_id'];

            getdata(siemUrl, `event_src.host = "${event_src_host}" and msgid = "${processStartMsgid}" and object.account.session_id = ${session} and (correlation_name = null)`, count, processTree, "", ttimeto - 86400, ttimeto);
          },
        "",
        ttimeto - 86400, // 1 сутки назад
        ttimeto);
      }
    });

    descendants_tree_icon.click(function (){
      var commandline = getFieldValueFromSidebar("object.process.cmdline");
      let object_process_guid = getFieldValueFromSidebar("object.process.guid");
      // иногда нужный GUID лежит в поле subject.process.guid
      if(object_process_guid == "") {
        object_process_guid = getFieldValueFromSidebar("subject.process.guid");
        commandline = getFieldValueFromSidebar("subject.process.cmdline");
      }

      events_for_children_waiting = [];
      w = $(document).width();
      h = $(document).height(); 

      element = $("div[title=\"object\"] + div span.pt-preserve-white-space", addedNode);
      newelem = $('<div>').attr("id", "output").attr("title",`Потомки процесса ${commandline}`)
      .dialog(
        {
          height: h - 100,
          width: w - 100,
          close: function(event, ui){
            $(this).empty();
            $(this).remove();
            treeBranchEvents = [];
          }
        }
      ).prev(".ui-dialog-titlebar").css("background","#114e77").css("color", "white");
      //siemUrl = window.location.href.split('#',1).slice(0, -1);
      let siemUrl = window.location.origin;
      var iframe = $('#legacyApplicationFrame'); 
      count = 100;

      let msgid = getFieldValueFromSidebar("msgid");
      let uuid = getFieldValueFromSidebar("uuid");


      let time = getTimeValueFromSidebar();

      let ttimeto = time + 86400; // на сутки вперед
      gtfrom = time - 600; // и на 10 минут назад на всякий случай
      gtto = ttimeto;


      treeBranchEvents = [];

      // Если текущее событие - событие запуска процесса, запускаем процесс построения дерева
      if(msgid === '1' || msgid === '4688') {
        getdata(siemUrl, `uuid = '${uuid}'`, count, processTreeBranchReverse, "", ttimeto - 86400 - 600, ttimeto);    //TODO: со временем путаница и не удобно, надо распутаться
      }
      // Иначе ищем доступными средствами соответсвующее событие запуска процесса 
      else {
        getdata(siemUrl,
          `object.process.guid = '${object_process_guid}' and msgid = 1`,
          1, 
          function(e) {
            let uuid = e[0]['uuid'];
            getdata(siemUrl, `uuid = '${uuid}'`, count, processTreeBranchReverse, "", ttimeto - 86400 - 600, ttimeto);    //TODO: со временем путаница и не удобно, надо распутаться
          },
        "",
        ttimeto - 86400, // 1 сутки назад
        ttimeto);
      }
    });
  //}
}

/**
 * Получить значение поля события из правой панели 
 * @param {str} fieldName название поля
 * @returns {str} значение поля
 */
function getFieldValueFromSidebar(fieldName) {
  let legacy_events_page = $("legacy-events-page");
  if(legacy_events_page.length === 1) {
    let shadowRoot = legacy_events_page[0].shadowRoot;
    let fieldValue = $(`div[title=\"${fieldName}\"] + div > div > div:first`, shadowRoot).text().trim('↵');  
    return fieldValue;
  }

  let iframe = $('#legacyApplicationFrame'); 
  let fieldValue = $(`div[title=\"${fieldName}\"] + div > div > div:first`, iframe.contents()).text().trim('↵');
  if (fieldValue == "") {
    fieldValue = $(`div[title=\"${fieldName}\"] + div > div > div:first`).text().trim('↵');
  }
  return fieldValue;
}

/**
 * Получить значение времени из правой панели
 * @returns {str} время в виде строки вида 20.06.2023 13:18:49
 */
function getTimeValueFromSidebar() {
  let legacy_events_page = $("legacy-events-page");
  if(legacy_events_page.length === 1) {
    let shadowRoot = legacy_events_page[0].shadowRoot;
    // class="layout-padding_no-left mc-sidebar-header__title flex ng-binding"
    let time = $("mc-sidebar-opened > header > div.layout-row.flex > div > div", shadowRoot).text().trim("↵");
    // SIEM don't want milliseconds, microseconds and nanoseconds
    return_time = getDateFromFormat(time, date_format)/1000;
    return return_time;
  }

  let time = $("body > section > div > div > events-page > div > section > mc-sidebar.mc-sidebar_wide.mc-sidebar_right.ng-scope.ng-isolate-scope > mc-sidebar-opened > header > div.layout-row.flex > div > div").text().trim("↵");
  if(time.length === 0 ) { 
    time = $("mc-sidebar-opened > header > div.layout-row.flex > div > div").text().trim("↵");
    if (time.length === 0) {
      let iframe = $('#legacyApplicationFrame'); 
      time = $("mc-sidebar-opened > header > div.layout-row.flex > div > div", iframe.contents()).text().trim("↵");
    }
  }
  // SIEM don't want milliseconds, microseconds and nanoseconds
  return_time = getDateFromFormat(time, date_format)/1000;
  return return_timetime;
}

function ExternalLink(addedNode) {
  external_link_element = $("div[title=\"external_link\"]", addedNode);
  external_link_element.click(function (){
    valueNode = $(this).next();
    external_link_value_element = $(".pt-preserve-white-space", valueNode);
    external_link = external_link_value_element.text()
    window.open(external_link, "_blank"); 
  });
}

function DstIPAdd(addedNode) {
  $('.monkeyipinfo').remove();
  dst_ip_element = $("div[title=\"dst.ip\"]", addedNode);
  value_node = dst_ip_element.next();
  value_node_span = $("pdql-fast-filter", value_node);

  dst_ip_element.text("▸dst.ip");
  dst_ip_element.click(function () {
    if ($(".ip-check-external-link", addedNode).css("display") === "block") {
        $(".ip-check-external-link", addedNode).css("display", "none");
        $(this).text("▸dst.ip");
    } 
    else {
        $(".ip-check-external-link", addedNode).css("display", "block");
        $(this).text("▾dst.ip");
    }
  });

  dst_ip_span = $("div[title=\"dst.ip\"] + div span.pt-preserve-white-space", addedNode);
  dst_ip_span.nextAll("span").remove();

  AddExternalServiceLink(dst_ip_span, "проверить на VT", VTLink);
  AddExternalServiceLink(dst_ip_span, "проверить на AbuseIPDB", AbuseIPDBLink);
  AddExternalServiceLink(dst_ip_span, "проверить на IP-API", IPAPILink);
  AddExternalServiceLink(dst_ip_span, "проверить на SPUR", SpurLink);
  AddExternalServiceLink(dst_ip_span, "проверить на Whois7", Whois7Link);
  AddExternalServiceLink(dst_ip_span, "проверить на RSTCloud", RSTCloudLink);
  if('options' in options && 'iplinks' in options.options){
    options.options.iplinks.forEach(e => {
      let link = e.template.replace('${ip}', )
      AddExternalServiceLink(dst_ip_span, e.name, (ip) => e.template.replace('${ip}', ip));
    });
  }
}

function SrcIPAdd(addedNode) {
  src_ip_element = $("div[title=\"src.ip\"]", addedNode);
  src_ip_element.text("▸src.ip");
  src_ip_element.click(function () {
    if ($(".ip-check-external-link", addedNode).css("display") === "block") {
        $(".ip-check-external-link", addedNode).css("display", "none");
        $(this).text("▸src.ip");
    } 
    else {
        $(".ip-check-external-link", addedNode).css("display", "block");
        $(this).text("▾src.ip");
    }
  });

  src_ip_span = $("div[title=\"src.ip\"] + div span.pt-preserve-white-space", addedNode);
  src_ip_span.nextAll("span").remove();

  AddExternalServiceLink(src_ip_span, "проверить на VT", VTLink);
  AddExternalServiceLink(src_ip_span, "проверить на AbuseIPDB", AbuseIPDBLink);
  AddExternalServiceLink(src_ip_span, "проверить на IP-API", IPAPILink);
  AddExternalServiceLink(src_ip_span, "проверить на SPUR", SpurLink);
  AddExternalServiceLink(src_ip_span, "проверить на Whois7", Whois7Link);
  AddExternalServiceLink(src_ip_span, "проверить на RSTCloud", RSTCloudLink);
  if('options' in options && 'iplinks' in options.options){
    options.options.iplinks.forEach(e => {
      let link = e.template.replace('${ip}', )
      AddExternalServiceLink(src_ip_span, e.name, (ip) => e.template.replace('${ip}', ip));
    });
  }
}

function ObjectHashAdd(addedNode, fieldname) {
  $('.monkeyipinfo').remove();
  dst_ip_element = $(`div[title=\"${fieldname}\"]`, addedNode);
  value_node = dst_ip_element.next();
  value_node_span = $("pdql-fast-filter", value_node);

  dst_ip_element.text(`▸${fieldname}`);
  dst_ip_element.click(function () {
    if ($(".ip-check-external-link", addedNode).css("display") === "block") {
        $(".ip-check-external-link", addedNode).css("display", "none");
        $(this).text(`▸${fieldname}`);
    } 
    else {
        $(".ip-check-external-link", addedNode).css("display", "block");
        $(this).text(`▾${fieldname}`);
    }
  });

  object_hash_span = $(`div[title=\"${fieldname}\"] + div span.pt-preserve-white-space`, addedNode);
  object_hash_span.nextAll("span").remove();

  AddHashExternalServiceLink(object_hash_span, "проверить на VT", VTHashLink);
  // AddHashExternalServiceLink(object_hash_span, "проверить на RSTCloud", RSTCloudHashLink);
  if('options' in options && 'hashlinks' in options.options){
    options.options.hashlinks.forEach(e => {
      let link = e.template.replace('${hash}', )
      AddHashExternalServiceLink(object_hash_span, e.name, (hash) => {
        hash = ExtractHashFromHashValue(hash)
        return e.template.replace('${hash}', hash)
      });
    });
  }
}


function AddExternalServiceLink(src_ip_span, text, callback) {
  vtdiv = $("<span>");
  vtdiv.addClass('ip-check-external-link');
  vtdiv.text(text);
  vtdiv.hover(function(){
    let ip_to_check = $(".pt-preserve-white-space", $(this).parent()).text().replace(/[^.0-9]+/g, "");
    $(this).css('cursor','pointer').attr('title', callback(ip_to_check));
    }, function() {
    $(this).css('cursor','auto');
  });
  vtdiv.click(function () {
    let ip_to_check = $(".pt-preserve-white-space", $(this).parent()).text().replace(/[^.0-9]+/g, "");
    window.open(callback(ip_to_check), "_blank");
  });
  vtdiv.insertAfter(src_ip_span);
}

function AddHashExternalServiceLink(src_ip_span, text, callback) {
  vtdiv = $("<span>");
  vtdiv.addClass('ip-check-external-link');
  vtdiv.text(text);
  vtdiv.hover(function(){
    let ip_to_check = $(".pt-preserve-white-space", $(this).parent()).text();//.replace(/[^.0-9]+/g, "");
    $(this).css('cursor','pointer').attr('title', callback(ip_to_check));
    }, function() {
    $(this).css('cursor','auto');
  });
  vtdiv.click(function () {
    let ip_to_check = $(".pt-preserve-white-space", $(this).parent()).text();//.replace(/[^.0-9]+/g, "");
    window.open(callback(ip_to_check), "_blank");
  });
  vtdiv.insertAfter(src_ip_span);
}

function VTLink(ip_to_check)
{
  return `https://www.virustotal.com/gui/ip-address/${ip_to_check}/details`;
}

function IPAPILink(ip_to_check)
{
  return `https://ip-api.com/#${ip_to_check}`;
}

function AbuseIPDBLink(ip_to_check)
{
  return `https://www.abuseipdb.com/check/${ip_to_check}`;
}

function SpurLink(ip_to_check)
{
  return `https://spur.us/context/${ip_to_check}`;
}

function Whois7Link(ip_to_check)
{
  return `https://whois7.ru/?q=${ip_to_check}`;
}

function RSTCloudLink(ip_to_check)
{
  return `https://www.rstcloud.com/ioc-lookup-results/?search=${ip_to_check}`;
}

function VTHashLink(hash_to_check)
{
  hash_to_check = ExtractHashFromHashValue(hash_to_check);
  console.log(hash_to_check);
  return `https://www.virustotal.com/gui/file/${hash_to_check}/details`;
}

function RSTCloudHashLink(hash_to_check)
{
  hash_to_check = ExtractHashFromHashValue(hash_to_check);
  console.log(hash_to_check);
  return `https://www.rstcloud.com/ioc-lookup-results/?search=${hash_to_check}`;
}

function ExtractHashFromHashValue(hash_to_check) {
  if (hash_to_check.includes(':')) {
     let hashes = {};
     let hash_pairs = hash_to_check.split(/\s/);
     hash_pairs.map( h => {
       let [key, value] = h.split(/:/);
       hashes[key.toLowerCase()] = value;
    });
    console.log(hashes);
  
    if("sha256" in hashes) {
    hash_to_check = hashes["sha256"];
    }
    else if("sha1" in hashes) {
      hash_to_check = hashes["sha256"];
    }
    else if("md5" in hashes) {
      hash_to_check = hashes["sha256"];
    }
  }
  return hash_to_check;
}


/**
 * Обобщенный обработчик для добавления обработчика события onclick для названия поля события.
 * По клику извлекает значение поля и передаёт его текст в качестве параметра при вызове callback-функции.
 * Значение, возвращенное из callback интерпретируется как ссылка на внешний ресурс, корая открывается в новой вкладке.
 * @param {Node} addedNode добавляемый на страницу узел
 * @param {*} callback callback для получения ссылки на основе значения поля
 */
 async function CommonFieldClick(addedNode,  fieldname, callback) {
  element = $(`div[title=\"${fieldname}\"]`, addedNode);
  element.click(async function (){
    valueNode = $(this).next();
    value = $(".pt-preserve-white-space", valueNode);
    link = await callback(value.text());
    window.open(link, "_blank"); 
  });
} 


/**
 * Возвращает ссылку на страницу VT для файла с определённым хешем
 * @param {string} object_hash значение поля object.hash (или других аналогичных полей)
 * @returns 
 */
function GetVirusTotalLinkForHash(object_hash) {
  object_hash = object_hash.trim("↵");
  if (object_hash.includes(':')) {
    let hashes = {};
    let hash_pairs = object_hash.split(/\s/);
    hash_pairs.map( h => {
      let [key, value] = h.split(/:/);
      hashes[key.toLowerCase()] = value;
  });
  console.log(hashes);
 
  if("sha256" in hashes) {
    object_hash = hashes["sha256"];
  }
  else if("sha1" in hashes) {
    object_hash = hashes["sha1"];
  }
  else if("md5" in hashes) {
    object_hash = hashes["md5"];
  }

    //object_hash = object_hash.split(/:|\s/)[1].replace(/[\W_]+/g, "");
  }
  return `https://www.virustotal.com/gui/file/${object_hash}/detection`;
}

/**
 * Возвращает ссылку из поля external_link
 * @param {string} external_link значение поля external_link (ссылка на внешний ресурс)
 * @returns 
 */
 async function GetExternalLink(external_link) {
  // TODO: проверить, что значение начинается на 'http'
  // Если event_src.title = "multiscanner", то это sandbox и возможно надо подменить ссылку
  title = $("div[title=\"event_src.title\"] + div pdql-fast-filter span.pt-preserve-white-space").text().trim('↵');
  if(title == "multiscanner")
  {
    msg = await getRegisterdApps();
    apps = msg['applications'];
    // костыль: у кого порт 8443, тот наверняка не PT Sandbox, а PT AF 3
    sandboxUrl = apps.filter(x => {return x.type === 'PT.MS' && !x.endpoint.includes(':8443') })[0]['endpoint'];
    const regex = new RegExp('https://(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\/');
    external_link = external_link.replace(regex, sandboxUrl + '/');
    return external_link;
  }
  else 
  {
    return external_link;
  }
};

/**
 * Возвращает ссылку на PTKB с фильтром, содержашим id события для полнотекстового поиска нужно правила нормализации
 * @param {string} id значение поля id события
 * @returns ссылка на PTKB
 */
function GetNormalizationSearchLink(id) {
  siemUrl = window.location.origin;
  return `${siemUrl}:8091/#/siem/knowledge-packs?filter=%7B%22SiemObjectRegex%22:%5B%22${id}%22%5D,"DeploymentStatus":%5B"1"%5D%7D`;
};

/**
 * Возвращает ссылку на задачу SIEM по идентификатору задачи
 * @param {string} task_id идентификатор задачи
 * @returns ссылка на задачу SIEM
 */
function GetTaskLink(task_id) {
  //siemUrl = window.location.href.split('#',1).slice(0, -1);
  let siemUrl = window.location.origin;
  return `${siemUrl}/#/scanning/tasks/scan/history/${task_id}`;
};

/**
 * Получить информацию о зарегистрированных приложениях (PT NAD, PT AF, PT Sandbox и т.д.)
 * @returns информация о зарегистрированных приложениях
 */
 async function getRegisterdApps() {
  //siemUrl = window.location.href.split('#',1).slice(0, -1);
  let siemUrl = window.location.origin;
  let request = await $.ajax
  (
      {
          type: "GET",
          url: `${siemUrl}/api/tenants/v2/menu`,
      }
  );
  return request;
}

function AddElementIfNotExist(value_node_span, descendants_tree_icon, classname)
{
  let legacy_events_page = $("legacy-events-page");
  if(legacy_events_page.length === 1) {
    let shadowRoot = legacy_events_page[0].shadowRoot;
    if($(classname, shadowRoot).length === 0) {
      value_node_span.after(descendants_tree_icon);
    }
    else{
      console.log($(classname))
    }

  }
  else {
    if($(classname).length === 0) {
      value_node_span.after(descendants_tree_icon);
    }
    else{
      console.log($(classname))
    }
  }
}

async function ipfieldChangeObserver(addedNode, fieldname){
  
  setTimeout(function(addedNode){
    let src_ip_span = $(`div[title=\"${fieldname}\"] + div span.pt-preserve-white-space`, addedNode);
    const ip_span_observer = new MutationObserver(mutationList =>
      // костылим ожидание, пока загрузится всё в правой панели, 500 мс должно хватить
      setTimeout(function(changedElement){
        $(changedElement).nextAll("span").remove();
        src_ip = $(changedElement).text();
        let addr = ipaddr.parse(src_ip);
        let range = addr.range();

        if (range === "unicast") {
          AddExternalServiceLink(src_ip_span, "проверить на VT", VTLink);
          AddExternalServiceLink(src_ip_span, "проверить на AbuseIPDB", AbuseIPDBLink);
          AddExternalServiceLink(src_ip_span, "проверить на IP-API", IPAPILink);
          AddExternalServiceLink(src_ip_span, "проверить на SPUR", SpurLink);
          AddExternalServiceLink(src_ip_span, "проверить на Whois7", Whois7Link);
          AddExternalServiceLink(src_ip_span, "проверить на RSTCloud", RSTCloudLink);
        }

        if('options' in options && 'iplinks' in options.options){
          let services = [...options.options.iplinks].reverse();
          services.forEach(e => {
            if(range === "unicast" || (range === "private" && e.local)){
              AddExternalServiceLink(src_ip_span, e.name, (ip) => e.template.replace('${ip}', ip));
            }
          });
        }
      
      },
      500,
      src_ip_span)
    );
    span_to_observe = addedNode.querySelector(`div[title=\"${fieldname}\"] + div span.pt-preserve-white-space`);
    if (span_to_observe) {
      ip_span_observer.observe(span_to_observe,{childList: true, subtree: true, characterDataOldValue: true,});
    }

    src_ip_element = $(`div[title=\"${fieldname}\"]`, addedNode);
    src_ip_element.text(`▸${fieldname}`);
    src_ip_element.click(function () {
      if ($(".ip-check-external-link", addedNode).css("display") === "block") {
          $(".ip-check-external-link", addedNode).css("display", "none");
          $(this).text(`▸${fieldname}`);
      } 
      else {
          $(".ip-check-external-link", addedNode).css("display", "block");
          $(this).text(`▾${fieldname}`);
      }
    });

    src_ip_span.nextAll("span").remove();
    src_ip = src_ip_span.text();
    let addr = ipaddr.parse(src_ip);
    let range = addr.range();

    if (range === "unicast") {
      AddExternalServiceLink(src_ip_span, "проверить на VT", VTLink);
      AddExternalServiceLink(src_ip_span, "проверить на AbuseIPDB", AbuseIPDBLink);
      AddExternalServiceLink(src_ip_span, "проверить на IP-API", IPAPILink);
      AddExternalServiceLink(src_ip_span, "проверить на SPUR", SpurLink);
      AddExternalServiceLink(src_ip_span, "проверить на Whois7", Whois7Link);
      AddExternalServiceLink(src_ip_span, "проверить на RSTCloud", RSTCloudLink);
    }

    if('options' in options && 'iplinks' in options.options){
      let services = [...options.options.iplinks].reverse();
      services.forEach(e => {
        if(range === "unicast" || (range === "private" && e.local)){
          AddExternalServiceLink(src_ip_span, e.name, (ip) => e.template.replace('${ip}', ip));
        }
      });
    }

  },
  500,
  addedNode);  
}


/**
 * Добавить обработчик появления и изменения значения элемента uuid в правой панели
 * @param {*} addedNode добавляемый элемент на страницу
 */
async function uuidChange(addedNode){
  // костылим ожидание, пока загрузится всё в правой панели, 500 мс должно хватить
  setTimeout(function(addedNode){
    // uuid меняется при клике на каждое новое событие, т.к. он уникален
    // это можно использоать для добавления/удаления элементов при необходимости
    let value_node_span = $("pdql-fast-filter", addedNode);
  
    // нарисовать иконки при изменении значения поля uuid
    const value_span_observer = new MutationObserver(mutationList =>
    // костылим ожидание, пока загрузится всё в правой панели, 500 мс должно хватить
      setTimeout(function(changedElement){
        let sidebar = changedElement.closest('mc-sidebar');
        // нужно убрать старую иконку загрузки сабивентов
        $('.downloadsubeventsnormalizedicon').remove();
        // и нарисовать новую, если есть поле correlation_name
        let correlation_name = $("div[title=\"correlation_name\"]", sidebar)
        if(correlation_name.length > 0) {
          AddDownloadNormalizedSubeventsIcon($('.downloadnormalizedicon'));
        }
      },
      500,
      value_node_span)
    );

    value_node_to_observe = addedNode.querySelector("pdql-fast-filter");
    if (value_node_to_observe) {
      value_span_observer.observe(value_node_to_observe,{childList: true, subtree: true, characterDataOldValue: true,});
    }

    // нарисовать иконки загрузки событий при появлении uuid первый раз на странице
    let sidebar = $(addedNode).closest('mc-sidebar');
    let event_icon_type = $('event-icon-type', sidebar);
    let correlation_name = $("div[title=\"correlation_name\"]", sidebar);
    if(correlation_name.length > 0) {
      AddDownloadNormalizedSubeventsIcon(event_icon_type.next());
    }
    AddDownloadNormalizedIcon(event_icon_type.next());
  },
  500,
  addedNode);
}

/**
 * Добавить обработчик появления значения элемента uuid в правой панели для размещения дополнительных иконок
 * @param {*} addedNode добавляемый элемент на страницу
 */
async function shareableLinkIconAdd(addedNode){
  // костылим ожидание, пока загрузится всё в правой панели, 500 мс должно хватить
  setTimeout(function(addedNode){
    let sidebar = $(addedNode).closest('mc-sidebar');
    let event_icon_type = $('event-icon-type', sidebar);
    AddGetShareableEventLinkIcon(event_icon_type);
  },
  500,
  addedNode);
}


/**
 * Добавить иконку сохранения в файл исходных событий для корреляционного события
 * @param {*} addedNode добавляемый элемент (этот элемент будет левым братом для иконки)
 */
function AddDownloadNormalizedSubeventsIcon(addedNode) {
  value_node_span = $(addedNode);

  download_all_subevents_icon = $(`<span title="Сохранить JSON всех исходных событий в файл">🖫</span>`);
  download_all_subevents_icon.addClass("downloadsubeventsnormalizedicon");
  setTimeout(AddElementIfNotExist, 200, value_node_span, download_all_subevents_icon, ".downloadsubeventsnormalizedicon"); 
  download_all_subevents_icon.click(function(){
    //siemUrl = window.location.href.split('#',1).slice(0, -1);
    let siemUrl = window.location.origin;
    let uuid = getFieldValueFromSidebar('uuid');
    let time = getTimeValueFromSidebar();
    gtfrom = time; 
    gtto = time;
    getdata(siemUrl, `uuid = '${uuid}'`, 1, processCorrleationEventDownloadSubevents, "", gtfrom, gtto);    //TODO: со временем путаница и не удобно, надо распутаться
  })
}

/**
 * Добавить иконки сохранения в буфер обмена и сохранения в файл текущего события 
 * @param {*} addedNode добавляемый элемент (этот элемент будет левым братом для иконок)
 */
function AddDownloadNormalizedIcon(addedNode) {
  value_node_span = $(addedNode);

  copy_normalized_icon = $(`<span title="Скопировать JSON события в буфер обмена">📋</span>`);//
  copy_normalized_icon.addClass("copynormalizedicon");
  setTimeout(AddElementIfNotExist, 500, value_node_span, copy_normalized_icon, ".copynormalizedicon"); 

  download_normalized_icon = $(`<span title="Сохранить JSON события в файл">💾</span>`);//
  download_normalized_icon.addClass("downloadnormalizedicon");
  setTimeout(AddElementIfNotExist, 300, value_node_span, download_normalized_icon, ".downloadnormalizedicon"); 
 
  download_normalized_icon.click(function ()
  {
    let siemUrl = window.location.origin;
    let uuid = getFieldValueFromSidebar('uuid');
    let time = getTimeValueFromSidebar();
    gtfrom = time; 
    gtto = time;
    getdata(siemUrl, `uuid = '${uuid}'`, 1, processCorrleationEventDownload, "", gtfrom, gtto);
  })

  copy_normalized_icon.click(function ()
  {
    let siemUrl = window.location.origin;
    let uuid = getFieldValueFromSidebar('uuid');
    let time = getTimeValueFromSidebar();
    gtfrom = time; 
    gtto = time;
    getdata(siemUrl, `uuid = '${uuid}'`, 1, processEventCopyToClipboard, "", gtfrom, gtto);
  })
}


/**
 * Добавить иконку сохранения ссылки на текущее событие в буфер обмена
 * @param {*} addedNode добавляемый элемент (этот элемент будет левым братом для иконки)
 */
function AddGetShareableEventLinkIcon(addedNode) {
  value_node_span = $(addedNode);

  link_icon = $(`<i class="pt-icons pt-icons-link_16" title="Ссылка на это событие"></i>`);
  link_icon.addClass("shareableeventlink");
  setTimeout(AddElementIfNotExist, 200, value_node_span, link_icon, ".shareableeventlink"); 
  link_icon.click(function(){
    siemUrl = window.location.href.split('#',1).slice(0, -1);
    if(siemUrl == ""){
      siemUrl = origin;
    }
    let uuid = getFieldValueFromSidebar('uuid');
    let time = getTimeValueFromSidebar();
    time = time*1000;
    let link = `${siemUrl}/#/events/view?where=uuid=%22${uuid}%22&period=range&start=${time}&end=${time}`;
    console.log(link);
    navigator.clipboard.writeText(link);
    let legacy_events_page = $("legacy-events-page");
    let searchNode;
    if(legacy_events_page.length === 1) {
      searchNode = legacy_events_page[0].shadowRoot;
    }
    else {
      searchNode = document;
    }
    let icon = $(".shareableeventlink", searchNode);
    $('<div>Ссылка в буфере обмена...</div>').insertAfter(icon).show().delay(500).fadeOut(500, function() { $(this).remove(); })
  })
}

async function popup_event_handler() {
  let applicationNode = null;
  let legacy_events_page = $("legacy-events-page"); //UI 26.1
  if(legacy_events_page.length === 1) {
      applicationNode = legacy_events_page[0].shadowRoot;
  }
  else {
      applicationNode = $('#legacyApplicationFrame').contents(); 
  }
  let params = {};

  try {
      // получаем от SIEM список поддерживаемых полей и для каждого поля парсим из правого сайдбара значение
      let msg = await getTaxonomy();
      let fields = msg['fields'];
      fields.forEach( x => {
          params[x.name] = $(`div[title=\"${x.name}\"] + div > div > div:first`, applicationNode).text().trim('↵');
      });
      let time = getTimeValueFromSidebar();
      params['time'] = time*1000;
  }
  catch(err)
  {
      // если не вышло, то считаем, что мы в NAD, поэтому пробуем получить адреса и порты с карточки сессии/атаки
      // TODO: решить, как быть с NAD - надо как-то определять, что мы точно в NADе
      params['nad_src_ip'] = $('details-endpoint[dir="src"] span[ng-if="::details[dir].ip"]', applicationNode)
      .first().text();
      params['nad_dst_ip'] = $('details-endpoint[dir="dst"] span[ng-if="::details[dir].ip"]', applicationNode)
      .first().text();
      params['nad_src_port'] = $('details-endpoint[dir="src"] span[ng-if="::details[dir].port"]', applicationNode)
      .eq(1).text();
      params['nad_dst_port'] = $('details-endpoint[dir="dst"] span[ng-if="::details[dir].port"]', applicationNode)
      .eq(1).text();
      params['session_start'] = $('div[row-title="Начало"]', applicationNode).attr('row-value');
  }
  chrome.runtime.sendMessage({
      'title': document.title,
      'url': window.location.origin,
      'params': params
  });
}

// Подписываемся на оповещения только в основном окне, а в iframe не будем
if(window.location.pathname != '/ng1/') {
  //console.log(window.location);
  chrome.runtime.onMessage.addListener(
     async function (request, sender, reply){
      console.log(request.siemMonkeyMessage);
      if(request.siemMonkeyMessage == "getEventDetaisFromSidebar"){
        await popup_event_handler();
      }
      return true;
    });
} 


async function fieldAliases(addedNode) {
  await applyFieldAliases(addedNode);
  let value_node_span = $("pdql-fast-filter", addedNode);
  //value_node_span.on('DOMSubtreeModified', async function(){
  const value_node_span_observer = new MutationObserver(mutationList =>
    // костылим ожидание, пока загрузится всё в правой панели, 500 мс должно хватить
    setTimeout(async function(changedElement){
      await applyFieldAliases(changedElement);
    },
    500,
    value_node_span)
  );

  value_node_span_to_observe = addedNode.querySelector("pdql-fast-filter");
  if (value_node_span_to_observe) {
    value_node_span_observer.observe(value_node_span_to_observe,{childList: true, subtree: true, characterDataOldValue: true,});
  }
}

var originalFieldsNames = []
async function applyFieldAliases(changedElement) {
  let sidebar = changedElement.closest('mc-sidebar');
  /// Вернуть всё, как было
  try {
    if(originalFieldsNames.length == 0){
      let msg = await getTaxonomy();
      originalFieldsNames = msg['fields'];
    }
    originalFieldsNames.forEach(x => {
      let element = $(`div[title=\"${x.name}\"]`, sidebar);
      element.text(x.name);
    });
  }
  catch (err) {
    console.log(err);
  }
  /// 
  let fieldAliases;
  try {
    let aliases = chrome.runtime.getURL('fieldaliases.json');
    let xhr = new XMLHttpRequest();
    xhr.onload = function () {
      fieldAliases = JSON.parse(this.response);
    };
    xhr.open('GET', aliases, false);
    xhr.send();
  }
  catch (err)
  {
    console.log("Не удалось прочитать файл fieldaliases.json");
    return;
  }

  if("default" in fieldAliases){
    let fieldsObj = fieldAliases["default"];
    Object.keys(fieldsObj).forEach(function (fieldName) {
      field = $(`div[title=\"${fieldName}\"]`, sidebar);
      field.text(fieldsObj[fieldName]);
    });
  }


  let id = $(`div[title=\"id\"] + div > div > div:first`, sidebar).text().trim('↵');
  if (id in fieldAliases) {
    let fieldsObj = fieldAliases[id];
    Object.keys(fieldsObj).forEach(function (fieldName) {
      field = $(`div[title=\"${fieldName}\"]`, sidebar);
      field.text(fieldsObj[fieldName]);
    });
  }

  let correlation_name = $(`div[title=\"correlation_name\"] + div > div > div:first`, sidebar).text().trim('↵');
  if (correlation_name in fieldAliases) {
    let fieldsObj = fieldAliases[correlation_name];
    Object.keys(fieldsObj).forEach(function (fieldName) {
      field = $(`div[title=\"${fieldName}\"]`, sidebar);
      field.text(fieldsObj[fieldName]);
    });
  }
}




var gtfrom = 0;
var gtto = 0;
let icondataurl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAQAAADZc7J/AAAABGdBTUEAALGPC/xhBQAAAAJiS0dEAP+Hj8y/AAAACXBIWXMAAA1nAAANZwG8Jya1AAAAB3RJTUUH5wEdDiU4kuliGwAABGBJREFUSMeNlV1sU2UYx3/v+Wg7t9LRtZRNZARGhM0hH3KB6ASFRASJiTFkRhMSLvRGjCYaEy8kJt7oBYkXRDAxITEsokFEoxdC7LZA5oRByBhjK8SxZXRfrK1td9qevq8X55R2DD+ek5z34n3+/+fzfR7BPGl3T0HOq2qUiQCUKIi0N6fcu455CHE/XCHN4nptp/cJX4PhcwhsyxrPXZS/6le0griPQsyHF1Et+jsNe1vCqwnhdfDkmGaYa1PjZ4qHxTV9HoWohCepfrH207Y1z7F0vmuAIs45ugYT72d+DFRQiPYKleKeyNF9DU+i8WCRXOCb8Yk39J/K9HorUBTFFcVNYmvg41dXPr3AdmW8y/H7b2ywknZYKpKa44EMcTDQXtsw6dluvPaP1stefM1v9pJ8YjzZwefatN4S1A+vfeuFYKM5o+0jwH+JIMR1bbu5Ljj3zN162am3HFx1cK8epp9FbPsX98vi5yZpWmkk3jyT1Hz7N5p+bCZp+l9wEDQxiY2fjaZvv1HVFAZsLMKuQpw/mCDABla5fRCjjxQRNlMPQBgLG4MwVU2GsqUBEokHgEFOUEWEMfrYRRvQxfdUUc0APbzOWsCDRAISZRuZy6Nb6lFuT2U4TSNbMJEM8gtB4AceYQ9JrjDCKd6mxvULRslc1gpHLqXu3CveKCk2kKeHGR5lCcf5Eo3n8XELjYeZZMzV1LjDpVThiKGfjK8488Fj1XkAchiYpBkgSIht5LjIGBNcJY1ABywA8vTRn4l/pp/UW4uiJ3l9xG8v22rWofidMEtZTRgND9UUue4GqJEiw0783OXc3NDZxEfaV+QNIK9/N3e+6me1HpayiU62sQybYaaQ5LCI0YiHDGO0Ue/Ef2PugPcOgOa8KmVhOzXexSJ6sblAJ3FmydIEXOUGQyxnd6lXbGUBdKA5D1NIVZQATJHgcVIM8RSCNawBniXADnaTYMp9D6oopIMspT9fSGUARZQwKzFYT4gp0qSZIsRmGmgmRBQFZCikcLKO4RwJy3MrDiS4yVY0/GxC8TLVwHJqCQKCZs6TYDFx8rcSVsQtJwARVegdlpJpioRQbs8H8eAh6MatCFFkGsmwLPRGFJUEQHds5DZZDExK81dV/EFhYpDlNrERukswzckliNjMqSgKhXTtaxWfKCUPRZSZUyJWmopGiclU9rGeXTXNkiw+Ckw4daWUqggmWSQxegbkMVOVb8rvfGj2UPRocfEodczRS/refFDUsAMPo0wTnZ09JIYqp4Mr7YDQ5Jt8sqL2FR4i74ZSitRDlm/5M8GH2hdKlse6XlLppxWUuCRGUutkXSNedIx7n0mBTgaGeU8cR1YuFr1sxaFQ/bJ7ojnTGKYKzU0mJIjS12Uf4KxQ81dbBYFDISBud8YXjTRlvBKbLBNcpfOvoROFd7XB+zcjC+eos6mkT7YZL/k2eusgN2P12ae1Ls1iAZwHDeLSsrM0bbEKgEjKWZ+b0Y4F2n8DLrW7Px/mhBwAAAAldEVYdGRhdGU6Y3JlYXRlADIwMjMtMDEtMjlUMTQ6Mzc6NTErMDA6MDAjXia7AAAAJXRFWHRkYXRlOm1vZGlmeQAyMDIzLTAxLTI5VDE0OjM3OjUxKzAwOjAwUgOeBwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAAASUVORK5CYII=";
let icon16dateurl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAABlVBMVEUAAABUWW6ChZRbYHRRV25cYHOYinJhYm1RVmtSV21VWm+rrbhTWG1iZnlcYXU0OlJWW3BnZ3AlK0ZZXnJxdYd4fY1PVGqHipm9v8fb3OBBS21PVGmPk6BiY2+ajHGRiX3U1duViHKumnOQhXJeYW+BeW6trbCAeW41Pl2rrbg1O1Opq7YQFzSWmaZ1eYqxtL1QVWp3e45LUmxwbXBJUW2De3HDqnQvP2xfYW93c3Di4+bi4+f////mw3W2rJv29/r3+Pr6+/z7+/v4+PjtyHW5s6z8/P7PztCzqpu2sKnn6Ovm5+ucqsCMoL3Gy9X8/P3Wt3S8t6/m5+y1pojdvHPVt3SropWKlqqRuORrrfVskb/n5+u7qYPcu3XtyXfmwnSLj41oqfJVpv9mkcT6+vuysK7TtXXEqnSum3ORiHVgfJ9fg6+fqbz6+vq2sKi5o3SynXS0nnO0nnLIrHK2sKfa3OG8qoX+1Hf50Xjxy3f60nj+1XfFr4H/1nf+1HinmHz0zXfCqXW5onTTtnbwy3fuyXfiwXbk7/kLAAAAOnRSTlMAAAAAAAAAAAAAAAAAAAAAAAAKQXaGIJzr/BU7tUXC7/7T/Mc1sfixIdgVzwmyaPwVtyq6GpbvC02GFDa/iQAAAAFiS0dEPKdqYc8AAAAJcEhZcwAADWcAAA1nAbwnJrUAAAAHdElNRQfnAR0OIht/z4WuAAABCUlEQVQY02NgYGRiFhIWERUVERZiZmJkYGBhZBUTl5C0spKUEBdjZWRhYJOSlrG2AQNrGWkpNgZZOXkFGyhQkJeTZVC0tbO3cXC0sXFytrG3s1VkUHJxdXP38PTy9vH183d1UWJQDggMCg4JDQuPiIyKDgxQZlBRVbOOiY2LT0hMSrZSU1dhYNfQTElNS8/IzMrOydXUYGfg0NJ2yAvNLygsKi5x0NbiYODU0S0tK6+orKyqLivV1eFk4OLW06+prQOC2hp9PW4uBkYeA8P6hsampsaGekMDHqBnePmMjJtbWltbmo2N+HgZGBgY+QVMTM3a2sxMTQT4gQqAIoKM5haWlhbmQAYDAwC+0TkTtbceAAAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyMy0wMS0yOVQxNDozMjozMiswMDowMDLw/uUAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjMtMDEtMjlUMTQ6MzI6MzIrMDA6MDBDrUZZAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAABJRU5ErkJggg=="

var commandline = '';
var treeBranchEvents = [];
// идентификаторы событий, для которых ожидаем получение процессов потомков
var events_for_children_waiting = [];
var fields = [];
options = {};
GetOptionsFromStorage().then(() => {
  // Если включен параметр "Отключить новое поведение сортировки при аггрегации (R25.1 и выше)", то
  // подгрузим код из файла xhr_override.js, который будет убирать из параметров запроса лишнее поле, отвечающее за
  // новый способ сортировки
  if('options' in options && 'disable_agg_sort' in options.options && options.options.disable_agg_sort == true) {
    var s = document.createElement('script');
    s.src = chrome.runtime.getURL('xhr_override.js');
    s.onload = function() {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
  }
});

// catch if SIEM menu is changed and there is a place for Monkey
// should help if we switching between assets, events and other tabs
function monitorSIEMnav() {
  let config = {
    attributes: false,
    subtree: true,
    childList: true,
  };

  let callback = function(mutationList, monkeyObserver) {
    // if MP href changed, is monkey on sidebar?
    // attach if needed
    let href_main = document.location.href.split("?")[0];
    if (oldHref !== href_main) {
      oldHref = href_main;

      let target_class = ".sidebarWithMonkey";
      let monkey_binded = 0;
      monkey_binded = document.querySelectorAll(target_class).length;
      if (monkey_binded == 0) {
        // search in shadowRoot too
        let legacy_events = $("legacy-events-page");
        if (legacy_events.length === 1) {
          let shadowRoot = legacy_events[0].shadowRoot;
          if (shadowRoot) {
            monkey_binded = $(shadowRoot).find(target_class).length;
          }
        }
      }
      //console.log("Monkey binded: " + monkey_binded);
      if (monkey_binded == 0) {
        //console.log("no Monkeys here. We want Monkey!");
        SearchBananas(
          siem_bananas,
          siemMonkeyBind,
          500,
          6000
        );
      }
    }
  }
  let targetNode = document.getElementsByTagName("pt-siem-app-root")[0];
  monkeyObserver = new MutationObserver(callback);
  monkeyObserver.observe(targetNode, config);
}
