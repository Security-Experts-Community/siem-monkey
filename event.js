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
