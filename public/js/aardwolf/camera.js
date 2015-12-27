var AardwolfCameras = {
    table: null,

    init: function() { 
        this.table = $("#cameras").DataTable({
            "ajax": "camera/list",
            "columns": [
                    { "data": "id" },
                    { "data": "name" },
                    { "data": "desc_name" },
                    { "data": "latitude" },
                    { "data": "longitude" },
                    { "data": "altitude" },
                    { "data": "orientation" },
                    { "data": "info" },
                    { "data": "created_on" }
                ],
            select: true
        });

        $("#view-camera").change(function() { 
            Aardwolf.helper.viewFolderRefresh();
        });
        
        $("#add-camera-button").button().click(function(){
            $("#camera-id").val(0);
            $("#camera-name").val("");
            $("#camera-desc-name").val("");
            $("#camera-lat").val("");
            $("#camera-lon").val("");
            $("#camera-or").val("");
            $("#camera-alt").val("");
            $("#camera-info").val("");
            $("#camera-dialog-add-button").button("enable");
            $("#camera-dialog-edit-button").button("disable");
            $("#edit-camera-button").button("disable");
            $("#add-camera").dialog("open");
        });
        
        $("#edit-camera-button").button({
            disabled: true
        }).click(function(){
            $("#camera-dialog-add-button").button("disable");
            $("#camera-dialog-edit-button").button("enable");
            $("#edit-camera-button").button("disable");
            $("#add-camera").dialog("open");
        });
        
        $("#camera-form").validate({
            invalidHandler: function(event, validator) {
                $("#error-msgbox").html("Camera must have a unique and non-empty name.");
                $("#error-msgbox").dialog("open");
            }
        });
        
        $("#add-camera").dialog({
            autoOpen: false,
            title: "Add/Edit Camera",
            modal: true,
            width: 450,
            open: function() { 
            },
            buttons: [
                {
                    text: "Add",
                    id: "camera-dialog-add-button",
                    click: function() { 
                        if (!$("#camera-form").valid()) {
                            return;
                        }
                        var cameraData = $("form.camera").serializeObject();
                        var dialog = $(this);
                        delete cameraData["$id"];
                        $.ajax({
                            url: "/camera/add", 
                            method: "POST",
                            data: cameraData,
                            success: function() {
                                Aardwolf.cameras.table.ajax.reload();
                                Aardwolf.cameras.viewCameraRefresh();
                                dialog.dialog("close");
                            },
                            error: function(jqXHR, err) { 
                                $("#error-msgbox").html("Failed to add camera. Reason " + jqXHR.responseJSON.info);
                                $("#error-msgbox").dialog("open");
                            }
                        });
                    },
                    type: "submit"
                },
                {
                    text: "Edit",
                    id: "camera-dialog-edit-button",
                    click: function() { 
                        var cameraData = $("form.camera").serializeObject();
                        var dialog = $(this);
                        $.ajax({
                            url: "/camera/edit", 
                            method: "PUT", 
                            data: cameraData,
                            success: function() { 
                                Aardwolf.cameras.table.ajax.reload();
                                Aardwolf.cameras.viewCameraRefresh();
                                dialog.dialog("close");
                            },
                            error: function(jqXHR, err) {
                                $("#error-msgbox").html("Failed to edit camera. Reason " + jqXHR.responseJSON.info);
                                $("#error-msgbox").dialog("open");
                            }
                        });
                    },
                    type: "submit"
                },
                {
                    text: "Close",
                    click: function() {
                        $(this).dialog("close");
                    }
                }
            ]
        });
        
        $("#cameras tbody").on("click", "tr", function(){
                if ($(this).hasClass("selected")) {
                    $(this).removeClass("selected");
                    $("#edit-camera-button").button("disable");
                } else {
                    Aardwolf.cameras.table.$("tr.selected").removeClass("selected");
                    $(this).addClass("selected");
                    $("#edit-camera-button").button("enable");
                    var row = Aardwolf.cameras.table.row(this).data();
                    $("#camera-id").val(row.id);
                    $("#camera-name").val(row.name);
                    $("#camera-desc-name").val(row.desc_name);
                    $("#camera-lat").val(row.latitude);
                    $("#camera-lon").val(row.longitude);
                    $("#camera-or").val(row.orientation);
                    $("#camera-alt").val(row.altitude);
                    $("#camera-info").val(row.info);
                }
        });

        this.viewCameraRefresh();
    },

    viewCameraRefresh: function(){ 
        var selectedCamera = $("#view-camera option:selected").val();
        $("#view-camera").empty();
        if (selectedCamera == "") { 
            $("#view-camera").append("<option value=\"0\" selected>All Cameras</option>");
        } else { 
            $("#view-camera").append("<option value=\"0\">All Cameras</option>");
        }
        $.ajax({
            url: "/camera/list", 
            success: function(data) { 
                if (data.data.length > 0) {
                    $("#landing-help").hide();
                } else { 
                    $("#landing-help").show();
                }
                $.each(data.data, function(k, v) { 
                    var selected = (v.id == selectedCamera) ? " selected " : "";
                    $("#view-camera").append("<option value='" + v.id + "'" + selected + ">" + v.name + "</option>");
                });
            }
        });
        $("#view-camera").prop("disabled", false);
    }
};
