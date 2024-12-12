# Item Timing Trainer Documentation

[GitHub Repository](https://github.com/bglendenning/itemtimingtrainer/) - [Item Timing Trainer on GitHub Pages](https://bglendenning.github.io/itemtimingtrainer/)

Item Timing Trainer is a personal project that has been overhauled twice over ~15 years. The intent
is to develop a pure HTML, CSS, and Javascript application without the reliance on frameworks or
libraries.

The current design is class-based, and was composed with an emphasis on being self-documenting.
Effort is mindfully exerted into carefully selecting meaningful symbol names with consistent
qualities, encapsulating similar functionality in coherent structures, abstracting complex
functionality into simpler forms without creating confusing relationships, and avoiding the use of
esoteric language features and difficult-to-read solutions for the sake of reducing line count.

## Event Delegation and State Management

The `Communicator` class adds click event listeners that route click events
to _event listener delegatees_. The event listener delegatee methods are specially-named, which
allows the methods to be automatically called for relevant events. `Communicator` also provides the
functionality for routing message proxy notifications to specially-named receiver methods.

The `Main` class creates a proxy for the `Message` class. The proxy is provided to all classes
instantiated by `Main`. The proxy implements a setter trap, which, when accessed, calls
`Main.notify()` to forward intercepted data to the rest of the application, allowing for reactivity.
The `Communicator` class provides functionality to send and receive messages.
