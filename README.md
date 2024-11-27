# Item Timing Trainer

Item Timing Trainer was created around the peak of [Quake Live](https://store.steampowered.com/app/282440/Quake_Live/)
player population. Quake Live is an arena FPS with some game types in which the player benefits from developing the
ability to anticipate when power-ups will spawn during a match. The calculations for determining when a power-up will
spawn after picking it up can be confusing for unaccustomed players.

As an example, Quake Live duel maps feature two common forms of power-ups: megahealth and colored armors. The standard
spawn time for colored armors is 25 seconds, and, for megahealth, 35 seconds. Matches can be intensely dynamic, with
many context switches and distractions, which can lead to difficulty for players to mindfully perform the calculations
necessary to compute a picked up item's next spawn time. Additional difficulty is presented when the player must
calculate a spawn time that extends into the next minute of the match, because determining the remainder over _60_ of,
for instance, _48 + 35_, isn't commonly an intuitive process for those familiar with decimal calculations.

Item Timing Trainer was designed to work similarly to flash card practice. Through repetitive practice, the player will
develop familiarity with the calculations, and over time will come to recognize patterns and relationships in the
process, and memorize results, such that, when in game, the player will no longer experience the stress of calculating
spawn times, and can focus on building the habits of being mindful of spawn times when items are picked up, and of
maintaining multiple spawn times in memory over time.

The project is no longer actively developed. It is left for the posterity of those who may find themselves interested in
mastering this esoteric skill.

# Using Item Timing Trainer

Clone the repository and open `index.html` in a web browser. In addition to the item timing aspect of the project, a
simple target practice activity is provided. The intent is to give the player an activity to perform while practicing
timing in order to simulate&mdash;to a much smaller degree&mdash;the distracting multitasking required by arena FPS games.

The timescale can be adjusted in increments of _1_. This will multiply the rate at which the timer seconds accrue,
allowing players to introduce greater challenge as they adapt to the tasks. Score is multiplied by the timescale.

## Customization

Though Item Timing Trainer was designed to represent Quake Live item properties, various features can be easily
customized.

### Items

Items are [represented as objects](index.html#L249-L277) in
the return value of [Config.setConfig](index.html#L200).
Items can be added, removed, or edited. The data structure of an item follows:

* `name`: Used for logging training activity.
* `id`: The DOM element ID, used for event handling and DOM manipulation.
* `interval`: The interval, in seconds, after picking up the item that it will spawn.
* `spawnTime`: The time, in seconds, at which the item will next spawn.
* `bg`: The background color of the item's DOM element. Colors are mapped to CSS classes in
  [bgColors](index.html#L186-L193).
* `fg`: The color of the item's related log entries. Colors are mapped to CSS classes in
  [fgColors](index.html#L177-L184)

### Target

The target configuration is
[represented as an object](index.html#L208-L222) in the
return value of [Config.setConfig](index.html#L200). The
data structure of an item follows:

* `target.dimensions.width`: The width, in pixels, of the target.
* `target.dimensions.height`: The height, in pixels, of the target.
* `target.positions.left`: The left position, in pixels, at which the target will initially be rendered.
* `target.positions.top`: The top position, in pixels, at which the target will initially be rendered.
* `target.scoreValue`: This value will be used in calculating the value to add to the session score when the target is
  clicked.
* `target.elements.target`: The target DOM element.
* `target.elements.checkbox`: The enable/disable target checkbox DOM element.
