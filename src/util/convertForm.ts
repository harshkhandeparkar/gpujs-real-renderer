/**
 * Convert polar to Cartesian form.
 * @param r Modulus
 * @param theta Argument
 */
export function convertPolarCartesian(r: number, theta: number) {
  return [
    r * Math.cos(theta),
    r * Math.sin(theta)
  ]
}

/**
 * Convert Cartesian to polar form.
 * @param x Real Part
 * @param y Complex Part
 */
export function convertCartesianPolar(x: number, y: number) {
  return [
    Math.sqrt(x*x + y*y),
    Math.atan2(y, x)
  ]
}

/**
 * Convert hsl Color into RGB color.
 * @param h color value ranges from 0 to 360.
 * @param s saturation value.
 * @param l brightness level.
 * @returns array containing r g and b value
 */
export function convertHSLToRGB(h: number, s: number, l: number) :[ number ,number ,number ] {

    s /= 100;
    l /= 100;
  
    var c: number = (1 - Math.abs(2 * l - 1)) * s;
    var x: number = c * (1 - Math.abs((h / 60) % 2 - 1));
    var m: number = l - c/2;
    var r: number = 0;
    var g: number = 0;
    var b: number = 0;

    if (0 <= h && h < 60) {
        r = c; g = x; b = 0;  
    } else if (60 <= h && h < 120) {
        r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
        r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
        r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
        r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
        r = c; g = 0; b = x;
    }
    
    r = Math.round((r + m));
    g = Math.round((g + m));
    b = Math.round((b + m));

    return [ r ,g ,b ];
}