var AardwolfDownload = {

    progressDialog: null,
    progressBar: null,
    paths: [],
    pathsLength: 0,
    completed: 0,

    init: function() { 
        var self = this;

        $("#download-icon").click(function(){
            if ($("#view-camera option").size() > 1) { 
                $("#download-window").dialog("open");
            } else {
                $("#error-msgbox").html("You need to have at least one camera in the project before attempting to download images.");
                $("#error-msgbox").dialog("open");
            }
        });

        $("#download-folders").scroll();

        self.progressDialog = $("#download-progress-dialog").dialog({
            autoOpen: false,
            width: 400,
            height: 200,
            modal: true
        });

        self.progressBar = $("#download-progress").progressbar({
            value: false,
            change: function() { 
                $("#download-progress-text").text("Completed: " +  self.progressBar.progressbar("value") + "%");
            },
            complete: function() { 
                self.progressDialog.dialog("option", "buttons", [{
                    text: "Close",
                    id: "download-progress-button",
                    click: function() { 
                        $(this).dialog("close"); 
                        $("#download-progress-button").button("disable"); 
                        $("#file-download-button").button("disable"); 
                        $("#download-src-folder").val(""); 
                    }
                }]);
                $(".ui-dialog button").last().focus();
            }
        });

        $("#download-src-folder").change(function(){
            if ($(this).val().length == 0) {
                $("#file-download-button").button("disable");
            } else {
                $("#file-download-button").button("enable");
            }
        });
    },

    downloadFiles: function(cameraName, folderName, cameraID, folderID) { 
        var self = this;
        if (self.paths.length == 0) {
            return;
        }
        var file = self.paths.shift();
        $.ajax({
            type: "POST",
            url: "/folder/add",
            data: {"file": file, "camera_name": cameraName, "camera_id": cameraID, "folder_name": folderName, "folder_id": folderID },
            success: function() { 
                self.completed++;
                var donePercentage = parseInt(self.completed / self.pathsLength * 100);
                self.progressBar.progressbar("value", donePercentage);
            },
            complete: function() { 
                self.downloadFiles(cameraName, folderName, cameraID, folderID);
            }
        });
    },

};


var downloadWindow = $("#download-window").dialog({
    autoOpen: false,
    title: "Download Images",
    modal: true,
    width: 800,
    height: 600,
    open: function() { 
        $.ajax({
            method: "GET", 
            url: "/camera/list",
            success: function(data) { 
                $("#download-camera").empty();
                $.each(data.data, function(key, value) { 
                    $("#download-camera").append("<option value=\"" + value.name + "\" camera_id=\"" + value.id + "\">" + value.name + "</option>");
                });
            }
        });
        $.getJSON("/drives", function(data) { 
            var drives = [];
            $.each(data, function(key, val) {
                if (val.mountpoint != undefined) {
                    drives.push("<option value=\"" + val.mountpoint + "\">" + val.description + "</option>");
                }
                $("#download-src-drive").html(drives.join(""));
            });
            $("#download-folders").fileTree({ root: "/", script: "/files" }, function(file) { /* double-click on file */ });
        });
    },
    buttons: [
        {
            id: "file-download-button",
            text: "Download",
            disabled: true,
            click: function() { 
                $.ajax({
                    type: "POST", 
                    url: "/files",
                    data: {"dir": $("#download-src-folder").val()},
                    success: function(fileData) { 
                        var cameraID = $("#download-camera option:selected").attr("camera_id");
                        var cameraName = $("#download-camera option:selected").attr("value");
                        $.ajax({
                            type: "POST",
                            url: "/folder/create",
                            data: {"camera_id":cameraID, "camera_name":cameraName},
                            success: function(folderData) {
                                var folderID = folderData.id;
                                var folderName = folderData.name;
                                Aardwolf.download.paths = [];
                                $.each(fileData, function(key, value) { 
                                    if (value.type == 2) { // only JPEG support for now (NOTE: look at fileBrowser.js in server side for types)
                                        Aardwolf.download.paths.push(value.path);
                                    }
                                });
                                Aardwolf.download.pathsLength= Aardwolf.download.paths.length;
                                $("#download-progress-dialog").dialog("open");
                                Aardwolf.download.completed = 0;
                                Aardwolf.download.progressDialog.dialog("option", "title", "Downloading " + Aardwolf.download.paths.length + " images...");
                                Aardwolf.download.downloadFiles(cameraName, folderName, cameraID, folderID);

                            }
                        });
                    }
                });
            }
        },
        {
            text: "Close",
            click: function() { 
                $(this).dialog("close");
                Aardwolf.helper.updatePhotos();
            }
        }
    ]
});
