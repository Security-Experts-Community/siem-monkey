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


String.prototype.trunc = 
      function(n){
          return this.substring(0,n-1)+(this.length>n?'&hellip;':'');
      };


const getStorageData = key =>
    new Promise((resolve, reject) =>
        chrome.storage.sync.get(key, result =>
          chrome.runtime.lastError
            ? reject(Error(chrome.runtime.lastError.message))
            : resolve(result)
        )
    )      


async function vt3(hash)
{
    // Получаем API-ключ VT из настроек
    const options  = await getStorageData('options');
    apikey = options.options['vt_api_key'];

    $.ajax
    (
        {
            type: "GET",
            url: `https://www.virustotal.com/api/v3/files/${hash}`,
            headers: { 'x-apikey': apikey},
            success: function(msg)
            {
                let verdict = msg['data']['attributes']['last_analysis_stats'];
                malicious = verdict['malicious'];
                undetected = verdict['undetected'];

                let names = msg['data']['attributes']['names'];
                
                $('<div>', {class: 'hashoutput'})
                .text("Известные имена: " + JSON.stringify(names, null, 4))
                .insertAfter($("#output"+ hash));
                if (malicious == 0)
                {
                    classname = 'good';
                }
                if (malicious > 0 && malicious < 10)
                {
                    classname = "susp"
                }
                if (malicious >= 10)
                {
                    classname = 'danger'
                }
                $("#output"+ hash)
                .append($('<span>', {class: classname})
                .text(` VT: ${malicious}/${undetected}`)
                .attr('title', 'Открыть VT в новой вкладке')
                .css('cursor', 'pointer')
                .tooltip()
                .click(
                     function()    {
                        window.open(`https://www.virustotal.com/gui/file/${hash}/detection`, "_blank"); 
                    }
                ));

                
            },
            error: function(xhr, status, error)
            {
                $("#output"+ hash)
                .append($('<span>', {class:'parameter'})
                .text(` VT error: ${xhr.status} / ${error}`)
                .attr('title', 'Открыть VT в новой вкладке')
                .css('cursor', 'pointer')
                .tooltip()
                .click(
                     function()    {
                        window.open(`https://www.virustotal.com/gui/file/${hash}/detection`, "_blank"); 
                    }
                ));
            } 
        }
    );
}


/**
 * Получить список полей таксономии, поддерживаемых SIEM
 * @returns список полей таксономии
 */
 async function getTaxonomy() {
    let request = await $.ajax
    (
        {
            type: "GET",
            url: `${siemUrl}/api/events/v2/events_metadata`,
        }
    );
    return request;
}


/**
 * Получить информацию о зарегистрированных приложениях (PT NAD, PT AF, PT Sandbox и т.д.)
 * @returns информация о зарегистрированных приложениях
 */
 async function getRegisterdApps() {
    let request = await $.ajax
    (
        {
            type: "GET",
            url: `${siemUrl}/api/tenants/v2/menu`,
        }
    );
    return request;
}


/**
 * Получить информацию о зарегистрированных приложениях (PT NAD, PT AF, PT Sandbox и т.д.)
 * @returns информация о зарегистрированных приложениях
 */
 async function getRegisterdAppsFromNAD() {
    let request = await $.ajax
    (
        {
            type: "GET",
            url: `${siemUrl}/api/v2/menu`,
        }
    );
    return request;
}


/**
 * Получение информации о событиях от SIEM 
 * @param {string} siemUrl адрес SIEM
 * @param {string} filter фильтр для получения информации о событиях
 * @param {int} count максимальное количество событий
 * @param {function} callback функция-обработчик полученных событий
 * @param {*} outputelemsuffix класс DOM-елемента, где следует отображать результат 
 * @param {*} ttfrom нижняя граница времени
 * @param {*} ttto верхняя граница времени
 */
 async function getdata(siemUrl, filter, count, callback, outputelemsuffix="", ttfrom="", ttto="")
{
    // Если время не задано в параметрах явно, то берутся значения из диалогов выбора времени в UI popup'а
    let tfrom;
    let tto;
    if(ttfrom === "")
    {
        tfrom = $("#datepickerFrom").datepicker('getDate') / 1000;
    }
    else 
    {
        tfrom = ttfrom;
    }
    if(ttto === "")
    {
        tto = $("#datepickerTo").datepicker('getDate') / 1000;
    }
    else
    {
        tto = ttto;
    }

    let msg = await getTaxonomy();
    let prefields = msg['fields'];
    
    // получаем только те поля, которые можно использовать в фильтре
    let fields = prefields.filter(x => x.filterable == true).map(y => y['name']);
   
    fields.push('subevents');
    fields.push('text');
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
    let loading = document.createElement("div");
    loading.classList.add("lds-dual-ring");
    $(`#output${outputelemsuffix}`).html(loading); 
    $.ajax
    (
        {
            type: "POST",
            url: `${siemUrl}/api/events/v2/events?limit=${count}&offset=0`,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(params),
            success: function(msg) {
                $(".lds-dual-ring").remove();
                let events = msg['events'];
                callback(events, outputelemsuffix);
        }
    });
}


function countGroupBy(siemUrl, filter, group, callback)
{
    let tfrom = $("#datepickerFrom").datepicker('getDate') / 1000;
    let tto = $("#datepickerTo").datepicker('getDate') / 1000;
    let params = {
        "timeFrom": tfrom,
        "timeTo": tto,
        "filter": `${filter}`,
        "fields": [`${group}`, `subject.name`],
        "top": null
    }
    let loading = document.createElement("div");
    loading.classList.add("lds-dual-ring");
    $(`#output`).html(loading); 
    $.ajax
    (
        {
            type: "POST",
            url: `${siemUrl}/api/events/v2/events/count_distinct_field_values`,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(params),
            success: function(msg)
            {
                $(".lds-dual-ring").remove();
                msg.forEach( (element) => {
                    let session = element["values"][0];
                    let sessionUser = element["values"][1];
                    let sessionProcesses = element['count'];
                    
                    let newdiv = $('<div class="monkey monkeysessionslinks">')
                    .attr('id', `output${session}`)
                    .text(`Найти процессы в сессии ${sessionUser} ${session} (число процессов = ${sessionProcesses})`)
                    .click(function() {
                        $("#output").empty();
                        count = sessionProcesses;
                        let filter = `event_src.host = "${event_src_host}" ` + 
                        `and msgid = "${processStartMsgid}" and datafield1 = ${session} and (correlation_name = null) `; 
                        
                        getdata(siemUrl, filter, count, callback, session);
                    })
                    .appendTo("body");
                    
                    if(session < 1000)
                    {
                        newdiv.addClass("systemProcesses");
                    }
                    if(sessionUser.startsWith("dwm-") || sessionUser.startsWith("umfd-"))
                    {
                        newdiv.addClass("systemDwmOrUmfdProcesses");
                    }
                });
            }
        }
    );
}


function countGroupByHash(siemUrl, filter, group, callback)
{
    let tfrom = $("#datepickerFrom").datepicker('getDate') / 1000;
    let tto = $("#datepickerTo").datepicker('getDate') / 1000;
    let params = {
        "timeFrom": tfrom,
        "timeTo": tto,
        "filter": `${filter}`,
        "fields": [`${group}`, `event_src.host`],
        "top": null
    }
    $.ajax
    (
        {
            type: "POST",
            url: `${siemUrl}/api/events/v2/events/count_distinct_field_values`,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(params),
            success: function(msg)
            {
                $(".lds-dual-ring").remove();
                msg.forEach( (element) => {
                    let hash = element["values"][0];
                    let host = element["values"][1];
                    let sessionProcesses = element['count'];

                    e = $("<div>", {"class":"hashoutput"})
                    .text(`На узле ${host} хеш ${hash} (встречается ${sessionProcesses} раз(а))`)
                    .attr('id', `output${hash}`);
                    e.prependTo($(`#output`)); 
                    
                    vt3(hash);

                });
            }
        }
    );
}


var treeBranchEvents = [];

// идентификаторы событий, для которых ожидаем получение процессов потомков
var events_for_children_waiting = [];


function switchProcessStartMsgid()
{
    switch(processStartMsgid){
        case 1: processStartMsgid = 4688;
        break;
        case 4688: processStartMsgid = 1;
        break;
        default: processStartMsgid = 4688;
    }
    $('#processStartMsgidDiv').text(`Для дерева процессов используется фильтр "msgid = ${processStartMsgid}"`)
}


let commandline = "";
var processStartMsgid = "";


// разбор полученных данных и вывод на popup плагина
async function onPageDetailsReceived(details) {
    siemUrl = details['url'];

    // полезные фильтры aka параметризованные фильтры
    // TODO: удваивать все обратные слеши в значениях
    let filters;
    let customfilters = chrome.runtime.getURL('customfilters.json');
    let xhr = new XMLHttpRequest();
    xhr.onload = function () {
        filters = JSON.parse(this.response);
    };
    xhr.open('GET', customfilters, false);
    xhr.send();
    
    // функция для подстановки значений переменных в шаблон фильтра
    let template = (tpl, args) => tpl.replace(/\${((\.|\w)+)}/g, (_, v) => {
        if (!(typeof args[v] == 'undefined' || args[v]== '' )) {
            return (args[v]);
        }
        else throw `${v} is undefined or empty`;
    });

    // функция для подстановки значений переменных в шаблон описания фильтра
    let template_descr = (tpl, args) => tpl.replace(/\${((\.|\w)+)}/g, (_, v) => {
        if (!(typeof args[v] == 'undefined' || args[v]== '' )) {
            return (`<span class=parameter>${args[v]}</span>`);
        }
        else throw `${v} is undefined or empty`;
    });

    let based_event = btoa(encodeURIComponent(JSON.stringify(details.params)))
    $("#saved_event_data").text(based_event);

    filters.forEach(filter => {
        try{
            let description = template_descr(filter.description, details.params);
            let condition = template(filter.filter, details.params);
            f = $("<div>").html(description)
            .attr('title', condition) // фильтр будет видно в качестве тултипа
            .click(
                async function() {
                    let url = '';
                    if('requesturl' in filter) {
                        let msg = await getRegisterdAppsFromNAD();
                        let apps = msg['applications'];
                        let siem = apps.filter(x => {return x.type === 'PT.MPSIEM'})[0];
                        url = siem['link'];
                    }
                    else {
                        url = siemUrl;
                    }
                    // это костыль, чтобы преобразовать в timestamp в миллисекундах
                    let time_start = $("#datepickerFrom").datepicker('getDate') / 1; 
                    let time_end = $("#datepickerTo").datepicker('getDate') / 1;  
                    chrome.tabs.create({
                        url: `${url}#/events/view?where=${condition}&start=${time_start}&end=${time_end}&period=range`
                    });    
                }
            )
            $("#filters").append(f);
        }
        catch(error)
        {
            ;//console.log(error);
        }
    });


    $("#datepickerFrom").datetimepicker({
        dateFormat: "yy-mm-dd",
        timeFormat:  "HH:mm:ss",
        timeInput: true
    });
    $( "#datepickerTo" ).datetimepicker({
        dateFormat: "yy-mm-dd",
        timeFormat:  "HH:mm:ss",
        timeInput: true
    });

    let selectedEventTimeParsed = "";
    let selectedEventTimeParsedTo = "";
    let selectedEventTimeParsedFrom = "";
    let selectedEventTime = details.params['time'];
    
    if(typeof selectedEventTime === 'undefined'){ 
        // попробуем распарсить по формату из NAD
        let session_start = details.params['session_start'];
        let session_start_parsed = moment(session_start, "DD MMMM YYYY, hh:mm:ss", "ru");
        selectedEventTimeParsedTo = session_start_parsed.clone().add(15, 'm');
        selectedEventTimeParsedFrom = session_start_parsed.clone().subtract(15, 'm');
        $("#datepickerTo").datepicker().datepicker("setDate", selectedEventTimeParsedTo.toDate());
        $("#datepickerFrom").datepicker().datepicker("setDate", selectedEventTimeParsedFrom.toDate());
    }
    else{
        selectedEventTimeParsed = moment(selectedEventTime, "DD.MM.YYYY hh:mm:ss");
        selectedEventTimeParsedTo = selectedEventTimeParsed.clone().add(1, 'days');
        selectedEventTimeParsedFrom = selectedEventTimeParsed.clone().subtract(1, 'days');
        $("#datepickerTo").datepicker().datepicker("setDate", selectedEventTimeParsedTo.toDate());
        $("#datepickerFrom").datepicker().datepicker("setDate", selectedEventTimeParsedFrom.toDate());
    }

    processStartMsgid = details.params['msgid'].trim("↵");
    
    $('#processStartMsgidDiv').text(`Для дерева процессов используется фильтр "msgid = ${processStartMsgid}"`)
    $('#processstartmsgidcheckbox').click(function(){ switchProcessStartMsgid(); });
    if(processStartMsgid == 1){
        $('#processstartmsgidcheckbox').prop('checked', true);
    }

    chain_id = details.params['chain_id'].trim("↵");
    e = document.createElement("div");
    e.classList.add("extlink");
    e.setAttribute("id", "sandboxtask");
    e.innerHTML = `Открыть задачу в Sandbox`;
    e.onclick = function() {
        request = getRegisterdApps();
        request.then(function(msg) {
            apps = msg['applications'];
            // костыль: у кого порт 8443, тот не PT Sandbox, а PT AF
            sandboxUrl = apps.filter(x => {return x.type === 'PT.MS' && !x.endpoint.includes(':8443') })[0]['endpoint'];
            chrome.tabs.create({url: `${sandboxUrl}/tasks-v2/${chain_id}`});
        });
    };
    $('#userprofile').append(e);

    let object_name = details.params['object.name'].trim("↵");
    let object_process_name = details.params['object.process.name'].trim("↵");
    let src_ip = details.params['src.ip'].trim("↵");
    let dst_ip = details.params['dst.ip'].trim("↵");
    let src_port = details.params['src.port'].trim("↵");
    let dst_port = details.params['dst.port'].trim("↵");
    event_src_host = details.params['event_src.host'].trim("↵");
    
    let timestampfrom = selectedEventTimeParsed.clone().subtract(15, 'minutes').unix()*1000;
    let timestampto = selectedEventTimeParsed.clone().add(15, 'minutes').unix()*1000;

    // Подготовка фильтра для поиска трафика в NAD
    let nadfilter = '';
    if(src_ip != ''){
        nadfilter += `src.ip%20%3D%3D%20${src_ip}`;
    }
    if(src_port != ''){
        if(nadfilter != '') {
            nadfilter += '%20%26%26%20';
        }
        nadfilter += `src.port%20%3D%3D%20${src_port}`;
    }
    if(dst_ip != ''){
        if(nadfilter != '') {nadfilter += '%20%26%26%20';}
        nadfilter += `dst.ip%20%3D%3D%20${dst_ip}`;
    }
    if(dst_port != ''){
        if(nadfilter != '') {nadfilter += '%20%26%26%20';}
        nadfilter += `dst.port%20%3D%3D%20${dst_port}`;
    }

    let msg = await getRegisterdApps();
    let apps = msg['applications'];
    let nads = apps.filter(x => {return x.type === 'PT.NAD'});

    // костыль для удаления повторяющихся значений, если они вдруг есть
    nads_uniq = [...new Map(nads.map(x => [x['endpoint'], x])).values()];

    nads_uniq.forEach(nad => {
        let  e = document.createElement("div");
        e.classList.add("extlink");
        e.innerHTML = `Найти  сессию ${src_ip}:${src_port} ⇄ ${dst_ip}:${dst_port} в ${nad['displayName']}`;
        e.onclick = function() {
            let url = `${nad['endpoint']}/#/sessions/list?sources=2&from=`+
            `${timestampfrom}&to=${timestampto}&filter=${nadfilter}`;
            chrome.tabs.create({url: url});
        };
        $('#userprofile').append(e);
    });
    
    //Поиск хеша по имени файла
    if(object_name != "")
    {
         $(`<div class="monkey">Найти в SIEM и проверить на VT хеш файла </div>`)
         .appendTo("#mlinks")
         .click(function(){
            let filter = `event_src.host = '${event_src_host}' and ` + 
            `((msgid = 1 and event_src.title = 'sysmon') or ` + 
            `(id = "PT_Kaspersky_Security_Center_odbc_Additional_info_executables")) ` + 
            `and object.name = '${object_name}'`;
            countGroupByHash(siemUrl, filter, 'object.hash', processHashByNameSearch);
        })
        .append($('<span>', {class:'parameter'})
        .text(`${object_name}`))
        .prop('title', 'Поиск среди событий на хосте тех, где может встретиться хеш, и проверка этого хеша на VirusTotal');
    }

    //Поиск хеша по имени файла
    if(object_process_name != "" && (object_name != object_process_name))
    {
       $(`<div class="monkey">Найти в SIEM и проверить на VT хеш файла </div>`)
       .appendTo("#mlinks")
       .click(function(){
            let filter = `event_src.host = '${event_src_host}' and ` +
            `((msgid = 1 and event_src.title = 'sysmon') or ` +
            `(id = "PT_Kaspersky_Security_Center_odbc_Additional_info_executables")) ` +
            `and object.process.name = '${object_process_name}'`;
            countGroupByHash(siemUrl, filter, 'object.hash', processHashByNameSearch);
        })
        .append($('<span>', {class:'parameter'}).text(`${object_process_name}`));
    }

    //Проверить на VT по хешу
    let hash = details.params['object.hash'].trim("↵");
    if(!(typeof hash == 'undefined' || hash == '' )) {
        $(`<div class="monkey">Проверить на VirusTotal по хешу  </div>`)
        .appendTo("#mlinks")
        .click(function(){
            let e = $("<div>", {"class":"hashoutput"})
            .text(`Информация по хешу ${hash}`)
            .attr('id', `output${hash}`);
            e.prependTo($(`#output`)); 
            vt3(hash);
        })
    .append($('<span>', {class:'parameter'}).text(`${hash}`));
    }

    // Сессии и число процессов в них
    $(`<div class="monkey">Показать сессии и число процессов в них на узле </div>`)
    .appendTo("#mlinks")
    .click(function(){
        $("#output").empty();
        $('#output').replaceWith("<div id=\"output\"></div>" );
        let filter = `event_src.host = "${event_src_host}" and msgid = "${processStartMsgid}" `+
        `and (correlation_name = null)`;
        countGroupBy(siemUrl, filter, "object.account.session_id", processTree);
    
    })
    .append($('<span>', {class:'parameter'}).text(`${event_src_host}`))

    // Найти процессы в рамках сессии
    let session = details.params['object.account.session_id'].replace(/[\n\r'"]+/g, '');
    $(`<div class="monkey">Найти процессы в сессии </div>`)
    .appendTo("#mlinks")
    .click(function(){
        let count = $("#count").val();
        $('#output').replaceWith("<div id=\"output\"></div>" );
        let filter = `event_src.host = "${event_src_host}" and msgid = "${processStartMsgid}" ` + 
        `and object.account.session_id = ${session} and (correlation_name = null)`;
        getdata(siemUrl, filter, count, processTree);
    
    })
    .append($('<span>', {class:'parameter'}).text(`${session}`))
    .append($('<span>').text(" на узле "))
    .append($('<span>', {class:'parameter'}).text(`${event_src_host}`));

    let commandlineField = "object.process.cmdline";

    // Родители процесса (одна ветка в дереве)
    $(`<div class="monkey">Родители процесса  </div>`)
    .appendTo("#mlinks")
    .click(function(){
        treeBranchEvents = [];
        //let body = $("body");
        //body.addClass("loading");
        let count = $("#count").val();
        $('#output').replaceWith("<div id=\"output\"></div>" );
        let uuid = details.params['uuid'].replace(/[\n\r'"]+/g, '');
        getdata(siemUrl, `uuid in ['${uuid}']`, count, processTreeBranch);
    
    })
    .append($('<span>', {class:'parameter'}).text(`${details.params[commandlineField].trim("↵")}`)) 

    // Все потомки текущего процесса
    $(`<div class="monkey">Все потомки процесса  </div>`)
    .appendTo("#mlinks")
    .click(function(){
        treeBranchEvents = [];
        let count = $("#count").val();
        $('#output').replaceWith("<div id=\"output\"></div>" );
        let uuid = details.params['uuid'].replace(/[\n\r'"]+/g, '');
        getdata(siemUrl, `uuid in ['${uuid}']`, count, processTreeBranchReverse);
    })
    .append($('<span>', {class:'parameter'}).text(`${details.params[commandlineField].trim("↵")}`))
}

let count = "5";
var event_src_host = "";
var siemUrl = "";
$( function() {
    $( "#tabs" ).tabs();
});

window.addEventListener('load', async function(event){
    const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
    const response = await chrome.tabs.sendMessage(tab.id,  { siemMonkeyMessage: "getEventDetaisFromSidebar" });
});

// Регистрируем обработчик сообщений от context.js
chrome.runtime.onMessage.addListener(
    function doStuff(message){
        // console.log(message);
        onPageDetailsReceived(message); 
}); 


