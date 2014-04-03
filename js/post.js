function POST(c, page) {
    var self = this,
        cntr = c,
        cnt = $('.content', cntr),
        cntW = 0,
        cntH = 0,
        popW = 90,
        popH = 26,
        list = $('.list', cntr),
        success = 'available!',
        error = 'not available!',
        feature = 0,
        features = [
            {
                "title" : "HTML5 canvas",
                "check" : function() { return true; } //supports.canvas; }
            },
            {
                "title" : "HTML5 canvas text",
                "check" : function() { return true; }//supports.canvasText; }
            },
            {
                "title" : "CSS3 transitions",
                "check" : function() { return true; }, //supports.transition; },
                "success" : function(r) {
                    r.html(success).css({"position":"relative", "top":"10px"})
                        .animate({"top":"0px"}, 100,
                            function() { list.trigger('next.POST'); });
                    return false;
                }
            },
            {
                "title" : "CSS3 animations",
                "check" : function() { return true; } //supports.animation; }
            },
            {
                "title" : "CSS3 round borders",
                "check" : function() { return true; }, //supports.borderRadius; },
                "success" : function(r) {
                    (cntr.add(list)).addClass('borders');
                    return true;
                }
            },
            {
                "title" : "CSS3 gradients",
                "check" : function() { return true; }, //supports.canvas; },
                "success" : function(r) {
                    cntr.addClass('gradient');
                    return true;
                }
            },
            {
                "title" : "CSS3 text shadows",
                "check" : function() { return true; }, //supports.textShadow; },
                "success" : function(r) {
                    $('.title', cntr).addClass('inset');
                    return true;
                }
            },
            {
                "title" : "SVG",
                "check" : function() { return true; } //supports.svg; }
            },
        ],
        allOK = true;
    
    function typewrite(elmt, str) {
        var append = elmt.hasClass('feature'),
            text = (append) ? (str + '... ').split('') : str.split(''),
            h = setInterval(function() {
                if (text.length == 0) {
                    clearInterval(h);
                    setTimeout(function() {
                        elmt.trigger('written.POST');
                    }, 300);
                } else {
                    elmt.append(text.shift());
                }
            }, 30);
    }
    
    function addItem() {
        return $('<p/>').addClass('item')
            .append($('<span/>').addClass('feature'))
            .append($('<span/>').addClass('result'))
            .appendTo(list);
    }
    
    function written(evt) {
        var elmt = $(this);
        if (elmt.hasClass('result')) {
            elmt.trigger('next.POST');
            return true;
        }
        var ftr = feature,
            result = elmt.siblings('.result'),
            ok = (ftr.check) ? ftr.check() : true;
        allOK &= ok;
        if (ok) {
            result.addClass('success');
            if (ftr.success) {
                if (!ftr.success(result)) return;
            }
            typewrite(result, success);
        } else {
            typewrite(result.addClass('error'), error);
        }
    }
    
    function depost() {
        cntr.addClass('depost')
            .animationEnd(function(e, n) {
                if (n == 'depost') {
                    cntr.hide().trigger('postComplete');
                }
            });
    }
    
    function popButton() {
        var btn = $('<a id="go" href="home">Proceed!</a>');
        cnt.append(btn);
        btnX = (cntW - btn.innerWidth()) / 2;
        btnY = (cntH - btn.innerHeight()) / 2 - 20;
        btn.css({"left" : btnX + 'px', "top" : btnY + 'px'})
            .addClass('pop')
            .on('click', function(evt) {
                evt.preventDefault();
                btn.addClass('shrink')
                    .animationEnd(function(evt, name) {
                        if (name == 'shrink') {
                            btn.hide().removeClass('pop');
                            depost();
                        }
                    });
            });
    }
    
    function end(evt) {
        if (allOK) {
            cntW = cnt.width();
            cntH = cnt.height();
            cnt.css({
                "width" : cntW,
                "height" : cntH
            });
            list.addClass('done').animationEnd(function(evt, name) {
                if (name == 'close') {
                    popButton();
                }
            });
        }
    }
    
    function next(evt) {
        if (features.length == 0) {
            list.trigger('end.POST');
            return true;
        }
        feature = features.shift();
        var item = addItem().show(100);
        typewrite(item.children('.feature'), feature.title);
        return true;
    }
    
    this.begin = function() {
        var pW = page.width(),
                cW = cntr.width();
        cntr.css('left', (pW - cW)/2 + 'px');
        list.on({
                "next.POST" : next,
                "end.POST" : end,
            })
            .on("written.POST", 'span', written)
            .trigger('next.POST');
    };
}
