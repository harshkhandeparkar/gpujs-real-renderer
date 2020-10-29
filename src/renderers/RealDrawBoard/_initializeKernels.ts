import { RealDrawBoard } from './RealDrawBoard';

import { getPlotKernel } from '../../kernels/plot';
import { getInterpolateKernel } from '../../kernels/interpolate';

export function _initializeKernels(this: RealDrawBoard) {
  this._plotKernel = getPlotKernel(
    this.gpu,
    this.dimensions,
    this.xScaleFactor,
    this.yScaleFactor,
    this.xOffset,
    this.yOffset
  )

  this._strokeKernel = getInterpolateKernel(
    this.gpu,
    this.dimensions,
    this.xScaleFactor,
    this.yScaleFactor,
    this.xOffset,
    this.yOffset
  )
}
