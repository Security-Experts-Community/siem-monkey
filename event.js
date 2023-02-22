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


// Функция вызывается после того, как будет отображено окно попапа плагина
function getPageDetails(callback) { 
    // В контекст страницы внедряются скрипты необходимых библиотек и скрипт content.js, который будет
    // парсить значения полей события из правой панели
    chrome.tabs.executeScript(null, { file: "libs/jquery/jquery-3.5.1.min.js" }, function() {
            chrome.tabs.executeScript(null, { file: "content.js" });
    });
    
    // Регистрируем обработчик сообщений от фоновой страницы
    chrome.runtime.onMessage.addListener(
        function doStuff(message){
            chrome.extension.onMessage.removeListener(doStuff);
            // Вызов callback-функции, в нашем случае это будет onPageDetailsReceived из файла popup.js
            callback(message); 
    }); 
};
