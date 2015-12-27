var AardwolfHelper = {

    init: function() {
        $.validator.addMethod("aardwolfName", function(value, element) {
            return this.optional(element) || /^[a-z0-9\-]+$/i.test(value);
        }, "Only letters, numbers, or dashes.");

        $("#view-folder").change(function() {
            Aardwolf.helper.updateJournal();
        });

        $("#error-msgbox").dialog({
            autoOpen: false,
            modal: true,
            width: 400,
            buttons: {
                Ok: function() {
                    $(this).dialog("close");
                }
            }
        });

        // Super helpful method to serialize form data!
        $.fn.serializeObject = function() {
           var o = {};
           var a = this.serializeArray();
           $.each(a, function() {
               if (o[this.name]) {
                   if (!o[this.name].push) {
                       o[this.name] = [o[this.name]];
                   }
                   o[this.name].push(this.value || '');
               } else {
                   o[this.name] = this.value || '';
               }
           });
           return o;
        };
    },
    
    refreshPageButtons: function() {
        var currentPage = parseInt($("#current-page").val());
        var maxPages = parseInt($("#num-pages").val());

        if (currentPage == 1) {
            $("#prev-page-button").button("disable");
        } else if (currentPage > 1 && currentPage != maxPages) {
            $("#prev-page-button").button("enable");
        }
        if (currentPage == maxPages) {
            $("#next-page-button").button("disable");
        } else if (currentPage < maxPages && currentPage != maxPages) { 
            $("#next-page-button").button("enable");
        }
    },

    logJournal: function(){ 
        $.ajax({
            url: "/journal/log/" + Aardwolf.journal.id,
            method: "PUT",
            data: {"journal":Aardwolf.journal},
        });
    },

    updatePhotos: function(){ 
        $("#current-page").val(Aardwolf.journal.page);
        $("#current-page-index").val(Aardwolf.journal.page_index);
        $("#photospp").val(Aardwolf.journal.page_size);

        var pageIndex = Aardwolf.journal.page_index;
        var page = parseInt($("#current-page").val());
        var photospp = parseInt($("#photospp").val());

        var photoData = {};
        if ($("#view-camera option:selected").val()) {
            photoData.camera_id = $("#view-camera option:selected").val();
            if ($("#view-folder option:selected").val()) {
                photoData.folder_id = $("#view-folder option:selected").val();
            }
        }
        if ($("#tag-search").val()) { 
            photoData.tag = $("#tag-search").val();
        }
    
        $.ajax({
            url: "/photo/count",
            method: "GET",
            data: photoData,
            success: function(data) { 
                if (data.num_photos == 0) {
                    $("#photo-landing").show();
                    $("#photo-control").hide();
                    $("#exif-view").hide();
                    $("#tags-select").hide();
                    Aardwolf.gallery.load([{image:"/images/dummy.png"}]);
                    return;
                } else {
                    $("#photo-landing").hide();
                    $("#tags-select").show();
                    $("#photo-control").show();
                    $("#exif-view").show();
                }
                $("#num-photos").val(data.num_photos);
                $("#num-photos").trigger("change");

                var start = (page * photospp) - photospp;
                if (start < 0) start = 0;
                Aardwolf.helper.refreshPageButtons();
                $.ajax({
                    url: "/photo/list/" + start + "/" + photospp, 
                    method: "GET",
                    data: photoData,
                    success: function(data) { 
                        if (Aardwolf.journal.page_index != 0) { 
                            Galleria.configure({show:Aardwolf.journal.page_index});
                        }
                        Galleria.configure({dummy: "/images/dummy.png"});
                        Aardwolf.gallery.load(data.data);
                    }
                });
            }
        });
    },

    updateJournal: function(){
        var searchData = {};
        searchData.camera_id = $("#view-camera").val();
        searchData.folder_id = $("#view-folder").val();
        if ($("#tag-search").val() != "") searchData.tag = $("#tag-search").val();
        $.ajax({
            url: "/journal/search",
            method: "GET",
            data: searchData,
            success: function(journalObj) { 
                if ($.isEmptyObject(journalObj)) {
                    var newJournal = {};
                    newJournal.page_size    = parseInt($("#photospp").val());
                    newJournal.page         = 1;
                    newJournal.page_index   = 0;
                    newJournal.tag          = $("#tag-search").val();
                    newJournal.camera_id    = searchData.camera_id;
                    newJournal.folder_id    = searchData.folder_id;
                    $.ajax({
                        url: "/journal/add",
                        method: "POST",
                        data:newJournal,
                        success: function(data) { 
                            var id = data.id;
                            $.ajax({
                                url: "/journal/fetch/" + id,
                                method: "GET",
                                success: function(data) { 
                                    Aardwolf.journal = data;
                                    Aardwolf.helper.updatePhotos();
                                }
                            });
                        }
    
                    });
                } else {
                    Aardwolf.journal = journalObj;
                    Aardwolf.helper.updatePhotos();
                }
            }
        });
    },

    viewFolderRefresh: function(){ 
        var selectedFolder = $("#view-folder option:selected").val();
        $("#view-folder").empty();
        if (selectedFolder == "") { 
            $("#view-folder").append("<option value=\"0\" selected>All Folders</option>");
        } else { 
            $("#view-folder").append("<option value=\"0\">All Folders</option>");
        }
        var cameraID = $("#view-camera option:selected").val();
        if (cameraID == "") { 
            $("#view-folder").prop("disabled", true);
            return;
        }
        $("#view-folder").prop("disabled", false);
        $.ajax({
            url: "/folder/list/" + cameraID,
            success: function(data) { 
                $.each(data.data, function(k, v) { 
                    var selected = (v.id == selectedFolder) ? " selected " : "";
                    $("#view-folder").append("<option value=\"" + v.id + "\"" + selected + ">" + v.name + "</option>");
                });
                if (Aardwolf.journal.folder_id != 0) { 
                    var folder = $("#view-folder option[value=\""+Aardwolf.journal.folder_id+"\"]");
                    folder.attr("selected", "selected");
                } 
                $("#view-folder").trigger("change");
            }
        });
    }

};
