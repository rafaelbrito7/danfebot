function iniciar() {
    document.addEventListener('DOMContentLoaded', function () {

        function ConsultaChaveNFe(chave){            
            function createWindow(url) {
                chrome.windows.create({ url: url, focused: true, type: "popup", width: 1024, height: 800}, function(window) {
                    localStorage.setItem('FSisttabIdOpen', window.tabs[0].id);                
                    localStorage.setItem('FSistChave', chave);                                    
                });
            }
            createWindow('https://www.nfe.fazenda.gov.br/portal/consultaRecaptcha.aspx?tipoConsulta=resumo&tipoConteudo=7PhJ+gAVw2g=');
        }

        document.getElementById('butTeste').addEventListener('click', function () {
            //browser.downloads.download({ url: "https://www.fsist.com.br/PriPlugin/v4/imgs/monitor/app1.png" })
            //ConsultaChaveNFe('35211061033155000119550010001323861001681118');


            chrome.tabs.query({active: true}, function(tabs){
                    var codeToExec = [                
                        'document.querySelector("#stringsChaveText").value = "isso mesmo";'
                    ].join('\n');

                    chrome.tabs.executeScript(tabs[0].id, {
                        code: codeToExec
                    }, function(result) {
                        
                    });
            });
        });
        document.getElementById('butUpload').addEventListener('click', function () {
            document.getElementById('arquivo').click();            
        });

        document.getElementById('arquivo').addEventListener('change', function (event) {
            var files = event.target.files; 
            f = files[0];
            var reader = new FileReader();            
            reader.onload = (function (theFile) {
                return function (e) {
                    document.getElementById('textXML').value = e.target.result;
                    document.getElementById('butGerar').click();
                };
            })(f);            
            reader.readAsText(f);
        });

        var butGerar = document.getElementById('butGerar');
        butGerar.addEventListener('click', function () {

            var textXML = document.getElementById('textXML');
            if (textXML.value.trim() == '') {
                MsgInf('É necessário informar o xml', function () {
                    textXML.focus();
                });
            }
            else {
                var chave = getChave(textXML.value);
                if (chave != '' && chave.length == 44) {
                    Aguarde();
                    var paraenviar =
                    {
                        chave: chave,
                        xml: btoa(textXML.value)
                    };
                    //$.ajax({
                    //    method: 'POST',
                    //    url: 'https://www.fsist.com.br/api/xmltopdf/',
                    //    data: paraenviar,
                    //    success: function (data) {
                    //        AguardeClose();
                    //        download(chave + '.pdf', data);
                    //    }
                    //});
                    var con = new Ajax2();
                    con.PostAdd('chave', chave);
                    con.PostAdd('xml', textXML.value);
                    con.POST('https://www.fsist.com.br/api/xmltopdf/', function (data) {
                        AguardeClose();
                        download(chave + '.pdf', data);
                        //window.open('data:application/pdf;base64,' + encodeURIComponent(data));
                    });
                }
                else {
                    MsgInf('Arquivo xml inválido.', function () {
                        textXML.focus();
                    });
                }
            }
        });        
    });
    var Ajax2 = function () {
        var itens = [];
        this.PostAdd = function (nome, value) {
            itens.push({ 'nome': nome, 'value': value });
        }
        var poststring = function () {
            var res = '';
            for (var i = 0; i < itens.length; i++) {
                if (itens[i] != null) {
                    if (res != '') res += '&';
                    res += encodeURIComponent(itens[i].nome) + '=' + encodeURIComponent(itens[i].value);
                }
            }
            return res;
        }
        var metodo = function (cmd, url, onload) {
            var dow1 = null;
            var dow2 = null;
            try { dow1 = new XDomainRequest(); }
            catch (e) { dow2 = new XMLHttpRequest(); }
            if (dow1 != null) {
                dow1.open(cmd, url);
                if (onload != null) dow1.onload = function () {
                    onload(this.responseText);
                };
                dow1.send(poststring());
            }
            else {
                if (dow2 != null) {
                    dow2.onreadystatechange = function () {
                        if (this.readyState == 4)
                            if (onload != null)
                                onload(this.responseText);
                    }
                    dow2.open(cmd, url, true);
                    dow2.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                    dow2.send(poststring());
                }

            }
        }
        this.GET = function (url, onload) {
            metodo('GET', url, onload);
        }
        this.POST = function (url, onload) {
            metodo('POST', url, onload);
        }
    };
    function download(arquivo, content) {
        var link = document.createElement('a');
        link.setAttribute('download', arquivo);
        link.href = 'data:application/pdf;base64,' + encodeURIComponent(content);
        document.body.appendChild(link);
        link.click();
    }
    var downloadFile = function (filename, dataValue) {
        var MIME_TYPE = 'application/pdf';
        window.URL = window.webkitURL || window.URL;
        window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder;

        var prevLink = document.body.querySelector('a');
        if (prevLink) {
            window.URL.revokeObjectURL(prevLink.href);
            output.innerHTML = '';
        }

        var a = document.createElement('a');
        a.download = '" + filename + @".csv';

        if (BlobBuilder == undefined) {
            var bb = new Blob([dataValue], { 'type': MIME_TYPE });
            a.href = window.URL.createObjectURL(bb);
        }
        else {
            var bb = new BlobBuilder();
            bb.append(dataValue);
            a.href = window.URL.createObjectURL(bb.getBlob(MIME_TYPE));
        }

        a.textContent = 'Download ready';

        a.dataset.downloadurl = [MIME_TYPE, a.download, a.href].join(':');
        a.draggable = true; // Don't really need, but good practice.
        a.classList.add('dragout');

        document.body.appendChild(a);

        a.onclick = function (e) {
            if ('disabled' in this.dataset) {
                return false;
            }
        };
    };
    function getChave(xml) {
        if (xml.indexOf(' Id="NFe') > -1) {
            return StrEntreStr(' Id="NFe', '"', xml);
        }
        else if (xml.indexOf(' Id="CTe') > -1) {
            return StrEntreStr(' Id="CTe', '"', xml);
        }
        return '';
    }
    function StrEntreStr(str1, str2, str) {
        var ini = str.indexOf(str1);
        if (ini > -1) {
            ini += str1.length;
            var fim = str.indexOf(str2, ini);
            if (fim > -1) {
                var res = str.substr(ini, fim - ini);
                return res;
            }
        }
        return '';
    }
    function Aguarde() {
        $('#msg2').modal('show');
    }
    function AguardeClose() {
        $('#msg2').modal('hide');
    }
    function MsgInf(msg, onclose) {
        $('#msg1texto').html(msg);
        $('#msg1').modal('show');
        $('#msg1').on('hidden.bs.modal', function (e) {
            if (onclose != null) {
                onclose();
            }
        })
    }    
}
function teste3() {
    alert('ok');
}
iniciar();
