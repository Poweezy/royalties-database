/**
 * IdleTimer.js
 *
 * A module to monitor user activity and trigger callbacks for idle state and session logout.
 */
export class IdleTimer {
  constructor({ idleTimeout, onIdle, onActive }) {
    this.idleTimeout = idleTimeout;
    this.onIdle = onIdle;
    this.onActive = onActive;

    this.timeoutId = null;
    this.isIdle = false;

    this.eventHandler = this.reset.bind(this);
    this.events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
  }

  start() {
    this.reset();
    this.events.forEach(event => {
      window.addEventListener(event, this.eventHandler, true);
    });
  }

  stop() {
    clearTimeout(this.timeoutId);
    this.events.forEach(event => {
      window.removeEventListener(event, this.eventHandler, true);
    });
  }

  reset() {
    if (this.isIdle) {
      this.isIdle = false;
      if (this.onActive) {
        this.onActive();
      }
    }

    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      this.isIdle = true;
      if (this.onIdle) {
        this.onIdle();
      }
    }, this.idleTimeout);
  }
}
