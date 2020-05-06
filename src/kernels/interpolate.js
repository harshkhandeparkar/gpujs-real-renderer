/**
 * @param {Object} gpu 
 * @param {Float32Array} dimensions 
 * @param {Number} xScaleFactor
 * @param {Number} yScaleFactor
 * @param {Number} xOffset
 * @param {Number} yOffset
 * @param {Number} lineThickness
 * @param {Number} lineColor
 */
function getInterpolateKernel(gpu, dimensions, xScaleFactor, yScaleFactor, xOffset, yOffset, lineThickness, lineColor) {
  return gpu.createKernel(function(graphPixels, val1, val2) {
    const x = this.thread.x,
      y = this.thread.y;

    const x1 = val1[0];
    const y1 = val1[1];

    const x2 = val2[0];
    const y2 = val2[1];
      
    const outX = this.output.x, outY = this.output.y;

    const X = x / this.constants.xScaleFactor - (outX * (this.constants.yOffset / 100)) / this.constants.xScaleFactor;
    const Y = y / this.constants.yScaleFactor - (outY * (this.constants.xOffset / 100)) / this.constants.yScaleFactor;

    let lineEqn = X * (y1 - y2) - x1 * (y1 - y2) - Y * (x1 - x2) + y1 * (x1 -x2);
    let lineDist = Math.abs(lineEqn) / Math.sqrt((y1 - y2)*(y1 - y2) + (x1 - x2)*(x1 - x2));

    if (
      lineDist <= this.constants.lineThickness &&
      X <= Math.max(x1, x2) &&
      X >= Math.min(x1, x2) &&
      Y <= Math.max(y1, y2) &&
      Y >= Math.min(y1, y2)
    ) return this.constants.lineColor;
    else return graphPixels[this.thread.y][this.thread.x];
  },
  {
    output: dimensions,
    pipeline: true,
    constants: {
      lineThickness,
      lineColor,
      xScaleFactor,
      yScaleFactor,
      xOffset,
      yOffset
    },
    constantTypes: {
      lineThickness: 'Float',
      lineColor: 'Array(3)',
      xScaleFactor: 'Float',
      yScaleFactor: 'Float',
      xOffset: 'Float',
      yOffset: 'Float'
    }
  })
}

module.exports = getInterpolateKernel;