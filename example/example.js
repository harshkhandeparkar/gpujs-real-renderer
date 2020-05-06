const options = {
  canvasTag: 'line-canvas',
  dimensions: [420, 360],

  xScaleFactor: 20,
  yScaleFactor: 0.2,

  bgColor: [0.2, 0.2, 0.2],
  axesColor: [0.2, 1, 1],

  drawsPerFrame: 2, // Draws twice before displaying the pixels (every browser frame)
  timeStep: 1 / 120, // Increases internal time count by 1 / 120 every *draw*

  xOffset: 20, // 20%
  yOffset: 10, // 10%
  
  progressiveAxis: 'x', // x -> Graph moves along x-axis; y -> Graph moves along y-axis
  progressionMode: 'overflow', // continous -> Axis always moves; overfloa -> Axis only moves when space for new data is inadequate;
  progressInterval: 0.4, // Axis moves by one pixel every 0.4 internal time units (Only for continous type)

  brushSize: 2, // The radius of one point of data, in coordinate units
  brushColor: [0.76, 0, 0], // Color of the brush

  lineThickness: 0.03, // Thickness of the line joining points
  lineColor: [0.1, 0.2, 0.8]
}

const LineGraph = new GPUjsRealRenderer.RealLineGraph(options)

LineGraph.draw();

const ComplexGraph = new GPUjsRealRenderer.RealComplexSpace({
  canvasTag: 'complex-canvas',
  xScaleFactor: 1,
  dimensions: [420, 360],
  changeNumbers: (nums, time) => {
    if (nums.final) nums.final.number = new Complex(0, 0);
    for (let num in nums) {
      if (num !== 'final') {
        nums[num].number = nums[num].number.multiply(new Complex(1, Number(num) / 100));
        nums.final.number.add(nums[num].number);
      }
    }
    return nums;
  }
})

window.ComplexGraph = ComplexGraph;
window.Complex = ComplexGraph.Complex;

const k = new Complex(100, Math.PI / 4);
const l = new Complex(80, Math.PI / 8);
const m = new Complex(60, Math.PI / 16);
const final = new Complex(0, 0);

ComplexGraph.draw().watch(k, false, '-1').watch(l, false, '1').watch(m, false, '2').watch(final.add(k).add(l).add(m), true, 'final');

document.getElementById('complex-render').onclick = e => {
  e.preventDefault();

  if (ComplexGraph._doRender) {
    ComplexGraph.stopRender();
    document.getElementById('complex-render').innerText = 'Start Rendering';
  }
  else {
    ComplexGraph.startRender();
    document.getElementById('complex-render').innerText = 'Stop Rendering';
  }
}


// if (LineGraph.progressionMode == 'continous') {
  // document.getElementById('line-btn').onclick = e => {
  //   e.preventDefault();

  //   if (LineGraph.doRender) {
  //     LineGraph.stopRender();
  //     document.getElementById('line-btn').innerText = 'Start Rendering';
  //   }
  //   else {
  //     LineGraph.startRender();
  //     document.getElementById('line-btn').innerText = 'Stop Rendering';
  //   }
  // }
// }
// else document.getElementById('line-btn').disabled = true;

document.getElementById('add').onclick = e => {
  e.preventDefault();

  if (typeof document.getElementById('value').value != 'undefined') {
    LineGraph.addData(document.getElementById('value').value);
  }
}
