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
 * @param theta Complex Part
 */
export function convertCartesianPolar(x: number, y: number) {
  return [
    Math.sqrt(x*x + y*y),
    Math.atan2(y, x)
  ]
}