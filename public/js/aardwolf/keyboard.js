var AardwolfKeyboard = {
    init: function() { 
        $(document).keydown(this.handleArrowKeys);
        $(document).keypress(this.handleKeys);
    },

    handleArrowKeys: function(e) {
        if (Aardwolf.gallery == null) {
            return;
        }
        // Work with keys only when not focused on input/other elements
        if ($(":focus").length == 0) { 
            if (e.keyCode >= 37 && e.keyCode <= 40) { 
                // Handle arrows
                switch (e.keyCode) { 
                    case 37: // Left
                        if (Aardwolf.gallery.getIndex() == 0) { 
                            if (!$("#prev-page-button").is(":disabled")) { 
                                if ($("#auto-page").is(":checked")) {
                                    $("#prev-page-button").trigger("click");
                                }
                            }
                        } else {
                            Aardwolf.gallery.prev();
                        }
                        break;
                    case 38: // Up
                        break;
                    case 39: // Right
                        if (Aardwolf.gallery.getIndex() == (Aardwolf.gallery.getDataLength() - 1)) {
                            if (!$("#next-page-button").is(":disabled")) {
                                if ($("#auto-page").is(":checked")) {
                                    $("#next-page-button").trigger("click");
                                }
                            }
                        } else {
                            Aardwolf.gallery.next();
                        }
                        break;
                    case 40: // Down
                        break;
                }
                e.preventDefault();
            }
        }
    },
    
    handleKeys: function(e) {
        if ($(":focus").length == 0) { 
            var input = $("input[shortcut=\"" + String.fromCharCode(e.keyCode) + "\"]");
            if (input) {
                Aardwolf.tags.update(input, e);
            }
        }
    }
};
