# Item Timing Trainer Documentation

[GitHub Repository](https://github.com/bglendenning/itemtimingtrainer/)
[Item Timing Trainer on GitHub Pages](https://bglendenning.github.io/itemtimingtrainer/)

This is an exercise in documentation. The intent is to gain experience and insight into the process
by writing with a focus on brevity, clarity, and thoroughness. No guarantee is provided as to the
achievement of those goals.

Item Timing Trainer is a personal project that has been overhauled twice over ~15 years. The initial
(and current) intent was (and is) to develop a pure HTML, CSS, and Javascript application without
the reliance on frameworks or libraries&mdash;an "intrinsic" approach that is enjoyable for the less
stringent reliance on keeping up with often-chaotic practices and standards manifested by the
teeming development technologies ecosystems. The core language APIs tend to be more mature and
robust than those of frameworks and libraries, and the problems presented by using core language
features leads to a fuller understanding of the platforms they are implemented on, as well as an
ability to more capably understand the frameworks and libraries that depend on them, whereas working
with frameworks and libraries obscures the intrinsic properties of the language with idiomatic
conventions that, when learned, don't frequently transfer to capability with other frameworks of
libraries.

Much of the current iteration of Item Timing Trainer is inspired by my experience with Python
development over the past 5 years, and the motivation for documenting it comes from experience
working with other developers in professional settings. Documentation is difficult, and, in private
enterprise, often grossly lacking, with few opportunities for practicing it, and even fewer
opportunities for feedback, as developers tend to avoid reading it.

The current code is class-based, and was composed with an emphasis on being self-documenting. Effort
is mindfully exerted into carefully selecting meaningful symbol names with consistent qualities,
encapsulating similar functionality in coherent structures, abstracting complex functionality
into simpler forms without creating confusing relationships, and avoiding the use of esoteric
language features or difficult-to-read solutions for the sake of reducing line count.

## Event Delegation

Item Timing Trainer was originally designed so that one or more listeners were added to the client
per interactive DOM element. If a single `click` event needed to be listened to by separate parts of
the application, then a those parts of the application would add listeners as required.

Event delegation is now implemented. The `ClickEventListener` class serves as a mixin that adds a
`click` event listener to `document` per instantiated subclass. `ClickEventListener` dictates a
listener naming format, `<DOM element ID>ElementClick`. When the subclass's listener receives an
event, it checks the subclass object for a property that matches the naming format. If a property is
found, then the listener tests whether it is callable, and, if so, calls the property, passing the
event as a parameter to the method, referred throughout the documentation as an `event delegatee`. 

## JSDoc Nuances

The documentation was created using [JSDoc](https://jsdoc.app/). An interesting solution for
manipulating JSDoc rendering&mdash;which doesn't handle `getter` and `setter` documentation
well&mdash; was developed to improve the resultant documentation. An example:

```javascript
class ClassName {
  #privateProperty = "stay off";

  /**
   * Gets the value.
   * @instance // Allows the method to be referenced as `ClassName#getterMethod`
   * @memberof ClassName // Ensures the method is shown with the `ClassName` documentation 
   * @method // Classifies the method as a method, since JSDoc classifies it as a member
   * @returns {string}
   * @summary `getter` // The summary is shown above the description
   * @variation 0 // Allows for linking to symbols with the same `namepath`
   */
  get privateProperty() {
    return this.#privateProperty;
  }

  /**
   * Sets the value of [ClassName.privateProperty]{@link ClassName#privateProperty(0)}.
   * @instance
   * @memberof ClassName
   * @method
   * @param {string} message
   * @summary `setter`
   * @variation 1
   */
  set privateProperty(message) {
    this.#privateProperty = message;
  }
}
```

Class method symbols are not linked by the JSDoc compiler without applying `@instance` (or the
relevant method classification), and will be displayed in `Global` scope without specifying
`@memberof`. Because `getter` and `setter` are separate methods, those methods are displayed twice
with the same name in the documentation. This is initially confusing to follow, especially without
much insight to `getter` and `setter` behavior, as the reader must parse each method for
information, such as whether a return value or an input parameter is documented, indicating an
identifying difference in how `getters` and `setters` are implemented. Using `@summary` allows for
denoting each same-named method's utility, while still accurately depicting the code structure, and
maintaining the nuanced level of detail afforded by describing the same-named methods separately.
