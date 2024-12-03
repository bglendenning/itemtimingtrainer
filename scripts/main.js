import { Timer } from "./modules/timer.js";
import { Score } from "./modules/score.js";
import { Logger } from "./modules/logger.js";
import { Target } from "./modules/target.js";
import { Items } from "./modules/items.js";

"use strict";

class Message {
  set send(message) {
    //console.log("hello");
  }
}

class Main {
  state = {};

  constructor(components) {
    this.componentsLength = components.length
    const message = new Message();
    this.messageProxy = new Proxy(message, {
      set: (object, property, value) => {
        this.introspect(object, property, value);
        const [_object, _property, _value] = value;

        this.state[_object]["state"][_property] = _value;
        this.notify(
          this.state[_object]["instance"],
          _property,
          this.state[_object]["state"][_property],
        );

        return Reflect.set(object, property, value);
      },
    });

    components.forEach((Component) => {
      this.components = Component;
    });
  }

  set components(Object) {
    this.state[Object] = {
      instance: new Object(this.messageProxy),
      state: {},
    };

    const object = this.state[Object].instance;

    if (object.hasOwnProperty("initialize") && typeof(object.initialize) === "function") {
      object.initialize();
    }
  }

  introspect(object, property, value) {
    // console.log(value);
  }

  notify(object, property, value) {
    for (const _object in this.state) {
      this.state[_object].instance.receive(object, property, value);
    }
  }
}

new Main([Score, Target, Logger, Timer, Items]);
