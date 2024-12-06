/** @module modules/Logger */

import { Communicator } from "./Communicator.js";
import { Timer } from "./Timer.js";

/**
 * Interacts with DOM elements related to activity logging.
 * @extends Communicator
 */
export class Logger extends Communicator {
  /**
   * @property {Element} logs - Displays the log entries.
   * @property {Element} clearLogs - Can be clicked to clear the log entries.
   * @type {Object.<string, Element>}
   */
  domElements = {
    logs: document.getElementById("entries"),
    clearLogs: document.getElementById("clearLogs"),
  };
  static name = "Logger";
  name = "Logger";

  /** @see {@link Communicator} */
  constructor(messageProxy) {
    super(messageProxy);
  }

  /**
   * Creates and styles a paragraph element, then prepend it to the logs DOM element.
   * @param {string} content - The content to assign to prepend to the logs.
   * @param {string} cssClass - The class to add to the paragraph element.
   **/
  createLogEntry(content, cssClass) {
    const paragraphElement = document.createElement("p");
    paragraphElement.textContent = `${Timer.formatTime(this.state[Timer].seconds)} - ${content}`;
    paragraphElement.classList.add(cssClass, "entry");
    this.domElements.logs.prepend(paragraphElement);
  }

  /**
    * An event listener delegatee that clears the logs DOM element.
    * @method
    */
  clearLogsElementClick = () => {
    this.domElements.logs.textContent = "";
  }

  /**
   * Handles log entry notifications from the application.
   * @method
   */
  logReceive = (object, property, value) => {
    this.createLogEntry(value["entry"], value["cssClass"]);
  }
}
