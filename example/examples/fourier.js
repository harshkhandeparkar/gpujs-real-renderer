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
    if (nums.find(num => num.name == 'final')) nums[nums.findIndex(num => num.name == 'final')].number = new Complex(0, 0);

    for (let i = complexLimits[0]; i <= complexLimits[1]; i++) {
      if (nums.find(num => num.name == i)) {
        const n = nums.find(num => num.name == i);

        n.number = n.number.multiply(new Complex(1, n.attributes.period * timeStep));
        nums[nums.findIndex(num => num.name == 'final')].number.add(n.number);
      }
    }

    let partialSum = new Complex(0, 0);
    for (let i = complexLimits[0]; i <= complexLimits[1]; i++) {
      if (nums.find(num => num.name == i)) {
        const newPartial = {
          name: `p${i}`,
          number: new Complex(partialSum.r, partialSum.theta),
          show: true,
          persistent: false,
          interpolate: true,
          interpolateTo: new Complex(partialSum.r, partialSum.theta).add(nums.find(num => num.name == i).number)
        }

        if (nums.find(num => num.name == `p${i}`)) nums[nums.findIndex(num => num.name == `p${i}`)] = newPartial;
        else nums.push(newPartial);

        partialSum.add(nums.find(num => num.name == i).number);
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
