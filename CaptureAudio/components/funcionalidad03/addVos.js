function id(element) {
        return document.getElementById(element);
    }
    (function () {
        window.captureAudioModel = kendo.observable({
            pictureSource: null,
            destinationType: null,
            capureAudio: function (e) {
                var that = this;
                navigator.device.capture.captureAudio(that.captureSuccess, that.captureError, {
                    limit: 1
                });
                //Codigo para eliminar el bug de la primera grabación (en la primera grabación no se guarda la ruta)
                if (e.preventDefault) {
                    e.preventDefault();
                }
                e.stopPropagation();
                //end
            },
            captureSuccess: function (capturedFiles) {
                var i, capturesMsg = "";
                for (i = 0; i < capturedFiles.length; i += 1) {
                    capturesMsg += capturedFiles[i].fullPath;
                }
                f03newAudio(capturesMsg);
                if (e.preventDefault) {
                    e.preventDefault();
                }
                e.stopPropagation();
            },
            captureError: function (error) {
                if (window.navigator.simulator === true) {
                    alert(error);
                } else {
                    var media = document.getElementById("media");
                    media.innerHTML = "An error occured! Code:" + error.code;
                }
            },
        });

    }());

function addNotaVoz() {
    window.location.href = "#listaAudios";
    f03getAudios();
}

// on a global level
var isAudioPlaying = false;
var isAudioPause = 0;
var mediaContent = null;
// function play button
function playAudio(ID) {
    $("tag[type='divIsPlay']").hide();
    $("#divAccion" + ID).show();
    $("tag[type='iconBtn']").attr("class", "fa fa-play");
    //console.log("Play with the following parameters: idnota-> " + ID + " src-> " + document.getElementById("archivo" + ID).value);
    var src = document.getElementById("archivo" + ID).value;
    if (ID > 0) {
        //alert("Link Ausa: " + src);
    } else {
        src = src.replace("file:/","");
        src = src.replace("3gpp","wav");
        //alert("Path Local: " + src);    
        //src = '/android_asset/www/' + src;
    }
    alert(src);
    if (isAudioPlaying) {
        if (isAudioPause == ID) {
            if ($("#iconBtn" + ID).attr("class") == "fa fa-pause") {
                $("#iconBtn" + ID).attr("class", "fa fa-play");
                isAudioPause = ID;
                mediaContent.pause();
                return;
            } else {
                $("#iconBtn" + ID).attr("class", "fa fa-pause");
                isAudioPause = ID;
                mediaContent.play();
                return;
            }
        } else {
            $("#iconBtn" + ID).attr("class", "fa fa-pause");
            mediaContent.stop();
        }
    } else {
        $("#iconBtn" + ID).attr("class", "fa fa-pause");
    }
    mediaContent = new Media(src,
        function () {
            $("#iconBtn" + ID).attr("class", "fa fa-play");
            $("#divAccion" + ID).html('<i class="fa fa-volume-off"></i>');
            //console.log("Media success"); // the media has been finished , set the flag to false, or handle any UI changes. 
        },
        function () {
            $("#divAccion" + ID).html('<i class="fa fa-exclamation-triangle text-danger"></i>');
            //console.log("Media error");
        },
        function () {
            //$("#iconBtn" + ID).attr("class", "fa fa-pause");
            $("#divAccion" + ID).html('<i class="fa fa-volume-up"></i>');
            //console.log("Media change");
        });

    mediaContent.play();
    isAudioPlaying = true;
    isAudioPause = ID;
}

function f03getAudios() {
    var dsAudios = new kendo.data.DataSource({
        transport: {
            read: {
                url: "http://www.ausa.com.pe/appmovil_test01/Relaciones/nlistar/",
                dataType: "json",
                type: "post",
                data: {
                    txtid: 1 // idTarea
                }
            }
        }
    });

    dsAudios.fetch(function () {
        $("#f03viewAudios").kendoListView({
            dataSource: dsAudios,
            template: kendo.template($("#f03TemLA").html())
        });
    });

    $("#dialog").kendoWindow({
        title: "Confirmación",
        scrollable: false,
        modal: true,
        visible: false
    });
}

function f03enviarBackend() {
    //Notificaciones
    var notificationElement = $("#notification");
    notificationElement.kendoNotification();
    var notificationWidget = notificationElement.data("kendoNotification");
    //End

    //Iteramos los audios grabados en la memoria de nuestros smartphone, para hacer la carga de audios en el backend services
    kendo.ui.progress($("#listaAudios"), true);
    $("a[type='newAudio']").each(function (index) {
        var fileToUpload = $(this).attr("value"); //capturedFiles[0].fullPath;
        upload(fileToUpload);
        $(this).parent().remove();
    });
    $("#btnSendBS").attr("disabled", "disabled");
}

function upload(fileToUpload) {
    var apiKey = "9offhmwuw3dhu6vd";
    var el = new Everlive(apiKey);
    var options = {
        fileName: 'myAudio.wav',
        mimeType: ' audio/wav'
    };
    el.files.upload(fileToUpload, options).then(function (r) {
            var uploadResultArray = JSON.parse(r.response).Result;
            var uploadedFileId = uploadResultArray[0].Id;
            var uploadedFileUri = uploadResultArray[0].Uri;
            uploadedFileUri = uploadedFileUri.replace("https", "http");
            var newArchive = {
                Name: "MyArchive",
                FileUri: uploadedFileUri,
                FileId: uploadedFileId
            };
            el.data("Archivos").create(newArchive, function (data) {
                f03accionAudio("insert", uploadedFileUri, "", data.result.Id);
            }, function (err) {
                alert("Error al subir el archivo al backend service " + JSON.stringify(err));
            });
        },
        function (uploadError) {
            alert(JSON.stringify(uploadError));
        });
}
var toquen = 0;
function f03newAudio(archivo) {
        //$("#newAudio").append('<button type="button" class="list-group-item"><a class="btn btn-default btn-xs" type="newAudio" value="' + archivo + '" ><i class="fa fa-trash-o text-muted"></i></a> Nuevo Audio<span style="float:right"><a class="btn btn-info btn-xs" onclick="playAudio('archivo')"><i class="fa fa-play"></i></a></span></button>')
        toquen = toquen + 1;
        var idnota = "local" + toquen;
        $("#newAudio").append('<button type="button" class="list-group-item" id="btn' + idnota + '"><a class="btn btn-default btn-xs" type="newAudio" value="' + archivo + '"><i class="fa fa-trash-o text-muted"></i></a>&nbsp&nbsp&nbsp<i class="fa fa-hdd-o text-muted"></i> Nuevo Audio: ' + idnota + '<tag id="divAccion' + idnota + '" type="divIsPlay" align="center"></tag><span style="float:right"><input value="' + archivo + '" id="archivo' + idnota + '" type="hidden"></input><a class="btn btn-info btn-xs" onclick="playAudio(' + "'" + idnota + "'" + ')"><i id="iconBtn' + idnota + '" type="iconBtn" class="fa fa-play"></i></a></span></button>');

        $("#btnSendBS").removeAttr("disabled");
    }
    //Delete new audio
$(document).on("click", "a[type='newAudio']", function () {
    //$(this).parent().remove();
    idnota = $(this).parent().attr("id").replace("btn", "");
    $("#dialog").data("kendoWindow").open();
    $("#dialog").data("kendoWindow").center();
    $("#divMensajeConf").text("¿Desea eliminar el audio " + idnota + " de la tarea?");
    $("#accionAudio").attr('onclick', 'f03deleteAudio( idnota )');
});

function f03deleteAudio(idAudio) {
    if ($.isNumeric(idAudio)) {
        $("#dialog").data("kendoWindow").open();
        $("#dialog").data("kendoWindow").center();
        $("#divMensajeConf").text("¿Desea eliminar el audio " + idAudio + " de la tarea?");
        $("#accionAudio").attr('onclick', 'f03accionAudio("ndelete","",' + idAudio + ',"")');
    } else {
        $('#dialog').data('kendoWindow').close();
        $("#btn" + idAudio).remove();
        if( $('a[type="newAudio"]').length == 0){
            $("#btnSendBS").attr("disabled", "disabled");
        }
    }
}

function f03accionAudio(accion, FileUri, idAudio, idAudioBackend) {
    //Notificaciones
    var notificationElement = $("#notification");
    notificationElement.kendoNotification();
    var notificationWidget = notificationElement.data("kendoNotification");
    //End
    accion == "insert" && $.ajax({
        type: "POST",
        url: 'http://www.ausa.com.pe/appmovil_test01/Notas/insert',
        data: {
            txtruta: FileUri
        },
        async: false,
        success: function (datos) {
            var data = [];
            data = JSON.parse(datos);
            if (data[0].Column1 > 0) {
                var idNota = data[0].Column1;
                $.ajax({
                    type: "POST",
                    url: 'http://www.ausa.com.pe/appmovil_test01/Relaciones/ninsert',
                    data: {
                        txtidnota: idNota,
                        txtidtarea: 1
                    },
                    async: false,
                    success: function (datos) {
                        var data = [];
                        data = JSON.parse(datos);
                        //ajax para descargar, guardar en servidor y para actualizar el url en server ausa
                        $.ajax({
                            type: "POST",
                            //url: "http://54.213.238.161/wsAusa/Notas/ReadNotaUrl",
                            url: "http://www.ausa.com.pe/appmovil_test01/Upload/UploadUrl",
                            data: {
                                id: idNota,
                                url: FileUri,
                                tipo: 1,
                                subPath: 1
                            },
                            async: false,
                            success: function (datos) {
                                kendo.ui.progress($("#listaAudios"), false);
                                if (parseInt(datos) == 0) {
                                    // $('#f03viewAudios').data('kendoListView').dataSource.read();
                                    // $('#f03viewAudios').data('kendoListView').refresh();
                                    notificationWidget.show("Se insertó correctamente la nota: " + idNota, "success");

                                    /*Para borrar del backend service
                                    var el = new Everlive('9offhmwuw3dhu6vd');
                                    var data = el.data('Archivos');
                                    data.destroySingle({
                                            Id: idAudioBackend
                                        },
                                        function () {
                                            //notificationWidget.show("Eliminado correctamente del backend service", "success");
                                        },
                                        function (error) {
                                            notificationWidget.show(JSON.stringify(error), "error");
                                        });*/

                                } else {
                                    notificationWidget.show("No se descargó el archivo del backend service", "danger");
                                };
                            },
                            error: function () {
                                kendo.ui.progress($("#listaAudios"), true);
                                notificationWidget.show("El servicio no está disponible", "danger");
                                valido = false;
                            }
                        });
                    },
                    error: function () {
                        notificationWidget.show("No se puede establecer la conexión al servicio", "danger");
                        valido = false;
                    }
                });
                $('#f03viewAudios').data('kendoListView').dataSource.read();
                $('#f03viewAudios').data('kendoListView').refresh();
            }
        },
        error: function () {
            notificationWidget.show("No se puede establecer la conexión al servicio", "danger");
        }
    });

    accion == "ndelete" && $.ajax({
        type: "POST",
        url: 'http://www.ausa.com.pe/appmovil_test01/Relaciones/ndelete',
        data: {
            txtnota: idAudio,
            txttarea: 1
        },
        async: false,
        success: function (datos) {
            var data = [];
            data = JSON.parse(datos);
            if (parseInt(data[0].Ejecucion) == 0) {
                notificationWidget.show("Se eliminó la nota " + idAudio + " de tarea", "success");
                $('#f03viewAudios').data('kendoListView').dataSource.read();
                $('#f03viewAudios').data('kendoListView').refresh();

            } else {
                notificationWidget.show("No se eliminó la nota correctamente", "danger");
            }
			$('#dialog').data('kendoWindow').close();
        },
        error: function () {
            notificationWidget.show("No se puede establecer la conexión al servicio", "danger");
            valido = false;
        }
    });
}