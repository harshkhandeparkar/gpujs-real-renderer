import { RealDrawBoard } from './RealDrawBoard';

export function _addDOMEvents(this: RealDrawBoard) {
  this.canvas.addEventListener('mousedown', this._mouseDownEventListener);
  this.canvas.addEventListener('mouseup', this._mouseUpEventListener);
  this.canvas.addEventListener('mouseenter', this._mouseEnterEventListener);
  this.canvas.addEventListener('mouseleave', this._mouseLeaveEventListener);

  this.canvas.addEventListener('touchstart', this._touchStartEventListener);
  this.canvas.addEventListener('touchmove', this._touchMoveEventListener);
  this.canvas.addEventListener('touchend', this._touchEndEventListener);
}

export function _removeDOMEvents(this: RealDrawBoard) {
  this.canvas.removeEventListener('mousedown', this._mouseDownEventListener);
  this.canvas.removeEventListener('mouseup', this._mouseUpEventListener);
  this.canvas.removeEventListener('mouseenter', this._mouseEnterEventListener);
  this.canvas.removeEventListener('mouseexit', this._mouseLeaveEventListener);

  this.canvas.removeEventListener('touchstart', this._touchStartEventListener);
  this.canvas.removeEventListener('touchmove', this._touchMoveEventListener);
  this.canvas.removeEventListener('touchend', this._touchEndEventListener);
}
