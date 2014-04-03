function Cube(cntr, margin) {
    function Rotation(ax, an) {
        this.axis = ax;
        this.angle = an;
    }
    Rotation.prototype.invert = function () {
        return new Rotation(this.axis, -this.angle);
    };
    Rotation.prototype.toString = function() {
        var str = 'rotate';
        str += this.axis + '(';
        str += this.angle + 'deg)';
        return str;
    };

    this.parent = cntr.parent();
    this.cntr = cntr;
    this.cube = $('.cube', cntr);
    this.sides = this.cube.children('.side');
    this.margin = margin;
    this.rotation = {
        "top" : new Rotation('X', 90),
        "bot" : new Rotation('X', -90),
        "lft" : new Rotation('Y', -90),
        "rgt" : new Rotation('Y', 90),
        "frt" : new Rotation('Y', 0),
        "bck" : new Rotation('Y', 180)
    };
    this.order = 'top frt rgt bot lft bck'.split(' ');
    
    this.prepare();
    this.show('top');
}
Cube.prototype.prepare = function() {
    var pW = this.parent.width(),
        pH = this.parent.height(),
        cr = this.cntr,
        crM = this.margin,
        crW = pW - 2*crM,
        crH = pH - 2*crM,
        cb = this.cube,
        sd = this.sides,
        cZ = -crW / 2;
    cr.css({
        "height" : crH + 'px',
        "margin" : crM + 'px',
        "perspective" : crH + 'px',
        "position" : "relative"
    });
    cb.css({
        "height" : "100%",
        "position" : "absolute",
        "transform-origin" : "50% 50% " + cZ + "px",
        "transform-style" : "preserve-3d",
        "transition" : "transform 1s",
        "width" : "100%"
    });
    sd.css({
        "background-color" : "black",
        "height" : "100%",
        "position" : "absolute",
        "transform-origin" : "50% 50% " + cZ + "px",
        "width" : "100%"
    });
    for (var i = 0,
             ord = this.order,
             l = ord.length,
             rt = this.rotation,
             fc = null,
             val = null; i < l; ++i) {
        fc = ord[i];
        val = rt[fc].toString();
        sd.filter('.' + fc).css('transform', val);
    }
    cb.fadeIn(300);
};
Cube.prototype.show = function(fc) {
    var rt = this.rotation[fc].invert(),
        val = rt.toString();
    this.cube.css('transform', val);
};
