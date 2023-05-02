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


/**
 * Оторазить информацию о процессах в виде дерева
 * @param {list} pre_events список событий
 * @param {string} outputelemsuffix класс DOM-елемента, где требуется отобразить информацию
 */
 function processTree(pre_events, outputelemsuffix="")
 {
     let commandlineField = "object.process.cmdline";
     let events;
     if(pre_events[0]['msgid'].includes("exec")) {
         events = pre_events.map(x => ({
            ...x,
            tree_id: x['object.process.id'],
            tree_parent_id: x['object.process.parent.id']
        }));
     }
     else {
         if('object.process.guid' in pre_events[0] && pre_events[0]['object.process.guid'] != null) {
             events = pre_events.map(x => ({
                ...x,
                tree_id: x['object.process.guid'],
                tree_parent_id: x['object.process.parent.guid']
            }));
         }
         else{
             events = pre_events.map(x => ({...x,
                tree_id: x['object.id'] + " | " + x['object.name'],
                tree_parent_id: x['object.process.parent.id'] + " | " + x['object.process.parent.name']}));
         }
     }
 
     let parents = events.map(x => x['tree_parent_id']);  // массив значений идентификаторов процессов-родителей
     let items = events.map(x => x['tree_id']);    // массив значений идентификаторов процессов-детей
 
     let prediff = parents.filter(x => items.indexOf(x) == -1) // разница = родители верхнего уровня (сами не дети)
     let diff = [...new Set(prediff)];
 
     // готовим массив с информацией о процессах
     let processes = events.map(x =>  { 
         let parent = x['tree_parent_id']; // родитель
         if (diff.indexOf(parent) >= 0 ) parent = 'root'; // если родитель не является ни чьим ребёнком,
                                                          // привязываем его к псевдокорню
         
         let elemClass = "";
         
         // TODO: доделать отображение
         if(x[commandlineField] === commandline) //если встретился такой же процесс, на который мы смотрим в UI
         {
             elemClass += "alarm"; 
         }
 
         let elem = {
            "id":x['tree_id'],
            "parent": parent,
            "name": x['time'].slice(0,-9) + " | " + x['object.id'] + " | " + x[commandlineField],
            "text": x['time'].slice(0,-9) + " | " + x['object.id'] + " | " + x[commandlineField],
            "original": x,
            "elemClass": elemClass
         }  
         
         return elem;
     });
     
     let rootText = $(`#output${outputelemsuffix} a`).text();
     processes.push({"id":"root", "name":"...", "parent":"", "text":rootText})

     //let unique_processes = _.unique(processes, function(x) { return x.text; });
     let unique_processes = _.unique(processes, function(x) { return x.id; });
 
     // рисуем дерево
     svg = d3.select("#output").append("svg")
     .attr("width", 2150) 
     .append("g")
     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
 
     root = d3.stratify()
     .id(function(d) { return d.id; })
     .parentId(function(d) { return d.parent; })
     (unique_processes);
     root.x0 = 0;
     root.y0 = 0;
     update(root);
 }

 
// treeBranchEvents - описана, как глобальная там, откуда вызывается эта функция
/**
 * Оторазить информацию о процессах в виде дерева (только предки)
 * @param {list} pre_events список событий
 * @param {string} outputelemsuffix класс DOM-елемента, где требуется отобразить информацию
 * @returns 
 */
async function processTreeBranch(pre_events, outputelemsuffix="")
{
    // больше предков нет, пора отрисовать то, что накопилось
    if(pre_events.length === 0)
    {
        let commandlineField = "object.process.cmdline";
        let events;
        if(treeBranchEvents[0]['msgid'].includes("exec")) {
            events = treeBranchEvents.map(x => ({
               ...x,
               tree_id: x['object.process.id'],
               tree_parent_id: x['object.process.parent.id']
           }));
        }
        else {
            if('object.process.guid' in treeBranchEvents[0] && treeBranchEvents[0]['object.process.guid'] != null) {
                events = treeBranchEvents.map(x => ({
                   ...x,
                   tree_id: x['object.process.guid'],
                   tree_parent_id: x['object.process.parent.guid']
               }));
            }
            else{
                events = treeBranchEvents.map(x => ({...x,
                   tree_id: x['object.id'] + " | " + x['object.name'],
                   tree_parent_id: x['object.process.parent.id'] + " | " + x['object.process.parent.name']}));
            }
        }

        let parents = events.map(x => x['tree_parent_id']);  // родители
        let items = events.map(x => x['tree_id']);           // дети

        let prediff = parents.filter(x => items.indexOf(x) == -1) // разница = родители верхнего уровня (сами не дети)
        let diff = [...new Set(prediff)];

        let processes = events.map(x =>  { 
            let parent = x['tree_parent_id']; // родитель
            if (diff.indexOf(parent) >= 0 ) parent = 'root'; // если родитель не является ни чьим ребёнком,
                                                             // привязываем его к псевдокорню
        
            let elemClass = "";
            if(x[commandlineField] === commandline) //если встретился такой же процесс, на который мы смотрим в UI
            {
                elemClass += " alarm"; 
            }
            let elem = {
                "id":x['tree_id'],
                "parent":parent,
                "name":x['time'].slice(0,-9) + " | " + x['object.id'] + " | " + x[commandlineField],
                "text":x['time'].slice(0,-9) + " | " + x['object.id'] + " | " + x[commandlineField],
                "original":x,
                "elemClass": elemClass
            } 

            return elem;
        });

        let rootText = $(`#output${outputelemsuffix} a`).text();
        processes.push({"id":"root", "name":"...", "parent":"", "text":rootText})
        let unique_processes = _.unique(processes, function(x) {
            return x.id;
        });

        svg = d3.select("#output")
        .append("svg")
        .attr("width", 2150)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        root = d3.stratify()
        .id(function(d) { return d.id; })
        .parentId(function(d) { return d.parent; })
        (unique_processes);
        root.x0 = 0;
        root.y0 = 0;
        update(root);

        e = $("<div>", {"class":"openMsgs oneline"}).text(`Открыть в новом окне события запуска этих процессов`).click(
            function() {
                let uuids = treeBranchEvents.map(x => `"${x['uuid']}"`);
                let uuidsstr = uuids.join(", ");
                //let siemUrl = window.location.origin;
                try {
                    chrome.tabs.create({url: `${siemUrl}/#/events/view?where=uuid in [${uuidsstr}]`});
                }
                catch
                {
                    window.open(`${siemUrl}/#/events/view?where=uuid in [${uuidsstr}]`, "_blank");
                }
            });
    
        e.insertBefore($(`#output${outputelemsuffix}`));
        return;
    }
    // есть предок, создадим его и поищем его предка
    else
    {
        treeBranchEvents.push(pre_events[0]);
        let uuid = pre_events[0]['uuid'];
        let event_src_host = pre_events[0]['event_src.host'];
        let processStartMsgid = pre_events[0]['msgid'];
        let parentProcessPid = pre_events[0]['object.process.parent.id'];
        let parentProcessName = pre_events[0]['object.process.parent.name'];
        //let siemUrl = window.location.origin;
        getdata(siemUrl,
            `event_src.host = "${event_src_host}"` + 
            ` and msgid = "${processStartMsgid}"` + 
            ` and object.id = "${parentProcessPid}"` + 
            ` and object.name = "${parentProcessName}"` +
            ` and generator.type != 'correlationengine'`,
            count,
            processTreeBranch);
    }
}


//найти всех потомков текущего процесса
async function processTreeBranchReverse(pre_events, outputelemsuffix="")
{
    // в outputelemsuffix лежит guid процесса-родителя, для которого искались потомки
    events_for_children_waiting = _.without(events_for_children_waiting, outputelemsuffix)
    if(pre_events.length === 0)
    {
        if(events_for_children_waiting.length > 0)
        {
            return;
        }
        else
        {
            let commandlineField = "object.process.cmdline";
            let events;
            if(treeBranchEvents[0]['msgid'].includes("exec")) {
                events = treeBranchEvents.map(x => ({
                   ...x,
                   tree_id: x['object.process.id'],
                   tree_parent_id: x['object.process.parent.id']
               }));
            }
            else {
                if('object.process.guid' in treeBranchEvents[0] && treeBranchEvents[0]['object.process.guid'] != null) {
                    events = treeBranchEvents.map(x => ({
                       ...x,
                       tree_id: x['object.process.guid'],
                       tree_parent_id: x['object.process.parent.guid']
                   }));
                }
                else{
                    events = treeBranchEvents.map(x => ({...x,
                       tree_id: x['object.id'] + " | " + x['object.name'],
                       tree_parent_id: x['object.process.parent.id'] + " | " + x['object.process.parent.name']}));
                }
            }
    
            let parents = events.map(x => x['tree_parent_id']);  // родители
            let items = events.map(x => x['tree_id']);           // дети
    
            let prediff = parents.filter(x => items.indexOf(x) == -1) // разница = родители верхнего уровня (сами не дети)
            let diff = [...new Set(prediff)];
    
            let processes = events.map(x =>  { 
                let parent = x['tree_parent_id']; // родитель
                if (diff.indexOf(parent) >= 0 ) parent = 'root'; // если родитель не является ни чьим ребёнком,
                                                                 // привязываем его к псевдокорню
            
                let elemClass = "";
                if(x[commandlineField] === commandline) //если встретился такой же процесс, на который мы смотрим в UI
                {
                    elemClass += " alarm"; 
                }
                let elem = {
                    "id":x['tree_id'],
                    "parent":parent,
                    "name":x['time'].slice(0,-9) + " | " + x['object.id'] + " | " + x[commandlineField],
                    "text":x['time'].slice(0,-9) + " | " + x['object.id'] + " | " + x[commandlineField],
                    "original":x,
                    "elemClass": elemClass
                } 
    
                return elem;
            });
    
            let rootText = $(`#output${outputelemsuffix} a`).text();
            processes.push({"id":"root", "name":"...", "parent":"", "text":rootText})
            let unique_processes = _.unique(processes, function(x) {
                return x.id;
            });
    
            svg = d3.select("#output")
            .append("svg")
            .attr("width", 2150) 
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            root = d3.stratify()
            .id(function(d) { return d.id; })
            .parentId(function(d) { return d.parent; })
            (unique_processes);
            root.x0 = 0;
            root.y0 = 0;
            update(root);

            e = $("<div>", {"class":"openMsgs oneline"}).text(`Открыть в новом окне события запуска этих процессов`).click(
                function()    {
                    //let siemUrl = window.location.origin;
                    let uuids = treeBranchEvents.map(x => `"${x['uuid']}"`);
                    let uuidsstr = uuids.join(", ");
                    try {
                        chrome.tabs.create({url: `${siemUrl}/#/events/view?where=uuid in [${uuidsstr}]`});
                    }
                    catch
                    {
                        window.open(`${siemUrl}/#/events/view?where=uuid in [${uuidsstr}]`, "_blank");
                    }
                }
            );
            e.insertBefore($('#output'));
            return;
        }
    }
    else
    {
        treeBranchEvents = treeBranchEvents.concat(pre_events);
        pre_events.forEach(event => {
            let event_src_host = event['event_src.host'];
            let processStartMsgid = event['msgid'];
            let processGuid = event['object.process.guid']
            let parentProcessGuid = event['object.process.parent.guid'];
            let parentProcessName = event['object.process.parent.name'];
            events_for_children_waiting.push(processGuid);
            //в качестве outputelemsuffix передаю guid, чтобы в обработчике понять, дла какого процесса получен ответ
            //let filter = `event_src.host = "${event_src_host}" and msgid = "${processStartMsgid}" ` +
            //`and object.process.parent.guid = "${processGuid}"`;

            //в качестве outputelemsuffix передаю guid, чтобы в обработчике понять, дла какого процесса получен ответ
            let filter = `object.process.parent.guid = "${processGuid}"`;
            //let siemUrl = window.location.origin;
            getdata(siemUrl, filter, count, processTreeBranchReverse, processGuid);
        })
    }
}


function processHashByNameSearch(events)
{
    // Вся полезная работа сделана ранее в вызывающей фугкцкции :)
    // TODO: выглядит так, что тут надо всё отрефаторить
    // console.log(events);
    return;
}


/**
 * Сохранить JSON события в буфер обмена
 * @param {Array} events массив событий 
 * @param {str} outputelemsuffix 
 */
function processEventCopyToClipboard(events, outputelemsuffix="")
{
   let event = events[0];
   let event_filtered = $.each(event, function(key, value) {
    if(value === null) {
        delete event[key];
    }
   });
   navigator.clipboard.writeText(JSON.stringify(event_filtered));
   let icon = $(".copynormalizedicon");
   $('<div>Скопировано...</div>').insertAfter(icon).show().delay(1000).fadeOut();
}


/**
 * Сохранить список событий в локальный файл
 * @param {Array} events массив событий 
 * @param {str} outputelemsuffix uuid корреляционного события, для которого найдены исходные события 
 */
function processCorrleationEventDownload(events, outputelemsuffix="")
{

   let events_filtered = events.map(e => (
    $.each(e, function(key, value) {
        if(value === null) {
            delete e[key];
        }
       })
   ))

   let filename = '';
   let data = '';
   if(events_filtered.length === 1){
    data = JSON.stringify(events_filtered[0]);
    if(outputelemsuffix === ""){
      filename = `${events_filtered[0]['uuid']}.txt`;
    }
    else{
      filename = `${outputelemsuffix}_subevents.txt`;
    }
   }
   else {
    data = JSON.stringify(events_filtered);
    filename = `${outputelemsuffix}_subevents.txt`;
   }
   saveFile(filename, "data:attachment/text", data);
}


/**
 * Получить все исходные события и сохранить их в файл
 * @param {Array} events массив событий, для первого из них производится получение исходных и сохранение в файл
 * @param {str} outputelemsuffix 
 */
function processCorrleationEventDownloadSubevents(events, outputelemsuffix="")
{
    let event = events[0];
    let time = event['time'];
    //"2023-02-04T19:07:05.0000000Z"
    let timeParsed = moment.utc(time.slice(0,-9), "YYYY-MM-DDThh:mm:ss");
    let timeto = timeParsed.toDate();
    let ttimeto = timeto.getTime()/1000; 
    gtfrom = ttimeto; 
    gtto = ttimeto;

    let uuids = event['subevents'];
    let uuids_str = "'" + uuids.join("','") + "'";
    //let siemUrl = window.location.origin;
    getdata(siemUrl, `uuid in [${uuids_str}]`, uuids.length, processCorrleationEventDownload, event['uuid'], ttimeto-86400, ttimeto);    //TODO: со временем путаница и не удобно, надо распутаться
}

/**
 * Сохранить данные в файл
 * @param {str} name имя файла
 * @param {str} type тип данных
 * @param {str} data данные
 * @returns 
 */
function saveFile (name, type, data) {
    if (data !== null && navigator.msSaveBlob)
        return navigator.msSaveBlob(new Blob([data], { type: type }), name);
    let a = $("<a style='display: none;'/>");
    let url = window.URL.createObjectURL(new Blob([data], {type: type}));
    a.attr("href", url);
    a.attr("download", name);
    $("body").append(a);
    a[0].click();
    window.URL.revokeObjectURL(url);
    a.remove();
}

var siemUrl = window.location.origin;