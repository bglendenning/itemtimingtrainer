/**
 * Delegates `document` `click` event handling to subclass methods. Delegatee method names must be
 * formatted as `<DOM element ID>ElementClick`. Delegatee methods should be defined using arrow
 * function syntax to ensure that `this` will not be affected by execution context.
  */
export class Communicator {
  /**
   * The key is a DOM element `id` attribute. The value is an instance of an `Element` for that DOM
   * element.
   * @type {Object.<string, Element>}
   */
  domElements = {};
  name;
  static name;
  state = {};

  /**
   * Adds a `click` event listener to `document`. The listener checks subclasses for a callable
   * property that matches the requisite listener naming format. If found, the property is called
   * and provided with the `event` parameter.
   */
  constructor(messageProxy) {
    this.messageProxy = messageProxy;

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

  static toString() {
    return this.name;
  }

  toString() {
    return this.name;
  }

  receive(object, property, value) {
    if (!this.state.hasOwnProperty(object)) {
      this.state[object] = {};
    }

    this.state[object][property] = value;
    const receiveMethodName = this.constructReceiveMethodName(object, property);

    if (this.hasOwnProperty(receiveMethodName)) {
      this[receiveMethodName](object, property, value);
    }
  }

  constructReceiveMethodName(object, property) {
    return property + "Receive";
  }

  send(property, value) {
    this.messageProxy.send = [this, property, value];
  }

  /**
   * @param {Element} element - An instance of an `Element`.
   * @returns {string} A method name constructed with the format `<DOM element ID>ElementClick`.
   */
  constructEventMethodName(element) {
    return element.getAttribute("id") + "ElementClick";
  }

  ready() {
    this.messageProxy.send = [this, "ready", true];
  }
}
