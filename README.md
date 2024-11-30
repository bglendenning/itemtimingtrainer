# Item Timing Trainer

Item Timing Trainer was created around the peak of [Quake Live](https://store.steampowered.com/app/282440/Quake_Live/)
popularity. Quake Live is an arena FPS with game types in which the player benefits from developing the ability to
anticipate when power-ups will spawn during a match. The calculations for determining when a power-up will spawn after
picking it up can be confusing for unaccustomed players.

Quake Live duel maps feature two common forms of power-ups, megahealth and colored armors. The standard spawn time for
armors is 25 seconds, and 35 seconds for megahealth. Matches can be intensely dynamic, with many context switches and
distractions that can lead to difficulty for players to mindfully calculate picked-up item's next spawn time. Difficulty
compounds when the player must calculate a spawn time that extends into the next minute of the match, because
determining the remainder over _60_ of, as an example, _48 + 35_, isn't a commonly intuitive process.

Through practice, the player will develop familiarity with the patterns and relationships in the process, and memorize
results, such that, when in game, the player will less beholden to the mental demands of calculating spawn times, and
can focus on building habits of remembering them.

The project is infrequently updated in fits of motivation to restructure and modernize it according to how my experience
and personality has shaped my approach to web development and productivity over the years. It isn't so much a passion
project as a basically-solved multifaceted problem that can adapt and evolve to changing technologies. The only
restrictions I've imposed are that the project will not use any frameworks or libraries for manipulating the DOM. It's
essentially a naive web development playground to practice composing code to my standards at a given point in time
without deadlines, client demands, or compromise with team members, for better or worse.

# Using Item Timing Trainer

Item Timing Trainer can be accessed at its GitHub Pages [page](https://bglendenning.github.io/itemtimingtrainer/). The
page contains instructions for how to operate the game.

# Customization

Though Item Timing Trainer is designed to represent Quake Live item properties, various features can be customized to
represent other games or desired scenarios. To do so, clone the repository and edit `index.html`. To test changes, open
the local copy of `index.html` in a web browser. 

## Items

Items are [defined](index.html#L864-L889) in the `Items` class.

* `presentationName`: The name to present when logging item clicks.
* `domElementId`: A valid DOM element ID for use in creating the item's DOM element.
* `spawnIntervalSeconds`: The interval between when an item is picked up and when it will spawn again.
* `spawnTimeSeconds`: The next time, relative to the current session timer, at which the item will spawn. If defined as
  0, the item can be picked up immediately upon starting a session, else the item will spawn `spawnTimeSeconds` after
  the session starts.
* `backgroundColorClass`: The name of one of the project's [background color classes](index.html#L180-L202).

## Target

The target defaults and point value are [defined](index.html#L590-L595) in the `Target` class.

* `target.defaults.left`: The target DOM element's default left position in pixels.
* `target.defaults.top`: The target DOM element's default top position in pixels.
* `target.defaults.side`: The target DOM element's default width and height in pixels.
* `target.pointsValue`: The value&mdash;before timescale adjustment&mdash;to add to the session score when the target is 
  clicked.
