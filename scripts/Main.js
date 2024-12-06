/**
 * Manages the application state and instantiates the application.
 * @module Main
 */

import { Timer } from "./modules/Timer.js";
import { Score } from "./modules/Score.js";
import { Logger } from "./modules/Logger.js";
import { Target } from "./modules/Target.js";
import { Items } from "./modules/Items.js";

"use strict";

/**
 * Defines a single setter to be trapped by a Proxy for communicating component states.
 */
class Message {
  /**
   * The most important method in the application. Does nothing directly.
   * @method
   * @param {number|string|boolean|Object} message - A message to notify application components of.
   */
  set send(message) {
    //console.log("hello");
  }
}

/**
 * The main application class, which manages application state, communicates application state
 * between component classes, and initializes component classes.
 */
class Main {
  /**
   * Holds the states of application components as processed by the message proxy.
   */
  state = {};

  /**
   * Instantiates the method class, creates a proxy for the message instance, defines a setter trap
   * for the message proxy, then sets the class components property.
   * @param {...Object} components - The classes for which to pass the message proxy into and
   * conditionally initialize. The order in which they are passed is meaningful, depending on which
   * component states a given class depends on for its reactive behavior.
   */
  constructor(components) {
    const message = new Message();
    this.messageProxy = new Proxy(message, {
      set: (object, property, value) => {
        this.introspect(object, property, value);
        // Unpack the set value
        const [_object, _property, _value] = value;

        // Set the state of the sender's property
        this.state[_object].state[_property] = _value;
        // Notify application components of the message
        this.notify(
          this.state[_object].instance,
          _property,
          this.state[_object].state[_property],
        );

        return Reflect.set(object, property, value);
      },
    });

    components.forEach((Component) => {
      this.components = Component;
    });
  }

  /**
   * Sets the initial application state for the provided component.
   * @param {Function} object - The component class for which to set the state.
   */
  set components(object) {
    // Create a property for the object in the application state
    this.state[object] = {
      instance: new object(this.messageProxy),
      state: {},
    };

    const _object = this.state[object].instance;

    // If possible, initialize the component
    if (_object.hasOwnProperty("initialize") && typeof(_object.initialize) === "function") {
      _object.initialize();
    }
  }

  /**
   * For debugging and monitor message proxy setter behavior.
   * @param {Object} object - The setter sender.
   * @param {string} property - The message property set.
   * @param {Object} value - An object containing the sender component, that component's property to
   * notify other components about, and value related to that property.
   */
  introspect(object, property, value) {
    // console.log(value);
  }

  /**
   * Calls the receive method for all application components.
   * @param {Object} object - The sender component.
   * @param {string} property - The name of the sender property.
   * @param {number|string|boolean|Object} value - The value of the sender property.
   */
  notify(object, property, value) {
    for (const _object in this.state) {
      this.state[_object].instance.receive(object, property, value);
    }
  }
}

new Main([Score, Target, Logger, Timer, Items]);
