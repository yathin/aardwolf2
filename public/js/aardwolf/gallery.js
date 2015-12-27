var AardwolfGallery = {
    exifTable: null, 

    init: function() {
        var self = this;
        self.exifTable = $("#exif-display").DataTable({
            columns: [
                { "data": "key", "title":"EXIF key" },
                { "data": "value", "title":"Value" }
            ],
            select: false,
            pageLength: 10
        });

        Galleria.loadTheme("js/galleria/themes/classic/galleria.classic.min.js");
        Galleria.run(".galleria");

        Galleria.ready(function(){
            Aardwolf.gallery = this;
            $.ajax({
                url: "/journal/search",
                method: "GET",
                success: function(data) { 
                    Aardwolf.journal = data;

                    if (Aardwolf.journal.tag != "") { 
                        var tag = $("#tag-search option[value=\""+Aardwolf.journal.tag+"\"]");
                        tag.attr("selected", "selected");
                    }
                    if (Aardwolf.journal.camera_id != 0) { 
                        var camera = $("#view-camera option[value=\""+Aardwolf.journal.camera_id+"\"]");
                        camera.attr("selected", "selected");
                        Aardwolf.helper.viewFolderRefresh();
                    } else { 
                        Aardwolf.helper.updatePhotos();
                    }
                    if (Aardwolf.journal.page != 1 && $("#prev-page-button").is(":disabled")) { 
                        $("#prev-page-button").button("enable");
                    } 
                }
            });
        }); 

        Galleria.on("loadfinish", function(e) {
            var imgData = Aardwolf.gallery.getData();
            if (imgData.original != undefined) { 
                $.ajax({
                    url: "/exif",
                    method: "GET", 
                    data: {"file": imgData.original},
                    success: function(data) { 
                        self.exifTable.clear();
                        self.exifTable.rows.add(data.data).draw();
                    }
                });
            }
            $("#current-page-index").val(Aardwolf.gallery.getIndex());
            $("#current-page-index").trigger("change");
            
            // Clear & Populate Tags
            Aardwolf.tags.clear();
            Aardwolf.tags.populate();

        });
    }
};
