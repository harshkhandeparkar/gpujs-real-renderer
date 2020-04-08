/**
 * 
 * @param {Object} gpu 
 * @param {Float32Array} dimensions 
 * @param {Number} brushSize 
 * @param {Float32Array} brushColor
 * @param {Number} xScaleFactor
 * @param {Number} yScaleFactor
 * @param {Number} xOffset
 * @param {Number} yOffset
 */
function getAddDataKernel(gpu, dimensions, brushSize, brushColor, xScaleFactor, yScaleFactor, xOffset, yOffset) {
  return gpu.createKernel(function(graphPixels, value, dataIndex, lastData) {
    const X = this.thread.x / this.constants.xScaleFactor - this.output.x / (100 / this.constants.yOffset);
    const Y = this.thread.y / this.constants.yScaleFactor - this.output.y / (100 / this.constants.xOffset);

    const xDist = X - dataIndex;
    const yDist = Y - value;

    const dist = Math.sqrt(xDist*xDist + yDist*yDist);
    let lineEqn = 0;

    if (value - lastData != 0) {
      lineEqn = (Y - value) / (value - lastData) - (X - dataIndex) / this.constants.xScaleFactor;
    }
    else lineEqn = 10;

    // return [lineEqn / 100, 0, 0]

    if (dist < this.constants.brushSize) return this.constants.brushColor;
    else if (Math.abs(lineEqn) == 0) return this.constants.brushColor;
    else return graphPixels[this.thread.y][this.thread.x];
  },
  {
    output: dimensions,
    pipeline: true,
    constants: {
      brushSize,
      brushColor,
      xScaleFactor,
      yScaleFactor,
      xOffset,
      yOffset
    },
    constantTypes: {
      brushColor: 'Array(3)',
      brushSize: 'Float',
      xScaleFactor: 'Float',
      yScaleFactor: 'Float',
      xOffset: 'Float',
      yOffset: 'Float'
    }
  })
}

module.exports = getAddDataKernel;