function Painter(canvas) {
    var cvs = canvas.get(0),
        cvsW = cvs.width,
        cvsH = cvs.height,
        cxt = cvs.getContext('2d'),
        fading = 0,
        fadeVal = 1,
        fadeRate = 0.05,
        active = null,
        activeName = '',
        next = '',
        handle = null,
        data = {
            "snowy" : new SnowyNight(cvsW, cvsH),
            "game" : null
        };
    
    function render() {
        if (active) {
            cxt.globalAlpha = 1;
            active.process();
            active.render();
        }
        if (fading > 0) {
            cxt.globalAlpha = fadeVal;
            if (fading == 1) {
                fadeVal = Math.max(0, fadeVal - fadeRate);
                if (fadeVal == 0) {
                    fading = 0;
                }
            }
            else if (fading == 2) {
                fadeVal = Math.min(1, fadeVal + fadeRate);
                if (fadeVal == 1) {
                    fading = 0;
                    fadedOut();
                }
            }
            cxt.fillStyle = 'black';
            cxt.fillRect(0, 0, cvsW, cvsH);
        }
    }
    
    function start() {
        if (handle != null) return;
        handle = setInterval(render, 1000 / fps);
    }
    
    function stop() {
        if (handle == null) return;
        clearInterval(handle);
        handle = null;
    }
    
    function fadeIn() {
        fading = 1;
    }
    
    function fadeOut() {
        fading = 2;
    }
    
    function fadedOut() {
        if (active) {
            active.stop();
        }
        setActive(next);
        next = null;
    }
    
    function setActive(name) {
        activeName = name || '';
        active = data[name] || null;
        if (active) {
            active.start();
            fadeIn();
        } else {
            stop();
        }
    }
    
    function switchTo(name) {
        var n = name || '';
        if (activeName == n) return;
        if (!handle) start();
        if (active) {
            next = n;
            fadeOut();
        } else {
            setActive(n);
        }
    }
    
    data.snowy.bg = (function() {
        var g = cxt.createRadialGradient(cvsW / 2, -20, cvsW / 8, cvsW / 2, -10, cvsW);
        g.addColorStop(0, '#006');
        g.addColorStop(1, '#606');
        return g;
    })();
    
    data.snowy.house.wndColor = (function(h) {
        var x1 = h.wndRightX,
            y1 = h.wndTopY,
            r1 = h.windowW / 2,
            x2 = h.wndLeftX,
            y2 = h.wndBotY,
            r2 = h.windowH;
        g = cxt.createRadialGradient(x1, y1, r1, x2, y2, r2);
        g.addColorStop(0, '#FFA');
        g.addColorStop(1, '#FF6');
        return g;
    })(data.snowy.house);
    
    data.snowy.drawStar = function(s) {
        var gA = cxt.globalAlpha;
        cxt.globalAlpha = s.a;
        cxt.fillStyle = 'white';
        cxt.beginPath();
        cxt.moveTo(s.x + s.r, s.y);
        cxt.arc(s.x, s.y, s.r, 0, deg360);
        cxt.fill();
        cxt.globalAlpha = gA;
    };
    
    data.snowy.drawStars = (function(d) {
        var arr = d.stars;
        return function() {
            for (var i = 0, l = arr.length; i < l; ++i) {
                d.drawStar(arr[i]);
            }
        };
    })(data.snowy);
    
    data.snowy.drawCrescent = (function(c) {
        var x = c.x,
            y = c.y,
            r = c.r,
            ro = c.rotation;
        return function() {
            cxt.translate(x, y);
            cxt.rotate(ro);
            cxt.fillStyle = 'white';
            cxt.beginPath();
            cxt.moveTo(r, 0);
            cxt.arc(0, 0, r, 0, c.a, true);
            cxt.bezierCurveTo(c.x1, c.y1, c.x2, c.y2, r, 0);
            cxt.closePath();
            cxt.fill();
            cxt.rotate(-ro);
            cxt.translate(-x, -y);
        };
    })(data.snowy.crescent);
    
    data.snowy.drawFlake = function(f) {
        var r = f.size;
        cxt.beginPath();
        cxt.strokeStyle = 'white';
        cxt.translate(f.x, f.y);
        cxt.moveTo(0, 0);
        for (var a = 0; a < pi; a += deg45) {
            var from = a + f.a,
                to = from + pi;
            cxt.moveTo(r*cos(from), r*sin(from));
            cxt.lineTo(r*cos(to), r*sin(to));
        }
        cxt.stroke();
        cxt.translate(-f.x, -f.y);
    };
    
    data.snowy.drawFlakes = (function(d) {
        return function(a) {
            for (var i = a.length - 1; i > -1; --i) {
                d.drawFlake(a[i]);
            }
        };
    })(data.snowy);
    
    data.snowy.drawSmoke = function() {
        var d = data.snowy,
            puffs = d.puffs,
            count = puffs.length,
            gA = cxt.globalAlpha;
        if (count == 0) return;
        cxt.fillStyle = 'gray';
        cxt.beginPath();
        for (var i = 0; i < count; ++i) {
            var p = puffs[i];
            cxt.globalAlpha = p.a;
            cxt.moveTo(p.x + p.r, p.y);
            cxt.arc(p.x, p.y, p.r, 0, deg360);
            cxt.fill();
        }
        cxt.globalAlpha = gA;
    };
    
    data.snowy.drawGround = (function(g) {
        return function() {
            cxt.fillStyle = 'black';
            cxt.fillRect(0, g.y, cvsW, g.h);
        };
    })(data.snowy.ground);
    
    data.snowy.drawHouse = (function(h) {
        return function() {
            cxt.strokeStyle = 'black';
            cxt.lineCap = "round";
            cxt.lineJoin = "round";
            cxt.beginPath();
            cxt.moveTo(h.bodyLeftX, h.bodyBotY);
            cxt.lineTo(h.bodyLeftX, h.roofBotY);
            cxt.lineTo(h.roofBotLeftX, h.roofBotY);
            cxt.lineTo(h.roofTopLeftX, h.roofTopY);
            cxt.lineTo(h.chmyLeftX, h.roofTopY);
            cxt.lineTo(h.chmyLeftX, h.chmyTopY);
            cxt.lineTo(h.chmyRightX, h.chmyTopY);
            cxt.lineTo(h.chmyRightX, h.roofTopY);
            cxt.lineTo(h.roofTopRightX, h.roofTopY);
            cxt.lineTo(h.roofBotRightX, h.roofBotY);
            cxt.lineTo(h.bodyRightX, h.roofBotY);
            cxt.lineTo(h.bodyRightX, h.bodyBotY);
            cxt.closePath();
            cxt.stroke();
            cxt.fill();
            
            cxt.fillStyle = h.windowC;
            cxt.beginPath();
            cxt.moveTo(h.wndLeftX, h.wndTopY);
            cxt.lineTo(h.wndRightX, h.wndTopY);
            cxt.lineTo(h.wndRightX, h.wndBotY);
            cxt.lineTo(h.wndLeftX, h.wndBotY);
            cxt.closePath();
            cxt.fill();
        };
    })(data.snowy.house);
    
    data.snowy.render = (function(d) {
        return function() {
            cxt.fillStyle = d.bg;
            cxt.fillRect(0, 0, cvsW, cvsH);
            d.drawStars();
            d.drawCrescent();
            d.drawFlakes(d.flakesZ0);
            d.drawSmoke();
            d.drawGround();
            d.drawHouse();
            d.drawFlakes(d.flakesZ1);
        };
    })(data.snowy);
    
    this.drawSnowyNight = function() {
        switchTo('snowy');
    };
    
    this.stop = function() {
        switchTo('');
    };
}
