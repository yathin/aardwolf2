$("#prev-page-button").button({
}).click(function(){
    var currentPage = parseInt($("#current-page").val());
    var maxPages    = parseInt($("#num-pages").val());
    var photospp    = parseInt($("#photospp").val());
    currentPage--;
    if (currentPage >= 1) {
        Aardwolf.journal.page_index = photospp-1;
        Galleria.configure({"show":photospp-1});
        $("#current-page-index").val(photospp-1);
        $("#current-page").val(currentPage);
        $("#current-page").trigger("change");
        $("#current-page-index").trigger("change");
    }
});

$("#next-page-button").button({
}).click(function(){
    var currentPage = parseInt($("#current-page").val());
    var maxPages    = parseInt($("#num-pages").val());
    currentPage++;
    if (currentPage <= maxPages) {
        Aardwolf.journal.page_index = 0;
        Galleria.configure({"show":0});
        $("#current-page-index").val(0);
        $("#current-page").val(currentPage);
        $("#current-page").trigger("change");
        $("#current-page-index").trigger("change");
    }
});

$("#current-page").change(function(){
    $("#current-page-index").val(0);
    $("#current-page-index").trigger("change");
    var page = parseInt($(this).val());
    var maxPages = parseInt($("#num-pages").val());
    if (page < 1) {
        $(this).val('1');
    } else if (page > maxPages) { 
        $(this).val(maxPages);
    }
    Aardwolf.journal.page = $(this).val();
    Aardwolf.helper.logJournal();
    Aardwolf.helper.updatePhotos();
});

$("#num-photos").change(function(){
    var pages = Math.ceil(parseInt($("#num-photos").val()) / parseInt($("#photospp").val()));
    $("#num-pages").val(pages);
    /*
    if (pages == Aardwolf.journal.page) { 
        $("#next-page-button").button("disable");
    }
    */
});


$("#current-page-index").change(function(){
    if (Aardwolf.journal == null) return;
    Aardwolf.journal.page_index = $("#current-page-index").val();
    Aardwolf.helper.logJournal();
});

$("#photospp").change(function(){
    if (Aardwolf.journal == null) return;
    Aardwolf.journal.page_size = $("#photospp").val();
    Aardwolf.helper.logJournal();
    Aardwolf.helper.updatePhotos();
});
