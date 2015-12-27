var AardwolfTags = {
    
    groupsTable:    null,

    tagsTable:      null,

    init: function() {
        this.initGroupsConf();
        this.initTagsConf();
        
        $("#tag-groups-select").change(this.inputRefresh);

        $("#tag").validate({
            invalidHandler: function(event, validator) {
                $("#error-msgbox").html("Tag name and shortcut must be unique within a group.");
                $("#error-msgbox").dialog("open");
            }
        });

        $("#tag-input").scroll();
    }, 

    initGroupsConf: function() { 
        var self = this;
        $("#tag-group-window").dialog({
            autoOpen: false,
            title: "Add/Edit Tag Group",
            modal: true,
            width: 450,
            buttons: [
                { 
                    text: "Close",
                    click: function() { 
                        $(this).dialog("close");
                    }
                }
            ]
        });
        
        $("#edit-tag-group-button").button().click(function(){
            $("#tag-group-window").dialog("open");
        });
        
        self.groupsTable = $("#tag-groups").DataTable({
            ajax: "/tag/groups/list", 
            columns: [ { data: "name" } ]
        });
        
        $("#add-tag-group-button").button().click(function(){
            if ($("#new-tag-group").val().length > 0 && /^[a-z0-9\-]+$/i.test($("#new-tag-group").val())) {
                $.ajax({
                    url: "/tag/groups/add",
                    method: "POST", 
                    data: {"$name":$("#new-tag-group").val()},
                    success: function() { 
                        $("#new-tag-group").val("");
                        self.groupsTable.ajax.reload();
                        $("#new-tag-button").button("enable");
                    }, 
                    error: function(jqXHR, err) { 
                        $("#new-tag-group").val("");
                        $("#error-msgbox").html("Failed to add tag group. Reason " + jqXHR.responseJSON.info);
                        $("#error-msgbox").dialog("open");
                    }
                });
            } else {
                $("#new-tag-group").val("");
                $("#error-msgbox").html("Tag group may not be empty and can only contain letters, numbers and dashes.");
                $("#error-msgbox").dialog("open");
            }
        });
        
        $("#remove-tag-group-button").button({
            disabled: true
        }).click(function(){
            $.ajax({
                url: "/tag/groups/remove", 
                method: "DELETE", 
                data: {"$name":$("#selected-tag-group").val()},
                success: function() {
                    self.groupsTable.ajax.reload();
                    $("#remove-tag-group-button").button("disable");
                }, 
                error: function(jqXHR, err) { 
                    $("#error-msgbox").html("Failed to remove tag group. Reason " + jqXHR.responseJSON.info);
                    $("#error-msgbox").dialog("open");
                }
            });
            
        });

        $("#tag-groups tbody").on( "click", "tr", function() {
            if ( $(this).hasClass("selected") ) {
                $(this).removeClass("selected");
                $("#remove-tag-group-button").button("disable");
            }
            else {
                self.groupsTable.$("tr.selected").removeClass("selected");
                $(this).addClass("selected");
                $("#remove-tag-group-button").button("enable");
                $("#selected-tag-group").val(self.groupsTable.row(this).data().name);
            }
        });
    },

    initTagsConf: function() { 
        var self = this;
        self.tagsTable = $("#tags").DataTable({
            "ajax": "tag/list",
            "columns": [
                    { "data": "group_name" },
                    { "data": "name" },
                    { "data": "value_type" },
                    { "data": "shortcut" },
                    { "data": "xmp_name" },
                    { "data": "created_on" }
                ],
            select: true
        });
        
        $("#tag-window").dialog({
            autoOpen: false,
            modal: true,
            width: 450,
            title: "Add/Edit Tags",
            buttons: [
                {
                    text: "Add",
                    id: "tag-dialog-add-button",
                    click: function() { 
                        if (!$("#tag").valid()) {
                            return;
                        }
                        var tagData = $("form.tag").serializeObject();
                        var dialog = $(this);
                        $.ajax({
                            url: "/tag/add", 
                            method: "POST",
                            data: tagData,
                            success: function() {
                                self.tagsTable.ajax.reload();
                                dialog.dialog("close");
                            },
                            error: function(jqXHR, err) { 
                                $("#error-msgbox").html("Failed to add tag. Reason " + jqXHR.responseJSON.info);
                                $("#error-msgbox").dialog("open");
                            }
                        });
                    }
                },
                {
                    text: "Edit",
                    id: "tag-dialog-edit-button",
                    click: function() { 
                        var tagData = $("form.tag").serializeObject();
                        delete tagData["$xmp_name"];
                        var dialog = $(this);
                        $.ajax({
                            url: "/tag/edit", 
                            method: "PUT",
                            data: tagData,
                            success: function() {
                                self.tagsTable.ajax.reload();
                                dialog.dialog("close");
                            },
                            error: function(jqXHR, err) { 
                                $("#error-msgbox").html("Failed to edit tag. Reason " + jqXHR.responseJSON.info);
                                $("#error-msgbox").dialog("open");
                            }
                        });
                    }
                },
                {
                    text: "Remove",
                    id: "tag-dialog-remove-button",
                    click: function() { 
                        var tagData = $("form.tag").serializeObject();
                        delete tagData["$value_type"];
                        delete tagData["$shortcut"];
                        delete tagData["$xmp_name"];
                        var dialog = $(this);
                        $.ajax({
                            url: "/tag/remove", 
                            method: "DELETE", 
                            data: tagData,
                            success: function() { 
                                self.tagsTable.ajax.reload();
                                dialog.dialog("close");
                            }, 
                            error: function(jqXHR, err) { 
                                $("#error-msgbox").html("Failed to remove tag. Reason " + jqXHR.responseJSON.info);
                                $("#error-msgbox").dialog("open");
                            }
                        });
                    }
                },
                {
                    text: "Close",
                    click: function() {
                        $(this).dialog("close");
                    }
                }
            ]
        
        });
        
        $("#new-tag-button").button({
            disabled: true
        }).click(function(){
            $("#tag-name").val("");
            $("#tag-name").removeAttr("readonly");
            $("#tag-shortcut").val("");
            $("#tag-xmp-name").val("");
            
            $("#tag-group-name").empty();
            $.ajax({
                    type: "GET",
                    url: "/tag/groups/list",
                    success: function(data){
                        $.each(data.data, function(k, v) {
                            $("#tag-group-name").append("<option value=\"" + v.name + "\">" + v.name + "</option>");
                        });
                    }
                });
            $("#tag-value-type").empty();
            $.ajax({
                    type: "GET",
                    url: "/tag/values/list",
                    success: function(data){
                        $.each(data.data, function(k, v) {
                            $("#tag-value-type").append("<option value=\"" + v.name + "\">" + v.name + "</option>");
                        });
                    }
                });
            $("#tag-dialog-add-button").button("enable");
            $("#tag-dialog-edit-button").button("disable");
            $("#tag-dialog-remove-button").button("disable");
            $("#tag-window").dialog("open");
        });
        
        $("#edit-tag-button").button({
            disabled: true
        }).click(function(){
            $("#tag-dialog-add-button").button("disable");
            $("#tag-dialog-edit-button").button("enable");
            $("#tag-dialog-remove-button").button("enable");
            $("#tag-window").dialog("open");
        });
        
        $("#tag-name").on("input propertychange paste", function() {
            $("#tag-xmp-name").val($("#tag-group-name").val() + "_" + $("#tag-name").val());
        });
        $("#tag-group-name").on("input propertychange", function() { 
            $("#tag-xmp-name").val($("#tag-group-name").val() + "_" + $("#tag-name").val());
        });
        
        $("#tags tbody").on( "click", "tr", function () {
                if ($(this).hasClass("selected")) {
                    $(this).removeClass("selected");
                    $("#edit-tag-button").button("disable");
                }
                else {
                    camerasTable.$("tr.selected").removeClass("selected");
                    $(this).addClass("selected");
                    $("#edit-tag-button").button("enable");
                    var row = self.tagsTable.row(this).data();
                    $("#tag-name").val(row.name);
                    $("#tag-name").attr("readonly", "true");
                    $("#tag-shortcut").val(row.shortcut);
                    $("#tag-xmp-name").val(row.xmp_name);
                    $("#tag-group-name").empty();
                    $("#tag-group-name").append("<option value=\"" + row.group_name + "\">" + row.group_name + "</option>");
                    $("#tag-value-type").empty();
                    $.ajax({
                        type: "GET",
                        url: "/tag/values/list",
                        success: function(data){
                            $.each(data.data, function(k, v) {
                                $("#tag-value-type").append("<option value=\"" + v.name + "\" " + ((v.name == row.value_type) ? 
                                        "selected" : "") + ">" + v.name + "</option>");
                            });
                        }
                    });
                }
            } );


    },

    clear: function() {
        $("#tag-input").find("input").val("").removeAttr("checked").removeAttr("selected").removeAttr("tag_id");
    },

    populate: function() { 
        if (Aardwolf.gallery == null) { 
            return;
        }
        var imgData = Aardwolf.gallery.getData();
        $.ajax({
            url: "/photo/" + imgData.photo_id + "/tag/list",
            method: "GET",
            success: function(data) { 
                $.each(data.data, function(k, v) { 
                    var input = $("input[group_name=\""+v.group_name+"\"][name=\""+v.name+"\"]");
                    switch ($(input).attr("value_type")) { 
                        case "Checkbox":
                            if (v.value == 1) {
                                $(input).attr("tag_id", v.id);
                                $(input).prop("checked", true);
                            }
                            break;
                        case "Text":
                        case "Numeric":
                        case "Textbox":
                                $(input).attr("tag_id", v.id);
                                $(input).val(v.value);
                            break;
                    }
                });
            }
        });
    },

    refreshGroups: function() { 
        var self = this;
        $.ajax({
            type: "GET",
            url: "/tag/groups/list",
            success: function(data) { 
                if (data.data.length > 0) { 
                    $("#tags-landing").hide();
                    $("#tags-select").show();
                } else {
                    $("#tags-landing").show();
                    $("#tags-select").hide();
                }
                var currentTagGroup = $("#tag-groups-select").val();
                $("#tag-groups-select").empty();
                $.each(data.data, function(k, v) {
                    var option = "<option value=\"" + v.name + "\" " + ((v.name == currentTagGroup) ?  "selected" : "") + ">" + v.name + "</option>";
                    $("#tag-groups-select").append(option);
                });
                self.inputRefresh();
            }
        });
    },

    inputRefresh: function() { 
        var self = this;
        $("#tag-input").empty();
        var currentTagGroup = $("#tag-groups-select").val();
        $.ajax({
            type: "GET",
            url: "/tag/list/" + currentTagGroup,
            success: function(data) { 
                var count = 0;
                $.each(data.data, function(k, v) {
                    count++;
                    var attrList = [];
                    $.each(v, function(k, v) { 
                        attrList.push(k + "=\"" + v + "\"");
                    });
                    var elem_id = "input_" + count;
                    switch (v.value_type) { 
                        case "Checkbox": 
                            $("#tag-input").append("<input class=\"tag-inputs\" type=\"checkbox\" " + attrList.join(" ") + " value= \"" + v.name + "\" id=\"" + elem_id + "\">");
                            $("#tag-input").append("<label for=\"" + elem_id + "\">" + v.name + ((v.shortcut != "") ? (" (<u>" + v.shortcut + "</u>)") : "" ) + "</label><br/>");
                            break;
                        case "Text": 
                        case "Numeric": 
                            $("#tag-input").append("<label for=\"" + elem_id + "\">" + v.name + ((v.shortcut != "") ? (" (<u>" + v.shortcut + "</u>)") : "" ) + ": </label>");
                            $("#tag-input").append("<input class=\"tag-inputs\" type=\"text\" " + attrList.join(" ") + " value= \"\" id=\"" + elem_id + "\"><br>");
                            break;
                        case "Textbox": 
                            $("#tag-input").append("<label for=\"" + elem_id + "\">" + v.name + ((v.shortcut != "") ? (" (<u>" + v.shortcut + "</u>)") : "" ) + ": </label>");
                            $("#tag-input").append("<textarea " + attrList.join(" ") + " class=\"tag-inputs\" value= \"\" id=\"" + elem_id + "\"></textarea><br>");
                            break;
                    }
                });
                $(".tag-inputs").on("input", function(){
                    self.update($(this), null);
                });
                $(".tag-inputs").on("click", function(){
                    self.update($(this), null);
                });
                self.populate();
            }
        });
    },

    update: function (input, e) { 
        var self = this;

        if (Aardwolf.gallery == null) { 
            return;
        }
    
        var imgData     = Aardwolf.gallery.getData();
        var photoID     = imgData.photo_id;
        var groupName   = $(input).attr("group_name");
        var tagName     = $(input).attr("name");
    
        switch($(input).attr("value_type")) { 
            case "Checkbox":
                if (e) {
                    // From keyboard shortcut. Hence, toggle
                    $(input).prop("checked", !input.prop("checked"));
                }
                if ($(input).is(":checked")) { 
                    // Add tag
                    $.ajax({
                        url: "/photo/" + photoID + "/tag/upsert/",
                        method: "POST",
                        data: {"group":groupName, "tag":tagName, "value":1},
                        success: function(data) { 
                            $(input).attr("tag_id", data.id);
                        }, 
                        error: function(jqXHR, err) { 
                            $(input).prop("checked", false);
                            $("#error-msgbox").html("Failed to add tag! Please see server logs for details.");
                            $("#error-msgbox").dialog("open");
                        }
                    });
                } else {
                    // Remove tag
                    var tagID = $(input).attr("tag_id");
                    if (tagID != null) { 
                        $.ajax({
                            url: "/photo/" + photoID + "/tag/remove/" + tagID,
                            method: "DELETE",
                            success: function() {
                                $(input).removeAttr("tag_id");
                            }, 
                            error: function(jqXHR, err) { 
                                $(input).prop("checked", true);
                                $("#error-msgbox").html("Failed to remove tag! Please see server logs for details.");
                                $("#error-msgbox").dialog("open");
                            }
                        });
                    }
                }
                break;
            case "Text":
            case "Numeric":
            case "Textbox":
                if (e) {
                    e.preventDefault();
                    $(input).focus();
                }
                var newVal  = $(input).val();
                var tagID   = $(input).attr("tag_id");
                if ($(input).val()) { 
                    var url     = "/photo/" + photoID + "/tag/upsert/";
                    if (tagID != null) { url += tagID; }
                    $.ajax({
                        "url": url,
                        method: "POST",
                        data: {"group":groupName, "tag":tagName, "value":$(input).val()},
                        success: function(data) { 
                            $(input).attr("tag_id", data.id);
                            $(input).val(data.value);
                        },
                        error: function(jqXHR, err) { 
                            $("#error-msgbox").html("Failed to add tag! Please see server logs for details.");
                            $("#error-msgbox").dialog("open");
                        }
                    });
                } else { 
                    var tagID   = $(input).attr("tag_id");
                    if (tagID != null) { 
                        $.ajax({
                            url: "/photo/" + photoID + "/tag/remove/" + tagID,
                            method: "DELETE",
                            success: function() { 
                                $(input).removeAttr("tag_id");
                                $(input).val("");
                            },
                            error: function(jqXHR, err) { 
                                $("#error-msgbox").html("Failed to remove tag! Please see server logs for details.");
                                $("#error-msgbox").dialog("open");
                            }
                        });
                    }
                }
                break;
        }
    },
};
