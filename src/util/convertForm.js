/**
 * Convert polar to Cartesian form.
 * @param {Number} r Modulus
 * @param {Number} theta Argument
 * @returns {Float32Array} [x, y]
 */
function convertPolarCartesian(r, theta) {
  return [
    r * Math.cos(theta),
    r * Math.sin(theta)
  ]
}

/**
 * Convert Cartesian to polar form.
 * @param {Number} x Real Part
 * @param {Number} theta Complex Part
 * @returns {Float32Array} [r, theta]
 */
function convertCartesianPolar(x, y) {
  return [
    Math.sqrt(x*x + y*y),
    Math.atan2(y, x)
  ]
}

module.exports = {
  convertPolarCartesian,
  convertCartesianPolar
}