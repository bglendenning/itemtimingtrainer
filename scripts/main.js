"use strict";

/**
 * Delegates `document` `click` event handling to subclass methods. Delegatee method names must be
 * formatted as `<DOM element ID>ElementClick`. Delegatee methods should be defined using arrow
 * function syntax to ensure that `this` will not be affected by execution context.
 * instance of an `Element` for that DOM element.
 */
class ClickEventListener {
  /**
   * The key is a DOM element's `id` attribute. The value is an instance of an `Element` for that
   * DOM element.
   * @type {Object.<string, Element>}
   */
  domElements = {};

  /**
   * Adds a `click` event listener to `document`. The listener checks subclasses for a callable
   * property that matches the requisite listener naming format. If found, the property is called
   * and provided with the `event` parameter.
   */
  constructor() {
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
 * Interacts with DOM elements related to activity logging.
 * @extends ClickEventListener
 */
class Logger extends ClickEventListener {
  /**
   * @see {@link ClickEventListener#domElements}
   */
  domElements = {
    logs: document.getElementById("logs"),
    clearLogs: document.getElementById("clearLogs"),
  };

  /**
   * @param {Timer} timer - A {@link Timer} instance.
   */
  constructor(timer) {
    super();

    this.timer = timer;
  }

  /**
   * Create and style a paragraph element, then prepend it to the logs DOM element.
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
    * A {@link ClickEventListener} delegatee that clears the `textContent` of
    * `Logger.domElements.logs`.
    * @method
    */
  clearLogsElementClick = () => {
    this.domElements.logs.textContent = "";
  }
}

/**
 * Manages session time and interacts with DOM elements related to session time
 * @property {Interval} #interval - A `setInterval` instance during an active session,
 * `false` during a paused session, or `null` if the session hasn't started.
 * @property {number} #multiplier - A factor used to adjust the `setInterval` `duration` in order to
 * increase or decrease the rate at which seconds elapse. Its value is also used as a factor when
 * scoring points.
 * @property {Array.<SessionSegment>} #sessionSegments - A list of time segments in which a session
 * was started.
 */
class Timer extends ClickEventListener {
  /**
   * A segment of time that the active session was running. Contains a minimum of one property with
   * the key `start`, which is assigned the return value of `performance.now()` when a session is
   * started. A second property with the key `end`, is assigned the return value of
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
   * @property {Element} clock - Displays the elapsed session time.
   * @property {Element} start - Can be clicked to start a session.
   * @property {Element} pause - Can be clicked to pause a session.
   * @property {Element} end - Can be clicked to end a session.
   * @property {Element} timescaleMultiplier - Displays the session timescale multiplier.
   * @property {Element} timescaleMultiplierDecrease - Can be clicked to decrease the timescale
   * multiplier.
   * @property {Element} timescaleMultiplierIncrease - Can be clicked to increase the timescale
   * multiplier.
   * @see {@link ClickEventListener#domElements}
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

  /** Sets properties required to initialize the DOM. */
  constructor() {
    super();

    this.seconds = 0;
    this.timescaleMultiplier = 1;
  }

  #seconds;

  /**
   * @instance
   * @memberof Timer
   * @method
   * @returns {number} The session seconds set by [set seconds]{@link Timer#seconds(1)}.
   * @summary `getter`
   * @variation 0
   */
  get seconds() {
    return this.#seconds;
  }

  /**
   * Sets the session elapsed seconds, then calls
   * [Timer.updateClockElementText]{@link Timer#updateClockElementText}.
   * @instance
   * @memberof Timer
   * @method
   * @param {number} seconds - The number to set the session elapsed seconds to.
   * @summary `setter`
   * @variation 1
   */
  set seconds(seconds) {
    this.#seconds = seconds;
    this.updateClockElementText();
  }

  /**
   * Sets [Timer.domElements.clock.textContent]{@link Timer#domElements} to the return value of
   * [get seconds]{@link Timer#seconds(0)} as formatted by
   * [Timer.formatTime]{@link Timer#formatTime}.
   */
  updateClockElementText() {
    this.domElements.clock.textContent = this.formatTime(this.seconds);
  }

  #interval = null;

  /**
   * @instance
   * @memberof Timer
   * @method
   * @returns {Interval} The session interval state set by [set interval]{@link Timer#interval(1)}.
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
   * @param {(Interval|true)} interval - The interval state to set the interval to.
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
        () => this.seconds += 1, (1000 * this.timescaleMultiplier)
      );
    } else {
      // The session is paused or ended
      this.#interval = interval;
    }
  }

  #timescaleMultiplier;

  /**
   * @instance
   * @memberof Timer
   * @method
   * @returns {number} The session timescale multiplier set by
   * [set timescaleMultiplier]{@link Timer#timescaleMultiplier(1)}.
   * @summary `getter`
   * @variation 0
   */
  get timescaleMultiplier() {
    return this.#timescaleMultiplier;
  }

  /**
   * Sets the session timescale multiplier if the `timeScaleMultiplier` value is greater than 0,
   * then calls
   * [Timer.updateTimescaleMultiplierElementText]{@link Timer#updateTimescaleMultiplierElementText}.
   * @memberof Timer
   * @method
   * @param {number} timescaleMultiplier - The number to set the session timescale multiplier to.
   * @summary `setter`
   * @variation 1
   */
  set timescaleMultiplier(timescaleMultiplier) {
    if (timescaleMultiplier > 0) {
      this.#timescaleMultiplier = timescaleMultiplier;

      if (this.interval) {
        this.interval = true;
      }

      this.updateTimescaleMultiplierElementText();
    }
  }

  /**
   * Sets [Timer.domElement.timescaleMultiplier.textContent]{@link Timer#domElements} to
   * the return value of [get timeScaleMultiplier]{@link Timer#timescaleMultiplier(0)}.
   */
  updateTimescaleMultiplierElementText() {
    this.domElements.timescaleMultiplier.textContent = this.timescaleMultiplier;
  }

  #sessionSegments = [];

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
   * Adds a [Timestamp]{@link Timer.Timestamp} that represents either of a
   * [SessionSegment's]{@link Timer.SessionSegment} `start` or `end` values. Each `SessionSegment`
   * is initially assigned the `start` property. The `end` property is assigned when the session is
   * paused. When the session is restarted, the setter creates a new `SessionSegment` and adds it to
   * `sessionSegments`. When the session is ended, `sessionSegments` is set to an empty array.
   * @instance
   * @memberof Timer
   * @method
   * @param {Array|Timestamp} value - An empty array
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

      if (this.sessionSegments.length === 0) {
        // A new session has started
        // Add the new start time to the session times
        this.#sessionSegments.push({start: value});
      } else {
        const index = this.sessionSegments.length - 1;
        const lastSessionTime = this.sessionSegments[index];

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
  }

  /**
   * Calculate minutes and remainder seconds of `seconds`, and left-pad both to a character-length
   * of 2.
   * @param {number} seconds - The number of seconds to format as a time string.
   * @returns {string} A time string formatted as `mm:ss`.
   */
  formatTime(seconds) {
    const paddedMinutes = pad(Math.floor(seconds / 60), 2);
    const paddedSeconds = pad(seconds % 60, 2).toString();

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
 * Track the score and manipulate DOM elements related to interacting with and presenting the score.
 */
class Score extends ClickEventListener {
  domElements = {
    session: document.getElementById("sessionScore"),
    high: document.getElementById("highScore"),
  };
  paddedLength = 6;

  constructor(timer) {
    super();

    this.timer = timer;
    this.high = 0;
    this.session = 0;
  }

  /** An integer used to track the greatest session score. */
  #high;

  get high() {
    return this.#high;
  }

  set high(score) {
    this.#high = score;
    this.updateHighElementText();
  }

  updateHighElementText() {
    this.domElements.high.textContent = pad(this.high, this.paddedLength);
  }

  /** An integer used to track the session score. */
  #session;

  get session() {
    return this.#session;
  }

  set session(points) {
    this.#session = points;
    this.updateSessionElementText();

    if (this.#session > this.high) {
      this.high = this.#session;
    }
  }

  /** Multiply `points` by `timer.timescaleMultiplier` and add to the session score. */
  addPointsToSessionScore(points) {
    this.session += points * this.timer.timescaleMultiplier
  }

  updateSessionElementText() {
    this.domElements.session.textContent = pad(this.session, this.paddedLength);
  }
}

/** Manipulate DOM elements related to interacting with and presenting the target. */
class Target extends ClickEventListener {
  domElements = {
    target: document.getElementById("target"),
    targetToggle: document.getElementById("targetToggle"),
    averageClick: document.getElementById("averageClick"),
    start: document.getElementById("start"),
    end: document.getElementById("end"),
  };
  defaults = {
    left: 50, // Target DOM element left position in pixels
    top: 50, // Target DOM element top position in pixels
    side: 25, // Target DOM element width and height dimensions in pixels
  };
  pointsValue = 1;

  constructor(timer, score) {
    super();

    this.timer = timer;
    this.score = score;

    // Initialize the class
    this.targetElementLeft = this.defaults.left;
    this.targetElementTop = this.defaults.top;
    this.targetElementWidth = this.defaults.side;
    this.targetElementHeight = this.defaults.side;
    this.targetElementVisibility = this.domElements.targetToggle;
    this.updateClickSessionElement();
  }

  /** The left position, in pixels, of the target DOM element */
  #targetElementLeft;

  get targetElementLeft() {
    return this.#targetElementLeft;
  }

  set targetElementLeft(left) {
    this.#targetElementLeft = left;
    this.updateTargetElement();
  }

  /** The top position, in pixels, of the target DOM element */
  #targetElementTop;

  get targetElementTop() {
    return this.#targetElementTop;
  }

  set targetElementTop(top) {
    this.#targetElementTop = top;
    this.updateTargetElement();
  }

  /** The width, in pixels, of the target DOM element */
  #targetElementWidth;

  get targetElementWidth() {
    return this.#targetElementWidth;
  }

  set targetElementWidth(width) {
    this.#targetElementWidth = width;
    this.updateTargetElement();
  }

  /** The height, in pixels, of the target DOM element */
  #targetElementHeight;

  get targetElementHeight() {
    return this.#targetElementHeight;
  }

  set targetElementHeight(height) {
    this.#targetElementHeight = height;
    this.updateTargetElement();
  }

  /** The CSS `visibility` of the target DOM element */
  #targetElementVisibility;

  get targetElementVisibility() {
    return this.#targetElementVisibility;
  }

  set targetElementVisibility(targetToggleElement) {
    this.#targetElementVisibility = targetToggleElement.checked ? "visible" : "hidden";
    this.updateTargetElement();
  }

  updateTargetElement() {
    this.domElements.target.style.left = `${this.targetElementLeft}px`;
    this.domElements.target.style.top = `${this.targetElementTop}px`;
    this.domElements.target.style.width = `${this.targetElementWidth}px`;
    this.domElements.target.style.height = `${this.targetElementHeight}px`;
    this.domElements.target.style.visibility = this.targetElementVisibility;
  }

  resetTargetElementPosition() {
    this.targetElementLeft = this.defaults.left;
    this.targetElementTop = this.defaults.top;
  }

  resetTargetElementDimensions() {
    this.targetElementWidth = this.defaults.side;
    this.targetElementHeight = this.defaults.side;
  }

  setRandomTargetElementPositions() {
    const maxLeft = window.innerWidth - this.targetElementWidth * 2;
    const maxTop = window.innerHeight - this.targetElementHeight * 2;
    this.targetElementLeft = Math.floor((Math.random() * maxLeft) + this.targetElementWidth);
    this.targetElementTop = Math.floor((Math.random() * maxTop) + this.targetElementHeight);
  }

  setRandomTargetElementDimensions() {
    const value = Math.floor(
      Math.random() * (
        (this.defaults.side * 2) - (this.defaults.side / 2)
      ) + (this.defaults.side / 2)
    );
    this.targetElementWidth = value;
    this.targetElementHeight = value;
  }

  /** Ascending click times. */
  #clickTimes = [];

  get clickTimes() {
    return this.#clickTimes;
  }

  /**
   * A first in, first out queue of click times with a maximum length of 2. Generate a click
   * interval when the maximum length is reached, then remove the first click in preparation of
   * receiving the next click.
   */
  set clickTimes(value) {
    if (Array.isArray(value)) {
      this.#clickTimes = value;
    } else {
      if (this.timer.interval) {
        this.#clickTimes.push(value);

        if (this.clickTimes.length === 2) {
          // Generate a click interval from the two consecutive click times
          this.clickIntervals = this.clickTimes;
          // Remove the older click time to prepare for the next click time
          this.#clickTimes.splice(0, 1);
        }
      }
    }

    this.updateClickSessionElement();
  }

  resetClickTimes() {
    this.clickTimes = [];
    this.clickIntervals = [];
    this.updateClickSessionElement();
  }

  /** The intervals, in milliseconds, between consecutive clicks */
  #clickIntervals = [];

  /** Return the average of the summed `#clickIntervals` in milliseconds or 0. */
  get clickIntervals() {
    let clickIntervalSum = this.#clickIntervals.reduce(
      (totalTime, recordedTime) => totalTime + recordedTime, 0
    );

    if (clickIntervalSum > 0) {
      return Math.round(clickIntervalSum / this.#clickIntervals.length);
    }

    return clickIntervalSum;
  }

  /**
   * Accept a length-2 array of consecutive click times and determine the interval between them.
   * Determine the duration for which the session was paused between clicks, and subtract that
   * duration from the click interval.
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

  updateClickSessionElement() {
    this.domElements.averageClick.textContent = `${this.clickIntervals}`;
  }

  /** Sum the duration of time that the session was paused between two click times. */
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
   * Set the target DOM element to random dimensions and position, and add the points value to the
   * session score.
   */
  targetElementClick = (event) => {
    if (this.timer.interval && this.domElements.targetToggle.checked) {
      this.clickTimes = performance.now();
      this.setRandomTargetElementDimensions();
      this.setRandomTargetElementPositions();
      this.score.addPointsToSessionScore(this.pointsValue);
    }
  }

  targetToggleElementClick = (event) => {
    this.targetElementVisibility = event.target;
  }

  startElementClick = (event) => {
    // Add a clickTime when a new session is started
    if (this.clickTimes.length === 0) {
      this.clickTimes = performance.now();
    }

    this.setRandomTargetElementDimensions();
    this.setRandomTargetElementPositions();
  }

  endElementClick = (event) => {
    this.resetTargetElementPosition();
    this.resetTargetElementDimensions();
    this.resetClickTimes();
  }
}

/** Track items and manipulate DOM elements related to interacting with and presenting items. */
class Items extends ClickEventListener {
  domElements = {
    items: document.getElementById("items"),
  };

  constructor(timer, logger, score) {
    super();

    this.timer = timer;
    this.logger = logger;
    this.score = score;

    // Initialize the class
    this.items = [
      {
        presentationName: "Red Armor",
        domElementId: "itemArmorRed",
        spawnIntervalSeconds: 25,
        spawnTimeSeconds: 0,
        backgroundColorClass: "background-color-red",
        backgroundImage: "url('images/armor.webp')",
      },
      {
        presentationName: "Yellow Armor",
        domElementId: "itemArmorYellow",
        spawnIntervalSeconds: 25,
        spawnTimeSeconds: 0,
        backgroundColorClass: "background-color-yellow",
        backgroundImage: "url('images/armor.webp')",
      },
      {
        presentationName: "Megahealth",
        domElementId: "itemHealthMega",
        spawnIntervalSeconds: 35,
        spawnTimeSeconds: 0,
        backgroundColorClass: "background-color-blue",
        backgroundImage: "url('images/megahealth.webp')",
      },
    ];
  }

  /**
   * An array of objects containing item information. Used to manipulate the DOM and track item
   * interactivity.
   */
  #items;

  get items() {
    return this.#items;
  }

  set items(items) {
    this.#items = items;
    this.createItemsDomElements(items);
  }

  /**
   * Create a DOM element for each item in `items`, style the element, then create an event listener
   * for the element.
   */
  createItemsDomElements(items) {
    items.forEach((item) => {
      const element = document.createElement("div");
      element.setAttribute("id", item.domElementId);
      element.classList.add("item", item.backgroundColorClass);
      element.style.backgroundImage = item.backgroundImage;
      element.textContent = item.spawnIntervalSeconds;
      this.domElements.items.append(element);
      this.domElements[item.domElementId] = element;
      // Create the event listener
      this[this.constructEventMethodName(element, "click")] = (event) => {
        this.itemsElementClick(event);
      };
    });
  }

  resetItemsDomElementInnerHtml() {
    this.domElements.items.textContent = "";
  }

  /**
   * Determine if the item clicked is interactive, and, if it is, add the item's point value to the
   * session score, then log the click, else log the early click.
   */
  itemsElementClick = (event) => {
    if (this.timer.interval) {
      // Find the item in `this.items` using the event target element's ID
      const item = this.items.find((item) => {
        return item.domElementId === event.target.getAttribute("id");
      });
      const spawnTimeAtClick = item.spawnTimeSeconds;
      const clickTime = this.timer.seconds;
      const difference = clickTime - item.spawnTimeSeconds;

      // The item element is interactive
      if (difference >= 0) {
        // The time, in seconds relative to the session timer, the item will become clickable
        item.spawnTimeSeconds = clickTime + item.spawnIntervalSeconds;
        // Subtract a maximum of `item.spawnIntervalSeconds` points from the item points value
        const points = (
          item.spawnIntervalSeconds - Math.min(difference, item.spawnIntervalSeconds)
        );
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
   * Clear the items DOM element, reset each item's `spawnTimeSeconds` so that the items are
   * interactive when a new session starts, then set `this.items` with the updated items.
   */
  endElementClick = (event) => {
    this.resetItemsDomElementInnerHtml();
    // Create a deep copy of `this.items`
    const items = structuredClone(this.items);

    items.forEach((item) => {
      item.spawnTimeSeconds = 0;
    });

    this.items = items;
  }
}

/** Convert `number` to string `paddedValue` and left-pad with zeroes to length `length` */
function pad(number, length) {
  let paddedValue = number.toString();

  while (paddedValue.length < length) {
    paddedValue = "0" + paddedValue;
  }

  return paddedValue;
}
