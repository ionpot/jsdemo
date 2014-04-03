function Wind() {
    this.magnitude = 2;
    this.angleMin = deg45;
    this.angleMax = deg135;
    this.angle = deg90;
    
    var self = this,
        sourceA = 0,
        targetA = 0,
        distance = 0,
        duration = 0,
        angleRange = abs(self.angleMax - self.angleMin),
        ease = new EasingValue();
    
    function newTarget() {
        sourceA = self.angle;
        targetA = self.angleMin + angleRange * rand();
        distance = targetA - sourceA;
        duration = scnd * 3 + abs(distance);
        duration += rand() * 3;
        ease.set(sourceA, distance, duration, newTarget);
    }
    
    newTarget();
    
    this.process = function() {
        self.angle = ease.get();
    };
}

function Star(x, y) {
    this.x = x || 0;
    this.y = y || 0;
    this.r = rand();
    this.a = rand();
}

function SnowyNight(cvsW, cvsH) {
    var self = this,
        step = 1000 / fps,
        flakes = 20,
        gravity = 1,
        wind = new Wind(),
        flakeG = null,
        puffG = null,
        flicker = null;

    this.ground = {
        "h" : 30
    };
    this.crescent = {
        "x" : cvsW - 80,
        "y" : 40,
        "r" : 20,
        "a" : deg90,
        "l" : 10,
        "m" : 15,
        "rotation" : deg1 * 160
    };
    this.house = {
        "bodyX" : 30,
        "bodyW" : 50,
        "bodyH" : 35,
        "roofTopW" : 60,
        "roofBotW" : 70,
        "roofH" : 30,
        "chimneyX" : 40,
        "chimneyW" : 5,
        "chimneyH" : 10,
        "windowX" : 10,
        "windowY" : 6,
        "windowW" : 6,
        "windowH" : 10,
        "windowC" : "#FF6"
    };
    this.windy = true;
    this.snowing = true;
    this.smoking = true;
    this.flakesZ0 = [];
    this.flakesZ1 = [];
    this.puffs = [];
    this.stars = [];
    
    function interpolate() {
        var c = self.crescent,
            g = self.ground,
            h = self.house;

        c.x1 = c.r * cos(c.a + deg45) - c.l - c.m,
        c.y1 = c.r * sin(c.a + deg45) + c.l - c.m,
        c.x2 = c.r * cos(deg45) + c.l - c.m,
        c.y2 = -c.r * sin(deg45) - c.l - c.m;
        
        g.y = cvsH - g.h;
        
        h.bodyLeftX = h.bodyX;
        h.roofBotLeftX = h.bodyLeftX - abs(h.bodyW - h.roofBotW) / 2;
        h.roofTopLeftX = h.roofBotLeftX + abs(h.roofBotW - h.roofTopW) / 2;
        h.chmyLeftX = h.roofTopLeftX + h.chimneyX;
        h.chmyRightX = h.chmyLeftX + h.chimneyW;
        h.roofTopRightX = h.roofTopLeftX + h.roofTopW;
        h.roofBotRightX = h.roofBotLeftX + h.roofBotW;
        h.bodyRightX = h.bodyLeftX + h.bodyW;
        h.bodyBotY = g.y;
        h.roofBotY = h.bodyBotY - h.bodyH;
        h.roofTopY = h.roofBotY - h.roofH;
        h.chmyTopY = h.roofTopY - h.chimneyH;
        h.wndLeftX = h.bodyLeftX + h.windowX;
        h.wndRightX = h.wndLeftX + h.windowW;
        h.wndTopY = h.roofBotY + h.windowY;
        h.wndBotY = h.wndTopY + h.windowH;
    }
    
    function SmokePuff(iX, iY) {
        var self = this,
            wA = 0,
            wM = wind.magnitude,
            iR = 1,
            rGrow = 2,
            up = 0,
            coef = 0,
            easeC = new EasingValue(),
            easeR = new EasingValue(),
            easeA = new EasingValue();

        this.x = iX;
        this.y = iY;
        this.r = iR;
        this.a = 1;
        
        easeC.set(0, 1, scnd / 2);
        easeR.set(iR, rGrow, scnd);
        easeA.set(1, -1, scnd);
        
        this.process = function() {
            self.r = easeR.get();
            self.a = easeA.get();
            if (coef < 1) {
                coef = easeC.get();
            }
            wA = wind.angle;
            up = gravity * sin(wA);
            self.y -= up * coef;
            self.x += wM * cos(wA + pi) * coef;
        };
    }
    
    function PuffGenerator() {
        var h = self.house,
            x = h.chmyLeftX + (h.chimneyW / 2),
            y = h.chmyTopY,
            freq1 = 250,
            freq2 = 200,
            handle1 = null,
            handle2 = null;
        
        function generate1() {
            self.puffs.push(new SmokePuff(x-1, y));
        }
        
        function generate2() {
            self.puffs.push(new SmokePuff(x+1, y));
        }
        
        this.start = function() {
            handle1 = handle1 || setInterval(generate1, freq1);
            handle2 = handle2 || setInterval(generate2, freq2);
        };
        this.stop = function() {
            clearInterval(handle1);
            clearInterval(handle2);
            handle1 = handle2 = null;
        };
    }

    function SnowFlake() {
        var self = this,
            sourceA = 0,
            targetA = 0,
            distance = 0,
            duration = 0,
            ease = new EasingValue(),
            wC = rand() * wind.magnitude,
            wA = deg1 * 20 * cos(pi * rand()),
            gC = (0.5 + 0.5 * rand()) * gravity;

        this.size = 2 + 2 * rand();
        this.x = cvsW * cos(wind.angle) + cvsW * rand();
        this.y = -this.size;
        this.a = deg360 * rand();
        
        function newRotation() {
            sourceA = self.a;
            targetA = deg360 * rand();
            distance = targetA - sourceA;
            duration = scnd * 3 + scnd * 5 * rand();
            ease.set(sourceA, distance, duration, newRotation);
        }
        
        newRotation();
        
        this.process = function() {
            self.a = ease.get();
            var a = wind.angle + wA;
            if (a > wind.angleMax) {
                a -= 2 * (a - wind.angleMax);
            }
            else if (a < wind.angleMin) {
                a += 2 * (wind.angleMin - a);
            }
            a += pi;
            self.x += wC * cos(a);
            self.y -= gC * sin(a);
        }
    }
    
    function newFlake() {
        if (flakes == 0) return;
        if (rnd(rand()) == 0) {
            self.flakesZ0.push(new SnowFlake());
        } else {
            self.flakesZ1.push(new SnowFlake());
        }
        --flakes;
    }
    
    function removeFlake(arr, index) {
        arr.splice(index, 1);
        ++flakes;
    }
    
    function FlakeGenerator() {
        var h = 0,
            chance = 0.7,
            frequency = 200;
        
        this.start = function() {
            h = setInterval(function() {
                if (chance > rand()) {
                    newFlake();
                }
            }, frequency);
        };
        
        this.stop = function() { clearInterval(h); };
    }
    
    function fillStars() {
        var stars = self.stars,
            skyH = self.ground.y - 10,
            tileW = 5,
            tileH = 5,
            cols = Math.floor(cvsW / tileW),
            rows = Math.floor(skyH / tileH),
            colsL = cvsW % tileW,
            rowsL = skyH % tileH,
            chance = 0.5,
            x = 0,
            y = 0;

        for (var i = 0; i < rows; ++i) {
            y = i * tileH;
            for (var j = 0; j < cols; ++j) {
                if (chance < rand()) continue;
                x = j * tileW + tileW * rand();
                stars.push(new Star(x, y + tileH * rand()));
            }
            if (chance < rand()) continue;
            x = cols * colsL + colsL * rand();
            stars.push(new Star(x, y + tileH * rand()));
        }
    }
    
    function processFlakes(arr) {
        for (var i = 0, l = arr.length, f = null; i < l; ++i) {
            f = arr[i];
            f.process();
            if (f.y + f.size > self.ground.y) {
                removeFlake(arr, i);
                l = arr.length;
            }
        }
    }
    
    function processPuffs() {
        var arr = self.puffs,
            len = arr.length;
        for (var i = 0; i < len; ++i) {
            var p = arr[i];
            if (p.a == 0) {
                arr.splice(i, 1);
                len = arr.length;
            } else {
                p.process();
            }
        }
    }
    
    function Flicker() {
        var h = self.house,
            val = h.windowC,
            handle = null,
            flip = null,
            state = false,
            rate = 50,
            minDur = 500,
            maxDur = 10000;
        
        function newDur() {
            return minDur + maxDur * rand();
        }
        
        function setTO(dur) {
            handle = setTimeout(flip, dur);
        }
        
        flip = function() {
            state = !state;
            if (state) {
                h.windowC = '#660';
                setTO(rate);
            } else {
                h.windowC = val;
                setTO(newDur());
            }
        };
        
        this.start = function() {
            if (handle) return;
            setTO(newDur());
        };
        
        this.stop = function() {
            clearTimeout(handle);
            handle = null;
        };
    }
    
    this.start = function() {
        flakeG.start();
        puffG.start();
        flicker.start();
    };
    
    this.stop = function() {
        flakeG.stop();
        puffG.stop();
        flicker.stop();
    };
    
    this.process = function() {
        if (self.windy) {
            wind.process();
        }
        if (self.snowing) {
            processFlakes(self.flakesZ0);
            processFlakes(self.flakesZ1);
        }
        if (self.smoking) {
            processPuffs();
        }
    };
    
    interpolate();
    fillStars();
    flakeG = new FlakeGenerator();
    puffG = new PuffGenerator();
    flicker = new Flicker();
}
