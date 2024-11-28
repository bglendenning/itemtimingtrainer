# Item Timing Trainer

Item Timing Trainer was created around the peak of [Quake Live](https://store.steampowered.com/app/282440/Quake_Live/)
player population. Quake Live is an arena FPS with some game types in which the player benefits from developing the
ability to anticipate when power-ups will spawn during a match. The calculations for determining when a power-up will
spawn after picking it up can be confusing for unaccustomed players.

As an example, Quake Live duel maps feature two common forms of power-ups: megahealth and colored armors. The standard
spawn time for colored armors is 25 seconds, and, for megahealth, 35 seconds. Matches can be intensely dynamic, with
many context switches and distractions, which can lead to difficulty for players to mindfully perform the calculations
necessary to compute a picked-up item's next spawn time. Additional difficulty is presented when the player must
calculate a spawn time that extends into the next minute of the match, because determining the remainder over _60_ of
_48 + 35_ isn't commonly an intuitive process for those familiar with decimal calculations.

Item Timing Trainer is designed to work similarly to flash card practice. Through repetitive practice, the player will
develop familiarity with the calculations, and over time will come to recognize patterns and relationships in the
process, and memorize results, such that, when in game, the player will no longer experience the stress of calculating
spawn times, and can focus on building the habits of being mindful of spawn times when items are picked up, and of
maintaining multiple spawn times in memory over time.

The project is infrequently updated in fits of motivation to restructure and modernize it according to how my experience
has shaped my approach to web development as the years pass. It isn't so much a passion project as a basically-solved
multifaceted problem that can adapt and evolve to changing technologies. The only restrictions I've imposed are that the
project should not rely on any frameworks or libraries for manipulating the DOM. It's essentially a naive web
development playground to practice composing code to my standards at a given point in time without deadlines, client
demands, or compromise with team members.

# Using Item Timing Trainer

Clone the repository and open `index.html` in a web browser. In addition to the item timing aspect of the project, a
simple target practice activity is provided. The intent is to give the player a task to perform while practicing timing
to simulate a small amount of the distracting multitasking required by arena FPS games.

The timescale can be adjusted in increments of _1_. This will multiply the rate at which the timer seconds accrue,
allowing players to introduce greater challenge as they adapt to the process. Activity point values are multiplied by
the timescale.

## Customization

Though Item Timing Trainer was designed to represent Quake Live item properties, various features can be easily
customized.

### Items

Items are [defined](index.html#L633-L658) in the `Items` class.

#### Item Properties

* `presentationName`: The name to present when logging item clicks.
* `domElementId`: A valid DOM element ID for use in creating the item's DOM element.
* `spawnIntervalSeconds`: The interval between when an item is picked up and will spawn again.
* `spawnTimeSeconds`: The next time, relative to the current session timer, at which the item will
   spawn. This value can be defined as greater than 0.
* `backgroundColorClass`: The name of one of the project's [background color classes](index.html#L143-L165).
* `logTextColorClass`: The name of one of the project's [color classes](index.html#L119-L141).

### Target

The target defaults and point value are [defined](index.html#L477-L482) in the `Target` class.

* `target.defaults.left`: The target DOM element's default left position in pixels.
* `target.defaults.top`: The target DOM element's default top position in pixels.
* `target.defaults.side`: The target DOM element's default width and height in pixels.
* `target.pointValue`: The value&mdash;before timescale adjustment&mdash;to add to the session score
   when the target is clicked.
