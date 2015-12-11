'use strict';

app.homeView = kendo.observable({
    onShow: function () {},
    afterShow: function () {}
});

// START_CUSTOM_CODE_homeView
// END_CUSTOM_CODE_homeView


window.app.homeView = kendo.observable({
    seleccionarL: function () {
        $.soap({
            // url: 'http://www.ausa.com.pe/WS_SVU/ws_svu.asmx?WSDL'
            url: 'http://www.ausa.com.pe/WS_SVU/ws_svu.asmx?op=',
            method: 'nuevaAutenticacion',

            data: {
                userName: 'jlcornejo',
                password: '123'
            },

            success: function (soapResponse) {
                alert("entro");
                // do stuff with soapResponse
                // if you want to have the response as JSON use soapResponse.toJSON();
                // or soapResponse.toString() to get XML string
                // or soapResponse.toXML() to get XML DOM
            },
            error: function (SOAPResponse) {
                // show error
                alert("error");
            }
        });
    }
});

function SuccessOccur(data, status, req) {
    if (status == "success")
        alert(req.responseText);
}

function ErrorOccur(data, status, req) {
    alert(status);
}


$(function () {
    //Evita problemas de cross-domain con JQuery
    jQuery.support.cors = true;
});