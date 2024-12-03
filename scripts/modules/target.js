import { Communicator } from "./communicator.js";
import { Timer } from "./timer.js";

/**
 * Manages the randomized target and interacts and interacts with DOM elements related to it.
 * @extends Communicator
 */
export class Target extends Communicator {
  /**
   * A number representing a dimension in pixels.
   * @memberof Target
   * @typedef {number} Pixel
   */

  /**
   * The return value of `performance.now()` as recorded at the time of an accepted click.
   * @memberof Target
   * @typedef {Timer.Timestamp} ClickTime
   */

  /**
   * A sequential array of {@link Target.ClickTime} values recorded in a session.
   * @memberof Target
   * @typedef {Array<Target.ClickTime>} ClickTimes
   */

  /**
   * An interval of time measured between clicks accepted by the
   * [Target.domElements.target]{@link Target#domElements} event delegatee.
   * @memberof Target
   * @typedef {Timer.Timestamp} ClickInterval
   */

  /**
   * A sequential array of {@link Target.ClickInterval} values recorded in a session.
   * @memberof Target
   * @typedef {Target.ClickInterval} ClickIntervals
   */

  /**
   * @property {Element} target - Can be clicked to score points. Its positions and dimensions are
   * randomized after accepted clicks.
   * @property {Element} targetVisibility - Can be clicked to enable or disable the target. Enabling the
   * target sets the DOM element's `visibility` style to _visible_; disabling to _hidden_.
   * @property {Element} averageClick - Displays the average time, in milliseconds, that a target
   * click was accepted following the target being presented.
   * @property {Element} start - Can be clicked to reset the target position and dimensions, and
   * record the initial click time.
   * @property {Element} end - Can be clicked to reset the target position and dimensions, and the
   * average click time.
   * @type {Object.<string, Element>}
   */
  domElements = {
    target: document.getElementById("target"),
    targetVisibility: document.getElementById("targetVisibility"),
    averageClick: document.getElementById("averageClick"),
    start: document.getElementById("start"),
    end: document.getElementById("end"),
  };

  /**
   * Contains default target DOM element geometry configuration.
   * @property {number} left - Used for the
   * [Target.domElements.target.left]{@link Target#domElements} position.
   * @property {number} top - Used for the
   * [Target.domElements.target.top]{@link Target#domElements} position.
   * @property {number} side - Used for the
   * [Target.domElements.target.width]{@link Target#domElements} and
   * [Target.domElements.targetn.height]{@link Target#domElements} dimensions.
   */

  defaults = {
    left: 50, // Target DOM element left position in pixels
    top: 50, // Target DOM element top position in pixels
    side: 25, // Target DOM element width and height dimensions in pixels
  };

  /**
   * The number of points that the [Target.domElements.target]{@link Target#domElements}
   * [event delegatee]{@link Target#targetElementClick} passes to
   * [Score.addPointsToSessionScore]{@link Score#addPointsToSessionScore} when a click is accepted.
   * @type {number}
   */
  pointsValue = 1;
  static name = "Target";
  name = "Target";

  /**
   * Sets the properties required to initialize the DOM.
   */
  constructor(messageProxy) {
    super(messageProxy);
  }

  initialize = () => {
    this.targetElementLeft = this.defaults.left;
    this.targetElementTop = this.defaults.top;
    this.targetElementWidth = this.defaults.side;
    this.targetElementHeight = this.defaults.side;
    this.targetElementVisibility = this.targetElementVisibility;
    this.clickTimes = [];
  }

  /**
   * @instance
   * @memberof Target
   * @method
   * @returns {number} The [Target.domElements.target.left]{@link Target#domElements}
   * position set by [Target.targetElementLeft]{@link Target#targetElementLeft(1)}.
   * @summary `getter`
   * @variation 0
   */
  #targetElementLeft;

  /**
   * Sets the [Target.domElements.target.left]{@link Target#domElements} position, and
   * [updates]{@link Target#updateTargetElement}
   * [Target.domElements.target]{@link Target#domElements}.
   * @instance
   * @memberof Target
   * @method
   * @param {number} left - The number to set the left position to.
   * @summary `setter`
   * @variation 1
   */
  set targetElementLeft(left) {
    this.#targetElementLeft = left;
    this.updateTargetElement();
  }

  #targetElementTop;

  /**
   * Sets the [Target.domElements.target.top]{@link Target#domElements} position, and
   * [updates]{@link Target#updateTargetElement}
   * [Target.domElements.target]{@link Target#domElements}.
   * @instance
   * @memberof Target
   * @method
   * @param {number} top - The number to set the top position to.
   * @summary `setter`
   * @variation 1
   */
  set targetElementTop(top) {
    this.#targetElementTop = top;
    this.updateTargetElement();
  }

  #targetElementWidth;

  /**
   * Sets the [Target.domElements.target.width]{@link Target#domElements} dimension, and
   * [updates]{@link Target#updateTargetElement}
   * [Target.domElements.target]{@link Target#domElements}.
   * @instance
   * @memberof Target
   * @method
   * @param {number} width - The number to set the width dimension to.
   * @summary `setter`
   * @variation 1
   */
  set targetElementWidth(width) {
    this.#targetElementWidth = width;
    this.updateTargetElement();
  }

  #targetElementHeight;

  /**
   * Sets the [Target.domElements.target.height]{@link Target#domElements} dimension, and
   * [updates]{@link Target#updateTargetElement}
   * [Target.domElements.target]{@link Target#domElements}.
   * @instance
   * @memberof Target
   * @method
   * @param {number} height - The number to set the height dimension to.
   * @summary `setter`
   * @variation 1
   */
  set targetElementHeight(height) {
    this.#targetElementHeight = height;
    this.updateTargetElement();
  }

  #targetElementVisibility;

  /**
   * @instance
   * @memberof Target
   * @method
   * @returns {string} The [Target.domElements.target.visibility]{@link Target#domElements} value.
   * @summary `getter`
   * @variation 0
   */
  get targetElementVisibility() {
    return this.domElements.targetVisibility.checked ? "visible" : "hidden";
  }

  targetElementIsVisible() {
    return this.targetElementVisibility === "visible";
  }

  /**
   * Sets [Target.domElements.target.visibility.checked]{@link Target#domElements}, and
   * [updates]{@link Target#updateTargetElement}
   * [Target.domElements.target]{@link Target#domElements}.
   * @instance
   * @memberof Target
   * @method
   * @param {string} visibility - The value to set the visibility value to.
   * @summary `setter`
   * @variation 1
   */
  set targetElementVisibility(visibility) {
    this.domElements.target.checked = visibility;
    this.updateTargetElement();
    this.send("targetElementVisibility", visibility);
  }

  /**
   * Sets [Target.domElements.target]{@link Target#domElements} styles.
   */
  updateTargetElement() {
    this.domElements.target.style.left = `${this.#targetElementLeft}px`;
    this.domElements.target.style.top = `${this.#targetElementTop}px`;
    this.domElements.target.style.width = `${this.#targetElementWidth}px`;
    this.domElements.target.style.height = `${this.#targetElementHeight}px`;
    this.domElements.target.style.visibility = this.targetElementVisibility;
  }

  /**
   * Sets the target positions to their default values.
   * @method
   */
  resetTargetElementPosition() {
    this.targetElementLeft = this.defaults.left;
    this.targetElementTop = this.defaults.top;
  }

  /**
   * Sets the target dimensions to their default values.
   * @method
   */
  resetTargetElementDimensions() {
    this.targetElementWidth = this.defaults.side;
    this.targetElementHeight = this.defaults.side;
  }

  /**
   * Sets random target positions within the browser window.
   * @method
   */
  setRandomTargetElementPositions() {
    const maxLeft = window.innerWidth - this.#targetElementWidth * 2;
    const maxTop = window.innerHeight - this.#targetElementHeight * 2;
    this.targetElementLeft = Math.floor((Math.random() * maxLeft) + this.#targetElementWidth);
    this.targetElementTop = Math.floor((Math.random() * maxTop) + this.#targetElementHeight);
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
   * Sets [Target.clickTimes]{@link Target#clickTimes(0)} to a first in, first out queue of
   * [Target.ClickTime]{@link Target.ClickTime} values with a maximum length of 2, or clears the
   * click time queue. When the maximum length of click times is set, a
   * [Target.ClickInterval]{@link Target.ClickInterval} is created and added to
   * [Target.clickIntervals]{@link Target#clickIntervals(1)}, then the first click time in the queue
   * is removed. If an empty array is provided for `value`, the click times queue will be cleared.
   * Updates [Timer.domElements.averageClick.element.textContent]{@link Timer#domElements}.
   * @instance
   * @memberof Target
   * @method
   * @param {(number|ClickTimes)} value - A [Target.ClickTime]{@link Target.ClickTime} or an
   * empty array to clear the click times queue.
   * @summary `setter`
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
        this.clickIntervals = this.#clickTimes;
        // Remove the older click time to open a slot for the next click time
        this.#clickTimes.splice(0, 1);
      }
    }
  }

  /**
   * Empties [Target.clickTimes]{@link Target#clickTimes(1)} and
   * [Target.clickIntervals]{@link Target#clickIntervals(1)}, then updates
   * [Target.domElements.averageClick.textContent]{@link Target#domElements}.
   */
  resetClickTimes() {
    this.clickTimes = [];
    this.clickIntervals = [];
    this.updateAverageClickElement();
  }

  #clickIntervals = [];

  /**
   * Sums the {@link Target.ClickIntervals} set by
   * [Target.clickIntervals]{@link Target#clickIntervals(1)} and attempts to average the sum.
   * @instance
   * @memberof Target
   * @method
   * @returns {number} The average of the summed click intervals in milliseconds.
   * @summary `getter`
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
   * interval, then adds the {@link Target.ClickInterval} to the click intervals.
   * @instance
   * @memberof Target
   * @method
   * @param {(number|ClickTimes)} clickTimes - A full or empty
   * [Target.ClickTimes]{@link Target#ClickTimes(1)} queue.
   * @summary `setter`
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
   * Updates [Target.domElements.averageClick.textContent]{@link Target#domElements} to the value of
   * [Target.clickIntervals]{@link Target#clickIntervals(0)}.
   */
  updateAverageClickElement() {
    this.domElements.averageClick.textContent = this.clickIntervals.toString();
  }

  /**
  * Sum the duration of time that the session was paused between two sequential
  * [Target.ClickTime]{@link Target.ClickTime} values.
  * @param {Target.clickTime} startClick - The earliest accepted click.
  * @param {Target.clickTime} endClick - The latest accepted click.
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
   * A {@link Communicator} delegatee that [adds a click time]{@link Target#clickTimes(1)},
   * randomizes the[Target.domElements.target]{@link Target#domElements} position and dimensions,
   * then adds points to the session score.
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
   * A {@link Communicator} delegatee that sets
   * [Target.domElements.target.visibility]{@link Target#domElements} to the value
   * returned by [Target.targetElementVisibility]{@link Target#targetElementVisibility(0)}.
   * @method
   */
  targetVisibilityElementClick = () => {
    this.targetElementVisibility = this.targetElementVisibility;

    if (this.state[Timer].process === "start") {
        this.clickTimes = performance.now();
    }

  }

  processReceive = (object, property, value) => {
    switch (value) {
      case "start":
        // Add a clickTime when a new session is started
        if (this.#clickTimes.length === 0 && this.targetElementIsVisible()) {
          this.clickTimes = performance.now();
        }

        this.setRandomTargetElementDimensions();
        this.setRandomTargetElementPositions();
        break;
      case "pause":
        this.updateTargetElement();
        break;
      case "end":
        this.resetTargetElementPosition();
        this.resetTargetElementDimensions();
        this.resetClickTimes();
    }
  }
}
