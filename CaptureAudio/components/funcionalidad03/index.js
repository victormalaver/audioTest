'use strict';
app.funcionalidad03 = kendo.observable({
    onShow: function () {
        //Carga JavaScript 3st
    },
    afterShow: function () {
        //Carga JavaScript 4st        
    },
    viewFormTarea: function (e) {
        kendo.mobile.application.navigate("components/funcionalidad03/captureView.html");    }
});
