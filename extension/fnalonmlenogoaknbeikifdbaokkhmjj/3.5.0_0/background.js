var config =  {
    urls:
    [
        'https://www.nfe.fazenda.gov.br/*',
        'https://www.cte.fazenda.gov.br/*'
    ],
    urlFSist:
    [
        'https://www.fsist.com.br/'
    ],    
    urlsFazendaDownload:
    [
        'www.nfe.fazenda.gov.br/portal/downloadNFe.aspx',
        'www.cte.fazenda.gov.br/portal/downloadCTe.aspx'
    ],
    urlsTratarElementos:
    [
        'www.nfe.fazenda.gov.br/portal/consultaRecaptcha.aspx?tipoConsulta=resumo',
        'www.cte.fazenda.gov.br/portal/consultaRecaptcha.aspx?tipoConsulta=resumo'
    ],
    urlsTratarElementosHidden:
    [
        '#ctl00_ContentPlaceHolder1_txtChaveAcessoResumo',
        '#ctl00_ContentPlaceHolder1_btnConsultar',
        '#ctl00_ContentPlaceHolder1_btnConsultarHCaptcha',
        '#ctl00_ContentPlaceHolder1_btnLimpar',
        '#ctl00_ContentPlaceHolder1_btnLimparHCaptcha'
    ],
    urlsTratarElementosReplace:
    [
        '#ctl00_ContentPlaceHolder1_lblChaveAcesso'
    ],
    errosParaFechar:
    [
        'NF-e INEXISTENTE na base nacional',
        'CT-e INEXISTENTE na base nacional'
    ]
}
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
const extra = ['blocking', 'responseHeaders'];
if (/Firefox/.test(navigator.userAgent) === false) {
    extra.push('extraHeaders');
}
var tabIdOpen = null;
var windowIdOpen = null;
var checkCertNFe = false;
var checkCertCTe = false;
var chave = null;
function checkCert(){
    if (chave != null ){
        if (chave.substr(20, 2) == '55'){
            return checkCertNFe;
        }
        else if (chave.substr(20, 2) == '57'){
            return checkCertCTe;
        }
    }
    return false;    
}
function checkCertSet(value){
    if (chave != null ){
        if (chave.substr(20, 2) == '55'){
            checkCertNFe = value;
        }
        else if (chave.substr(20, 2) == '57'){
            checkCertCTe = value;
        }
    }    
}
chrome.webRequest.onHeadersReceived.addListener(function(details){
    function removerItem(responseHeaders, name){
        var index = responseHeaders
            .findIndex(function (value) { return value.name.toLowerCase() == name.toLowerCase(); });
        if (index != -1){
            responseHeaders.splice(index, 1);
        }
    }
    function responseHeadersGetValue(responseHeaders, name){
        var index = responseHeaders
            .findIndex(function (value) { return value.name.toLowerCase() == name.toLowerCase(); });
        if (index > -1){
            return responseHeaders[index].value;        
        }
        else{
            return null;
        }
    }        
    if (tabIdOpen != null){
        var Location = responseHeadersGetValue(details.responseHeaders, "Location");
        if (urlsVerificar(Location, config.urlsFazendaDownload)){                
            enviarLink(Location);                
            if (checkCert()){
                Fechar();
                getXML(Location);
                return { cancel: true };
            }
        }
        removerItem(details.responseHeaders, 'x-frame-options');
        removerItem(details.responseHeaders, 'Content-Disposition');    
        details.responseHeaders.push({
            name: 'Access-Control-Allow-Origin', 
            value: 'https://www.fsist.com.br'
        });    
        return {responseHeaders:details.responseHeaders};
    }
  },
{ urls: config.urls }, extra);

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.tipo == 'AbrirConsulta'){
            localStorage.setItem('FSistChave', request.chave);
            ConsultaChave(request.chave, request.url);
            sendResponse({result: true});
        }
        else if (request.tipo == 'GetChave'){            
            sendResponse({chave: localStorage.getItem('FSistChave')});
        }
        else if (request.tipo == 'SetHtml'){ 
            enviarHTML(request.html);
            sendResponse(true);
        }
        else if (request.tipo == 'GetXML'){ 
            checkCertSet(true);
            Fechar(); 
            getXML(request.link);
            sendResponse(true);
        }
        else if (request.tipo == 'Fechar'){        
            Fechar();            
            sendResponse(true);
        }
        else if (request.tipo == 'SetConfig'){  
            config = JSON.parse(request.configJson);
            sendResponse(true);
        }
        else{
            sendResponse(true);
        }
    }
);
function getXML(url) {   
    var req = new XMLHttpRequest();
    req.open("GET", url, true);
    req.onreadystatechange=function() {
        if (req.readyState==4) {
            if (req.status==200) {        
                var xml = req.responseText;
                enviarXML(xml);                             
            }            
            else {
                alert('Erro status: ' + req.status + '\r\n' + url);
            }
        }
    }
    req.send();
}
function base64utf8(str){
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
    }));
}
function enviarXML(xml){
    chrome.tabs.query({active: true}, function(tabs){
        if (tabs.length > 0){
            if (tabs[0].url.indexOf(config.urlFSist[0]) > -1){
                var codeToExec = [                
                    'if (document.querySelector("#stringsFSistXml") != null) {',
                    'document.querySelector("#stringsFSistXml").value = ' + '"' +  base64utf8(xml) + '";',
                    'document.querySelector("#stringsFSistXml").click();',
                    '}',
                ].join('\n');

                chrome.tabs.executeScript(tabs[0].id, {
                    code: codeToExec
                }, function(result) {});
            }
        }
    });    
}
function enviarLink(link){
    chrome.tabs.query({active: true}, function(tabs){
        if (tabs.length > 0){
            if (tabs[0].url.indexOf(config.urlFSist[0]) > -1){
                var codeToExec = [                
                    'if (document.querySelector("#stringsFSistLink") != null) {',
                    'document.querySelector("#stringsFSistLink").value = ' + '"' +  btoa(link) + '";',
                    'document.querySelector("#stringsFSistLink").click();',
                    '}',
                ].join('\n');

                chrome.tabs.executeScript(tabs[0].id, {
                    code: codeToExec
                }, function(result) {});
            }
        }
    });
}
function enviarHTML(html){
    chrome.tabs.query({active: true}, function(tabs){
        if (tabs.length > 0){
            if (tabs[0].url.indexOf(config.urlFSist[0]) > -1){
                var codeToExec = [                
                    'if (document.querySelector("#stringsFSistHtml") != null) {',
                    'document.querySelector("#stringsFSistHtml").value = ' + '"' +  base64utf8(html) + '";',
                    'document.querySelector("#stringsFSistHtml").click();',
                    '}'
                ].join('\n');

                chrome.tabs.executeScript(tabs[0].id, {
                    code: codeToExec
                }, function(result) {});
            }
        }
    });
}
function ConsultaChave(chave_, url){
    chave = chave_;
    function createWindow(url) {
        tabIdOpen = null;
        chrome.windows.create({ url: url, focused: true, type: "popup", width: 1024, height: 800}, function(window) {
            tabIdOpen = window.tabs[0].id;
            windowIdOpen = window.id;
        });

        var codeToExec = [                
            "sessionStorage.setItem('FSIST_CONFIG', '" + JSON.stringify(config) + "');"
        ].join('\n');

        chrome.tabs.executeScript(tabIdOpen, {
            code: codeToExec,
        }, function(result) {});
    }
    createWindow(url);
}
function Fechar(){
    if (tabIdOpen !== null){
        chrome.tabs.remove(tabIdOpen);
        tabIdOpen = null;
        windowIdOpen = null;
    }
}
chrome.windows.onRemoved.addListener(function(windowsId, removeInfo) {
    if (windowsId == windowIdOpen) {
        windowIdOpen = null;
        tabIdOpen = null;
    }
});