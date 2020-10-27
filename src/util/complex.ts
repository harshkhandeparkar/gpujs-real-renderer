// A Complex class to handle all complex stuff
import { convertCartesianPolar, convertPolarCartesian } from './convertForm';

export class Complex {
  r: number;
  theta: number;
  x: number;
  y: number;
  static convertCartesianPolar = convertCartesianPolar;
  static convertPolarCartesian = convertPolarCartesian;

  /**
   * Constructor
   * @param r Modulus
   * @param theta Argument (radians)
   */
  constructor(r: number, theta: number) {
    this.r = r;
    this.theta = theta;

    this.x = convertPolarCartesian(this.r, this.theta)[0];
    this.y = convertPolarCartesian(this.r, this.theta)[1];

    return this;
  }

  getCartesianForm() {
    return [this.x, this.y];
  }

  getPolarForm() {
    return [this.r, this.theta];
  }

  /**
   * @param addedNum Complex number (object) to be added.
   */
  add(addedNum: Complex) {
    this.x += addedNum.x;
    this.y += addedNum.y;

    this.r = convertCartesianPolar(this.x, this.y)[0];
    this.theta = convertCartesianPolar(this.x, this.y)[1];

    return this;
  }

  /**
   * @param subtractedNum Complex number (object) to be subtracted.
   */
  subtract(subtractedNum: Complex) {
    this.x -= subtractedNum.x;
    this.y -= subtractedNum.y;

    this.r = convertCartesianPolar(this.x, this.y)[0];
    this.theta = convertCartesianPolar(this.x, this.y)[1];
    return this;
  }

  /**
   * @param multipliedNum Complex number (object) to be multiplied.
   */
  multiply(multipliedNum: Complex) {
    this.r *= multipliedNum.r;
    this.theta += multipliedNum.theta;

    this.x = convertPolarCartesian(this.r, this.theta)[0];
    this.y = convertPolarCartesian(this.r, this.theta)[1];

    return this;
  }

  /**
   * @param dividedNum Complex number (object) to be multiplied.
   */
  divide(dividedNum: Complex) {
    this.r /= dividedNum.r;
    this.theta -= dividedNum.theta;

    this.x = convertPolarCartesian(this.r, this.theta)[0];
    this.y = convertPolarCartesian(this.r, this.theta)[1];

    return this;
  }

  /**
   * @returns The complex conjugate (modified this).
   */
  conjugate() {
    this.theta *= -1;
    this.x = convertPolarCartesian(this.r, this.theta)[0];
    this.y = convertPolarCartesian(this.r, this.theta)[1];

    return this;
  }

  /**
   * @returns The complex reciprocal (modified this).
   */
  reciprocal() {
    this.r = 1 / this.r;
    this.theta *= -1;
    this.x = convertPolarCartesian(this.r, this.theta)[0];
    this.y = convertPolarCartesian(this.r, this.theta)[1];

    return this;
  }
}
