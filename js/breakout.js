Breakout.extending(Game);

function Breakout() {
    var game = this,
        fillRate = 20,
        text = '';
    
    function Block() {
        this.row = 0;
        this.col = 0;
        this.x = 0;
        this.y = 0;
        this.eX = 0;
        this.eY = 0;
        this.on = [];
    }
    Block.c = 0;
    Block.w = 0;
    Block.h = 0;
    Block.lW = 1;
    Block.prototype.setPos = function(x, y) {
        this.x = x + Block.lW;
        this.y = y + Block.lW;
        this.eX = x + Block.w - Block.lW;
        this.eY = y + Block.h - Block.lW;
    };
    Block.prototype.id = function() {
        return this.row + 'x' + this.col;
    };

    function Blocks(cvsW, cvsH, cxt) {
        this.rows = 10;
        this.cols = 10;
        this.w = rnd(cvsW * 3 / 4);
        this.h = rnd(cvsH / 3);
        this.x = (cvsW - this.w) / 2;
        this.y = this.x;
        this.cX = this.x + this.w / 2;
        this.cY = this.y + this.h / 2;
        Block.w = this.w / this.rows;
        Block.h = this.h / this.cols;
        this.blocks = [];
        this.removed = [];
        this.listN = {};
        this.listS = {};
        this.listW = {};
        this.listE = {};
        this.hList = {};
        this.vList = {};
        this.color = (function(b, c) {
            var g = c.createRadialGradient(b.cX, b.cY, b.w/4, b.cX, b.cY, b.w/2);
            g.addColorStop(0, '#406');
            g.addColorStop(1, '#206');
            return g;
        })(this, cxt);
    }
    Blocks.prototype.getList = function(dr) {
        switch(dr) {
            case 'n':
                return this.listN;
            case 's':
                return this.listS;
            case 'w':
                return this.listW;
            case 'e':
                return this.listE;
            default:
                return null;
        }
    };
    Blocks.prototype.addToList = function(dr, bl) {
        if (!bl) return;
        var key = bl.id(),
            li = this.getList(dr);
        if (!li) return;
        if (li[key]) return;
        bl.on.push(dr);
        li[key] = bl;
    };
    Blocks.prototype.rmvFromList = function(bl, dr) {
        var id = bl.id(),
            on = bl.on,
            drI = false;
        if (!dr) {
            while(on.length) {
                var li = this.getList(on.shift());
                delete li[id];
            }
            return;
        }
        for (var i = 0; i < on.length; ++i) {
            if (on[i] == dr) {
                drI = true;
                on.splice(i, 1);
                break;
            }
        }
        if (drI) {
            var li = this.getList(dr);
            delete li[id];
        }
    };
    Blocks.prototype.getBlock = function(r, c) {
        if (r < 0) return null;
        if (r >= this.rows) return null;
        if (c < 0) return null;
        if (c >= this.cols) return null;
        return this.blocks[r][c];
    };
    Blocks.prototype.rmvBlock = function(bl) {
        var r = bl.row,
            c = bl.col,
            nB = this.getBlock(r-1, c),
            sB = this.getBlock(r+1, c),
            eB = this.getBlock(r, c+1),
            wB = this.getBlock(r, c-1);
        this.blocks[r][c] = null;
        this.removed.push(bl);
        this.rmvFromList(bl);
        if (--Block.c == 0) {
            game.trigger('cleared');
            return;
        }
        this.addToList('n', sB);
        this.addToList('s', nB);
        this.addToList('w', eB);
        this.addToList('e', wB);
    };
    Blocks.prototype.checkBumps = function(b) {
        var lf = b.left,
            up = b.up,
            bX = lf ? b.x : b.eX,
            bY = up ? b.y : b.eY,
            hL = this.hList,
            vL = this.vList,
            rmv = false;
        for (var k in hL) {
            var bl = hL[k],
                ok = lf ? (bl.eX >= bX) : (bl.x <= bX);
            ok &= lf ? (bX >= bl.x) : (bX <= bl.eX);
            if (ok) {
                ok = (bl.y <= b.cY);
                ok &= (b.cY <= bl.eY);
                if (ok) {
                    game.trigger('hBump', bl);/*
                    b.hBump();
                    this.rmvBlock(bl);*/
                    break;
                }
            }
        }
        for (var k in vL) {
            var bl = vL[k],
                ok = up ? (bl.eY >= bY) : (bl.y <= bY);
            ok &= up ? (bY >= bl.y) : (bY <= bl.eY);
            if (ok) {
                ok = (bl.x <= b.cX);
                ok &= (b.cX <= bl.eX);
                if (ok) {
                    game.trigger('vBump', bl);/*
                    b.vBump();
                    this.rmvBlock(bl);*/
                    break;
                }
            }
        }
    };
    Blocks.prototype.getNhbrs = function(row, col) {
        var rows = this.rows,
            cols = this.cols,
            arr = this.blocks,
            o = {};
        try {
            o.n = arr[row-1][col];
        } catch(e) {}
        try {
            o.s = arr[row+1][col];
        } catch(e) {}
        try {
            o.w = arr[row][col-1];
        } catch(e) {}
        try {
            o.e = arr[row][col+1];
        } catch(e) {}
        return o;
    };
    Blocks.prototype.putBlock = function(row, col) {
        var arr = this.blocks,
            bl = new Block(),
            x = this.x + (col * Block.w),
            y = this.y + (row * Block.h),
            nbs = null;
        bl.row = row;
        bl.col = col;
        bl.setPos(x, y);
        arr[row][col] = bl;
        ++Block.c;
        nbs = this.getNhbrs(row, col);
        if (nbs.n) {
            this.rmvFromList(nbs.n, 's');
        } else {
            this.addToList('n', bl);
        }
        if (nbs.s) {
            this.rmvFromList(nbs.s, 'n');
        } else {
            this.addToList('s', bl);
        }
        if (nbs.w) {
            this.rmvFromList(nbs.w, 'e');
        } else {
            this.addToList('w', bl);
        }
        if (nbs.e) {
            this.rmvFromList(nbs.e, 'w');
        } else {
            this.addToList('e', bl);
        }
    };
    Blocks.prototype.fill = function() {
        Block.c = 0;
        this.blocks = (function(r, c){
            var arr = new Array(r);
            for (var i = 0; i < r; ++i) {
                arr[i] = new Array(c);
                for (var j = 0; j < c; ++j) {
                    arr[i][j] = false;
                }
            }
            return arr;
        })(this.rows, this.cols);
        var bls = this,
            row = 0,
            col = 0,
            rows = this.rows,
            cols = this.cols,
            h = setInterval(function() {
                bls.putBlock(row, col);
                if (++col == cols) {
                    col = 0;
                    if (++row == rows) {
                        clearInterval(h);
                        game.trigger('filled');
                    }
                }
            }, fillRate);
    };
    Blocks.prototype.refill = function() {
        var bls = this,
            arr = this.removed,
            h = setInterval(function() {
                if (!arr.length) {
                    clearInterval(h);
                    game.trigger('filled');
                    return;
                }
                var bl = arr.pop();
                bls.putBlock(bl.row, bl.col);
            }, fillRate);
    };
    Blocks.prototype.draw = function(cxt) {
        cxt.lineWidth = Block.lW;
        cxt.strokeStyle = '#000';
        cxt.fillStyle = this.color;
        for (var row = 0, rows = this.blocks; row < rows.length; ++row) {
            for(var col = 0, cols = rows[row], bl = null; col < cols.length; ++col) {
                bl = cols[col];
                if (!bl) continue;
                cxt.beginPath();
                cxt.rect(bl.x, bl.y, Block.w, Block.h);
                cxt.stroke();
                cxt.fill();
            }
        }
    };

    function Ball() {
        this.r = 3;
        this.s = 2;
        this.d = this.r * 2;
        this.x = 0;
        this.y = 0;
        this.iX = 0;
        this.iY = 0;
        this.cX = 0;
        this.cY = 0;
        this.eX = 0;
        this.eY = 0;
        this.dr = -deg90;
        this.left = (cos(this.dr) < 0);
        this.up = (sin(this.dr) > 0);
        this.freeze = true;
        this.goingBack = {
            "active" : false,
            "x" : false,
            "y" : false
        };
        this.easeX = new EasingValue();
        this.easeY = new EasingValue();
    }
    Ball.prototype.setInit = function(x, y) {
        this.iX = x - this.r;
        this.iY = y - this.r;
    };
    Ball.prototype.setPos = function() {
        this.x = this.iX - this.r;
        this.y = this.iY - this.r;
        this.interpolate();
    };
    Ball.prototype.interpolate = function() {
        this.cX = this.x + this.r;
        this.cY = this.y + this.r;
        this.eX = this.x + this.d;
        this.eY = this.y + this.d;
    };
    Ball.prototype.goBack = function() {
        this.freeze = true;
        this.dr = -deg90;
        var gB = this.goingBack,
            dX = this.iX - this.x,
            dY = this.iY - this.y,
            dur = (abs(dX) + abs(dY)) / 4;
        gB.active = true;
        gB.x = false;
        gB.y = false;
        function check() {
            if (!(gB.x || gB.y)) return;
            gB.active = false;
            gB.x = false;
            gB.y = false;
            game.trigger('ballRewound');
        }
        function xDone() {
            gB.x = true;
            check();
        }
        function yDone() {
            gB.y = true;
            check();
        }
        this.easeX.set(this.x, dX, dur, xDone);
        this.easeY.set(this.y, dY, dur, yDone);
    };
    Ball.prototype.process = function() {
        if (this.goingBack.active) {
            this.x = this.easeX.get();
            this.y = this.easeY.get();
        }
        else if (!this.freeze) {
            this.x += this.s * cos(this.dr);
            this.y -= this.s * sin(this.dr);
        }
        this.interpolate();
    };
    Ball.prototype.hBump = function() {
        this.dr = pi - this.dr;
        this.left = !this.left;
    };
    Ball.prototype.vBump = function() {
        this.dr = -this.dr;
        this.up = !this.up;
    };
    Ball.prototype.pBump = function(plr) {
        var d = this.cX - plr.cX;
        this.dr = atan2(plr.w / 2, d);
        if (cos(this.dr) > 0) {
            this.left = false;
        } else {
            this.left = true;
        }
        if (sin(this.dr) > 0) {
            this.up = true;
        } else {
            this.up = false;
        }
    };
    Ball.prototype.draw = function(cxt) {
        cxt.fillStyle = '#666';
        cxt.beginPath();
        cxt.moveTo(this.eX, this.cY);
        cxt.arc(this.cX, this.cY, this.r, 0, deg360);
        cxt.fill();
    };

    function Player(cW, cH) {
        var self = this;
        this.y = cH - 50;
        this.w = 30;
        this.h = 8;
        this.m = 2;
        this.r = this.w / 2;
        this.minX = this.m;
        this.maxX = cW - 2*this.m - this.w;
        this.x = 0;
        this.cX = 0;
        this.eX = 0;
        this.tY = this.y - this.h;
    }
    Player.prototype.setX = function(x) {
        this.x = max(x - this.r, this.minX);
        this.x = min(this.x, this.maxX);
        this.interpolateX();
    };
    Player.prototype.interpolateX = function() {
        this.cX = this.x + this.r;
        this.eX = this.x + this.w;
    };
    Player.prototype.process = function(msX) {
        this.setX(msX);
    };
    Player.prototype.draw = function(cxt) {
        cxt.lineCap = 'round';
        cxt.lineWidth = this.h;
        cxt.strokeStyle = '#360';
        cxt.beginPath();
        cxt.moveTo(this.x + 2, this.y);
        cxt.lineTo(this.eX - 2, this.y);
        cxt.stroke();
    }
    
    
    function drawText(cxt, cvs) {
        var t = text;
        if (!t.length) return;
        var gA = cxt.globalAlpha;
        cxt.globalAlpha = 0.5;
        cxt.font = '20px Verdana';
        cxt.fillStyle = '#FFF';
        var x = cvs.w - cxt.measureText(t).width;
        cxt.fillText(t, x/2, cvs.h/4);
        cxt.globalAlpha = gA;
    }
    
    function checkBumps(cW, b, p) {
        var hB = false,
            vB = false,
            pB = false,
            ms = false;
        hB |= b.x <= 0;
        hB |= b.eX >= cW;
        vB |= b.y <= 0;
        if (b.y > p.tY) {
            ms = (b.y > p.y);
            if (!ms) {
                pB |= (p.x <= b.x) && (b.x <= p.eX);
                pB |= (p.x <= b.eX) && (b.eX <= p.eX);
            }
            else game.trigger('missed');
        }
        if (hB) game.trigger('hBump');
        if (vB) game.trigger('vBump');
        if (pB) game.trigger('pBump');
    }
    
    function rewind(d) {
        text = 'Rewinding...';
        d.rewinding = true;
        d.bls.refill();
        d.ball.goBack();
    }
    
    function initBegin(s) {
        s.begin = function(d) {
            var cW = this.w,
                cH = this.h;
            d.plr = new Player(cW, cH);
            d.plr.setX(cW/2);
            d.ball = new Ball();
            d.ball.setInit(cW/2, cH/2);
            d.ball.setPos();
            d.ballReady = true;
            d.bls = new Blocks(cW, cH, this.c);
            d.blocksReady = false;
            d.missed = false;
            d.cleared = false;
            d.rewinding = false;
            text = 'Click to begin.';
        };
        s.render = function(d, c) {
            d.plr.draw(c);
            d.ball.draw(c);
            drawText(c, this);
        };
        s.end = function(d) {
            text = '';
            return d;
        };
        s.events.clicked = function() {
            game.to('play');
        };
    }
    
    function initPlay(s) {
        s.begin = function(d) {
            if (d.missed || d.cleared) {
                rewind(d);
            } else {
                d.bls.fill();
            }
            d.missed = false;
            d.cleared = false;
        };
        s.end = function(d) {
            d.ball.freeze = true;
        };
        s.process = function(d) {
            d.ball.process();
            if (d.rewinding) return;
            d.plr.process(this.mX);
            checkBumps(this.w, d.ball, d.plr);
            d.bls.checkBumps(d.ball);
        };
        s.render = function(d, c) {
            d.ball.draw(c);
            d.plr.draw(c);
            d.bls.draw(c);
            drawText(c, this);
        };
        s.pause = function(d) {
            text = 'Paused';
            d.ball.freeze = true;
        };
        s.resume = function(d) {
            text = '';
            d.ball.freeze = false;
        };
        s.events.clicked = function(d) {
            if (d.rewinding) return;
            game.running ? game.pause() : game.resume();
        };
        s.events.filled = function(d) {
            d.blocksReady = true;
            if (d.ballReady) game.trigger('ready');
        };
        s.events.ballRewound = function(d) {
            d.ballReady = true;
            if (d.blocksReady) game.trigger('ready');
        };
        s.events.ready = function(d) {
            d.ball.freeze = d.rewinding = d.ballReady = d.blocksReady = false;
            text = '';
        };
        s.events.hBump = function(d, p) {
            var bls = d.bls;
            d.ball.hBump();
            bls.hList = d.ball.left ? bls.listE : bls.listW;
            if (p) bls.rmvBlock(p);
        };
        s.events.vBump = function(d, p) {
            var bls = d.bls;
            d.ball.vBump();
            bls.vList = d.ball.up ? bls.listS : bls.listN;
            if (p) bls.rmvBlock(p);
        };
        s.events.pBump = function(d) {
            var ba = d.ball,
                    bls = d.bls;
            ba.pBump(d.plr);
            bls.hList = ba.left ? bls.listE : bls.listW;
            bls.vList = ba.up ? bls.listS : bls.listN;
        };
        s.events.missed = function(d) {
            d.missed = true;
            game.to('end');
        };
        s.events.cleared = function(d) {
            d.cleared = true;
            game.to('end');
        };
    }
    
    function initEnd(s) {
        s.begin = function(d) {
            d.ballReady = false;
            d.blocksReady = false;
            text = d.missed ? 'Missed! Retry?' : 'Clear! Again?';
        };
        s.end = function(d) {
            text = '';
        };
        s.render = function(d, c) {
            d.ball.draw(c);
            d.plr.draw(c);
            d.bls.draw(c);
            drawText(c, this);
        };
        s.events.clicked = function(d) {
            game.to('play');
        };
    }

    this.init = function(s) {
        game.initState('begin', initBegin);
        game.initState('play', initPlay);
        game.initState('end', initEnd);
    };
}
