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


// Content script
/**
 * 
 * @returns Получить информацию о полях таксономии
 */
async function getTaxonomy() {
    siemUrl = window.location.href.split('#',1).slice(0, -1);
    let request = await $.ajax
    (
        {
            type: "GET",
            url: `${siemUrl}/api/events/v2/events_metadata`,
        }
    );
    return request;
}


async function main() {
    let iframe = $('#legacyApplicationFrame'); 
    let params = {};

    try {
        // получаем от SIEM список поддерживаемых полей и для каждого поля парсим из правого сайдбара значение
        let msg = await getTaxonomy();
        let fields = msg['fields'];
        fields.forEach( x => {
            params[x.name] = $(`div[title=\"${x.name}\"] + div > div > div:first`, iframe.contents()).text().trim('↵');
        });
        
        let selector = "body .mc-sidebar_right > mc-sidebar-opened > header > div.layout-row.flex > div > div";
        params['time'] = $(selector).text().trim('↵');
        if(params['time'].length === 0 ) { 
            params['time'] = $(selector, iframe.contents()).text().trim('↵');
        }
    }
    catch(err)
    {
        // если не вышло, то считаем, что мы в NAD, поэтому пробуем получить адреса и порты с карточки сессии/атаки
        // TODO: решить, как быть с NAD - надо как-то определять, что мы точно в NADе
        params['nad_src_ip'] = $('details-endpoint[dir="src"] span[ng-if="::details[dir].ip"]', iframe.contents())
        .first().text();
        params['nad_dst_ip'] = $('details-endpoint[dir="dst"] span[ng-if="::details[dir].ip"]', iframe.contents())
        .first().text();
        params['nad_src_port'] = $('details-endpoint[dir="src"] span[ng-if="::details[dir].port"]', iframe.contents())
        .eq(1).text();
        params['nad_dst_port'] = $('details-endpoint[dir="dst"] span[ng-if="::details[dir].port"]', iframe.contents())
        .eq(1).text();
        params['session_start'] = $('div[row-title="Начало"]', iframe.contents()).attr('row-value');
    }
    chrome.runtime.sendMessage({
        'title': document.title,
        'url': window.location.href,
        'params': params
    });
}


function destructor() {
    document.removeEventListener(destructionEvent, destructor);
}


var destructionEvent = 'destructmyextension_' + chrome.runtime.id;
document.dispatchEvent(new CustomEvent(destructionEvent));
document.addEventListener(destructionEvent, destructor);

main();
