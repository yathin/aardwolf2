var AardwolfData = {
    dataTable: null,
    init: function() {
        var self = this;
        $("#data-view").dialog({
            autoOpen: false,
            modal: true,
            width: 800,
            height: 600,
            open: function() { 
                $(this).on("resize", function() { 
                    if (self.dataTable != null) { 
                        self.dataTable.resize();
                    }
                });
                if (self.dataTable != null) { 
                    $("#data-view-table").dataTable().fnDestroy();
                }
                $.ajax({
                    url: "/data/view",
                    method: "GET",
                    success: function(data) { 
                        if (data.data.length < 1) {
                            return;
                        }
                        var keys = Object.keys(data.data[0]);
                        var colNames = [];
                        for (var i=0; i < keys.length; i++ ) {
                            var colData = {"title": keys[i], "data":keys[i]};
                            colNames.push(colData);
                        };
                        self.dataTable = $("#data-view-table").dataTable({
                            "columns": colNames,
                            "data": data.data
                        });
                    }
                });
            },
            buttons: [
                {
                    text: "Close",
                    click: function() { 
                        $(this).dialog("close");
                    }
                }
            ]
        });

        $("#dataview-icon").click(function(){
            $("#data-view").dialog("open");
        });
    }
};
