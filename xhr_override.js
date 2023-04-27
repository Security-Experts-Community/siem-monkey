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

originalSend = window.XMLHttpRequest.prototype.send;
window.XMLHttpRequest.prototype.send = overridedSend;

function overridedSend(data){
     if(this.onreadystatechange){
       this._onreadystatechange = this.onreadystatechange;
     }

     if(data !== null){
        try {
            // console.log(data);
            let params = JSON.parse(data); 
            // удалим ненужную сортировку
            delete params.filter.groupByOrder; // удаляем 
            data = JSON.stringify(params);
        }
        catch (error) {
            //console.log(error);
            ; //просто пропустим ошибку, какой она бы не была, 
              // наверняка просто попался какой-то запрос с параметрами другого формата
              // TODO: наверное стоит делать нормально, но пока и так сойдет
        }

        // console.log(data);
     }
     this.onreadystatechange = onReadyStateChangeReplacement;
     return originalSend.apply(this, arguments);
}

function onReadyStateChangeReplacement(){
    if(this._onreadystatechange){
      return this._onreadystatechange.apply(this, arguments);
   }
}