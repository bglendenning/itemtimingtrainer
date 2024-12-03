import { Communicator } from "./communicator.js";
import { Timer } from "./timer.js";

/**
* Manages items and interacts with DOM elements related to them. Item {@link Communicator}
* delegatees can accept or ignore browser `click` events depending on the item state. Item DOM
* elements are dynamically added to the DOM. Item event delegatees are dynamically added to the
* class object when the item elements are added to the DOM.
* @extends Communicator
*/
export class Items extends Communicator {
  /**
   * An item configuration that contains data required for DOM interactions.
   * @memberof Items
   * @property {string} presentationName - The name to be displayed in log entries.
   * @property {string} domElementId - The item's DOM element `id` attribute.
   * @property {number} startSpawnTimeSeconds - The time, relative to the value returned by
   * [Timer.seconds]{@link Timer#seconds(0)}, at which the event delegatee will begin accepting
   * click events when a new session is started. Defining a non-zero value will result in the item's
   * event delegatee ignoring clicks for `spawnIntervalSeconds` following a new session being
   * started.
   * @property {number} spawnIntervalSeconds - The interval for which the item's event delegatee
   * ignores `click` events after it has accepted a `click` event. This is also the points value
   * provided to [Score.addPointsToSessionScore]{@link Score#addPointsToSessionScore} when the event
   * delegatee accepts a click.
   * @property {number} spawnTimeSeconds - The time, relative to the value returned by
   * [Timer.seconds]{@link Timer#seconds(0)}, at which the item will begin accepting clicks events.
   * @property {string} backgroundColorClass - The name of a CSS class that defines a background
   * color.
   * @property {string} backgroundImageClass - The name of a CSS class that defines a background
   * image.
   * @typedef {Object<string, (string|number)>} Item
   */

  /**
   * @property {Element} items - Contains item elements.
   * @type {Object.<string, Element>}
   */
  domElements = {
    items: document.getElementsByTagName("items")[0],
  };
  static name = "Items";
  name = "Items";

  /**
   * Sets the properties required to initialize the DOM.
   */
  constructor(messageProxy) {
    super(messageProxy);
  }

  initialize = () => {
    this.items = [
      {
        presentationName: "Red Armor",
        domElementId: "itemArmorRed",
        startSpawnTimeSeconds: 0,
        spawnIntervalSeconds: 25,
        spawnTimeSeconds: 0,
        backgroundColorClass: "background-color-red",
        backgroundImageClass: "background-image-armor",
      },
      {
        presentationName: "Yellow Armor",
        domElementId: "itemArmorYellow",
        startSpawnTimeSeconds: 0,
        spawnIntervalSeconds: 25,
        spawnTimeSeconds: 0,
        backgroundColorClass: "background-color-yellow",
        backgroundImageClass: "background-image-armor",
      },
      {
        presentationName: "Megahealth",
        domElementId: "itemHealthMega",
        startSpawnTimeSeconds: 0,
        spawnIntervalSeconds: 35,
        spawnTimeSeconds: 0,
        backgroundColorClass: "background-color-blue",
        backgroundImageClass: "background-image-megahealth",
      },
    ];
  }

  #items;

  /**
   * @instance
   * @memberof Items
   * @method
   * @returns {Array.<Items.Item>} The items' configurations.
   * @summary `getter`
   * @variation 0
   */
  get items() {
    return this.#items;
  }

  /**
   * Sets the items, and creates the items' DOM elements.
   * @instance
   * @memberof Items
   * @method
   * @param {Array.<Items.Item>} items - The items' configurations to set.
   * @summary `setter`
   * @variation 1
   */
  set items(items) {
    this.#items = items;
    this.createItemsDomElements(items);
  }

  /**
   * Create a DOM element for each item in `items`, style the element, and create an event
   * delegatee for the element and add it to the class object.
   * @param {Array.<Items.Item>} items - The item configurations for which to create DOM elements and
   * event delegatees.
   */
  createItemsDomElements(items) {
    items.forEach((item) => {
      // Set the initial item spawn time
      item.spawnTimeSeconds += item.startSpawnTimeSeconds;
      const element = document.createElement("div");
      element.setAttribute("id", item.domElementId);
      element.classList.add("item", item.backgroundColorClass, item.backgroundImageClass);
      element.textContent = item.spawnIntervalSeconds.toString();
      this.domElements.items.append(element);
      this.domElements[item.domElementId] = element;
      // Create the event delegatee
      this[this.constructEventMethodName(element)] = (event) => {
        this.itemsElementClick(event);
      };
    });
  }

  /** Clear the items DOM element. */
  resetItemsDomElementText() {
    this.domElements.items.textContent = "";
  }

  /**
   * A {@link Communicator} delegatee that determines if the item is accepting clicks to
   * conditionally call [Score.addPointsToSessionScore]{@link Score#addPointsToSessionScore} to
   * handle the points value, then [creates a click log entry]{@link Logger#createLogEntry}. The
   * points value of a clicked item is equal to `item.spawnIntervalSeconds`. One point is deducted
   * per second that a click time follows `item.spawnIntervalSeconds`. A maximum value of
   * `item.spawnTimeSeconds` can be deducted from the points value, meaning that the minimum number
   * of points that can be scored is `0`.
   * @method
   */
  itemsElementClick = (event) => {
    if (this.state[Timer].process === "start") {
      // Find the item in `this.items` using the event target element's ID
      const item = this.items.find((item) => {
        return item.domElementId === event.target.getAttribute("id");
      });
      const spawnTimeAtClick = item.spawnTimeSeconds;
      const clickTime = this.state[Timer].seconds || 0;
      // A difference < 0 is early, and will be rejected
      const difference = clickTime - item.spawnTimeSeconds;

      // Pass the event to the delegatee
      if (difference >= 0) {
        // The time, in seconds, the event delegatee will begin accepting clicks at this time
        // This value is relative to the value returned by `timer.seconds()`
        item.spawnTimeSeconds = clickTime + item.spawnIntervalSeconds;
        // Subtract a point per second that a click follows `item.spawnIntervalSeconds`
        // A maximum of `item.spawnIntervalSeconds` points can be subtracted
        const points = (
          item.spawnIntervalSeconds - Math.min(difference, item.spawnIntervalSeconds)
        );

        // Select a color for the log entry
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

        this.send("points", points);
        this.send("log", {
          "entry": `
            ${item.presentationName}: ${Timer.formatTime(clickTime)}
            - ${Timer.formatTime(spawnTimeAtClick)} = ${Timer.formatTime(difference)}
            late
          `,
          "cssClass": color,
        });
      // The item element is not interactive
      } else {
        this.send("log", {
          "entry":`${item.presentationName} clicked ${Math.abs(difference)} seconds early`,
          "cssClass": "color-grey",
        });
      }
    }
  }

  /**
   * A {@link Communicator} that clears the items DOM element, resets each item's
   * `spawnTimeSeconds`, then sets [Items.items]{@link Items#items(1)} and recreates the items' DOM
   * elements and event delegatees.
   * @method
   */
  processReceive = (object, property, value) => {
    if (value === "end") {
      this.resetItemsDomElementText();
      // Create a deep copy of `this.items`
      const items = structuredClone(this.items);

      items.forEach((item) => {
        item.spawnTimeSeconds = 0;
      });

      this.items = items;
    }
  }
}
