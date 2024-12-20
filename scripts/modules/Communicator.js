/** @module modules/Communicator */

/**
 * Manages sending and receiving events to and from the message proxy. Delegates document click
 * event handling to methods. Event delegatee methods should be defined using arrow function syntax
 * to ensure that `this` will not be affected by execution context.
  */
export class Communicator {
  /**
   * The key is a DOM element `id` attribute. The value is an instance of an `Element` for that DOM
   * element.
   * @type {Object.<string, Element>}
   */
  domElements = {};
  /**
   * The name of the class for use in representing the object as a string.
   * @summary `static`
   * @type {string}
   * @variation 0
   */
  static name;
  /**
   * The name of the class for use in representing an instance of the object as a string.
   * @summary `instance`
   * @type {string}
   * @variation 1
   */
  name;
  /**
   * Various class properties necessary for the behavior of reactive components.
   * @type {Object}
   */
  state = {};

  /**
   * Sets the class message proxy, then adds a document click event listener that checks for a
   * callable property of `self` matching the delegatee method naming format. If found, the method
   * is called and provided with the event.
   * @param {Proxy} messageProxy - The application message proxy.
   */
  constructor(messageProxy) {
    this.messageProxy = messageProxy;

    document.addEventListener("click", (event) => {
      const targetId = event.target.getAttribute("id");

      if (this.domElements.hasOwnProperty(targetId)) {
        event.stopPropagation();
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
   * Prints the class name when the object is presented as a string.
   * @variation 0
   */
  static toString() {
    return this.name;
  }

  /**
   * Prints the class name when an instance of the object is presented as a string.
   * @variation 1
   */
  toString() {
    return this.name;
  }

  /**
   * Sets the state for the provided object and property to the provided value when the message
   * proxy send setter is trapped, then, if an appropriately named method exists, calls that method.
   * @param {Object} object - The sender.
   * @param {string} property - The name of the property of the seconder sender which to store the
   * state.
   * @param {number|string|boolean|Object} value - The value to set for the provided property name.
   */
  receive(object, property, value) {
    // Create a key and object for the sender if it does not exist
    if (!this.state.hasOwnProperty(object.toString())) {
      this.state[object] = {};
    }

    // Set the property state and construct the receive method name
    this.state[object][property] = value;
    const receiveMethodName = this.constructReceiveMethodName(property);

    // Call the receive method if it exists
    if (this.hasOwnProperty(receiveMethodName)) {
      this[receiveMethodName](object, property, value);
    }
  }

  /**
   * Formats a method name from the provided property name.
   * @param {string} property - The name of the property
   * @returns {string} A formatted string representing a method name.
   */
  constructReceiveMethodName(property) {
    return property + "Receive";
  }

  /**
   * Invokes the message proxy send setter.
   * @param {string} property - The name of the property.
   * @param {number|string|boolean|Object} value - The value to set for the provided property name.
   */
  send(property, value) {
    this.messageProxy.send = [this, property, value];
  }

  /**
   * Formats a method name from the provided DOM element.
   * @param {Element} element - An DOM element instance.
   * @returns {string} A formatted string represented a method name.
   */
  constructEventMethodName(element) {
    return element.getAttribute("id") + "ElementClick";
  }
}
