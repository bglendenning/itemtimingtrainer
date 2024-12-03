import { Communicator } from "./communicator.js";
import { Timer } from "./timer.js";
import { pad } from "./utilities.js";

/**
 * Manages scores and interacts with DOM elements related to them.
 * @extends Communicator
 */
export class Score extends Communicator {
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
  static name = "Score";
  name = "Score";

  /**
   * Sets the properties required to initialize the DOM.
   */
  constructor(messageProxy) {
    super(messageProxy);
  }

  initialize = () => {
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
    this.session += points * this.state[Timer].timescaleMultiplier
  }

  /**
   * Sets [Score.domElements.session.textContent]{@link Score#domElements} to the left-padded return
   * value of [Score.session]{@link Score#session(0)}.
   */
  updateSessionElementText() {
    this.domElements.session.textContent = pad(this.session, this.paddedLength);
  }

  timescaleMultiplierReceive = (object, property, value) => {
    this.timescaleMultiplier = value["data"];
  }

  pointsReceive = (object, property, value) => {
    this.addPointsToSessionScore(value);
  }

  processReceive = (object, property, value) => {
    if (value === "end") {
      this.session = 0;
    }
  }
}
