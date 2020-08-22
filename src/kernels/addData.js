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
function getAddDataKernel(gpu, dimensions, brushSize, brushColor, xOffset, yOffset, lineThickness, lineColor, progressiveAxis) {
  return gpu.createKernel(function(graphPixels, value, dataIndex, lastData, numProgress, xScaleFactor, yScaleFactor) {
    const x = this.thread.x + numProgress * Math.abs(this.constants.progressiveAxis - 1),
      y = this.thread.y + numProgress * this.constants.progressiveAxis;

    const val = value[0];
    const last = lastData[0];
      
    const outX = this.output.x, outY = this.output.y;

    const X = x / xScaleFactor - (outX * (this.constants.yOffset / 100)) / xScaleFactor;
    const Y = y / yScaleFactor - (outY * (this.constants.xOffset / 100)) / yScaleFactor;

    const xDist = (X - dataIndex) * xScaleFactor;
    const yDist = (Y - val) * yScaleFactor;

    const dist = Math.sqrt(xDist*xDist + yDist*yDist);

    let lineEqn = X * (val - last) - Y - dataIndex * (val - last) + val;
    let lineDist = Math.abs(lineEqn) / Math.sqrt((val - last)*(val - last) + 1)

    if (dist <= this.constants.brushSize) return this.constants.brushColor;
    else if (
      lineDist <= this.constants.lineThickness &&
      X <= dataIndex &&
      X >= dataIndex - 1 &&
      Y <= Math.max(val, last) &&
      Y >= Math.min(val, last)
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
      xOffset,
      yOffset,
      progressiveAxis: progressiveAxis == 'y' ? 1 : 0
    },
    constantTypes: {
      brushColor: 'Array(3)',
      brushSize: 'Float',
      lineThickness: 'Float',
      lineColor: 'Array(3)',
      xOffset: 'Float',
      yOffset: 'Float',
      progressiveAxis: 'Integer'
    }
  })
}

module.exports = getAddDataKernel;