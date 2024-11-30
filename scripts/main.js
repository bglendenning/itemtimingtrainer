"use strict";

/**
 * Listener class methods that are called by `EventTarget` are defined using arrow function syntax.
 * This prevents `EventTarget` from binding its context to the method's `this` context, as the arrow
 * function `this` will not change based on the execution context. This eliminates the need to bind
 * the class's `this` context to the listener when it is defined.
 */

/** Manipulate DOM elements related to interacting with and presenting the logger. */
class Logger {
  constructor(timer) {
    this.timer = timer;

    this.elements = {
      logs: document.getElementById("logs"),
      clear: document.getElementById("clearLogs"),
    };

    this.elements.clear.addEventListener("click", this.clearElementClick);
  }

  /** Create and style a paragraph element, then prepend it to the logs DOM element. */
  createLogEntry(content, color) {
    const paragraphElement = document.createElement("p");
    paragraphElement.textContent = `${this.timer.formatTime(this.timer.seconds)} - ${content}`;
    paragraphElement.classList.add(color, "entry");
    this.elements.logs.prepend(paragraphElement);
  }

  /** Clear logs DOM element. */
  clearElementClick = () => {
    this.elements.logs.textContent = "";
  }
}

/**
 * Track time and manipulate DOM elements related to interacting with and presenting the
 * timer.
 */
class Timer {
  constructor() {
    this.elements = {
      clock: document.getElementById("timerClock"),
      start: document.getElementById("timerStart"),
      pause: document.getElementById("timerPause"),
      end: document.getElementById("timerEnd"),
      multiplier: document.getElementById("timerMultiplier"),
      multiplierDecrease: document.getElementById("timerMultiplierDecrease"),
      multiplierIncrease: document.getElementById("timerMultiplierIncrease"),
    };

    this.seconds = 0;
    this.interval = null;
    this.multiplier = 1;

    this.elements.start.addEventListener("click", this.startElementClick);
    this.elements.pause.addEventListener("click", this.pauseElementClick);
    this.elements.end.addEventListener("click", this.endElementClick);
    this.elements.multiplierDecrease.addEventListener(
      "click", this.multiplierDecreaseElementClick
    );
    this.elements.multiplierIncrease.addEventListener(
      "click", this.multiplierIncreaseElementClick
    );
  }

  /** The session's elapsed seconds. Used to render the clock and validate item clicks. */
  #seconds;

  get seconds() {
    return this.#seconds;
  }

  set seconds(seconds) {
    this.#seconds = seconds;
    this.updateClockElementText();
  }

  updateClockElementText() {
    this.elements.clock.textContent = this.formatTime(this.seconds);
  }

  /**
  * `null` if a session has not been started or has ended, a `setInterval` object if a session is
  * started, or `false` if a session is paused. Used to track the session state and elapsed seconds.
  * */
  #interval;

  get interval() {
    return this.#interval;
  }

  set interval(interval) {
    clearInterval(this.interval);

    if (interval) {
      this.#interval = setInterval(
        () => this.seconds += 1, (1000 / this.multiplier)
      );
    } else {
      this.#interval = interval;
    }
  }

  /** An integer factor used to increase or decrease the `setInterval` delay. */
  #multiplier;

  get multiplier() {
    return this.#multiplier;
  }

  set multiplier(multiplier) {
    if (multiplier > 0) {
      this.#multiplier = multiplier;

      // clear the existing interval, then set a new interval using the new multiplier factor
      if (this.interval) {
        this.interval = true;
      }

      this.updateMultiplierElementText();
    }
  }

  updateMultiplierElementText() {
    this.elements.multiplier.textContent = this.multiplier;
  }

  #sessionTimes = [];

  get sessionTimes() {
    return this.#sessionTimes;
  }

  /**
   * Track the session state over time by recording consecutive start and pause times. Each object
   * contains a `start` property. An `end` property is added when the session is paused. An object
   * with both properties represents a period of time in which the session was active. If the last
   * object in the array has only the `start` property, then the session is active. If the last
   * object in the array has both `start` and `end` properties, then the session is paused. If the
   * array is empty, the session hasn't been started.
   */
  set sessionTimes(value) {
    if (Array.isArray(value) && value.length === 0) {
      this.#sessionTimes = value;
    } else if (value.length > 0) {
      throw new Error(`Invalid array length for value: ${value.length}`);
    } else {
      if (isNaN(value)) {
        throw new Error(`Invalid type for value: ${typeof(value)}`);
      }

      if (this.sessionTimes.length === 0) {
        // A new session has been started
        // Add the new start time to the session times
        this.#sessionTimes.push({start: value});
      } else {
        const index = this.sessionTimes.length - 1;
        const lastSessionTime = this.sessionTimes[index];

        if (lastSessionTime.hasOwnProperty("end")) {
          // Since the last session time has an end, the session is being restarted
          // Add a new session start time
          this.#sessionTimes.push({start: value});
        } else {
          // Since the session time doesn't have an end, the session is being paused
          // Add the pause time to the last session time
          this.#sessionTimes[index].end = value;
        }
      }
    }
  }

  /**
   * Calculate minutes and remainder seconds of `timerSeconds`, pad both, and return a formatted
   * time string.
   */
  formatTime(timerSeconds) {
    const minutes = pad(Math.floor(timerSeconds / 60), 2);
    const seconds = pad(timerSeconds % 60, 2);

    return `${minutes}:${seconds}`;
  }

  /** Start the session. */
  startElementClick = () => {
    if (!this.interval) {
      this.interval = true;
      this.sessionTimes = performance.now();
    }
  }

  /** Pause the session. */
  pauseElementClick = () => {
    if (this.interval) {
      this.interval = false;
      this.sessionTimes = performance.now();
    }
  }

  /** End the session. */
  endElementClick = () => {
    if (this.interval) {
      this.interval = null;
    }

    this.seconds = 0;
    this.multiplier = 1;
    this.sessionTimes = [];
  }

  multiplierDecreaseElementClick = () => {
    this.multiplier -= 1;
  }

  /** Decrease the interval delay by increasing the multiplier factor. */
  multiplierIncreaseElementClick = () => {
    this.multiplier += 1
  }
}

/**
 * Track the score and manipulate DOM elements related to interacting with and presenting the score.
 */
class Score {
  // The string length to pad scores to
  length = 6;

  constructor(timer) {
    this.timer = timer;

    this.elements = {
      session: document.getElementById("scoreSession"),
      high: document.getElementById("scoreHigh"),
      multiplier: document.getElementById("scoreMultiplier")
    };

    this.high = 0;
    this.session = 0;

    this.timer.elements.end.addEventListener("click", () => this.session = 0);
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
    this.elements.high.textContent = pad(this.high, this.length);
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

  /** Multiply `points` by `timer.multiplier` and add to the session score. */
  addPointsToSessionScore(points) {
    this.session += points * this.timer.multiplier
  }

  updateSessionElementText() {
    this.elements.session.textContent = pad(this.session, this.length);
  }
}

/** Manipulate DOM elements related to interacting with and presenting the target. */
class Target {
  defaults = {
    left: 50, // Target DOM element left position in pixels
    top: 50, // Target DOM element top position in pixels
    side: 25, // Target DOM element width and height dimensions in pixels
  }
  pointsValue = 1;

  constructor(timer, score) {
    this.timer = timer;
    this.score = score;

    this.elements = {
      target: document.getElementById("target"),
      targetToggle: document.getElementById("targetToggle"),
      clickSession: document.getElementById("clickSession"),
    };

    this.targetElementLeft = this.defaults.left;
    this.targetElementTop = this.defaults.top;
    this.targetElementWidth = this.defaults.side;
    this.targetElementHeight = this.defaults.side;
    this.targetElementVisibility = this.elements.targetToggle;
    this.updateClickSessionElement();

    this.elements.target.addEventListener("click", this.targetElementClick);
    this.elements.targetToggle.addEventListener("click", this.targetToggleElementClick);
    this.timer.elements.start.addEventListener("click", this.startElementClick);
    this.timer.elements.end.addEventListener("click", this.endElementClick);
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
    this.elements.target.style.left = `${this.targetElementLeft}px`;
    this.elements.target.style.top = `${this.targetElementTop}px`;
    this.elements.target.style.width = `${this.targetElementWidth}px`;
    this.elements.target.style.height = `${this.targetElementHeight}px`;
    this.elements.target.style.visibility = this.targetElementVisibility;
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
    if (this.timer.interval) {
      if (Array.isArray(value)) {
        this.#clickTimes = value;
      } else {
        this.#clickTimes.push(value);

        if (this.clickTimes.length === 2) {
          // Generate a click interval from the two consecutive click times
          this.clickIntervals = this.clickTimes;
          // Remove the older click time to prepare for the next click time
          this.#clickTimes.splice(0, 1);
        }
      }

      this.updateClickSessionElement();
    }
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
        console.log(clickTimes);
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
    this.elements.clickSession.textContent = `${this.clickIntervals}`;
  }

  /** Sum the duration of time that the session was paused between two click times. */
  getPauseDurationBetweenClicks(startClick, endClick) {
    const sessionTimes = this.timer.sessionTimes;

    return sessionTimes.reduce((totalTime, sessionTime, index) => {
      const nextIndex = index + 1;

      if (nextIndex in sessionTimes) {
        if (sessionTime.end > startClick && sessionTimes[nextIndex].start < endClick) {
          return totalTime + sessionTimes[nextIndex].start - sessionTime.end;
        }
      }

      return totalTime;
    }, 0);
  }

  /**
   * Set the target DOM element to random dimensions and position, and add the points value to the
   * session score.
   */
  targetElementClick = () => {
    if (this.timer.interval && this.elements.targetToggle.checked) {
      this.clickTimes = performance.now();
      this.setRandomTargetElementDimensions();
      this.setRandomTargetElementPositions();
      this.score.addPointsToSessionScore(this.pointsValue);
    }
  }

  targetToggleElementClick = (event) => {
    this.targetElementVisibility = event.target;
  }

  startElementClick = () => {
    // Add a clickTime when a new session is started
    if (this.clickTimes.length === 0) {
      this.clickTimes = performance.now();
    }

    this.setRandomTargetElementDimensions();
    this.setRandomTargetElementPositions();
  }

  endElementClick = () => {
    this.resetTargetElementPosition();
    this.resetTargetElementDimensions();
    this.resetClickTimes();
  }
}

/** Track items and manipulate DOM elements related to interacting with and presenting items. */
class Items {
  constructor(timer, logger, score) {
    this.timer = timer;
    this.logger = logger;
    this.score = score;

    this.elements = {
      items: document.getElementById("items"),
    }

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

    this.timer.elements.end.addEventListener("click", this.resetElementClick);
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
      this.elements.items.append(element);
      element.addEventListener("click", this.itemElementClick);
    });
  }

  resetItemsDomElementInnerHtml() {
    this.elements.items.textContent = "";
  }

  /**
   * Determine if the item clicked is interactive, and, if it is, add the item's point value to the
   * session score, then log the click, else log the early click.
   */
  itemElementClick = (event) => {
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
  resetElementClick = () => {
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
