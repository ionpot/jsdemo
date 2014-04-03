function Site() {
    var head = $('head'),
        body = $('body'),
        page = $('#page'),
        post = $('#post'),
        bg = $('#bg'),
        css = new inlineCSS(head),
        menu = ['Home', 'About', 'Skills', 'Game'],
        navi = new Navi(menu),
        cube = null,
        faceMap = {
            "home" : "top",
            "about" : "lft",
            "skills" : "frt",
            "game" : "bot"
        },
        pt = null,
        game = new Breakout(),
        header = null,
        banner = null,
        content = null,
        bannerDisabled = false;
            
    function initialize() {
        header = $('#header');
        banner = $('#banner');
        content = $('#content');

        navi.createIn($('#navi'), css);
        pt = new Painter(banner);
        banner.click(function() {
            pt.stop();
            bannerDisabled = true;
        });
        $.get('home.html', function(d) {
            content.html(d).slideDown(1000, cntVisible);
        });
    }

    function cntVisible(evt) {
        cube = new Cube($('#cube-cntr'), 20);
        navi.to('home');
    }

    function goTo(evt, name) {
        var id = 'content-' + name;
        cube.show(faceMap[name]);
        if (name === 'game') {
            if (!bannerDisabled) { pt.stop(); }
            game.start($('#game'));
        } else {
            game.stop();
            if (!bannerDisabled) { pt.drawSnowyNight(); }
        }
    }

    function postComplete(evt) {
        post.remove();
        bg.find('#bg_color').fadeIn(500, function() {
            bg.find('#bg_gradientOverlay').fadeIn(500, function() {
                console.log('faded in');
                page.addClass('opened').animationEnd(function(e, n) {
                    console.log('opened');
                    if (n == 'pageOpen') {
                        console.log('init');
                        initialize();
                        page.off(e.type);
                    }
                });
            });
        });
    }
    
    function vCenter(evt) {
        page.animate({"top" : Math.max(0, (wnd.height()-page.height())/2) + 'px'}, 200);
        return false;
    }
    
    this.begin = function() {
        $('#debug', body).hide();
        page.on({
            "resize" : vCenter,
            "postComplete" : postComplete,
            "goTo" : goTo
        });
        (new POST(post, page)).begin();
    };
}

$(function() { (new Site()).begin(); });
