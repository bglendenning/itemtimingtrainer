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
language features and difficult-to-read solutions for the sake of reducing line count.

## Event Delegation and State Management

The `Communicator` class adds click event listeners that route click events
to _event listener delegatees_. The event listener delegatee methods follow a specific naming
format, which allows the methods to be automatically called for relevant events.

The `Main` class creates a `Proxy` for the `Message` class. That proxy features a setter trap, which
calls `Main.notify()`. The message proxy is passed into all the classes, which use the proxy to
send messages through main to the other classes. When the message proxy trap is executed, it calls
`Main.notify()`, which forwards data captured in the trap to all classes. The `Communicator`
class provides functionality to send, receive, and distribute interclass messages.