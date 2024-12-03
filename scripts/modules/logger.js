import { Communicator } from "./communicator.js";
import { Timer } from "./timer.js";

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

  constructor(messageProxy) {
    super(messageProxy);
  }

  /**
   * Create and style a paragraph element, then prepend it to
   * [Logger.domElements.logs.textContent]{@link Logger#domElements}.
   * @param {string} content - The content to assign to the paragraph element's `textContent`.
   * @param {string} cssClass - The class to add to the paragraph element's `classList`.
   **/
  createLogEntry(content, cssClass) {
    const paragraphElement = document.createElement("p");
    paragraphElement.textContent = `${Timer.formatTime(this.state[Timer].seconds)} - ${content}`;
    paragraphElement.classList.add(cssClass, "entry");
    this.domElements.logs.prepend(paragraphElement);
  }

  /**
    * A {@link Communicator} delegatee that clears the content of
    * [Logger.domElements.logs.textContent]{@link Logger#domElements}
    * @method
    */
  clearLogsElementClick = () => {
    this.domElements.logs.textContent = "";
  }

  logReceive = (object, property, value) => {
    this.createLogEntry(value["entry"], value["cssClass"]);
  }
}
