var AardwolfSearch = {

    init: function() { 
        $("#tag-search").on("change", function(){
            Aardwolf.helper.updateJournal();
        });
    }, 

    refreshTags: function() { 
        $.ajax({
            url: "/tag/names/list",
            success: function(data) { 
                $("#tag-search").empty();
                var options = [];
                options.push("<option value=\"\">Select a tag...</option>");
                $.each(data, function(k, v) {
                    options.push("<option value=\"" + v.value + "\">" + v.label + "</option>");
                });
                if (options.length > 0) {
                    $("#tag-search").prop("disabled", false);
                }
                $("#tag-search").append(options.join(" "));
            }
        });
    }
};
