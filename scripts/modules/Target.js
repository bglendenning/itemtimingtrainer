/** @module modules/Target */

import { Communicator } from "./Communicator.js";
import { Timer } from "./Timer.js";

/**
 * A series of accepted click times.
 * @typedef {Array<module:modules/Timer~Timestamp>} ClickTimes
 */

/**
 * The difference between two click times.
 * @typedef {number} ClickInterval
 */

/**
 * A series of click intervals recorded in a session.
 * @typedef {Array.<ClickInterval>} ClickIntervals
 */

/**
 * Manages the randomized target and interacts and interacts with DOM elements related to it.
 * @extends Communicator
 */
export class Target extends Communicator {
  /**
   * @property {HTMLDivElement} target - Can be clicked to score points.
   * @property {HTMLInputElement} targetVisibility - Can be clicked to enable or disable the target.
   * @property {HTMLAnchorElement} averageClick - Displays the average time, in milliseconds, that a
   * target click was accepted following the target was displayed.
   * @property {HTMLAnchorElement} start - Can be clicked to reset the target position and dimensions.
   * @property {HTMLAnchorElement} end - Can be clicked to reset the target position and dimensions, and
   * the average click time.
   * @type {Object.<string, HTMLElement>}
   */
  domElements = {
    target: document.getElementById("target"),
    targetVisibility: document.getElementById("targetVisibility"),
    averageClick: document.getElementById("averageClick"),
    start: document.getElementById("start"),
    end: document.getElementById("end"),
  };

  /**
   * Contains default target DOM element configuration.
   * @property {number} left - The left position.
   * @property {number} top - The top position.
   * @property {number} side - The width and height dimension.
   * @property {string} visibility - The visibility.
   */
  defaults = {
    left: 50,
    top: 50,
    side: 25,
    visibility: "visible",
  };

  /**
   * The points a target click is worth. This value is multiplied by the timescale multiplier when
   * points are scored.
   * @type {number}
   */
  pointsValue = 1;
  static name = "Target";
  name = "Target";

  /** @see {@link Communicator} */
  constructor(messageProxy) {
    super(messageProxy);
  }

  /**
   * Sets the initial state.
   * @method
   */
  initialize = () => {
    this.targetElementLeft = this.defaults.left;
    this.targetElementTop = this.defaults.top;
    this.targetElementWidth = this.defaults.side;
    this.targetElementHeight = this.defaults.side;
    this.targetElementVisibility = this.defaults.visibility;
    this.clickTimes = [];
    this.clickIntervals = [];
  }

  /**
   * Sets the target DOM element left position.
   * @method
   * @param {number} left - The target left position.
   * @variation 1
   */
  set targetElementLeft(left) {
    this.domElements.target.style.left = `${left}px`;
  }

  /**
   * Sets the target DOM element top position.
   * @method
   * @param {number} top - The number to set the top position to.
   * @variation 1
   */
  set targetElementTop(top) {
    this.domElements.target.style.top = `${top}px`;
  }

  /**
   * Gets the target DOM element width.
   * @member
   * @type {number}
   * @variation 0
   */
  get targetElementWidth() {
    return parseInt(this.domElements.target.style.width, 10);
  }

  /**
   * Sets the target DOM element width.
   * @method
   * @param {number} width - The number to set the width dimension to.
   * @variation 1
   */
  set targetElementWidth(width) {
    this.domElements.target.style.width = `${width}px`;
  }

  /**
   * Sets the target DOM element height.
   * @method
   * @param {number} height - The number to set the height dimension to.
   * @variation 1
   */
  set targetElementHeight(height) {
    this.domElements.target.style.height = `${height}px`;
  }

  /**
   * Gets the target DOM element visibility.
   * @member
   * @type {boolean}
   * @variation 0
   */
  get targetElementVisibility() {
    return this.domElements.targetVisibility.checked;
  }

  /**
   * Sets the target DOM element visibility.
   * @method
   * @param {boolean} visible - True if visible, else false.
   * @variation 1
   */
  set targetElementVisibility(visible) {
    this.domElements.targetVisibility.checked = visible
    this.domElements.target.style.visibility = this.targetElementVisibility ? "visible" : "hidden";
    this.send("targetElementVisibility", visible);
  }

  /**
   * Sets random target positions within the browser window.
   * @method
   */
  setRandomTargetElementPositions() {
    const maxLeft = window.innerWidth - this.targetElementWidth * 2;
    const maxTop = window.innerHeight - this.targetElementWidth * 2;
    this.targetElementLeft = Math.floor((Math.random() * maxLeft) + this.targetElementWidth);
    this.targetElementTop = Math.floor((Math.random() * maxTop) + this.targetElementWidth);
  }

  /**
   * Sets random target dimensions to a minimum of half the default target side value and a maximum
   * of triple the side value plus half the side value.
   */
  setRandomTargetElementDimensions() {
    const value = Math.floor(
      Math.random() * (this.defaults.side * 3) + (this.defaults.side / 2)
    );
    this.targetElementWidth = value;
    this.targetElementHeight = value;
  }

  #clickTimes;

  /**
   * A first-in, first-out queue of session click times. The queue has a maximum length of 2.
   * @member
   * @type {Array.<Timer:Timestamp>}
   * @variation 0
   */
  get clickTimes() {
    return this.#clickTimes;
  }

  /**
   * Sets the session click times. When the maximum length of click times is reached, a
   * click interval is created from the difference between those two click times, then the 0-index
   * click time is removed. An empty array can be provided in place of a timestamp to clear the
   * click times.
   * @method
   * @param {number|module:modules/Timer:Timestamp|Array} value - A click time or empty array.
   * @variation 1
   */
  set clickTimes(value) {
    // Try to empty the click time queue
    if (Array.isArray(value)) {
      if (value.length > 0) {
        throw new Error(`Invalid array length for value: ${value.length}`);
      }

      this.#clickTimes = value;
    // Process the new click time
    } else {
      this.#clickTimes.push(value);

      if (this.#clickTimes.length === 2) {
        // Generate a click interval from two sequential click times
        this.clickIntervals = this.clickTimes;
        // Remove the older click time to open a slot for the next click time
        this.#clickTimes.splice(0, 1);
      }
    }
  }

  #clickIntervals = [];

  /**
   * The average of the session click intervals in milliseconds
   * @member
   * @type {number}
   * @variation 0
   */
  get clickIntervals() {
    let clickIntervalSum = this.#clickIntervals.reduce(
      (totalTime, recordedTime) => totalTime + recordedTime, 0
    );

    // Don't divide by 0
    if (this.#clickIntervals.length > 0) {
      return Math.round(clickIntervalSum / this.#clickIntervals.length);
    }

    return clickIntervalSum;
  }

  /**
   * Calculates the interval between two sequential click times, calculates the duration for which
   * the session was paused between the clicks times, subtracts the paused duration from the click
   * interval, then adds the resulting click interval to the click intervals.
   * @method
   * @param {(number|ClickTimes)} clickTimes - A full or empty click times queue.
   * @variation 1
   */
  set clickIntervals(clickTimes) {
    if (Array.isArray(clickTimes) && clickTimes.length === 0) {
      // Reset `#clickIntervals` if `clickTimes` is empty
      this.#clickIntervals = [];
    } else if (clickTimes.length < 2 || clickTimes.length > 2) {
      throw new Error(`Invalid array length for clickTimes: ${clickTimes.length}`);
    } else {
      if (clickTimes.filter((time) => isNaN(time)).length > 0) {
        throw new Error(
          `Invalid type(s) for clickTimes: ${typeof(clickTimes[0])}, ${typeof(clickTimes[1])}`
        );
      } else if (clickTimes[1] - clickTimes[0] < 0) {
        throw new Error(`Invalid time sequence for clickTimes: ${clickTimes[1]}, ${clickTimes[2]}`);
      }

      const pauseDuration = this.getPauseDurationBetweenClicks(clickTimes[0], clickTimes[1]);
      this.#clickIntervals.push(clickTimes[1] - clickTimes[0] - pauseDuration);
      this.updateAverageClickElement();
    }
  }

  /**
   * Updates the average click DOM element content.
   */
  updateAverageClickElement() {
    this.domElements.averageClick.textContent = this.clickIntervals.toString();
  }

  /**
  * Sum the duration of time that the session was paused between two sequential click times.
  * @param {module:modules/Timer:Timestamp} startClick - The first accepted click.
  * @param {module:modules/Timer:Timestamp} endClick - The last accepted click.
  * @returns {number} The summed pause durations in milliseconds.
  */
  getPauseDurationBetweenClicks(startClick, endClick) {
    const sessionSegments = this.state[Timer].sessionSegments;

    return sessionSegments.reduce((totalTime, sessionTime, index) => {
      const nextIndex = index + 1;

      if (nextIndex in sessionSegments) {
        if (sessionTime.end > startClick && sessionSegments[nextIndex].start < endClick) {
          return totalTime + sessionSegments[nextIndex].start - sessionTime.end;
        }
      }
      return totalTime;
    }, 0);
  }

  /**
   * An event listener delegatee that adds a click time randomizes the target DOM element  position
   * and dimensions, then adds points to the session score.
   * @method
   */
  targetElementClick = () => {
    if (this.state[Timer].process === "start") {
      this.clickTimes = performance.now();
      this.setRandomTargetElementDimensions();
      this.setRandomTargetElementPositions();
      this.send("points", this.pointsValue);
    }
  }

  /**
   * An event listener delegatee that sets the target DOM element to the target visibility.
   * @method
   */
  targetVisibilityElementClick = () => {
    this.targetElementVisibility = this.targetElementVisibility;

    if (this.state[Timer].process === "start") {
        this.clickTimes = performance.now();
    }
  }

  /**
  * Handles the sesssion start, pause, and end states.
  * @method
  */
  processReceive = (object, property, value) => {
    switch (value) {
      case "start":
        // Add a clickTime when a new session is started
        if (this.clickTimes.length === 0 && this.targetElementVisibility) {
          this.clickTimes = performance.now();
        }

        this.setRandomTargetElementDimensions();
        this.setRandomTargetElementPositions();

        break;
      case "pause":
        this.setRandomTargetElementDimensions();
        this.setRandomTargetElementPositions();

        break;
      case "end":
        this.initialize();
    }
  }
}
