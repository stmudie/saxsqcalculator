// -----------------------------------------------------------------------
// eros@recoding.it
// showcase 1.0
//
// 27/07/2009 - Added asynchronous loading of images
// 26/06/2009 - some new implementations
// 19/06/2009 - standardization
// 08/06/2009 - Initial sketch
//
// requires jQuery 1.3.x
//------------------------------------------------------------------------
(function($) {
    $.fn.showcase = function (options) {
        var $container = this;

        // Retrieve options
        var opt;
        opt = $.extend({}, $.fn.showcase.defaults, options);
        if (options && options.animation) {  
            opt.animation = $.extend({}, $.fn.showcase.defaults.animation, options.animation); 
            if (!/horizontal-slider|vertical-slider|fade/.test(opt.animation.type)) 
            {
                opt.animation.type = "horizontal-slider";
            }
        }
        if (options && options.navigator) { 
            opt.navigator = $.extend({}, $.fn.showcase.defaults.navigator, options.navigator); 
            
            if (!/top-left|top-right|bottom-left|bottom-right/.test(opt.navigator.position)) 
            {
                opt.navigator.position = "top-right";
            }
            
            if (!/horizontal|vertical/.test(opt.navigator.orientation)) 
            { 
                opt.navigator.position = "horizontal";
            }
            
            if (options.navigator.item) { opt.navigator.item = $.extend({}, $.fn.showcase.defaults.navigator.item, options.navigator.item);  }
        }
        if (options && options.titleBar) { 
            opt.titleBar = $.extend({}, $.fn.showcase.defaults.titleBar, options.titleBar); 
            if (options.titleBar.css) { opt.titleBar.css = $.extend({}, $.fn.showcase.defaults.titleBar.css, options.titleBar.css);  }
        }
        
        // Check loading mode.
        // If there's something in opt.images[], I'll load them asynchronously, 
        // it will be nice to have opt.width and opt.height setted, in order to define the $container sizes
        if (opt.images.length != 0) {
            $container.css({ width: opt.width, height: opt.height, overflow: "hidden" });
            for (var i in opt.images) {
                var img = new Image();
                img.src = opt.images[i].url;
                img.alt = opt.images[i].description || "";
                var $link = $("<a />").attr("href", opt.images[i].link || "#");
                $link.append(img);
                $container.append($link);
            }
        }
        
        // Check loading state of #1 image
        if ($container.find("img:first")[0].complete) {
            $.fn.showcase.start($container, opt);
        }
        else {
            $container.find("img:first").load( function() {
                $.fn.showcase.start($container, opt);
            });
        }
    }
    
    $.fn.showcase.start = function($container, opt) {
        // Define local vars
        var index = 0;                             
        var nImages = $container.find("img").length;
        var $fi = $container.find("img:first");
        var imagesize = { width: $fi.removeAttr("width").width(), height: $fi.removeAttr("height").height() };

        $container.css({ position: "relative", 
                         overflow: "hidden",
                         width: imagesize.width,
                         height: imagesize.height,
                         border: opt.border })
            .find("a").css({ position: "absolute", top: "0", left: "0" })
                .find("img").css("border", "0px");
    
        var $slider = $("<div id='slider' />").css({ position:"absolute" });
        var $divNavigator = $("<div id='navigator' />").css({
            position: "absolute", 
            "z-index": 1000,
            border: opt.navigator.border,
            padding: opt.navigator.padding
        });
        
        switch (opt.navigator.position)
        {
            case "top-left": $divNavigator.css({ top: "5px", left: "5px" });
                break;
            case "top-right": $divNavigator.css({ top: "5px", right: "5px" });
                break;
            case "bottom-left": $divNavigator.css({ bottom: "5px", left: "5px" });
                break;
            case "bottom-right": $divNavigator.css({ bottom: "5px", right: "5px" });
                break;
        }
        
        $container.find("a").wrapAll($slider).each( function(i) {
            switch (opt.animation.type)
            { 
                case "horizontal-slider":
                    $(this).css("left", i*imagesize.width);
                    break;
                case "vertical-slider":
                    $(this).css("top", i*imagesize.height);
                    break;
                case "fade":
                    $(this).css({ top: "0", left: "0", opacity:1, "z-index": 1000-i });
                    break;
            }
            
            var $navElement = $("<a href='#'>" + (opt.navigator.showNumber ? (i + 1) : "") + "</a>")
                                .click( function() {
                                    $.fn.showcase.showImage(i, $container, imagesize, opt);
                                    index = i;
                                    return false;
                                }).appendTo($divNavigator);
            
            if (opt.navigator.item.cssClass) { $navElement.attr("class", opt.navigator.item.cssClass); }
            else {
                $.extend({}, $navElement.css, opt.navigator.item);
                $navElement.css({ 
                    display: "block",
                    color: opt.navigator.item.color,
                    "text-decoration": opt.navigator.item.textDecoration,
                    "-moz-outline-style": "none",
                    width: opt.navigator.item.width, 
                    height: opt.navigator.item.height, 
                    lineHeight: opt.navigator.item.lineHeight,
                    verticalAlign: opt.navigator.item.middle,
                    backgroundColor: opt.navigator.item.backgroundColor,
                    padding: opt.navigator.item.padding,
                    border: opt.navigator.item.border,
                    margin: opt.navigator.item.margin
                });
                if (opt.navigator.item.borderRounded) { $navElement.css({ "-moz-border-radius": "4px", "-webkit-border-radius": "4px" }); }
                switch (opt.navigator.orientation) 
                {
                    case "horizontal":
                        $navElement.css("float", "left");
                        break;
                    case "vertical":
                        $navElement.css("float", "none");
                        break;    
                }
            }
            
            if (opt.navigator.showMiniature) {
                $("<img />").attr({ src: $(this).find("img").attr("src"), width: $navElement.css("width").replace("px", ""), height: $navElement.css("height").replace("px", ""), border: "0px" }).appendTo($navElement);
            }
            
            if (i == 0) { $navElement.css("background-color", opt.navigator.item.selectedCssClass ? "" : opt.navigator.item.selectedBGColor).addClass(opt.navigator.item.selectedCssClass); }
        });
        
        if (opt.navigator.autoHide) {
            $divNavigator.css("opacity", 0);
        }
        
        $container.append($divNavigator).hover(
            function() { 
                if (opt.titleBar.autoHide) {
                    $($titleBar).stop().animate({ opacity: 0, left: 0, right: 0, height: "0px" }, 250);
                    if (opt.navigator.autoHide) { $($divNavigator).stop().animate({ opacity: 1 }, 250); }
                }
                
                $(this).data("isMouseHover", true);
            },
            function() { 
                if (opt.titleBar.autoHide) {
                    $titleBar.stop().animate({ opacity: 0, height: "0px" }, 400); 
                    if (opt.navigator.autoHide) { $divNavigator.stop().animate({ opacity: 0 }, 250); }
                }
                
                $(this).data("isMouseHover", false);
            }
        );
        
        var $titleBar = $("<div id='subBar' />")
                            .css({ 
                                "z-index": 1002,
                                position: "absolute",
                                bottom: "0px",
                                opacity: (opt.titleBar.autoHide ? 0 : opt.titleBar.css.opacity), 
                                "background-color": opt.titleBar.css.backgroundColor,
                                height: opt.titleBar.css.height,
                                width: "100%" })
                            .html($("<span />").text($container.find("a:first img").attr("alt")) 
                                    .css({ color: opt.titleBar.css.fontColor, 
                                           fontStyle: opt.titleBar.css.fontStyle, 
                                           fontSize: opt.titleBar.css.fontSize, 
                                           fontWeight: opt.titleBar.css.fontWeight,
                                           lineHeight: opt.titleBar.css.height,
                                           paddingLeft: "5px",
                                           "vertical-align": "middle" })
                            );
        if (opt.titleBar.cssClass) { $titleBar.attr("class", opt.titleBar.cssClass); }
        $titleBar.appendTo($container);
        
        if (opt.animation.autoCycle) {
            setInterval( function() { 
                if (!$container.data("isMouseHover") || !opt.animation.stopOnHover) 
                    $.fn.showcase.showImage(++index % nImages, $container, imagesize, opt); 
            }, opt.animation.interval);
        }
    }
    
    $.fn.showcase.showImage = function(i, $container, imagesize, opt) {
        var $a = $container.find("a");
        switch (opt.animation.type)
        { 
            case "horizontal-slider": $container.find("#slider").animate({ left: - (i*imagesize.width) }, opt.animation.speed, opt.animation.easefunction);
                break;
            case "vertical-slider": $container.find("#slider").animate({ top: - (i*imagesize.height) }, opt.animation.speed, opt.animation.easefunction);
                break;
            case "fade":
                $container.css({ "z-index": "1001" });
                if ($a.eq(i).css("z-index") != "1000") 
                {
                    $a.eq(i).css({ "z-index": "1000", opacity: 0 });
					
                    $a.not($container.find("a").eq(i)).each( function() {
						if ($(this).css("z-index") != "auto")
							$(this).css("z-index", parseInt($(this).css("z-index"), 10) - 1);
                    });
                    
                    $a.eq(i).animate({ opacity: 1 }, opt.animation.speed, opt.animation.easefunction);
                }
                break;
        }
		
        $container.find("#subBar span").text($a.eq(i).find("img").attr("alt"));
        $container.find("#navigator a").css("background-color", opt.navigator.item.cssClass ? "" : opt.navigator.item.backgroundColor).removeClass(opt.navigator.item.selectedCssClass)
            .eq(i).css("background-color", opt.navigator.item.selectedCssClass ? "" : opt.navigator.item.selectedBGColor).addClass(opt.navigator.item.selectedCssClass);
	};
    
    $.fn.showcase.defaults = {
        images: [],
        width: "",
        height: "",
        animation: { autoCycle: true,
                     stopOnHover: true,
                     interval: 4000,
                     speed: 500,
                     easefunction: "swing",
                     type: "horizontal-slider" },
		border: "solid 1px #dedede",
		navigator: { position: "top-right",
		             orientation: "horizontal",
		             autoHide: false,
		             showNumber: false,
		             showMiniature: false,
		             border: "none",
		             padding: "0px",
		             item: { cssClass: null,
		                     selectedCssClass: null,
		                     selectedBGColor: "#ffffff",
		                     color: "#000000",
		                     textDecoration: "none",
		                     width: "12px", 
		                     height: "12px", 
		                     lineHeight: "12px",
		                     verticalAlign: "middle",
		                     backgroundColor: "#cdcdcd",
		                     padding: "3px",
		                     margin: "0px 3px 0px 0px",
		                     border: "solid 1px #acacac",
		                     borderRounded: true }
		           },
		titleBar: { autoHide: true,
		            cssClass: null,
		            css: { opacity: 0,
		                   backgroundColor: "#ffffff",
		                   height: "48px",
		                   fontColor: "#444444",
		                   fontStyle: "italic",
		                   fontWeight: "bold",
		                   fontSize: "1em" } }
	};
	
})(jQuery);