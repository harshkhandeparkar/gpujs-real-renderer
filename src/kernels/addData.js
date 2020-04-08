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
 * @param {Number} lineThickness
 * @param {Number} lineColor
 * @param {String} progressiveAxis
 */
function getAddDataKernel(gpu, dimensions, brushSize, brushColor, xScaleFactor, yScaleFactor, xOffset, yOffset, lineThickness, lineColor, progressiveAxis) {
  return gpu.createKernel(function(graphPixels, value, dataIndex, lastData, numProgress) {
    const x = this.thread.x + numProgress * Math.abs(this.constants.progressiveAxis - 1),
      y = this.thread.y + numProgress * this.constants.progressiveAxis;
      
    const outX = this.output.x, outY = this.output.y;

    const X = x / this.constants.xScaleFactor - (outX * (this.constants.yOffset / 100)) / this.constants.xScaleFactor;
    const Y = y / this.constants.yScaleFactor - (outY * (this.constants.xOffset / 100)) / this.constants.yScaleFactor;

    const xDist = X - dataIndex;
    const yDist = Y - value;

    const dist = Math.sqrt(xDist*xDist + yDist*yDist);

    let lineEqn = X * (value - lastData) - Y - dataIndex * (value - lastData) + value;
    let lineDist = Math.abs(lineEqn) / Math.sqrt((value - lastData)*(value - lastData) + 1)

    if (dist <= this.constants.brushSize) return this.constants.brushColor;
    else if (
      lineDist <= this.constants.lineThickness &&
      X <= dataIndex &&
      X >= dataIndex - 1 &&
      Y <= Math.max(value, lastData) &&
      Y >= Math.min(value, lastData)
    ) return this.constants.lineColor;
    else return graphPixels[this.thread.y][this.thread.x];
  },
  {
    output: dimensions,
    pipeline: true,
    constants: {
      brushSize,
      brushColor,
      lineThickness,
      lineColor,
      xScaleFactor,
      yScaleFactor,
      xOffset,
      yOffset,
      progressiveAxis: progressiveAxis == 'y' ? 1 : 0
    },
    constantTypes: {
      brushColor: 'Array(3)',
      brushSize: 'Float',
      lineThickness: 'Float',
      lineColor: 'Array(3)',
      xScaleFactor: 'Float',
      yScaleFactor: 'Float',
      xOffset: 'Float',
      yOffset: 'Float',
      progressiveAxis: 'Integer'
    }
  })
}

module.exports = getAddDataKernel;