// Line Graph
const options = {
  canvas: document.getElementById('line-canvas'),
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
  progressionMode: 'squeeze', // continous -> Axis always moves; overflow -> Axis only moves when space for new data is inadequate;
  progressInterval: 0.4, // Axis moves by one pixel every 0.4 internal time units (Only for continous type)

  brushSize: 2, // The radius of one point of data, in coordinate units
  brushColor: [0.76, 0, 0], // Color of the brush

  lineThickness: 0.03, // Thickness of the line joining points
  lineColor: [0.1, 0.2, 0.8]
}

const LineGraph = new GPUjsRealRenderer.RealLineGraph(options);
const progressModeSelector = document.querySelector('#progress-mode');
// progressModeSelector.oninput = e => {
//   e.preventDefault();
//   options.progressionMode = progressModeSelector.value;
//   LineGraph.progressionMode = options.progressionMode;
//   LineGraph.reset();
// }

LineGraph.draw(); // To draw the initial axes


document.getElementById('add').onclick = e => {
  e.preventDefault();

  if (typeof document.getElementById('value').value != 'undefined') {
    LineGraph.addData(document.getElementById('value').value);
  }
}

// Fourier Series
const ComplexGraph = new GPUjsRealRenderer.RealComplexSpace({
  canvas: document.getElementById('complex-canvas'),
  xScaleFactor: 2,
  yScaleFactor: 2,
  brushSize: 1.5,
  timeStep: 1 / 1000,
  drawsPerFrame: 5,
  lineThickness: 0.8,
  lineColor: [0.8, 0, 0],
  dimensions: [420, 360],
  changeNumbers: (nums, time, timeStep) => {
    if (nums.find(num => num.name == 'final')) nums.find(num => num.name == 'final').number = new Complex(0, 0);

    for (let i = complexLimits[0]; i <= complexLimits[1]; i++) {
      if (nums[i]) {
        const n = nums[i];

        n.number = n.number.multiply(new Complex(1, n.attributes.period * timeStep));
        nums.final.number.add(n.number);
      }
    }

    let partialSum = new Complex(0, 0);
    for (let i = complexLimits[0]; i <= complexLimits[1]; i++) {
      if (nums[i]) {
        const newPartial = {
          name: `p${i}`,
          number: new Complex(partialSum.r, partialSum.theta),
          show: true,
          persistent: false,
          interpolate: true,
          interpolateTo: new Complex(partialSum.r, partialSum.theta).add(nums[i].number)
        };

        if (nums.find(num => num.name == `p${i}`)) nums.find(num => num.name == `p${i}`) = newPartial;
        else nums.push(newPartial);

        nums.push()

        partialSum.add(nums[i].number)
      }
    }
    return nums;
  }
})

window.ComplexGraph = ComplexGraph;
window.Complex = ComplexGraph.Complex;

// Random Nos
let clockwise = [];
let anticlockwise = [];

function generateRandomSeries(upperBound = 10) {
  clockwise = [];
  anticlockwise = [];
  for (let i = 0; i <= upperBound; i++) {
    clockwise.push(
      new Complex(Math.random() * 100 / upperBound, Math.PI / 2/* * 2 * Math.random()*/)
    )
  }
  
  for (let i = 0; i <= upperBound; i++) {
    anticlockwise.push(
      new Complex(Math.random() * 100 / upperBound, Math.PI / 2 /* * 2 * Math.random()*/)
    )
  }
}

generateRandomSeries();

const final = new Complex(0, 0);
window.complexLimits = [
  -clockwise.length,
  anticlockwise.length - 1
]

ComplexGraph
  .draw()
  .watch('final', final, true, true, false, null);

anticlockwise.forEach((num, i) => {
  ComplexGraph.watch(`${i}`, num, false, false, false, null, {period: i})
})

clockwise.forEach((num, i) => {
  ComplexGraph.watch(`${-i - 1}`, num, false, false, false, null, {period: -i - 1})
})

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

document.getElementById('complex-randomize').onclick = e => {
  e.preventDefault();

  ComplexGraph.stopRender().clearWatched().reset();

  generateRandomSeries();

  const final = new Complex(0, 0);

  window.complexLimits = [
    -clockwise.length,
    anticlockwise.length - 1
  ]

  ComplexGraph
    .draw()
    .watch('final', final, true, true, false, null);

  anticlockwise.forEach((num, i) => {
    ComplexGraph.watch(`${i}`, num, false, false, false, null, {period: i})
  })

  clockwise.forEach((num, i) => {
    ComplexGraph.watch(`${-i - 1}`, num, false, false, false, null, {period: -i - 1})
  })

  setTimeout(() => {
    ComplexGraph.startRender();
    document.getElementById('complex-render').innerText = 'Stop Rendering';
  }, 1000)

}