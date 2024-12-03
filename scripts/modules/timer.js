import { Communicator } from "./communicator.js";
import { pad } from "./utilities.js";

/**
 * Manages session time and interacts with DOM elements related to it.
 * @extends Communicator
 */
export class Timer extends Communicator {
  /**
   * A segment of time in which the active session was running. Contains a minimum of one property
   * with the key `start`, which is assigned the return value of `performance.now()` when a session
   * is started. A second property with the key `end`, is assigned the return value of
   * `performance.now()` when a session is paused.
   * @memberof Timer
   * @property {number} start - The time at which the session was started.
   * @property {number} end - The time at which the session was paused.
   * @typedef {Object.<string, number>} SessionSegment
   */

  /**
   * A representation of the session state. `null` indicates that a session has not been started or
   * has ended. A numeric ID indicates that a session has started. `false` indicates that a session
   * is paused.
   * @memberof Timer
   * @typedef {(null|number|false)} Interval
   */

  /**
   * A high resolution numeric timestamp returned by `performance.now`.
   * @memberOf Timer
   * @typedef {number} Timestamp
   */

  /**
   * @property {Element} clock - Displays the [elapsed session time]{@link Timer#seconds(0)}.
   * @property {Element} start - Can be clicked to [start a session]{@link Timer#startElementClick}.
   * @property {Element} pause - Can be clicked to [pause a session]{@link Timer#pauseElementClick}.
   * @property {Element} end - Can be clicked to [end a session]{@link Timer#endElementClick}.
   * @property {Element} timescaleMultiplier - Displays the session
   * [timescale multiplier]{@link Timer#timescaleMultiplier(0)}.
   * @property {Element} timescaleMultiplierDecrease - Can be clicked to
   * [decrease the timescale multiplier]{@link Timer#timescaleMultiplierDecreaseElementClick}.
   * @property {Element} timescaleMultiplierIncrease - Can be clicked to
   * [increase the timescale multiplier]{@link Timer#timescaleMultiplierIncreaseElementClick}.
   * @type {Object.<string, Element>}
   */
  domElements = {
    clock: document.getElementById("clock"),
    start: document.getElementById("start"),
    pause: document.getElementById("pause"),
    end: document.getElementById("end"),
    timescaleMultiplier: document.getElementById("timescaleMultiplier"),
    timescaleMultiplierDecrease: document.getElementById("timescaleMultiplierDecrease"),
    timescaleMultiplierIncrease: document.getElementById("timescaleMultiplierIncrease"),
  };
  static name = "Timer";
  name = "Timer";

  constructor(messageProxy) {
    super(messageProxy);
  }

  initialize = () => {
    this.seconds = 0;
    this.interval = null;
    this.timescaleMultiplier = 1;
    this.sessionSegments = [];
  }

  #seconds;

  /**
   * @instance
   * @memberof Timer
   * @method
   * @returns {number} The session seconds set by [Timer.seconds]{@link Timer#seconds(1)}.
   * @summary `getter`
   * @variation 0
   */
  get seconds() {
    return this.#seconds;
  }

  /**
   * Sets the session seconds, and updates
   * [Timer.domElements.clock.textContent]{@link Timer#domElements}.
   * @instance
   * @memberof Timer
   * @method
   * @param {number} seconds - The session seconds.
   * @summary `setter`
   * @variation 1
   */
  set seconds(seconds) {
    this.#seconds = seconds;
    this.updateClockElementText();
    this.send("seconds", this.seconds);
  }

  /**
   * Sets [Timer.domElements.clock.textContent]{@link Timer#domElements} to the return value of
   * [Timer.seconds]{@link Timer#seconds(0)} as formatted by
   * [Timer.formatTime]{@link Timer#formatTime}.
   */
  updateClockElementText() {
    this.domElements.clock.textContent = Timer.formatTime(this.#seconds);
  }

  #interval;

  /**
   * @instance
   * @memberof Timer
   * @method
   * @returns {Interval} The session interval state set by
   * [Timer.interval]{@link Timer#interval(1)}.
   * @summary `getter`
   * @variation 0
   */
  get interval() {
    return this.#interval;
  }

  /**
   * Calls `clearInterval` if the return value of [set interval]{@link Timer#interval(0)} is an
   * interval ID, then conditionally sets the session interval state. If the `interval` parameter
   * value is `true`, calls `setInterval` and sets the state to the interval ID `setInterval`
   * returns, else to the `interval` parameter value.
   * @instance
   * @memberof Timer
   * @method
   * @param {(null|boolean|number)} interval - The interval state to set the interval to.
   * @summary `setter`
   * @variation 1
   */
  set interval(interval) {
    if (this.interval) {
      // Clear the existing interval to stop its calls
      clearInterval(this.interval);
    }

    if (interval) {
      // The session is started
      this.#interval = setInterval(
        () => this.seconds += 1, (1000 / this.timescaleMultiplier)
      );
      this.send("process", "start");
    } else {
      // Send signals if process state changed
      if (interval === null && interval !== this.interval) {
        this.send("process", "end");
      } else if (interval === false && interval !== this.interval) {
        this.send("process", "pause");
      }

      this.#interval = interval;
    }
  }

  #timescaleMultiplier;

  /**
   * @instance
   * @memberof Timer
   * @method
   * @returns {number} The session timescale multiplier set by
   * [Timer.timescaleMultiplier]{@link Timer#timescaleMultiplier(1)}.
   * @summary `getter`
   * @variation 0
   */
  get timescaleMultiplier() {
    return this.#timescaleMultiplier;
  }

  /**
   * Sets the session timescale multiplier if the `timeScaleMultiplier` parameter is greater than 0,
   * then updates [Timer.domElements.timescaleMultiplier.textContent]{@link Timer#domElements}.
   * @memberof Timer
   * @method
   * @param {number} timescaleMultiplier - The number to set the session timescale multiplier to.
   * @summary `setter`
   * @variation 1
   */
  set timescaleMultiplier(timescaleMultiplier) {
    if (timescaleMultiplier > 0) {
      const oldTimeScaleMultiplier = this.timescaleMultiplier;
      this.#timescaleMultiplier = timescaleMultiplier;

      if (this.interval) {
        this.interval = true;
      }

      // Don't send if timescaleMultiplier didn't change
      if (oldTimeScaleMultiplier !== this.timescaleMultiplier) {
        this.send("timescaleMultiplier", this.timescaleMultiplier);
      }

      this.updateTimescaleMultiplierElementText();
    }
  }

  /**
   * Sets [Timer.domElement.timescaleMultiplier.textContent]{@link Timer#domElements} to
   * the return value of [Timer.timeScaleMultiplier]{@link Timer#timescaleMultiplier(0)}.
   */
  updateTimescaleMultiplierElementText() {
    this.domElements.timescaleMultiplier.textContent = this.#timescaleMultiplier.toString();
  }

  #sessionSegments;

  /**
   * @instance
   * @memberof Timer
   * @method
   * @returns {Array.<SessionSegment>} An array of [SessionSegments]{@link Timer.SessionSegment}.
   * @summary `getter`
   * @variation 0
   */
  get sessionSegments() {
    return this.#sessionSegments;
  }

  /**
   * Adds a [Timestamp]{@link Timer.Timestamp} that represents the start or end value of a
   * [SessionSegment]{@link Timer.SessionSegment}. Each session segment is initially assigned the
   * `start` property. The `end` property is assigned when the session is paused. When the session
   * is restarted, the setter creates a new `SessionSegment` and
   * [adds it to Timer.sessionSegments]{@link Timer#sessionSegments(1)}. When the session ends,
   * [Timer.sessionSegments is set to an empty array]{@link Timer#sessionSegments(1)}.
   * @instance
   * @memberof Timer
   * @method
   * @param {Array|number} value - An empty array or a number representing a timestamp.
   * @summary `setter`
   * @variation 1
   */
  set sessionSegments(value) {
    if (Array.isArray(value) && value.length === 0) {
      // The session has ended
      this.#sessionSegments = value;
    } else if (value.length > 0) {
      throw new Error(`Invalid array length for value: ${value.length}`);
    } else {
      if (isNaN(value)) {
        throw new Error(`Invalid type for value: ${typeof(value)}`);
      }

      if (this.#sessionSegments.length === 0) {
        // A new session has started
        // Add the new start time to the session times
        this.#sessionSegments.push({start: value});
      } else {
        const index = this.#sessionSegments.length - 1;
        const lastSessionTime = this.#sessionSegments[index];

        if (lastSessionTime.hasOwnProperty("end")) {
          // Since the last session time has an end, the session is being restarted
          // Add a new session start time
          this.#sessionSegments.push({start: value});
        } else {
          // Since the session time doesn't have an end, the session is being paused
          // Add the pause time to the last session time
          this.#sessionSegments[index].end = value;
        }
      }
    }
    this.send("sessionSegments", this.sessionSegments);
  }

  /**
   * Calculate minutes and remainder seconds of `seconds`, and left-pad both.
   * @param {number} seconds - The number of seconds to format as a time string.
   * @returns {string} A time string formatted as `mm:ss`.
   */
  static formatTime(seconds) {
    const paddedMinutes = pad(Math.floor(seconds / 60), 2);
    const paddedSeconds = pad(seconds % 60, 2);

    return `${paddedMinutes}:${paddedSeconds}`;
  }

  /**
   * A {@link Communicator} delegatee that starts a session.
   * @method
   */
  startElementClick = () => {
    if (!this.interval) {
      this.interval = true;
      this.sessionSegments = performance.now();
    }
  }

  /**
   * A {@link Communicator} delegatee that pauses a session.
   * @method
   */
  pauseElementClick = () => {
    if (this.interval) {
      this.interval = false;
      this.sessionSegments = performance.now();
    }
  }

  /**
   * A {@link Communicator} delegatee that ends a session.
   * @method
   */
  endElementClick = () => {
    this.interval = null;
    this.seconds = 0;
    this.timescaleMultiplier = 1;
    this.sessionSegments = [];
  }

  /**
   * A {@link Communicator} delegatee that decreases the session timescale multiplier.
   * @method
   */
  timescaleMultiplierDecreaseElementClick = () => {
    this.timescaleMultiplier -= 1;
  }

  /**
   * A {@link Communicator} delegatee that increases the timescale multiplier.
   * @method
   */
  timescaleMultiplierIncreaseElementClick = () => {
    this.timescaleMultiplier += 1
  }
}
