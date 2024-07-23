//console.log(window.appConfig);
if (window.appConfig){
    window.postMessage({type : "FROM_PAGE", text : JSON.stringify(window.appConfig)}, "*");
}
