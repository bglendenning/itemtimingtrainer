"use strict";

/**
 * Delegates `document` `click` event handling to subclass methods. Delegatee method names must be
 * formatted as `<DOM element ID>ElementClick`. Delegatee methods should be defined using arrow
 * function syntax to ensure that `this` will not be affected by execution context.
  */
class ClickEventListener {
  /**
   * The key is a DOM element `id` attribute. The value is an instance of an `Element` for that DOM
   * element.
   * @type {Object.<string, Element>}
   */
  domElements = {};

  /**
   * Adds a `click` event listener to `document`. The listener checks subclasses for a callable
   * property that matches the requisite listener naming format. If found, the property is called
   * and provided with the `event` parameter.
   */
  constructor() {
    // consider building a hash table
    document.addEventListener("click", (event) => {
      const targetId = event.target.getAttribute("id");

      if (this.domElements.hasOwnProperty(targetId)) {
        const element = this.domElements[targetId];
        const eventMethodName = this.constructEventMethodName(element);

        if (this.hasOwnProperty(eventMethodName)) {
          if (typeof(this[eventMethodName]) === "function") {
            this[eventMethodName](event);
          }
        }
      }
    });
  }

  /**
   * @param {Element} element - An instance of an `Element`.
   * @returns {string} A method name constructed with the format `<DOM element ID>ElementClick`.
   */
  constructEventMethodName(element) {
    return element.getAttribute("id") + "ElementClick";
  }
}

/**
 * Manages session time and interacts with DOM elements related to it.
 * @extends ClickEventListener
 */
class Timer extends ClickEventListener {
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

  constructor() {
    super();

    this.state = {};
    this.seconds = 0;
    this.interval = null;
    this.timescaleMultiplier = 1;
    this.sessionSegments = [];
  }

  /**
   * @instance
   * @memberof Timer
   * @method
   * @returns {number} The session seconds set by [Timer.seconds]{@link Timer#seconds(1)}.
   * @summary `getter`
   * @variation 0
   */
  get seconds() {
    return this.state.seconds;
  }

  /**
   * Sets the session elapsed seconds, and updates
   * [Timer.domElements.clock.textContent]{@link Timer#domElements}.
   * @instance
   * @memberof Timer
   * @method
   * @param {number} seconds - The number to set the session elapsed seconds to.
   * @summary `setter`
   * @variation 1
   */
  set seconds(seconds) {
    this.state.seconds = seconds;
    this.updateClockElementText();
  }

  /**
   * Sets [Timer.domElements.clock.textContent]{@link Timer#domElements} to the return value of
   * [Timer.seconds]{@link Timer#seconds(0)} as formatted by
   * [Timer.formatTime]{@link Timer#formatTime}.
   */
  updateClockElementText() {
    this.domElements.clock.textContent = this.formatTime(this.seconds);
  }

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
    return this.state.interval;
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
      this.state.interval = setInterval(
        () => this.seconds += 1, (1000 * this.timescaleMultiplier)
      );
    } else {
      // The session is paused or ended
      this.state.interval = interval;
    }
  }

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
    return this.state.timescaleMultiplier;
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
      this.state.timescaleMultiplier = timescaleMultiplier;

      if (this.interval) {
        this.interval = true;
      }

      this.updateTimescaleMultiplierElementText();
    }
  }

  /**
   * Sets [Timer.domElement.timescaleMultiplier.textContent]{@link Timer#domElements} to
   * the return value of [Timer.timeScaleMultiplier]{@link Timer#timescaleMultiplier(0)}.
   */
  updateTimescaleMultiplierElementText() {
    this.domElements.timescaleMultiplier.textContent = this.timescaleMultiplier.toString();
  }

  /**
   * @instance
   * @memberof Timer
   * @method
   * @returns {Array.<SessionSegment>} An array of [SessionSegments]{@link Timer.SessionSegment}.
   * @summary `getter`
   * @variation 0
   */
  get sessionSegments() {
    return this.state.sessionSegments;
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
      this.state.sessionSegments = value;
    } else if (value.length > 0) {
      throw new Error(`Invalid array length for value: ${value.length}`);
    } else {
      if (isNaN(value)) {
        throw new Error(`Invalid type for value: ${typeof(value)}`);
      }

      if (this.sessionSegments.length === 0) {
        // A new session has started
        // Add the new start time to the session times
        this.state.sessionSegments.push({start: value});
      } else {
        const index = this.sessionSegments.length - 1;
        const lastSessionTime = this.sessionSegments[index];

        if (lastSessionTime.hasOwnProperty("end")) {
          // Since the last session time has an end, the session is being restarted
          // Add a new session start time
          this.state.sessionSegments.push({start: value});
        } else {
          // Since the session time doesn't have an end, the session is being paused
          // Add the pause time to the last session time
          this.state.sessionSegments[index].end = value;
        }
      }
    }
  }

  /**
   * Calculate minutes and remainder seconds of `seconds`, and left-pad both.
   * @param {number} seconds - The number of seconds to format as a time string.
   * @returns {string} A time string formatted as `mm:ss`.
   */
  formatTime(seconds) {
    const paddedMinutes = pad(Math.floor(seconds / 60), 2);
    const paddedSeconds = pad(seconds % 60, 2);

    return `${paddedMinutes}:${paddedSeconds}`;
  }

  /**
   * A {@link ClickEventListener} delegatee that starts a session.
   * @method
   */
  startElementClick = () => {
    if (!this.interval) {
      this.interval = true;
      this.sessionSegments = performance.now();
    }
  }

  /**
   * A {@link ClickEventListener} delegatee that pauses a session.
   * @method
   */
  pauseElementClick = () => {
    if (this.interval) {
      this.interval = false;
      this.sessionSegments = performance.now();
    }
  }

  /**
   * A {@link ClickEventListener} delegatee that ends a session.
   * @method
   */
  endElementClick = () => {
    this.interval = null;
    this.seconds = 0;
    this.timescaleMultiplier = 1;
    this.sessionSegments = [];
  }

  /**
   * A {@link ClickEventListener} delegatee that decreases the session timescale multiplier.
   * @method
   */
  timescaleMultiplierDecreaseElementClick = () => {
    this.timescaleMultiplier -= 1;
  }

  /**
   * A {@link ClickEventListener} delegatee that increases the timescale multiplier.
   * @method
   */
  timescaleMultiplierIncreaseElementClick = () => {
    this.timescaleMultiplier += 1
  }
}

/**
 * Manages scores and interacts with DOM elements related to them.
 * @extends ClickEventListener
 */
class Score extends ClickEventListener {
  /**
   * @property {Element} session - Displays the session score.
   * @property {Element} high - Displays the high score.
   * @type {Object.<string, Element>}
   */
  domElements = {
    session: document.getElementById("sessionScore"),
    high: document.getElementById("highScore"),
  };
  /**
   * The character-length to left-pad scores to.
   * @type {number}
   */
  paddedLength = 6;

  /**
   * Sets the properties required to initialize the DOM.
   * @param {Timer} timer - A `Timer` instance.
   */
  constructor(timer) {
    super();

    this.timer = timer;
    this.high = 0;
    this.session = 0;
  }

  #high;

  /**
   * @instance
   * @memberof Score
   * @method
   * @returns {number} The high score set by [Score.high]{@link Score#high(1)}.
   * @summary `getter`
   * @variation 0
   */
  get high() {
    return this.#high;
  }

  /**
   * Sets the high score, and updates [Score.domElements.high.textContent]{@link Score#domElements}.
   * @instance
   * @memberof Score
   * @method
   * @param {number} score - The number to set the high score to.
   * @summary `setter`
   * @variation 1
   */
  set high(score) {
    this.#high = score;
    this.updateHighElementText();
  }

  /**
   * Sets [Score.domElements.high.textContent]{@link Score#domElements} to the left-padded return
   * value of [Score.high]{@link Score#high(0)}.
   */
  updateHighElementText() {
    this.domElements.high.textContent = pad(this.high, this.paddedLength);
  }

  #session;

  /**
   * @instance
   * @memberof Score
   * @method
   * @returns {number} The session score set by [Score.session]{@link Score#session(1)}
   * @summary `getter`
   * @variation 0
   */
  get session() {
    return this.#session;
  }

  /**
   * Sets the session score, updates
   * [Score.domElements.session.textContent]{@link Score#domElements}, and conditionally
   * [sets]{@link Score#high(1)} the high score.
   * @instance
   * @memberof Score
   * @method
   * @param {number} points - The number of points to set the session score to.
   * @summary `setter`
   * @variation 1
   */
  set session(points) {
    this.#session = points;
    this.updateSessionElementText();

    if (this.#session > this.high) {
      this.high = this.#session;
    }
  }

  /**
   * Multiplies the provided points value by the return value of
   * [Timer.timescaleMultiplier]{@link Timer#timescaleMultiplier(0)}, adds
   * that product to the session score, then sets the session score.
   * @param {number} points - The number of points to add to the session score.
   */
  addPointsToSessionScore(points) {
    this.session += points * this.timer.timescaleMultiplier
  }

  /**
   * Sets [Score.domElements.session.textContent]{@link Score#domElements} to the left-padded return
   * value of [Score.session]{@link Score#session(0)}.
   */
  updateSessionElementText() {
    this.domElements.session.textContent = pad(this.session, this.paddedLength);
  }
}

/**
 * Interacts with DOM elements related to activity logging.
 * @extends ClickEventListener
 */
class Logger extends ClickEventListener {
  /**
   * @property {Element} logs - Displays the log entries.
   * @property {Element} clearLogs - Can be clicked to clear the log entries.
   * @type {Object.<string, Element>}
   */
  domElements = {
    logs: document.getElementById("logs"),
    clearLogs: document.getElementById("clearLogs"),
  };

  /**
   * @param {Timer} timer - A `Timer` instance.
   */
  constructor(timer) {
    super();

    this.timer = timer;
  }

  /**
   * Create and style a paragraph element, then prepend it to
   * [Logger.domElements.logs.textContent]{@link Logger#domElements}.
   * @param {string} content - The content to assign to the paragraph element's `textContent`.
   * @param {string} cssClass - The class to add to the paragraph element's `classList`.
   **/
  createLogEntry(content, cssClass) {
    const paragraphElement = document.createElement("p");
    paragraphElement.textContent = `${this.timer.formatTime(this.timer.seconds)} - ${content}`;
    paragraphElement.classList.add(cssClass, "entry");
    this.domElements.logs.prepend(paragraphElement);
  }

  /**
    * A {@link ClickEventListener} delegatee that clears the content of
    * [Logger.domElements.logs.textContent]{@link Logger#domElements}
    * @method
    */
  clearLogsElementClick = () => {
    this.domElements.logs.textContent = "";
  }
}

/**
 * Manages the randomized target and interacts and interacts with DOM elements related to it.
 * @extends ClickEventListener
 */
class Target extends ClickEventListener {
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
   * @property {Target.Pixel} left - Used for the
   * [Target.domElements.target.left]{@link Target#domElements} position.
   * @property {Target.Pixel} top - Used for the
   * [Target.domElements.target.top]{@link Target#domElements} position.
   * @property {Target.Pixel} side - Used for the
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

  /**
   * Sets the properties required to initialize the DOM.
   * @param {Timer} timer - A `Timer` instance.
   * @param {Score} score - A `Score` instance.
   */
  constructor(timer, score) {
    super();

    this.timer = timer;
    this.score = score;
    this.targetElementLeft = this.defaults.left;
    this.targetElementTop = this.defaults.top;
    this.targetElementWidth = this.defaults.side;
    this.targetElementHeight = this.defaults.side;
    this.targetElementVisibility = this.targetElementVisibility;
    this.clickTimes = [];
  }

  /** The left position, in pixels, of the target DOM element */
  #targetElementLeft;

  /**
   * @instance
   * @memberof Target
   * @method
   * @returns {Target.Pixel} The [Target.domElements.target.left]{@link Target#domElements}
   * position set by [Target.targetElementLeft]{@link Target#targetElementLeft(1)}.
   * @summary `getter`
   * @variation 0
   */
  get targetElementLeft() {
    return this.#targetElementLeft;
  }

  /**
   * Sets the [Target.domElements.target.left]{@link Target#domElements} position, and
   * [updates]{@link Target#updateTargetElement}
   * [Target.domElements.target]{@link Target#domElements}.
   * @instance
   * @memberof Target
   * @method
   * @param {Target.Pixel} left - The number to set the left position to.
   * @summary `setter`
   * @variation 1
   */
  set targetElementLeft(left) {
    this.#targetElementLeft = left;
    this.updateTargetElement();
  }

  #targetElementTop;

  /**
   * @instance
   * @memberof Target
   * @method
   * @returns {Target.Pixel} The [Target.domElements.target.top]{@link Target#domElements}
   * position set by [Target.targetElementTop]{@link Target#targetElementTop(1)}.
   * @summary `getter`
   * @variation 0
   */
  get targetElementTop() {
    return this.#targetElementTop;
  }

  /**
   * Sets the [Target.domElements.target.top]{@link Target#domElements} position, and
   * [updates]{@link Target#updateTargetElement}
   * [Target.domElements.target]{@link Target#domElements}.
   * @instance
   * @memberof Target
   * @method
   * @param {Target.Pixel} top - The number to set the top position to.
   * @summary `setter`
   * @variation 1
   */
  set targetElementTop(top) {
    this.#targetElementTop = top;
    this.updateTargetElement();
  }

  #targetElementWidth;

  /**
   * @instance
   * @memberof Target
   * @method
   * @returns {Target.Pixel} The [Target.domElements.target.width]{@link Target#domElements}
   * dimension set by [Target.targetElementWidth]{@link Target#targetElementWidth(1)}.
   * @summary `getter`
   * @variation 0
   */
  get targetElementWidth() {
    return this.#targetElementWidth;
  }

  /**
   * Sets the [Target.domElements.target.width]{@link Target#domElements} dimension, and
   * [updates]{@link Target#updateTargetElement}
   * [Target.domElements.target]{@link Target#domElements}.
   * @instance
   * @memberof Target
   * @method
   * @param {Target.Pixel} width - The number to set the width dimension to.
   * @summary `setter`
   * @variation 1
   */
  set targetElementWidth(width) {
    this.#targetElementWidth = width;
    this.updateTargetElement();
  }

  #targetElementHeight;

  /**
   * @instance
   * @memberof Target
   * @method
   * @returns {Target.Pixel} The [Target.domElements.target.height]{@link Target#domElements}
   * dimension set by [Target.targetElementHeight]{@link Target#targetElementHeight(1)}.
   * @summary `getter`
   * @variation 0
   */
  get targetElementHeight() {
    return this.#targetElementHeight;
  }

  /**
   * Sets the [Target.domElements.target.height]{@link Target#domElements} dimension, and
   * [updates]{@link Target#updateTargetElement}
   * [Target.domElements.target]{@link Target#domElements}.
   * @instance
   * @memberof Target
   * @method
   * @param {Target.Pixel} height - The number to set the height dimension to.
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
    this.#targetElementVisibility = visibility;
    this.updateTargetElement();
  }

  /**
   * Sets [Target.domElements.target]{@link Target#domElements} styles.
   */
  updateTargetElement() {
    this.domElements.target.style.left = `${this.targetElementLeft}px`;
    this.domElements.target.style.top = `${this.targetElementTop}px`;
    this.domElements.target.style.width = `${this.targetElementWidth}px`;
    this.domElements.target.style.height = `${this.targetElementHeight}px`;
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
    const maxLeft = window.innerWidth - this.targetElementWidth * 2;
    const maxTop = window.innerHeight - this.targetElementHeight * 2;
    this.targetElementLeft = Math.floor((Math.random() * maxLeft) + this.targetElementWidth);
    this.targetElementTop = Math.floor((Math.random() * maxTop) + this.targetElementHeight);
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
   * @instance
   * @memberof Target
   * @method
   * @returns {ClickTimes} The session click times set by
   * [Target.clickTimes]{@link Target#clickTimes(1)}
   * @summary `getter`
   * @variation 0
   */
  get clickTimes() {
    return this.#clickTimes;
  }

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
      // The session is running
      if (this.timer.interval) {
        this.#clickTimes.push(value);

        if (this.clickTimes.length === 2) {
          // Generate a click interval from two sequential click times
          this.clickIntervals = this.clickTimes;
          // Remove the older click time to open a slot for the next click time
          this.#clickTimes.splice(0, 1);
        }
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

  #clickIntervals;

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
    const sessionSegments = this.timer.sessionSegments;

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
   * A {@link ClickEventListener} delegatee that [adds a click time]{@link Target#clickTimes(1)},
   * randomizes the[Target.domElements.target]{@link Target#domElements} position and dimensions,
   * then adds points to the session score.
   * @method
   */
  targetElementClick = () => {
    if (this.timer.interval && this.domElements.targetVisibility.checked) {
      this.clickTimes = performance.now();
      this.setRandomTargetElementDimensions();
      this.setRandomTargetElementPositions();
      this.score.addPointsToSessionScore(this.pointsValue);
    }
  }

  /**
   * A {@link ClickEventListener} delegatee that sets
   * [Target.domElements.target.visibility]{@link Target#domElements} to the value
   * returned by [Target.targetElementVisibility]{@link Target#targetElementVisibility(0)}.
   * @method
   */
  targetVisibilityElementClick = () => {
    this.targetElementVisibility = this.targetElementVisibility;
  }

  /**
   * A {@link ClickEventListener} delegatee that conditionally
   * [adds an initial click time]{@link Target#clickTimes(1)}, then randomizes the
   * [Target.domElements.target]{@link Target#domElements} position and dimensions.
   * @method
   */
  startElementClick = () => {
    // Add a clickTime when a new session is started
    if (this.clickTimes.length === 0) {
      this.clickTimes = performance.now();
    }

    this.setRandomTargetElementDimensions();
    this.setRandomTargetElementPositions();
  }

  /**
   * A {@link ClickEventListener} delegatee that resets the
   * [Target.domElements.target]{@link Target#domElements} position and dimensions, then
   * [resets the click times]{@link Target#resetClickTimes}.
   * @method
   */
  endElementClick = () => {
    this.resetTargetElementPosition();
    this.resetTargetElementDimensions();
    this.resetClickTimes();
  }
}

/**
* Manages items and interacts with DOM elements related to them. Item {@link ClickEventListener}
* delegatees can accept or ignore browser `click` events depending on the item state. Item DOM
* elements are dynamically added to the DOM. Item event delegatees are dynamically added to the
* class object when the item elements are added to the DOM.
* @extends ClickEventListener
*/
class Items extends ClickEventListener {
  /**
   * An item configuration that contains data required for DOM interactions.
   * @memberof Items
   * @property {string} presentationName - The name to be displayed in log entries.
   * @property {string} domElementId - The item's DOM element `id` attribute.
   * @property {number} startSpawnTimeSeconds - The time, relative to the value returned by
   * [Timer.seconds]{@link Timer#seconds(0)}, at which the event delegatee will begin accepting
   * click events when a new session is started. Defining a non-zero value will result in the item's
   * event delegatee ignoring clicks for `spawnIntervalSeconds` following a new session being
   * started.
   * @property {number} spawnIntervalSeconds - The interval for which the item's event delegatee
   * ignores `click` events after it has accepted a `click` event. This is also the points value
   * provided to [Score.addPointsToSessionScore]{@link Score#addPointsToSessionScore} when the event
   * delegatee accepts a click.
   * @property {number} spawnTimeSeconds - The time, relative to the value returned by
   * [Timer.seconds]{@link Timer#seconds(0)}, at which the item will begin accepting clicks events.
   * @property {string} backgroundColorClass - The name of a CSS class that defines a background
   * color.
   * @property {string} backgroundImageClass - The name of a CSS class that defines a background
   * image.
   * @typedef {Object<string, (string|number)>} Item
   */

  /**
   * @property {Element} items - Contains item elements.
   * @type {Object.<string, Element>}
   */
  domElements = {
    items: document.getElementById("items"),
  };

  /**
   * Sets the properties required to initialize the DOM.
   * @param {Timer} timer - A `Timer` instance.
   * @param {Logger} logger - A `Logger` instance.
   * @param {Score} score - A `Score` instance.
   */
  constructor(timer, logger, score) {
    super();

    this.timer = timer;
    this.logger = logger;
    this.score = score;
    this.items = [
      {
        presentationName: "Red Armor",
        domElementId: "itemArmorRed",
        startSpawnTimeSeconds: 0,
        spawnIntervalSeconds: 25,
        spawnTimeSeconds: 0,
        backgroundColorClass: "background-color-red",
        backgroundImageClass: "background-image-armor",
      },
      {
        presentationName: "Yellow Armor",
        domElementId: "itemArmorYellow",
        startSpawnTimeSeconds: 0,
        spawnIntervalSeconds: 25,
        spawnTimeSeconds: 0,
        backgroundColorClass: "background-color-yellow",
        backgroundImageClass: "background-image-armor",
      },
      {
        presentationName: "Megahealth",
        domElementId: "itemHealthMega",
        startSpawnTimeSeconds: 0,
        spawnIntervalSeconds: 35,
        spawnTimeSeconds: 0,
        backgroundColorClass: "background-color-blue",
        backgroundImageClass: "background-image-megahealth",
      },
    ];
  }

  #items;

  /**
   * @instance
   * @memberof Items
   * @method
   * @returns {Array.<Items.Item>} The items' configurations.
   * @summary `getter`
   * @variation 0
   */
  get items() {
    return this.#items;
  }

  /**
   * Sets the items, and creates the items' DOM elements.
   * @instance
   * @memberof Items
   * @method
   * @param {Array.<Items.Item>} items - The items' configurations to set.
   * @summary `setter`
   * @variation 1
   */
  set items(items) {
    this.#items = items;
    this.createItemsDomElements(items);
  }

  /**
   * Create a DOM element for each item in `items`, style the element, and create an event
   * delegatee for the element and add it to the class object.
   * @param {Array.<Items.Item>} items - The item configurations for which to create DOM elements and
   * event delegatees.
   */
  createItemsDomElements(items) {
    items.forEach((item) => {
      // Set the initial item spawn time
      item.spawnTimeSeconds += item.startSpawnTimeSeconds;
      const element = document.createElement("div");
      element.setAttribute("id", item.domElementId);
      element.classList.add("item", item.backgroundColorClass, item.backgroundImageClass);
      element.textContent = item.spawnIntervalSeconds.toString();
      this.domElements.items.append(element);
      this.domElements[item.domElementId] = element;
      // Create the event delegatee
      this[this.constructEventMethodName(element)] = (event) => {
        this.itemsElementClick(event);
      };
    });
  }

  /** Clear the items DOM element. */
  resetItemsDomElementText() {
    this.domElements.items.textContent = "";
  }

  /**
   * A {@link ClickEventListener} delegatee that determines if the item is accepting clicks to
   * conditionally call [Score.addPointsToSessionScore]{@link Score#addPointsToSessionScore} to
   * handle the points value, then [creates a click log entry]{@link Logger#createLogEntry}. The
   * points value of a clicked item is equal to `item.spawnIntervalSeconds`. One point is deducted
   * per second that a click time follows `item.spawnIntervalSeconds`. A maximum value of
   * `item.spawnTimeSeconds` can be deducted from the points value, meaning that the minimum number
   * of points that can be scored is `0`.
   * @method
   */
  itemsElementClick = (event) => {
    if (this.timer.interval) {
      // Find the item in `this.items` using the event target element's ID
      const item = this.items.find((item) => {
        return item.domElementId === event.target.getAttribute("id");
      });
      const spawnTimeAtClick = item.spawnTimeSeconds;
      const clickTime = this.timer.seconds;
      // A difference < 0 is early, and will be rejected
      const difference = clickTime - item.spawnTimeSeconds;

      // Pass the event to the delegatee
      if (difference >= 0) {
        // The time, in seconds, the event delegatee will begin accepting clicks at this time
        // This value is relative to the value returned by `timer.seconds()`
        item.spawnTimeSeconds = clickTime + item.spawnIntervalSeconds;
        // Subtract a point per second that a click follows `item.spawnIntervalSeconds`
        // A maximum of `item.spawnIntervalSeconds` points can be subtracted
        const points = (
          item.spawnIntervalSeconds - Math.min(difference, item.spawnIntervalSeconds)
        );

        // Select a color for the log entry
        let color;

        if (difference === 0) {
          color = "color-blue";
        } else if (difference <= 3) {
          color = "color-green";
        } else if (difference <= 5) {
          color = "color-yellow";
        } else {
          color = "color-red";
        }

        this.score.addPointsToSessionScore(points);
        this.logger.createLogEntry(
          `
            ${item.presentationName}: ${this.timer.formatTime(clickTime)}
            - ${this.timer.formatTime(spawnTimeAtClick)} = ${this.timer.formatTime(difference)}
            late
          `,
          color
        );
      // The item element is not interactive
      } else {
        this.logger.createLogEntry(
          `${item.presentationName} clicked ${Math.abs(difference)} seconds early`, "color-grey"
        );
      }
    }
  }

  /**
   * A {@link ClickEventListener} that clears the items DOM element, resets each item's
   * `spawnTimeSeconds`, then sets [Items.items]{@link Items#items(1)} and recreates the items' DOM
   * elements and event delegatees.
   * @method
   */
  endElementClick = () => {
    this.resetItemsDomElementText();
    // Create a deep copy of `this.items`
    const items = structuredClone(this.items);

    items.forEach((item) => {
      item.spawnTimeSeconds = 0;
    });

    this.items = items;
  }
}

/**
 * Convert `number` to a string and left-pad with zeroes to length `length`.
 * @param {number} number - The number to pad.
 * @param {number} length - The desired character-length of the padded string.
 * @returns {string} - The padded string.
 */
function pad(number, length) {
  let paddedValue = number.toString();

  while (paddedValue.length < length) {
    paddedValue = "0" + paddedValue;
  }

  return paddedValue;
}
