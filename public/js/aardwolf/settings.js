var AardwolfSettings = {
    init: function() {
        $("#settings-tabs").tabs({
            event: "mouseover"
        });
        
        $("#settings").dialog({
            autoOpen: false,
            width: 800,
            height: 600,
            modal: true,
            open: function() { 
                if (Aardwolf.tags.groupsTable.data().count() > 0) { 
                    $("#new-tag-button").button("enable");
                }
            },
            close: function() { 
                Aardwolf.tags.refreshGroups(); 
                Aardwolf.search.refreshTags();
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
        
        $("#settings-icon").click(function(){
            $("#settings").dialog("open");
        });

        $("#about").dialog({
            autoOpen: false,
            width:300,
            buttons: [
                {
                    text: "Close",
                    click: function() {
                        $(this).dialog("close");
                    }
                }
            ]
        });

        $("#about-icon").click(function(){
            $("#about").dialog("open");
        });
    }
};
