var gtfrom = 0;
var gtto = 0;
let icondataurl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAQAAADZc7J/AAAABGdBTUEAALGPC/xhBQAAAAJiS0dEAP+Hj8y/AAAACXBIWXMAAA1nAAANZwG8Jya1AAAAB3RJTUUH5wEdDiU4kuliGwAABGBJREFUSMeNlV1sU2UYx3/v+Wg7t9LRtZRNZARGhM0hH3KB6ASFRASJiTFkRhMSLvRGjCYaEy8kJt7oBYkXRDAxITEsokFEoxdC7LZA5oRByBhjK8SxZXRfrK1td9qevq8X55R2DD+ek5z34n3+/+fzfR7BPGl3T0HOq2qUiQCUKIi0N6fcu455CHE/XCHN4nptp/cJX4PhcwhsyxrPXZS/6le0griPQsyHF1Et+jsNe1vCqwnhdfDkmGaYa1PjZ4qHxTV9HoWohCepfrH207Y1z7F0vmuAIs45ugYT72d+DFRQiPYKleKeyNF9DU+i8WCRXOCb8Yk39J/K9HorUBTFFcVNYmvg41dXPr3AdmW8y/H7b2ywknZYKpKa44EMcTDQXtsw6dluvPaP1stefM1v9pJ8YjzZwefatN4S1A+vfeuFYKM5o+0jwH+JIMR1bbu5Ljj3zN162am3HFx1cK8epp9FbPsX98vi5yZpWmkk3jyT1Hz7N5p+bCZp+l9wEDQxiY2fjaZvv1HVFAZsLMKuQpw/mCDABla5fRCjjxQRNlMPQBgLG4MwVU2GsqUBEokHgEFOUEWEMfrYRRvQxfdUUc0APbzOWsCDRAISZRuZy6Nb6lFuT2U4TSNbMJEM8gtB4AceYQ9JrjDCKd6mxvULRslc1gpHLqXu3CveKCk2kKeHGR5lCcf5Eo3n8XELjYeZZMzV1LjDpVThiKGfjK8488Fj1XkAchiYpBkgSIht5LjIGBNcJY1ABywA8vTRn4l/pp/UW4uiJ3l9xG8v22rWofidMEtZTRgND9UUue4GqJEiw0783OXc3NDZxEfaV+QNIK9/N3e+6me1HpayiU62sQybYaaQ5LCI0YiHDGO0Ue/Ef2PugPcOgOa8KmVhOzXexSJ6sblAJ3FmydIEXOUGQyxnd6lXbGUBdKA5D1NIVZQATJHgcVIM8RSCNawBniXADnaTYMp9D6oopIMspT9fSGUARZQwKzFYT4gp0qSZIsRmGmgmRBQFZCikcLKO4RwJy3MrDiS4yVY0/GxC8TLVwHJqCQKCZs6TYDFx8rcSVsQtJwARVegdlpJpioRQbs8H8eAh6MatCFFkGsmwLPRGFJUEQHds5DZZDExK81dV/EFhYpDlNrERukswzckliNjMqSgKhXTtaxWfKCUPRZSZUyJWmopGiclU9rGeXTXNkiw+Ckw4daWUqggmWSQxegbkMVOVb8rvfGj2UPRocfEodczRS/refFDUsAMPo0wTnZ09JIYqp4Mr7YDQ5Jt8sqL2FR4i74ZSitRDlm/5M8GH2hdKlse6XlLppxWUuCRGUutkXSNedIx7n0mBTgaGeU8cR1YuFr1sxaFQ/bJ7ojnTGKYKzU0mJIjS12Uf4KxQ81dbBYFDISBud8YXjTRlvBKbLBNcpfOvoROFd7XB+zcjC+eos6mkT7YZL/k2eusgN2P12ae1Ls1iAZwHDeLSsrM0bbEKgEjKWZ+b0Y4F2n8DLrW7Px/mhBwAAAAldEVYdGRhdGU6Y3JlYXRlADIwMjMtMDEtMjlUMTQ6Mzc6NTErMDA6MDAjXia7AAAAJXRFWHRkYXRlOm1vZGlmeQAyMDIzLTAxLTI5VDE0OjM3OjUxKzAwOjAwUgOeBwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAAASUVORK5CYII=";
let icon16dateurl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAABlVBMVEUAAABUWW6ChZRbYHRRV25cYHOYinJhYm1RVmtSV21VWm+rrbhTWG1iZnlcYXU0OlJWW3BnZ3AlK0ZZXnJxdYd4fY1PVGqHipm9v8fb3OBBS21PVGmPk6BiY2+ajHGRiX3U1duViHKumnOQhXJeYW+BeW6trbCAeW41Pl2rrbg1O1Opq7YQFzSWmaZ1eYqxtL1QVWp3e45LUmxwbXBJUW2De3HDqnQvP2xfYW93c3Di4+bi4+f////mw3W2rJv29/r3+Pr6+/z7+/v4+PjtyHW5s6z8/P7PztCzqpu2sKnn6Ovm5+ucqsCMoL3Gy9X8/P3Wt3S8t6/m5+y1pojdvHPVt3SropWKlqqRuORrrfVskb/n5+u7qYPcu3XtyXfmwnSLj41oqfJVpv9mkcT6+vuysK7TtXXEqnSum3ORiHVgfJ9fg6+fqbz6+vq2sKi5o3SynXS0nnO0nnLIrHK2sKfa3OG8qoX+1Hf50Xjxy3f60nj+1XfFr4H/1nf+1HinmHz0zXfCqXW5onTTtnbwy3fuyXfiwXbk7/kLAAAAOnRSTlMAAAAAAAAAAAAAAAAAAAAAAAAKQXaGIJzr/BU7tUXC7/7T/Mc1sfixIdgVzwmyaPwVtyq6GpbvC02GFDa/iQAAAAFiS0dEPKdqYc8AAAAJcEhZcwAADWcAAA1nAbwnJrUAAAAHdElNRQfnAR0OIht/z4WuAAABCUlEQVQY02NgYGRiFhIWERUVERZiZmJkYGBhZBUTl5C0spKUEBdjZWRhYJOSlrG2AQNrGWkpNgZZOXkFGyhQkJeTZVC0tbO3cXC0sXFytrG3s1VkUHJxdXP38PTy9vH183d1UWJQDggMCg4JDQuPiIyKDgxQZlBRVbOOiY2LT0hMSrZSU1dhYNfQTElNS8/IzMrOydXUYGfg0NJ2yAvNLygsKi5x0NbiYODU0S0tK6+orKyqLivV1eFk4OLW06+prQOC2hp9PW4uBkYeA8P6hsampsaGekMDHqBnePmMjJtbWltbmo2N+HgZGBgY+QVMTM3a2sxMTQT4gQqAIoKM5haWlhbmQAYDAwC+0TkTtbceAAAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyMy0wMS0yOVQxNDozMjozMiswMDowMDLw/uUAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjMtMDEtMjlUMTQ6MzI6MzIrMDA6MDBDrUZZAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAABJRU5ErkJggg=="
function insertMonkeyIntoUI() {
  let siem_title_elem = $("body > pt-siem-app-root > pt-siem-header > header > mc-navbar > mc-navbar-container:nth-child(1) > pt-siem-navbar-brand > a > mc-navbar-title");
  let siem_title = siem_title_elem.text();

  let nad_title_elem = $(".mc-navbar-title:first");
  let nad_title_elem_text = nad_title_elem.text();
  
 if (siem_title === "MaxPatrol 10") {
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
  }
  else if (nad_title_elem_text === "NAD") {
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
    }
  }
  icons = sidebar.find(".pt-icons").first();
  icons.before(`<img class="blinkAndRemove" width="16" height="16" src="${icon16dateurl}" alt="" />`)
  sidebar.attr('style', function(i, style){   
      return style && style.replace(/(max-width: )(\d+)(px)/, '$131337$3');
  });
  icons.prev()
  .delay(100).fadeTo(100,0.5)
  .delay(100).fadeTo(100,1)
  .delay(100).fadeTo(100,0.5)
  .delay(100).fadeTo(100,1)
  .delay(100).fadeTo(100,0.5)
  .delay(100).fadeTo(100,1, function(){$(this).remove();});
}

let siemMonkeyInUI = setTimeout(function () {
  insertMonkeyIntoUI();
}, 5000)


let observer = new MutationObserver(async mutations => {
  for(let mutation of mutations) {
      if(mutation.target.parentNode && mutation.target.parentNode.nodeName === 'RULES-CARD-LINK'){
        // Вывод описание правила корреляции на вкладке "Инциденты" в правом сайдбаре
        correlation_name = $(mutation.target.parentNode).children('span').eq(1).text();
        $(mutation.target.parentNode).children('span').slice(2).remove();
        let msg = await getCorrelationRuleInfoByName(correlation_name);
        let desc = msg['description'];
        $(mutation.target.parentNode).children('span').eq(1)
        .after($('<span>').addClass('mc-text-light').text(` (${desc})`));
      }

      if($(mutation.target.parentNode).is('.pt-preserve-white-space', '.ng-binding ng-scope') &&
      mutation.target.parentNode.innerText === 'process'){
        sidebarElement = $(mutation.target.parentNode).parents("mc-sidebar-opened");
        ProcessHandler(sidebarElement); 
      }

      for(let addedNode of mutation.addedNodes) {
        // Регистрация обработчиков клика на названия определенных полей в правом сайдбаре (карточка события)
        if (addedNode instanceof Node && (addedNode.className === "mc-dl-conditional ng-scope")) {
              if(addedNode.children.length = 2 && addedNode.children[0].innerHTML.endsWith(".hash")) {
                CommonFieldClick(addedNode, addedNode.children[0].innerHTML, GetVirusTotalLinkForHash);
              }             
              if(addedNode.children.length = 2 && addedNode.children[0].innerHTML === "external_link") {
                CommonFieldClick(addedNode, "external_link", GetExternalLink);
              }
              if(addedNode.children.length = 2 && addedNode.children[0].innerHTML === "task_id") {
                CommonFieldClick(addedNode, "task_id", GetTaskLink);
              }
              if(addedNode.children.length = 2 && addedNode.children[0].innerHTML === "src.ip") {
                SrcIPAdd(addedNode);
              }
              if(addedNode.children.length = 2 && addedNode.children[0].innerHTML === "dst.ip") {
                DstIPAdd(addedNode);  
              }
              if(addedNode.children.length = 2 && addedNode.children[0].innerHTML === "object") {
                ProcessHandler(addedNode);  
              }
            }
        }
   }
});


observer.observe(document, { childList: true, subtree: true, characterData: true, attributes: true });


function getTaxonomy()
{
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
    let siemUrl = window.location.href.split('#',1).slice(0, -1);  
    var request = $.ajax
    (
        {
            type: "GET",
            url: `${siemUrl}/api/siem/v2/rules/correlation/${correlation_name}`,
        }
    );
    return request;
}


var commandline = '';
var treeBranchEvents = [];
//идентификаторы событий, для которых ожидаем получение процессов потомков
var events_for_children_waiting = [];

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

  hostname_element = $("div[title=\"object\"]", addedNode);
  value_node = hostname_element.next();
  value = $(".pt-preserve-white-space", value_node).text().trim("↵");
  if(value === "process") {

    value_node_span = $("pdql-fast-filter", value_node);
        
    ancestors_branch_icon = $(`<span title="Предки процесса...">🦧</span>`);
    session_tree_icon = $(`<span title="Дерево процессов сессии...">🦍</span>`);
    descendants_tree_icon = $(`<span title="Потомки процесса...">🐒</span>`)

    ancestors_branch_icon.addClass("monkeymagicicon");
    session_tree_icon.addClass("monkeymagicicon");
    descendants_tree_icon.addClass("monkeymagicicon");
    
    value_node_span.after(descendants_tree_icon);
    value_node_span.after(ancestors_branch_icon);
    value_node_span.after(session_tree_icon);

    //одна ветка в дереве предков процесса
    ancestors_branch_icon.click(function (){
      w = $(document).width();
      h = $(document).height(); 

      element = $("div[title=\"object\"] + div span.pt-preserve-white-space", addedNode);
      newelem = $('<div>').attr("id", "output").attr("title","Родители процесса...")
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
      siemUrl = window.location.href.split('#',1).slice(0, -1);
      var iframe = $('#legacyApplicationFrame'); 

      commandline = $("div[title=\"object.process.cmdline\"] + div > div > div:first", iframe.contents()).text().trim('↵');
      if(commandline == "")
      {
        commandline = $("div[title=\"object.process.cmdline\"] + div > div > div:first").text().trim('↵');
      }


      uuid = $("div[title=\"uuid\"] + div > div > div:first", iframe.contents()).text().trim('↵');
      if(uuid == "")
      {
        uuid = $("div[title=\"uuid\"] + div > div > div:first").text().trim('↵');
      }
      count = 100;

      time = $("body > section > div > div > events-page > div > section > mc-sidebar.mc-sidebar_wide.mc-sidebar_right.ng-scope.ng-isolate-scope > mc-sidebar-opened > header > div.layout-row.flex > div > div").text().trim("↵");
      if(time.length === 0 ) { 
        time = $("mc-sidebar-opened > header > div.layout-row.flex > div > div").text().trim("↵");
        if (time.length === 0) {
          time = $("mc-sidebar-opened > header > div.layout-row.flex > div > div", iframe.contents()).text().trim("↵");
        }
      }

      timeParsed = moment(time, "DD.MM.YYYY hh:mm::ss");
      timeto = timeParsed.toDate();
      ttimeto = timeto.getTime()/1000 + 3600; // на 1 час вперёд

      gtfrom = ttimeto - 86400; // и на сутки назад
      gtto = ttimeto;
      treeBranchEvents = [];
      getdata(siemUrl, `uuid in ['${uuid}']`, count, processTreeBranch, "", ttimeto - 86400, ttimeto);
    });

    //дерево процессов сессии
    session_tree_icon.click(function (){
      w = $(document).width();
      h = $(document).height(); 
      valueNode = $(this).next();
      hostname_value_element = $(".pt-preserve-white-space", valueNode);
      hostname = hostname_value_element.text()
      element = $("div[title=\"object\"] + div span.pt-preserve-white-space", addedNode);
      newelem = $('<div>').attr("id", "output").attr("title","Родители процесса...")
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
      siemUrl = window.location.href.split('#',1).slice(0, -1);
      var iframe = $('#legacyApplicationFrame'); 
      if(iframe.length == 0)
      {
        commandline = $("div[title=\"object.process.cmdline\"] + div > div > div:first").text().trim('↵');
        uuid = $("div[title=\"uuid\"] + div > div > div:first").text().trim('↵');
        event_src_host = $("div[title=\"event_src.host\"] + div > div > div:first").text().trim('↵');
        processStartMsgid = $("div[title=\"msgid\"] + div > div > div:first").text().trim('↵');
        session = $("div[title=\"datafield1\"] + div > div > div:first").text().trim('↵');
        time = $("mc-sidebar-opened > header > div.layout-row.flex > div > div").text().trim("↵");
      }
      else
      {
        commandline = $("div[title=\"object.process.cmdline\"] + div > div > div:first", iframe.contents()).text().trim('↵');
        uuid = $("div[title=\"uuid\"] + div > div > div:first", iframe.contents()).text().trim('↵');
        event_src_host = $("div[title=\"event_src.host\"] + div > div > div:first", iframe.contents()).text().trim('↵');
        processStartMsgid = $("div[title=\"msgid\"] + div > div > div:first", iframe.contents()).text().trim('↵');
        session = $("div[title=\"datafield1\"] + div > div > div:first", iframe.contents()).text().trim('↵');
        time = $("mc-sidebar-opened > header > div.layout-row.flex > div > div", iframe.contents()).text().trim("↵");
      }
      
      // ограничение по числу процессов
      // TODO: придумать способ задавать этот параметр при необходимости
      count = 1000;

      timeParsed = moment(time, "DD.MM.YYYY hh:mm::ss");
      timeto = timeParsed.toDate();
      ttimeto = timeto.getTime()/1000;

      gtfrom = ttimeto - 86400;
      gtto = ttimeto;

      getdata(siemUrl, `event_src.host = "${event_src_host}" and msgid = "${processStartMsgid}" and datafield1 = ${session} and (correlation_name = null)`, count, processTree, "", ttimeto - 86400, ttimeto);
    });

    descendants_tree_icon.click(function (){
      // treeBranchEvents = [];
      events_for_children_waiting = [];
      w = $(document).width();
      h = $(document).height(); 

      element = $("div[title=\"object\"] + div span.pt-preserve-white-space", addedNode);
      newelem = $('<div>').attr("id", "output").attr("title","Потомки процесса...")
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
      siemUrl = window.location.href.split('#',1).slice(0, -1);
      var iframe = $('#legacyApplicationFrame'); 

      uuid = $("div[title=\"uuid\"] + div > div > div:first", iframe.contents()).text().trim('↵');
      if(uuid == "")
      {
        uuid = $("div[title=\"uuid\"] + div > div > div:first").text().trim('↵');
      }
      count = 100;

      time = $("body > section > div > div > events-page > div > section > mc-sidebar.mc-sidebar_wide.mc-sidebar_right.ng-scope.ng-isolate-scope > mc-sidebar-opened > header > div.layout-row.flex > div > div").text().trim("↵");
      if(time.length === 0 ) { 
        time = $("mc-sidebar-opened > header > div.layout-row.flex > div > div").text().trim("↵");
        if (time.length === 0) {
          time = $("mc-sidebar-opened > header > div.layout-row.flex > div > div", iframe.contents()).text().trim("↵");
        }
      }

      timeParsed = moment(time, "DD.MM.YYYY hh:mm::ss");
      timeto = timeParsed.toDate();
      ttimeto = timeto.getTime()/1000 + 86400; // на сутки вперед

      gtfrom = ttimeto - 86400 - 600; // и на 10 минут назад на всякий случай
      gtto = ttimeto;
      treeBranchEvents = [];
      getdata(siemUrl, `uuid in ['${uuid}']`, count, processTreeBranchReverse, "", ttimeto - 86400 - 600, ttimeto);    //TODO: со временем путаница и не удобно, надо распутаться
    });
  }
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
}

function AddExternalServiceLink(src_ip_span, text, callback) {
  vtdiv = $("<span>");
  vtdiv.addClass('ip-check-external-link');
  vtdiv.text(text);
  vtdiv.click(function () {
    let ip_to_check = $(".pt-preserve-white-space", $(this).parent()).text().replace(/[^.0-9]+/g, "");
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
    object_hash = object_hash.split(/:|\s/)[1].replace(/[\W_]+/g, "");
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
 * Возвращает ссылку на задачу SIEM по идентификатору задачи
 * @param {string} task_id идентификатор задачи
 * @returns ссылка на задачу SIEM
 */
function GetTaskLink(task_id) {
  siemUrl = window.location.href.split('#',1).slice(0, -1);
  return `${siemUrl}/#/scanning/tasks/scan/history/${task_id}`;
};

/**
 * Получить информацию о зарегистрированных приложениях (PT NAD, PT AF, PT Sandbox и т.д.)
 * @returns информация о зарегистрированных приложениях
 */
 async function getRegisterdApps() {
  siemUrl = window.location.href.split('#',1).slice(0, -1);
  let request = await $.ajax
  (
      {
          type: "GET",
          url: `${siemUrl}/api/tenants/v2/menu`,
      }
  );
  return request;
}