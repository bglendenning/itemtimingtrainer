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

## Versions

One detriment to the experimental/exploratory direction of the `main` branch is that the modularized approach to the
JavaScript application structure prevents running an application in a browser from the local filesystem. There are
currently two circumventions for this limitation.

### qltiming

The original project, _qltiming_, was created in 2014 and had a very rudimentary functional design that is still an
appealing approach to web application development. While the application structure on `main` is complex in its
organization, requires greater than entry-level familiarity with JavaScript, and supports configuration of item data,
qltiming is much more concise, precise, and&mdash;somewhat appreciably&mdash;naive in its design. To try qltiming,
check out the qltiming branch and open _index.html_ in a web browser.

### Item Timing Trainer

#### 2022

In 2022, _qltiming_ was pilfered from its original BitBucket repository, and whimsically updated to use ECMA classes as
an experiment in even-then-not-so-modern JavaScript development patterns. A very naive class-based implementation was
created and tweaked until everything appeared to be functional. This version maintains qltiming's ability to be run in a
browser from the local filesystem. To try the 2022 update, check out `main` at commit
`8bb051d116e0b3dd9f0f10d0454629e93e8a6a5b`, then open _index.html_ in a web browser.

#### 2024

In 2024, Item Timing Trainer was again whimsically updated to explore JavaScript with my latest understanding of web
development and general software design. Due to its modular design, the application must be accessed on a web server for
most&mdash;if not all&mdash;modern web browsers to execute the JavaScript.

## A Pragmatic Review

Having iterated on the "architecture" of this project twice, my conclusion is that the "original" approach is the most
appropriate for a project of this scale. There are benefits to a modular approach, in which stylesheets and JavaScript
are distributed as separate files and modules, such as caching considerations and code readability related to project
organization and structure. However, those benefits introduce detriments, such as reduced portability (e.g. the
inability to run the application in the absence of a web server), and increased development overhead (e.g. excessive
documentation requirements and specialized knowledge of ECMA syntax and a bespoke code base).

The same functional user experience is achieved in a single naive HTML file as that of a more sophisticated modular
application. Though the more-sophisticated approach introduces DOM event listener delegation and its own application
state manager that reduces general reliance on event listeners, the naive approach offers the same user experience with
virtually no difference in resource requirements (ignoring the aesthetic differences in presentation).

Ultimately, as an exercise in technical development, the modular approach is rewarding and enjoyable in its allowance
for exploration and adventure in JavaScript. However, the boundaries imposed by the naive design are similarly rewarding
and enjoyable, and offer perspective on how useful, engaging, and portable naive JavaScript/HTML/CSS can be when
isolated from the modern web production and deployment zeitgeist (e.g. large applications built on package managers
deployed to virtual servers).
