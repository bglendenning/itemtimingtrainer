/** @module modules/Timer */

import { Communicator } from "./Communicator.js";
import { pad } from "./utilities.js";

/**
 * A segment of time in which the active session was running. Contains a minimum of one property
 * with the key `start`, which is assigned the return value of `performance.now()` when a session
 * is started. A second property with the key `end`, is assigned the return value of
 * `performance.now()` when a session is paused.
 * @property {number} start - The time at which the session was started.
 * @property {number} end - The time at which the session was paused.
 * @typedef {Object.<string, number>} SessionSegment
 */

/**
 * A representation of the session state. `null` indicates that a session has not been started or
 * has ended. A numeric ID indicates that a session has started. `false` indicates that a session
 * is paused.
 * @typedef {(null|number|false)} Interval
 */

/**
 * A numeric timestamp returned by `performance.now()`.
 * @typedef {number} Timestamp
 */

/**
 * Manages session time and interacts with DOM elements related to it.
 * @extends Communicator
 */
export class Timer extends Communicator {
  /**
   * @property {Element} clock - Displays the elapsed session time.
   * @property {Element} start - Can be clicked to start a session.
   * @property {Element} pause - Can be clicked to pause a session.
   * @property {Element} end - Can be clicked to end a session.
   * @property {Element} timescaleMultiplier - Displays the session timescale multiplier.
   * @property {Element} timescaleMultiplierDecrease - Can be clicked to decrease the timescale
   * multiplier.
   * @property {Element} timescaleMultiplierIncrease - Can be clicked to increase the timescale
   * multiplier.
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

  /** @see {@link Communicator} */
  constructor(messageProxy) {
    super(messageProxy);
  }

  /**
   * Sets the initial state.
   * @method
   */
  initialize = () => {
    this.seconds = 0;
    this.interval = null;
    this.timescaleMultiplier = 1;
    this.sessionSegments = [];
  }

  #seconds;

  /**
   * The session seconds.
   * @member
   * @type {number}
   * @variation 0
   */
  get seconds() {
    return this.#seconds;
  }

  /**
   * Sets the session seconds, then updates the clock DOM element.
   * @method
   * @param {number} seconds - The session seconds.
   * @variation 1
   */
  set seconds(seconds) {
    this.#seconds = seconds;
    this.updateClockElementText();
    this.send("seconds", this.seconds);
  }

  /**
   * Sets the clock DOM element to the formatted value of the session seconds.
   * @see {@link Timer.formatTime}.
   */
  updateClockElementText() {
    this.domElements.clock.textContent = Timer.formatTime(this.#seconds);
  }

  #interval;

  /**
   * The session interval.
   * @member
   * @type {setInterval|false|null}
   * @variation 0
   */
  get interval() {
    return this.#interval;
  }

  /**
   * Conditionally clears the session interval, then conditionally sets the interval depending on
   * the value of the interval parameter.
   * @method
   * @param {(null|boolean|number)} interval - The interval state to set the interval to.
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
   * The session timescale multiplier.
   * @member
   * @type {number}
   * @variation 0
   */
  get timescaleMultiplier() {
    return this.#timescaleMultiplier;
  }

  /**
   * Conditionally sets the timescale multiplier, then updates the timescale multiplier DOM element.
   * @method
   * @param {number} timescaleMultiplier - The number to set the session timescale multiplier to.
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
   * Updates the timescale multiplier DOM element.
   */
  updateTimescaleMultiplierElementText() {
    this.domElements.timescaleMultiplier.textContent = this.#timescaleMultiplier.toString();
  }

  #sessionSegments;

  /**
   * An array with a maximum length of 2. Index 0 represents the time at which a session started.
   * The optional index 1 represents the time at which the session paused.
   * @member
   * @type {Array.<SessionSegment>}
   * @variation 0
   */
  get sessionSegments() {
    return this.#sessionSegments;
  }

  /**
   * Adds a timestamp that represents the start or end value of a session segment. Each session
   * segment is initially assigned the `start` property. The `end` property is assigned when the
   * session is paused. When the session is restarted, creates a new session segment and adds it to
   * the session segments. When the session ends, sets the session segments to an empty array.
   * @method
   * @param {Array|number} value - An empty array or a number representing a timestamp.
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
   * Calculates minutes and remainder seconds of `seconds`, then left-pads both.
   * @param {number} seconds - The number of seconds to format as a time string.
   * @returns {string} A time string formatted as `mm:ss`.
   */
  static formatTime(seconds) {
    const paddedMinutes = pad(Math.floor(seconds / 60), 2);
    const paddedSeconds = pad(seconds % 60, 2);

    return `${paddedMinutes}:${paddedSeconds}`;
  }

  /**
   * An event listener delegatee that starts a session.
   * @method
   */
  startElementClick = () => {
    if (!this.interval) {
      this.interval = true;
      this.sessionSegments = performance.now();
    }
  }

  /**
   * An event listener delegatee that pauses a session.
   * @method
   */
  pauseElementClick = () => {
    if (this.interval) {
      this.interval = false;
      this.sessionSegments = performance.now();
    }
  }

  /**
   * An event listener delegatee that ends a session.
   * @method
   */
  endElementClick = () => {
    this.interval = null;
    this.seconds = 0;
    this.timescaleMultiplier = 1;
    this.sessionSegments = [];
  }

  /**
   * An event listener delegatee that decreases the session timescale multiplier.
   * @method
   */
  timescaleMultiplierDecreaseElementClick = () => {
    this.timescaleMultiplier -= 1;
  }

  /**
   * An event listener delegatee that increases the timescale multiplier.
   * @method
   */
  timescaleMultiplierIncreaseElementClick = () => {
    this.timescaleMultiplier += 1
  }
}
