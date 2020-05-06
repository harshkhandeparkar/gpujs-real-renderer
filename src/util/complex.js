// A Complex class to handle all complex stuff
const {convertCartesianPolar, convertPolarCartesian} = require('./convertForm');

class Complex {
  /**
   * Constructor
   * @param {Number} r Modulus
   * @param {Number} theta Argument (radians)
   */
  constructor(r, theta) {
    this.r = r;
    this.theta = theta;

    this.x = convertPolarCartesian(this.r, this.theta)[0];
    this.y = convertPolarCartesian(this.r, this.theta)[1];


    this.convertCartesianPolar = convertCartesianPolar;
    this.convertPolarCartesian = convertPolarCartesian;

    return this;
  }

  /**
   * @returns {Float32Array} [x, y]
   */
  getCartesianForm() {
    return [this.x, this.y];
  }

  /**
   * @returns {Float32Array} [r, theta]
   */
  getPolarForm() {
    return [this.r, this.theta];
  }

  /**
   * @param {"Complex"} addedNum Complex number (object) to be added.
   * @returns {"Complex"} this
   */
  add(addedNum) {
    this.x += addedNum.x;
    this.y += addedNum.y;

    this.r = convertCartesianPolar(this.x, this.y)[0];
    this.theta = convertCartesianPolar(this.x, this.y)[1];

    return this;
  }

  /**
   * @param {"Complex"} subtractedNum Complex number (object) to be subtracted.
   * @returns {"Complex"} this
   */
  subtract(subtractedNum) {
    this.x -= subtractedNum.x;
    this.y -= subtractedNum.y;

    this.r = convertCartesianPolar(this.x, this.y)[0];
    this.theta = convertCartesianPolar(this.x, this.y)[1];
    return this;
  }

  /**
   * @param {"Complex"} multipliedNum Complex number (object) to be multiplied.
   * @returns {"Complex"} this 
   */
  multiply(multipliedNum) {
    this.r *= multipliedNum.r;
    this.theta += multipliedNum.theta;

    this.x = convertPolarCartesian(this.r, this.theta)[0];
    this.y = convertPolarCartesian(this.r, this.theta)[1];

    return this;
  }

  /**
   * @param {"Complex"} dividedNum Complex number (object) to be multiplied.
   * @returns {"Complex"} this 
   */
  divide(dividedNum) {
    this.r /= dividedNum.r;
    this.theta -= dividedNum.theta;

    this.x = convertPolarCartesian(this.r, this.theta)[0];
    this.y = convertPolarCartesian(this.r, this.theta)[1];

    return this;
  }

  /**
   * @returns {"Complex"} The complex conjugate (modified this).
   */
  conjugate() {
    this.theta *= -1;
    this.x = convertPolarCartesian(this.r, this.theta)[0];
    this.y = convertPolarCartesian(this.r, this.theta)[1];

    return this;
  }

  /**
   * @returns {"Complex"} The complex reciprocal (modified this).
   */
  reciprocal() {
    this.r = 1 / this.r;
    this.theta *= -1;
    this.x = convertPolarCartesian(this.r, this.theta)[0];
    this.y = convertPolarCartesian(this.r, this.theta)[1];

    return this;
  }
}

module.exports = Complex;