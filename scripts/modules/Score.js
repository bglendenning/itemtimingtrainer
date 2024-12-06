/** @module modules/Score */

import { Communicator } from "./Communicator.js";
import { Timer } from "./Timer.js";
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

  /** @see {@link Communicator} */
  constructor(messageProxy) {
    super(messageProxy);
  }

  /**
   * Sets the initial state.
   * @method
   */
  initialize = () => {
    this.highScore = 0;
    this.sessionScore = 0;
  }

  #highScore;

  /**
   * The high score.
   * @member
   * @type {number}
   * @variation 0
   */
  get highScore() {
    return this.#highScore;
  }

  /**
   * Sets the high score and updates the high score DOM element.
   * @method
   * @param {number} score - The number of points to set the high score to.
   * @variation 1
   */
  set highScore(score) {
    this.#highScore = score;
    this.updateHighScoreElementText();
  }

  /**
   * Sets the high score DOM element content to the current high score.
   */
  updateHighScoreElementText() {
    this.domElements.high.textContent = pad(this.highScore, this.paddedLength);
  }

  #sessionScore;

  /**
   * The session score.
   * @member
   * @type {number}
   * @variation 0
   */
  get sessionScore() {
    return this.#sessionScore;
  }

  /**
   * Sets the session score, updates the session score DOM element, and conditionally sets the high
   * score.
   * @method
   * @param {number} points - The number of points to set the session score to.
   * @variation 1
   */
  set sessionScore(points) {
    this.#sessionScore = points;
    this.updateSessionElementText();

    if (this.#sessionScore > this.highScore) {
      this.highScore = this.#sessionScore;
    }
  }

  /**
   * Multiplies the provided points value by the current timescale multiplier, adds that product to
   * ehe session score, then sets the session score.
   * @param {number} points - The number of points to add to the session score.
   */
  addPointsToSessionScore(points) {
    this.sessionScore += points * this.state[Timer].timescaleMultiplier
  }

  /** Sets the session score DOM element content to the current session score. */
  updateSessionElementText() {
    this.domElements.session.textContent = pad(this.sessionScore, this.paddedLength);
  }

  /**
   * Adds points to the session score.
   * @method
   * @see {@link Score#receive}
   */
  pointsReceive = (object, property, value) => {
    this.addPointsToSessionScore(value);
  }

  /**
   * Sets the session score to 0.
   * @method
   * @see {@link Score#receive}
   */
  processReceive = (object, property, value) => {
    if (value === "end") {
      this.sessionScore = 0;
    }
  }
}
