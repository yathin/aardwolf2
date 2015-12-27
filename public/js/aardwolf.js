$(function(){
    
    Aardwolf = {
        gallery:    null,
        journal:    null,
        tags:       AardwolfTags,
        download:   AardwolfDownload,
        helper:     AardwolfHelper,
        cameras:    AardwolfCameras,
        search:     AardwolfSearch,
        settings:   AardwolfSettings,

        init: function() { 
            $(document).tooltip();
            AardwolfGallery.init();
            AardwolfKeyboard.init();
            AardwolfData.init();

            this.cameras.init();
            this.download.init();
            this.helper.init(); 
            this.search.init();
            this.search.refreshTags();
            this.settings.init();
            this.tags.init();
            this.tags.refreshGroups();
        }
    }

    Aardwolf.init();
});
