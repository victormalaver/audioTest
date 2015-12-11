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
                $("#media").text(capturesMsg);

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
var mediaContent = null;
// function play button
function playAudio(ID) {
    //console.log("Play with the following parameters: idnota-> " + ID + " src-> " + document.getElementById("archivo" + ID).value);
    if ($.isNumeric(ID)) {
        var src = document.getElementById("archivo" + ID).value;
        alert("Link Ausa: " + src);
        console.log(src);
    } else {
        var src = ID;
        alert("Path Local: " + src);
    }
    if (isAudioPlaying) {
        mediaContent.stop();
    }
    mediaContent = new Media(src,
        function () {
            $("#divAccion").html('<i class="fa fa-circle-o-notch fa-spin"></i> Play: ' + ID);
            //console.log("Media success"); // the media has been finished , set the flag to false, or handle any UI changes. 
        },
        function () {
            $("#divAccion").html('<i class="fa fa-exclamation-triangle text-danger"></i> Error: ' + ID);
            //console.log("Media error");
        },
        function () {
            $("#divAccion").html('<i class="fa fa-refresh fa-spin"></i>');
            //console.log("Media change");
        });

    mediaContent.play();
    isAudioPlaying = true;
}

function pauseAudio(ID) {
    //alert("pause with the following parameters: idnota-> " + ID + " src-> " + document.getElementById("archivo" + ID).value);
    mediaContent.pause();
    $("#divAccion").html('<i class="fa fa-pause"></i> Pause: ' + ID);
}

function stopAudio(ID) {
    //alert("stop with the following parameters: idnota-> " + ID + " src-> " + document.getElementById("archivo" + ID).value);
    mediaContent.stop();
    $("#divAccion").html('<i class="fa fa-stop"></i> Stop: ' + ID);
}

function f03getAudios() {
    var dsAudios = new kendo.data.DataSource({
        transport: {
            read: {
                url: "http://www.ausa.com.pe/appmovil_test01/Relaciones/nlistar/",
                dataType: "json",
                type: "post",
                data: {
                    txtid: 1
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

    $("a[type='newAudio']").each(function (index) {
        var fileToUpload = $(this).attr("value"); //capturedFiles[0].fullPath;
        upload(fileToUpload);
        $(this).parent().remove();
    });
    $("#btnSendBS").attr("disabled", "disabled");
}

function upload(fileToUpload) {
    var fileToUpload = $("#media").text();
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
            alert(uploadedFileUri);
            var newArchive = {
                Name: "MyArchive",
                FileUri: uploadedFileUri,
                FileId: uploadedFileId
            };
            el.data("Archivos").create(newArchive, function (data) {
                alert("Created an archive with Id: " + data.result.Id);
                f03accionAudio("insert", uploadedFileUri, "");
            }, function (err) {
                alert("Cannot create an archive" + JSON.stringify(err));
            });
        },
        function (uploadError) {
            alert(JSON.stringify(uploadError));
        });
}

function f03newAudio(archivo) {
        $("#newAudio").append('<button type="button" class="list-group-item"><a class="btn btn-default btn-xs" type="newAudio" value="' + archivo + '" ><i class="fa fa-trash-o text-muted"></i></a> Nuevo Audio<span style="float:right"><a class="btn btn-info btn-xs" onclick="playAudio(' + archivo + ')"><i class="fa fa-play"></i></a>&nbsp<a class="btn btn-info btn-xs"><i class="fa fa-pause"></i></a>&nbsp<a class="btn btn-info btn-xs"><i class="fa fa-stop"></i></a></span></button>')
        $("#btnSendBS").removeAttr("disabled");
    }
    //Delete new audio
$(document).on("click", "a[type='newAudio']", function () {
    $(this).parent().remove();
});

function f03deleteAudio(idAudio) {
    $("#dialog").data("kendoWindow").center();
    $("#dialog").data("kendoWindow").open();
    $("#accionAudio").attr("onclick", "f03accionAudio('ndelete'," + "" + idAudio);
    console.log("Eliminar audio: " + idAudio);
}

function f03accionAudio(accion, FileUri, idAudio) {
    //Notificaciones
    var notificationElement = $("#notification");
    notificationElement.kendoNotification();
    var notificationWidget = notificationElement.data("kendoNotification");
    //End
    alert(FileUri);
    accion == "insert" && $.ajax({
        type: "POST",
        url: 'http://www.ausa.com.pe/appmovil_test01/Notas/insert',
        data: {
            txtruta: FileUri
        },
        async: false,
        success: function (datos) {
            alert("Se inserto en la tabla nota");
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
                        alert(idNota);
                        $.ajax({
                            type: "POST",
                            url: "http://54.213.238.161/wsAusa/Notas/ReadNotaUrl",
                            data: {
                                not_str_archivo: FileUri,
                                id: idNota
                            },
                            async: false,
                            success: function (datos) {
                                $('#f03viewAudios').data('kendoListView').dataSource.read();
                                $('#f03viewAudios').data('kendoListView').refresh();
                                notificationWidget.show("Se insertó correctamente la nota: "+idNota, "success");
                            },
                            error: function () {
                                notificationWidget.show("No se descargó", "danger");
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
            txtid: idAudio
        },
        async: false,
        success: function (datos) {
            var data = [];
            data = JSON.parse(datos);
            notificationWidget.show("Se eliminó la tarea", "success");
            $('#f03viewAudios').data('kendoListView').dataSource.read();
            $('#f03viewAudios').data('kendoListView').refresh();
        },
        error: function () {
            notificationWidget.show("No se puede establecer la conexión al servicio", "danger");
            valido = false;
        }
    });
}