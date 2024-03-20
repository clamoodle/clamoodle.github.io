document.addEventListener('DOMContentLoaded', function() {
    var canvas = document.getElementById('colorWheel');
    var ctx = canvas.getContext('2d');
    var radius = canvas.width / 2;
    var image = ctx.createImageData(canvas.width, canvas.height);
    var data = image.data;

    for (let x = -radius; x < radius; x++) {
        for (let y = -radius; y < radius; y++) {
            var [r, phi] = xyToPolar(x, y);
            if (r > radius) {
                continue;
            }

            var deg = radToDeg(phi);
            var [red, green, blue] = hslToRgb(deg / 360, 1, 0.5);

            var index = (x + radius + (y + radius) * canvas.width) * 4;
            data[index] = red;
            data[index + 1] = green;
            data[index + 2] = blue;
            data[index + 3] = 255; // Alpha
        }
    }

    ctx.putImageData(image, 0, 0);

    canvas.addEventListener('click', function(event) {
        var rect = canvas.getBoundingClientRect();
        var x = event.clientX - rect.left - radius;
        var y = event.clientY - rect.top - radius;
        var [r, phi] = xyToPolar(x, y);

        if (r < radius) {
            var deg = radToDeg(phi);
            var [red, green, blue] = hslToRgb(deg / 360, 1, 0.5);
            var hex = rgbToHex(red, green, blue);
            document.getElementById('selectedColor').innerText = hex;
        }
    });

    function xyToPolar(x, y) {
        var r = Math.sqrt(x*x + y*y);
        var phi = Math.atan2(y, x);
        return [r, phi];
    }

    function radToDeg(rad) {
        return (rad + Math.PI) / (2 * Math.PI) * 360;
    }

    function hslToRgb(h, s, l) {
        var r, g, b;

        if(s == 0){
            r = g = b = l; // achromatic
        }else{
            var hue2rgb = function hue2rgb(p, q, t){
                if(t < 0) t += 1;
                if(t > 1) t -= 1;
                if(t < 1/6) return p + (q - p) * 6 * t;
                if(t < 1/2) return q;
                if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }

            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    }
});
