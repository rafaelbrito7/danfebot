function TratarFSist(){
    if (document.getElementById('stringsFSistChave') != null && document.getElementById('stringsFSistClick') != null) {
        var stringsFSistChave = document.getElementById('stringsFSistChave');
        var stringsFSistUrl = document.getElementById('stringsFSistUrl');
        var stringsFSistClick = document.getElementById('stringsFSistClick');
        stringsFSistClick.onclick = function () {        
            chrome.runtime.sendMessage(
            {
                tipo: 'AbrirConsulta', 
                chave: stringsFSistChave.value,
                url: stringsFSistUrl.value
            }
            ,function(response) {
                //console.log(response);
            });
        };
    }

    if (document.getElementById('FSistbutDownloadComCertificado') != null){
        document.getElementById('FSistbutDownloadComCertificado').onclick = function (){
            var link = atob(document.querySelector("#stringsFSistLink").value);            
            chrome.runtime.sendMessage({tipo: 'GetXML', link: link}, function(response) {
                
            });
        };
    }

    if (document.getElementById('stringsFSIST_CONFIG') != null && document.getElementById('stringsFSIST_CONFIG').value != ''){
        var json = document.getElementById('stringsFSIST_CONFIG').value;
        chrome.runtime.sendMessage({tipo: 'SetConfig', configJson: json}, function(response) {
                
        });
    }

    if (document.getElementById('stringsFSistVersao') != null){
        try{
            var manifestData = chrome.runtime.getManifest();
            document.getElementById('stringsFSistVersao').value = manifestData.version;
        }
        catch (e){}         
    }
}
TratarFSist();

function getConfig(){
    if (sessionStorage.getItem('FSIST_CONFIG') != null){
        var res = JSON.parse(sessionStorage.getItem('FSIST_CONFIG'));
        return res;
    }
}

function TratarFazenda(){
    var buscando = true;
    var DownloadDocumentoBuscando = false;
    function Completo() {
        setTimeout(function () {        
            if (document.getElementsByName('h-captcha-response') != null) {
                if (document.getElementsByName('h-captcha-response')[0].value != '' ) {
                    buscando = false;   
                    
                    chrome.runtime.sendMessage({tipo: 'GetChave'}, function(response) {   
                        document.querySelector("#ctl00_ContentPlaceHolder1_txtChaveAcessoResumo")
                            .value = response.chave;                    
                        if (document.querySelector("#ctl00_ContentPlaceHolder1_btnConsultarHCaptcha") != null) {
                            document.querySelector("#ctl00_ContentPlaceHolder1_btnConsultarHCaptcha").click();
                        }
                    });
                }
            }
            if (buscando) {
                Completo();
            }
        }, 500);
    }
    function DownloadDocumento(iniciar){
        function ErrosParaFechar(){
            for (let i = 0; i < getConfig().errosParaFechar.length; i++) {
                const txt = getConfig().errosParaFechar[i];
                if (document.documentElement.outerHTML.indexOf(txt) > -1 ){
                    return true;
                }
            }
            return false;
        }
        if (ErrosParaFechar()){            
            chrome.runtime.sendMessage({tipo: 'SetHtml', html: document.documentElement.outerHTML}, function(response) {
                //console.log(response);
            });
            chrome.runtime.sendMessage({tipo: 'Fechar'}, function(response) {
                //console.log(response);
            });
        }
        else if (document.querySelector("#ctl00_ContentPlaceHolder1_btnDownload") != null) {               
            chrome.runtime.sendMessage({tipo: 'SetHtml', html: document.documentElement.outerHTML}, function(response) {});
            var antigo = document.querySelector("#ctl00_ContentPlaceHolder1_btnDownload");
            var pai = antigo.parentElement;
            var newbut = document.createElement('input');
            newbut.type = antigo.type;
            newbut.value = antigo.value;
            newbut.id = antigo.id;
            newbut.name = antigo.name;
            antigo.remove();
            pai.appendChild(newbut);
            newbut.style.display = 'none';                
            newbut.click();            
        }
    }
    Completo();
    DownloadDocumento();
    function urlsVerificar(texto, listaUrls){
        if (texto != null){
            for (let i = 0; i < listaUrls.length; i++) {
                if (texto.indexOf(listaUrls[i]) > -1) {
                    return true;
                }
            }
        }
        return false;
    }
    function ElementHidden(){
        function urlsIs() {
            return urlsVerificar(document.location.toString(), getConfig().urlsTratarElementos);
        }
        if (urlsIs()) {
            function TratarElementoHidden(name){
                var eleTemp = document.querySelector(name);
                if (eleTemp != null){
                    eleTemp.style.display = 'none';
                }
            }
            function TratarElementoReplace(name){
                var eleTemp = document.querySelector(name);
                if (eleTemp != null){                    
                    eleTemp.innerHTML = 'Informe o ReCaptcha';
                    eleTemp.style.fontSize = '18px';
                }
            }
            getConfig().urlsTratarElementosHidden.forEach(name => {
                TratarElementoHidden(name);
            });
            getConfig().urlsTratarElementosReplace.forEach(name => {
                TratarElementoReplace(name);
            });
        }
    }
    ElementHidden();

    if (document.location != null && urlsVerificar(document.location.toString(), getConfig().urlsFazendaDownload)){
        chrome.runtime.sendMessage({tipo: 'GetXML', link: document.location.toString()}, function(response) {
            //console.log(response);
        });
    }
}
if (sessionStorage.getItem('FSIST_CONFIG') != null){
    TratarFazenda();
}


