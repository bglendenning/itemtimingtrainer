# Item Timing Trainer

#### Try Item Timing Trainer on [GitHub Pages](https://bglendenning.github.io/itemtimingtrainer/) - [Read the Documentation](https://bglendenning.github.io/itemtimingtrainer/documentation/)

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
