/**
 * Convert hsl Color into RGB color.
 * @param h color value ranges from 0 to 360.
 * @param s saturation value.
 * @param l brightness level.
 * @return array containing r g and b value
 */
export function convertHSLToRGB(h: number, s: number, l: number): [number, number, number] {

  s /= 100;
  l /= 100;
  
  let c: number = (1 - Math.abs(2 * l - 1)) * s;
  let x: number = c * (1 - Math.abs((h / 60) % 2 - 1));
  let m: number = l - c/2;
  let r: number = 0;
  let g: number = 0;
  let b: number = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;  
  } 
  else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  }
  else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } 
  else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } 
  else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } 
  else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }
    
  r = (r + m);
  g = (g + m);
  b = (b + m);
 
  return [r, g, b];
}