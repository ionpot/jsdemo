var wnd = $(window),
    fps = 60,
    scnd = fps,
    pi = Math.PI,
    abs = Math.abs,
    rnd = Math.round,
    sin = Math.sin,
    cos = Math.cos,
    asin = Math.asin,
    acos = Math.acos,
    atan2 = Math.atan2,
    min = Math.min,
    max = Math.max,
    rand = Math.random,
    deg1 = pi / 180,
    deg45 = pi / 4,
    deg90 = pi / 2,
    deg135 = deg45 * 3,
    deg270 = deg90 * 3,
    deg360 = pi * 2;

function EasingValue() {
    var begin = 0,
        duration = 0,
        time = 0,
        increment = 0,
        angle = pi,
        onComplete = null;

    this.get = function () {
        var val = begin + duration * (1 - cos(angle));
        if (angle >= pi) {
            if (onComplete) {
                onComplete();
            }
        } else {
            angle += increment;
            angle = min(angle, pi);
        }
        return val;
    };

    this.set = function (bgn, dis, dur, complete) {
        begin = bgn || 0;
        duration = dis / 2 || 0;
        time = dur || 1;
        onComplete = complete || null;
        increment = pi / time;
        angle = 0;
    };
}

Function.prototype.extending = function (base) {
    var isF = (base.constructor == Function);
    this.prototype = isF ? new base : base;
    this.prototype.constructor = this;
    this.parent = isF ? base.prototype : base;
    return this;
};

$.fn.animationEnd = function (f, d) {
    if (typeof f != 'function') return this;
    if (!d) d = '';
    return this.each(function () {
        var e = $(this); console.log(e);
        e.bind("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", d, function (evt) {
            console.log('fire', evt);
            var name = evt.animationName || evt.originalEvent.animationName;
            //e.removeClass(name);
            f.call(this, evt, name);
        });
    });
};

$.fn.transitionEnd = function (f, d) {
    if (typeof f != 'function') return this;
    if (!d) d = '';
    return this.each(function () {
        var e = $(this);
        e.bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", d, function (evt) {
            var name = evt.propertyName || evt.originalEvent.propertyName;
            f.call(this, evt, name);
        });
    });
};


function inlineCSS(head) {
    this.cntr = $('<style type="text/css"></style>').appendTo(head);
}

inlineCSS.prototype.addRule = function (sel, rls) {
    var arr = [sel + '{'];
    for (var k in rls) {
        arr.push(k + ':' + rls[k] + ';');
    }
    arr.push('}');
    this.cntr.append(arr.join(''));
};

