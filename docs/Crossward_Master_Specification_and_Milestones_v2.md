# Crossward Game — Complete Product, Game, UI, Technical & Implementation Specification

**Document status:** Master implementation specification  
**Purpose:** Source of truth for an AI coding agent implementing the Crossward game  
**Project type:** Personal / hobby / friendly competition among friends  
**Primary language of the puzzle:** Hebrew (right-to-left)  
**Development approach:** Local-first, emulator-based, milestone-driven, testable at every step  
**Deployment target:** Firebase for the application/database/services, while the existing puzzle-image processing Python container remains external on Render

---

# 1. Document Purpose

This document defines the Crossward game sufficiently for an AI implementation agent to build it incrementally without having to rediscover the intended product behavior.

The document covers:

- Product purpose and scope
- Game concept
- Players and administration
- Room lifecycle
- Crossword representation
- Hebrew RTL crossword rendering
- Puzzle interaction
- Clue submission
- Admin approval
- Scoring
- Reveal behavior
- State transitions
- Data model
- UI/UX requirements
- Visual design
- Background motifs
- Responsive behavior
- Security and validation concerns
- Backend/frontend responsibilities
- Existing external image-processing service
- Local development
- Firebase emulator requirements
- Testing strategy
- Git workflow
- Very small, traceable milestones
- Definition of done for each milestone
- Progress tracking
- Deployment preparation

The AI agent should treat this document as the authoritative product specification unless a later explicit user instruction changes a requirement.

---

# 2. Product Vision

Crossward is a friendly competitive crossword game for subscribers/friends.

The core experience is not a traditional single-player crossword application. It is a shared competitive room in which multiple players solve the same crossword and compete to be the first player to correctly solve individual clues.

Each game consists of one or more rooms.

Each room contains:

- One crossword puzzle
- The crossword matrix
- The clue definitions/metadata
- The original crossword image
- Players currently participating
- Player-specific state
- Clue solution state
- Scoring information
- Admin state
- Submission/approval information
- Optional reveal state

The experience should feel like a game rather than an enterprise application.

The site is for fun and personal use. It is not a commercial SaaS product.

The implementation should therefore prioritize:

1. Correct game behavior
2. Clear interaction
3. Comfortable crossword solving
4. Reliable state management
5. Testability
6. Simple maintainable architecture
7. Attractive but restrained visual design

Avoid unnecessary complexity.

---

# 3. Source Requirements and Terminology

The original specification describes the following fundamental concepts:

- Several rooms exist.
- Each room contains one crossword and its participating players.
- A Python backend script already processes a crossword image and returns JSON describing the puzzle.
- Matrix values:
  - `0` = black cell
  - `1` = white cell
  - `2` = clue-start cell
- Clue metadata indicates whether the clue is horizontal, vertical, or both.
- The crossword is Hebrew and therefore displayed right-to-left.
- Clue numbering is calculated from the matrix.
- Players have their own colors.
- Players can enter any room.
- Players have room score and total score.
- Admin creates rooms and uploads images.
- Admin does not participate in scoring.
- Admin can solve clues in an admin-only workflow.
- Admin publishes approved solutions.
- Player submissions can be approved or declined.
- The first correct player solution receives two points.
- A later correct suggestion receives one point if the clue has not already been solved by another player.
- Once a clue is solved by a player, only that player's color is used for the solved clue.
- Revealing a solution gives no points.
- Admin can close a room.
- The application should use Firebase locally through emulators.
- Development occurs locally first and deployment occurs later.
- The demo can initially create players by name only.
- Password/authentication is a later concern before real deployment.
- The current admin is hardcoded as `Tal` for the demo.
- The site should contain crossword motifs without excessive decoration.
- Player colors should be very bright.
- Semi-transparent clue words can flow randomly in the page background.
- Development must be divided into small, independently testable milestones.
- Each milestone uses a feature branch named `feature/MileStoneXX`.
- `develop` is the main integration branch.

---

# 4. Explicit Scope

## 4.1 MVP / initial implementation

The initial implementation should support:

- Local application startup
- Firebase emulator environment
- Room creation
- Crossword image upload/input
- Consumption of the existing puzzle-processing service
- Matrix generation
- Hebrew RTL crossword rendering
- Clue numbering
- Clue direction metadata
- Interactive cells
- Player creation for demo purposes
- Room joining
- Player colors
- Player clue solving
- Full-clue submission
- Admin solution workflow
- Approval/decline workflow
- Player solved state
- Correct scoring
- Reveal solution
- Room closure
- Room score
- Total score
- Basic rooms page
- Room view
- Admin view
- Basic responsive UI
- Automated tests for core rules
- Emulator-based local integration tests

## 4.2 Explicitly deferred

Do not invent or implement these unless separately requested:

- Production authentication
- Password management
- Commercial subscription/payment system
- Public registration
- Social login
- Advanced anti-cheat
- Large-scale infrastructure
- AI clue generation
- Network-wide video/image crawling
- Complex analytics
- Advertising
- Paid features
- Enterprise administration
- Real-money competition

---

# 5. Core Game Concept

A room represents one active crossword competition.

Players enter a room.

Every player sees the same crossword structure.

Every player has an independent answer grid.

Players attempt to solve clues.

A player submits a clue solution only when the cells belonging to that clue are completely filled.

The system evaluates the submission against the room's authoritative solution.

The first accepted player to solve an unsolved clue receives 2 points.

After a clue has already been solved by a player, no other player can become the winner of that clue.

Other players can still reveal the answer.

If a player has not revealed the answer and submits a correct solution under the appropriate unresolved conditions, they can receive 1 point according to the game rule.

A player's color identifies clues that the player has won.

Admin is the authority for solution approval and does not compete.

---

# 6. Roles

## 6.1 Player

A player can:

- Enter rooms
- View the crossword
- Enter letters
- Select clues
- Fill clue answers
- Submit completed clue answers
- Receive approval/decline notifications
- See solved clue colors
- Reveal solutions
- View room score
- View total score

A player cannot:

- Approve another player's answer
- Change authoritative solutions
- Publish admin solutions
- Change room structure
- Change another player's score
- Participate as admin in scoring

---

# 7. Admin

The admin is the game master.

The current demo admin is hardcoded as:

`Tal`

This is a temporary development behavior only.

Admin can:

- Create rooms
- Upload/select the crossword image
- View the generated puzzle matrix
- View the room
- Solve clues in the admin view
- Store admin draft solutions
- Publish solutions
- Review pending player submissions
- Approve submissions
- Decline submissions
- Close rooms
- View room activity/state
- View all clue solution states

Admin does not:

- Receive player points
- Compete for clues
- Become the player color
- Count as a participant for scoring

---

# 8. Room Model

A room is the main game container.

A room should conceptually contain:

```text
Room
├── room identity
├── room status
├── crossword image
├── puzzle matrix
├── calculated clues
├── authoritative solutions
├── participants
├── player states
├── clue states
├── pending submissions
├── admin drafts
├── scoring
├── timestamps
└── lifecycle metadata
```

## 8.1 Room lifecycle

Recommended states:

```text
DRAFT
OPEN
ACTIVE
CLOSED
```

The minimum required user behavior is:

- Admin creates room
- Room becomes available
- Players enter
- Game is active
- Admin may close room

The exact transition between `OPEN` and `ACTIVE` may be simplified during MVP if necessary, but the data model should not prevent the distinction later.

---

# 9. Room Closure

Admin can close a room at any time.

After closure:

- Players cannot submit new solutions.
- New player participation should be prevented.
- Existing crossword state remains readable.
- Scores remain visible.
- Existing room history remains available.
- Reveal may remain available if that is consistent with the final UI.
- No scoring changes should occur after closure.

Closing must be idempotent.

Repeated close requests must not corrupt data.

---

# 10. Puzzle Image Processing

An existing Python script already runs inside a Render-hosted container.

Its purpose is to receive a crossword image and return JSON representing the crossword structure.

The application must consume that output rather than replacing the service during the initial implementation.

The existing service is external to the Firebase application.

The architecture therefore has:

```text
Web Application
      |
      v
Puzzle Processing Service
      |
      v
Puzzle JSON
      |
      v
Firebase application data
```

The exact API URL, authentication, request format, and deployment details are implementation configuration and must not be hardcoded throughout the application.

Use environment/configuration variables.

---

# 11. Puzzle JSON

The puzzle JSON contains:

- `rows`
- `cols`
- `matrix`
- `clues`

Example conceptual structure:

```json
{
  "rows": 11,
  "cols": 11,
  "matrix": [
    [2,1,2,1,2,0,2,1,2,1,2]
  ],
  "clues": [
    {
      "clue_number": 1,
      "row": 0,
      "col": 10,
      "horizontal": true,
      "vertical": true
    }
  ]
}
```

The supplied example demonstrates that clue numbers and matrix positions are associated.

The application should validate incoming JSON before persisting it.

---

# 12. Matrix Semantics

The matrix values are:

| Value | Meaning | UI |
|---|---|---|
| `0` | Black cell | Non-interactive |
| `1` | White cell | Interactive |
| `2` | Clue-start cell | Interactive + clue number |

Important:

`2` is not a separate visual cell type in the final crossword. It is a white/interactable cell with additional clue-start metadata.

Therefore:

- `0` is blocked
- `1` is answer cell
- `2` is answer cell plus clue start

---

# 13. Clue Number Calculation

The specification says the application should calculate clue numbering from the matrix.

For Hebrew RTL presentation:

- The first clue starts at the most top-right clue-start cell.
- Parsing proceeds leftward across the row.
- At the end of the row, continue on the next row.
- Numbers increase sequentially.
- The matrix is displayed right-to-left.

The AI implementation must keep logical matrix coordinates separate from visual layout direction.

Do not reverse stored matrix indices merely to achieve RTL rendering.

Recommended approach:

```text
Logical matrix:
row 0 -> col 0 ... col N-1

Visual Hebrew presentation:
right-to-left
```

This prevents data corruption and simplifies backend logic.

---

# 14. Clue Direction

Each clue can be:

- Horizontal
- Vertical
- Both

The puzzle JSON supplies:

```text
horizontal: true/false
vertical: true/false
```

The application should preserve this information.

A clue's cells must be calculated from:

- Starting row
- Starting column
- Direction
- Matrix boundaries
- Black cells

Do not rely solely on visual positions.

---

# 15. Clue Length

The document specifies calculating clue length by traversing the matrix from a clue-start cell until a black cell is reached.

For horizontal clues:

```text
start cell
→ adjacent cells in the horizontal direction
→ stop at black/boundary
```

For vertical clues:

```text
start cell
→ adjacent cells in the vertical direction
→ stop at black/boundary
```

Because the puzzle is Hebrew/RTL, the visual direction of horizontal traversal must be carefully defined.

The stored logical representation should remain consistent.

The UI should make the intended clue direction obvious.

---

# 16. Crossword UI

The crossword is the primary interaction surface.

It should be:

- Centered
- Comfortable to use
- Clearly readable
- High contrast
- Responsive
- Keyboard friendly where practical
- Touch friendly
- RTL-aware
- Visually game-like
- Free from unnecessary UI clutter

---

# 17. Crossword Cell Design

Each cell should contain:

- Letter value, if entered
- Clue number when it is a clue-start cell
- Solved/winner color state where applicable
- Selection/focus state
- Optional active-clue highlight

Clue number:

- Small
- Located in the top-right corner of the cell
- Clearly visible
- Must not interfere with letter entry
- Must not make the letter feel cramped

The letter should be the dominant content.

---

# 18. Cell Colors

The specification requires:

- Crossword colors: blue and white
- Blue represents black cells
- White represents answer cells
- Player colors are very bright

Recommended conceptual palette:

```text
Black crossword cell -> strong blue
Unsolved answer cell -> white
Selected cell -> highlighted UI state
Solved clue -> winner's bright player color
```

Do not allow player colors to make letters unreadable.

Accessibility and contrast must be tested.

---

# 19. Player Colors

Each player receives one bright color.

The color should be:

- Visually distinct
- Stable for the duration of the game
- Visible in the room
- Used consistently in clue ownership
- Visible in player list/scoreboard

Do not generate a new random color on every render.

Color assignment must be deterministic/persisted.

If the number of players exceeds the available palette, the system must use a predictable fallback strategy and preserve sufficient visual distinction.

---

# 20. Player Grid State

Each player needs an independent answer state.

Do not store a single mutable crossword answer grid for all players.

Conceptually:

```text
Room
  Puzzle Structure
  |
  +-- Player A answer grid
  |
  +-- Player B answer grid
  |
  +-- Player C answer grid
```

A player can therefore enter an answer without changing what another player has typed.

The authoritative solved clue state is separate from individual player input.

---

# 21. Player Input

A white/answer cell is interactive.

A player can:

- Click/tap a cell
- Type a letter
- Move between cells
- Select a clue
- Continue entering an answer

Black cells are not interactive.

Input should not be interrupted by the clue number.

For Hebrew:

- Use appropriate RTL text behavior.
- Ensure entered letters are rendered correctly.
- Avoid browser behavior that causes unexpected caret direction.
- Test keyboard entry with real Hebrew letters.

---

# 22. Clue Selection

Selecting a clue should make the relationship between:

- Clue
- Cells
- Direction
- Current input

obvious.

If a clue can be both horizontal and vertical, selecting its start cell may need to toggle or choose the relevant direction.

The exact interaction can be implemented as:

- click start cell to cycle directions,
- click clue list item,
- or provide an explicit horizontal/vertical selector.

Whichever implementation is selected must be predictable and documented in code.

---

# 23. Clue List / Clue Information

The UI should provide a clear way to identify clues by number.

The room view may include:

- Clue list
- Clue number
- Direction
- Current state
- Solved-by player color
- Pending status where relevant

Do not expose authoritative answers before allowed.

---

# 24. Submission Rule

The player can press Send/Submit for a clue only when the full clue has been filled.

This is an important rule.

A submission is not merely a snapshot of current activity.

A valid clue submission requires:

```text
All cells belonging to the clue are populated
```

If one or more cells are empty:

- Do not accept the submission.
- Show a clear user message.
- Keep the current input intact.
- Do not create a scoring event.

---

# 25. Submission Is Different from Presence/Activity

The original specification explicitly distinguishes solving/submission from present activity.

Do not interpret:

- player is typing
- player has entered a few letters
- player is looking at a clue

as a solution submission.

Only the explicit Send/Submit action creates a candidate solution.

---

# 26. Candidate Solution

A candidate solution should contain conceptually:

```text
roomId
playerId
clueNumber
solution
submittedAt
status
```

Possible statuses:

```text
PENDING
APPROVED
DECLINED
AUTO_APPROVED
```

The exact names can be adjusted, but the state machine must remain explicit.

---

# 27. Admin Solution Workflow

Admin can solve clues independently.

Admin's solution starts in:

```text
AdminDraft
```

Admin may work on several draft solutions.

When admin presses Publish:

1. Show a checklist of all AdminDraft solutions.
2. Show clue number.
3. Show proposed solution.
4. Allow admin to approve/check individual solutions.
5. Approved solution becomes authoritative.
6. Approved admin solution becomes `AdminApproved`.
7. Pending player submissions for the same clue must be evaluated against the authoritative solution.

The admin should not accidentally publish all drafts merely by opening the Publish screen.

Explicit confirmation is required.

---

# 28. Admin Draft Data

Admin draft state is separate from authoritative room solution data.

Conceptually:

```text
AdminDraft
  clueNumber
  solution
  state
```

Do not overwrite authoritative solution data while admin is still drafting.

---

# 29. Player Submission Approval

If a player submits a solution before admin has approved an authoritative solution:

- The submission enters a pending state.
- Admin sees it in the pending solution log.
- Admin can approve or decline it.

If admin approves:

```text
PlayerSolved
```

and the appropriate score is awarded according to the rules.

If admin declines:

```text
Declined
```

and the player receives a notification/message.

---

# 30. Automatic Comparison

If a clue is already `AdminApproved`, the player's submitted solution can be automatically compared against the authoritative solution.

If correct:

- Approve it.
- Apply the appropriate scoring rule.
- Mark the clue as solved if it is still unsolved.

If incorrect:

- Decline it.
- No score.
- Notify player.

---

# 31. If Admin Already Solved the Clue

The specification states:

If the clue was already solved by admin, the player's solution is approved or declined automatically.

Therefore:

```text
AdminApproved + matching player solution
    -> Approved / PlayerSolved
```

and:

```text
AdminApproved + nonmatching player solution
    -> Declined
```

No manual admin review should be required for these submissions.

---

# 32. Player Notification

A player must be told whether a submitted solution was:

- Approved
- Declined

The notification should be clear but not disruptive.

Examples of conceptual messages:

```text
Clue 12 approved!
```

```text
Clue 12 was declined.
```

Do not reveal an answer merely because the submission was declined unless the player explicitly chooses Reveal.

---

# 33. Scoring Rules

These are core game rules and must be implemented server-side/authoritatively.

## First correct player

If a player is the first player to correctly solve an unsolved clue:

```text
+2 points
```

The clue becomes:

```text
PlayerSolved
```

and ownership is assigned to that player.

## Correct attempt after another player has solved the clue

Once the first player has solved the clue:

- No other player can become its owner.
- The original player's color remains.
- Another player may still independently attempt the clue.
- The player knows the clue is already solved because its relevant crossword cells have changed from white to the solving player's color.
- If the player has **not revealed the solution**, fills the complete clue, and submits the correct answer, they receive **1 point**.
- The original winner remains the clue owner.
- The clue color does not change.
- A player must not receive the 1-point award more than once for the same clue.

Therefore:

```text
First player to correctly solve an unsolved clue
    -> 2 points
    -> owns clue
    -> clue uses that player's color

Another player independently solves an already-owned clue
    -> 1 point if correct and solution was not revealed
    -> original owner remains unchanged
    -> clue color remains original owner's color

Player reveals the solution
    -> 0 points for that clue
```

The implementation must distinguish:

- clue ownership
- player's independent solution attempt
- whether the player revealed the solution
- whether the submitted answer is correct
- whether the player has already received the one-point award for that clue

This must be enforced authoritatively by the backend.

---

# 34. Important Race Condition

Two players may submit the same clue nearly simultaneously.

This is a critical backend concern.

The server must guarantee:

```text
Only one player can become the first solver.
```

Never implement first-solver logic as:

```text
read clue
if unsolved:
    write solved
```

without an atomic transaction/conditional write.

Use the database's transactional/atomic capabilities.

The operation must atomically:

1. Verify clue is unresolved.
2. Verify submission is valid.
3. Assign winner.
4. Assign winner color.
5. Award points.
6. Mark clue solved.

A second simultaneous submission must observe the already-solved state and must not receive the first-solver award.

---

# 35. Reveal Rule

A player may choose to reveal a clue's solution.

If revealed:

- The clue solution is automatically filled into that player's matrix.
- The player receives no points for that clue.
- The player may not later claim points for submitting that revealed answer.
- The reveal must not change ownership.
- The reveal must not award a winner color.

The UI should clearly indicate that reveal forfeits scoring opportunity.

A confirmation dialog is recommended.

---

# 36. Reveal Scope

The reveal should operate on the selected clue, not the entire crossword.

The solution should fill the relevant cells in the player's grid.

If the clue intersects other clues, filling shared cells is expected, but this must not incorrectly mark the other clues as solved.

A revealed letter is player input/state, not proof that the player solved another clue.

---

# 37. Solved Clue Visualization

Once a clue has a player winner:

- The clue's cells become the winner's bright color.
- The color identifies the player.
- Other players see the color.
- Other players initially do not see the solution merely because the clue has been solved.

This distinction is essential:

```text
Solved ownership ≠ automatically revealed answer
```

---

# 38. Solution Visibility

When a player wins a clue:

Other players should see:

- clue solved
- winner color

They should not automatically see:

- the actual solution

The player can choose to reveal the solution.

The exact public/private reveal policy must be encoded separately from ownership.

---

# 39. Room Score

The room should display each participant's current score.

Suggested presentation:

```text
Player      Room Score
Tal         Admin / no score
Player A    5
Player B    3
Player C    1
```

Admin should not appear as a competing scorer.

---

# 40. Total Score

Each player also has a total score across games/rooms.

The architecture should support:

```text
Player total score
```

while maintaining room-level score independently.

For MVP, total score can be updated through authoritative backend logic.

Avoid allowing clients to directly set their score.

---

# 41. Score Integrity

Never trust a client-provided score.

The client should submit an action such as:

```text
submit clue
```

The backend determines:

- Whether the submission is valid
- Whether it is correct
- Whether the clue is already solved
- Whether points are awarded
- How many points are awarded

Score changes should be generated from validated game events.

---

# 42. Suggested Game State Machine

## Clue lifecycle

```text
UNRESOLVED
   |
   +--> PENDING_PLAYER_SUBMISSION
   |          |
   |          +--> APPROVED --> PLAYER_SOLVED
   |          |
   |          +--> DECLINED --> UNRESOLVED
   |
   +--> ADMIN_DRAFT
              |
              +--> ADMIN_APPROVED
                         |
                         +--> PLAYER_SOLVED
```

Reveal is a separate player action and should not necessarily change the authoritative clue state.

---

# 43. Important State Separation

Do not mix:

1. Puzzle structure
2. Authoritative solution
3. Player typing state
4. Player submission state
5. Clue ownership
6. Reveal state
7. Scoring

These are different concepts.

A clean implementation should keep them separate.

---

# 44. Recommended Data Model

The exact Firebase technology can be selected based on the project architecture, but the logical model should resemble:

```text
rooms/
  {roomId}/
    metadata
    puzzle
    clues
    clueStates
    participants
    submissions
    adminDrafts
    adminApprovals
    scores
    events
```

Players:

```text
players/
  {playerId}/
    name
    color
    totalScore
```

Player room state:

```text
rooms/{roomId}/players/{playerId}/
    joinedAt
    answerGrid
    roomScore
    revealState
```

The implementation may use a different physical structure if required by Firebase best practices, but the logical separation must remain.

---

# 45. Firebase Responsibilities

Firebase should handle application data and local emulation for:

- Rooms
- Players
- Participation
- Crossword metadata
- Clue states
- Submissions
- Scores
- Admin state
- Notifications/events where appropriate

The application should be designed to run locally against Firebase emulators.

Do not depend on production Firebase during normal development.

---

# 46. Firebase Emulator

The local environment should include the Firebase emulator suite required by the implementation.

The project should provide one predictable command/script that starts all required local services.

The developer should not have to manually start ten independent processes every time.

The initialization script should:

1. Verify required tools.
2. Start Firebase emulators.
3. Start the frontend.
4. Start backend/local supporting services if required.
5. Display useful URLs/ports.
6. Detect port conflicts.
7. Fail clearly.

---

# 47. Existing Render Service

The puzzle-image processing service is already running in a Render-hosted container.

During local development:

- The local application may call the Render endpoint if configured.
- A mock/local response should also be possible for deterministic tests.
- Tests should not depend on a live external Render service.

Use an abstraction such as:

```text
PuzzleProcessor
├── RenderPuzzleProcessor
└── MockPuzzleProcessor
```

This makes local testing deterministic.

---

# 48. Environment Configuration

Do not hardcode:

- Render service URL
- Firebase production configuration
- Secret keys
- API credentials
- Production URLs

Use environment configuration.

Example conceptual variables:

```text
PUZZLE_PROCESSOR_URL=
PUZZLE_PROCESSOR_MODE=render|mock
FIREBASE_EMULATOR_HOST=
FIREBASE_PROJECT_ID=
```

The exact names may be chosen by the implementation.

---

# 49. Security Principles

Even though this is a hobby application, the architecture must not depend on client-side trust.

Important protected operations:

- Score changes
- Clue ownership
- Approval
- Admin operations
- Room closure
- Authoritative solution access
- Publishing

The frontend should never be the authority for these operations.

---

# 50. Demo Authentication

For local MVP:

- Player creation may be name-only.
- No passwords are required.
- Admin may be hardcoded as `Tal`.

This is explicitly temporary.

Before production deployment:

- Proper authentication must be added.
- Admin identity must not be hardcoded.
- Authorization must be enforced server-side.
- Player identity must be trustworthy.

---

# 51. UI Architecture

The site should have at least these conceptual screens:

```text
Rooms / Main Page
    |
    +-- Player Room
    |
    +-- Admin Room
    |
    +-- Admin Create Room
    |
    +-- Admin Publish / Approval
```

Additional reusable components:

- Header
- Room card
- Player list
- Scoreboard
- Crossword grid
- Clue item
- Clue status
- Submission button
- Reveal control
- Admin pending list
- Admin draft checklist
- Notification/toast
- Confirmation modal

---

# 52. Main Rooms Page

The rooms page should feel like a game lobby.

Display:

- Available rooms
- Room status
- Crossword thumbnail/image
- Number of players
- Current room activity
- Join/open action

Avoid excessive dashboard complexity.

The user should understand the page immediately.

---

# 53. Room Card

A room card can show:

- Crossword visual
- Room name/number
- Status
- Player count
- Short game information
- Enter button

The card should be visually related to the crossword theme.

Avoid giant hero banners.

This is a game application, not a marketing landing page.

---

# 54. No Hero Marketing Section

Do not build a conventional website hero section with:

- giant portrait
- marketing headline
- oversized CTA
- generic stock person image

The site is personal and game-focused.

The crossword/game should be the visual focus.

---

# 55. Visual Theme

The site should contain crossword motifs but not be overloaded.

Possible motifs:

- Crossword grid fragments
- Letters
- Clue-number markers
- Subtle puzzle geometry
- Small word fragments
- Grid lines
- Paper/puzzle-inspired shapes

The background may contain a list of clue words flowing randomly.

These background words must be:

- Semi-transparent
- Decorative
- Non-interactive
- Behind the functional UI
- Randomly distributed
- Non-distracting

Never allow decorative text to reduce readability.

---

# 56. Responsive Design

The UI must work on:

- Desktop
- Laptop
- Tablet
- Mobile

The crossword is the highest-priority responsive element.

On small screens:

- Do not allow the grid to become unusably tiny.
- Allow controlled scrolling if necessary.
- Keep cells large enough for touch.
- Keep clue numbers readable.
- Keep controls accessible.

---

# 57. RTL Design

The crossword is Hebrew.

The application must support RTL properly.

Use:

```html
dir="rtl"
```

where appropriate.

Do not blindly apply RTL to technical data structures.

Keep:

- Database coordinates logical
- API fields logical
- Matrix indices logical
- UI layout RTL

This distinction prevents subtle bugs.

---

# 58. RTL Testing

Test:

- Hebrew letter entry
- Cursor movement
- Horizontal clue selection
- Vertical clue selection
- Clue number positioning
- Grid order
- Mobile keyboard behavior
- Mixed numeric/Latin UI labels
- Scoreboard
- Notifications

The supplied 11x11 example should be included as a fixture.

---

# 59. Accessibility

The UI should provide:

- Keyboard navigation where practical
- Focus indicators
- Sufficient contrast
- Readable font sizes
- Buttons with meaningful labels
- Accessible status messages
- No color-only dependency where possible

Because player colors communicate ownership, supplement color with:

- Player name
- Legend
- Tooltip/label
- Accessible text

---

# 60. Error Handling

The application should handle:

- Invalid puzzle JSON
- Missing matrix
- Matrix dimension mismatch
- Invalid clue coordinate
- Duplicate clue numbers
- Invalid clue direction
- Puzzle processor timeout
- Puzzle processor failure
- Firebase connection failure
- Submission race conditions
- Closed room submission
- Unauthorized admin action
- Empty clue submission
- Duplicate submission
- Reveal after closure, according to final policy

Errors must be user-readable.

Developer logs should contain enough technical information for debugging.

Never expose secrets.

---

# 61. Validation Rules

At puzzle creation:

- rows > 0
- cols > 0
- matrix dimensions match rows/cols
- matrix values are only 0/1/2
- clue coordinates are inside matrix
- clue numbers are unique
- clue directions are valid
- clue start cell must be 2
- calculated clue cells must stay within matrix
- clue cannot traverse through black cells

At submission:

- room exists
- room is active
- player belongs to room
- clue exists
- clue is valid
- all clue cells are populated
- player is not submitting after closure
- solution format is valid

---

# 62. Duplicate Submission

If a player presses Send twice:

- The system must not award points twice.
- The operation should be idempotent where possible.
- The UI should disable or debounce the button while submission is in progress.

Backend validation remains mandatory.

---

# 63. Network Reliability

The UI must assume network operations can fail.

For submissions:

1. User clicks Send.
2. UI shows pending state.
3. Backend validates.
4. UI receives result.
5. UI updates authoritative state.
6. Temporary failure shows retry option.

Do not optimistically award points.

---

# 64. Notifications

Use lightweight notifications.

Events may include:

- Submission accepted
- Submission declined
- Clue solved by another player
- Room closed
- Admin approval pending
- Solution revealed

Notifications should not block solving.

---

# 65. Admin Dashboard

The admin room view should combine:

### Game view

- Crossword
- Players
- Scores
- Clue states

### Admin controls

- Draft solution entry
- Publish
- Pending submissions
- Approve
- Decline
- Close room

Admin should not need to switch to a completely different application.

---

# 66. Admin Publish Checklist

The Publish interaction is important.

When clicked:

```text
Publish Solutions

[ ] Clue 1 — solution
[ ] Clue 2 — solution
[ ] Clue 3 — solution

Approve selected
```

The admin should clearly see:

- Which clue
- Proposed solution
- Current draft status

Only checked/confirmed solutions become `AdminApproved`.

---

# 67. Pending Player Submission Log

Admin room should contain a pending log.

Each entry:

```text
Player
Clue
Submitted solution
Time
Status
Approve
Decline
```

If an authoritative admin solution already exists, the system should automatically process the submission instead of requiring manual review.

---

# 68. Player Room Layout

Suggested conceptual structure:

```text
------------------------------------------------
Header
Room name / status / player identity
------------------------------------------------
Scoreboard / players
------------------------------------------------
              Crossword
------------------------------------------------
Selected clue / clue controls
------------------------------------------------
Send        Reveal
------------------------------------------------
Clue list / status
------------------------------------------------
Notifications
------------------------------------------------
```

The exact layout can vary.

The crossword should dominate the room.

---

# 69. Scoreboard

Keep it compact.

Example:

```text
YOU       4
Maya      3
Dan       2
Ron       0
```

The player's own row should be visually identifiable.

Solved clues should use the same player color as the scoreboard.

---

# 70. Game Feedback

Use subtle animation for:

- Cell selection
- Successful submission
- Solved clue
- Score update
- Player color assignment

Avoid excessive animation.

The user is solving a puzzle; animation must never interfere with concentration.

---

# 71. Design Principle

The primary visual hierarchy is:

```text
1. Crossword
2. Current clue / input
3. Player score / game status
4. Controls
5. Decorative motifs
```

Decorative elements must never outrank gameplay.

---

# 72. Data Ownership

## Client-owned transient state

Examples:

- Selected cell
- Current UI focus
- Open modal
- Animation state

## Server-authoritative state

Examples:

- Scores
- Winner
- Clue solved state
- Admin approval
- Room status
- Authoritative solutions
- Player participation

## Player persistent state

Examples:

- Answer grid
- Reveal state
- Room score reference

---

# 73. Recommended Domain Services

Keep game rules outside UI components.

Recommended conceptual services:

```text
PuzzleService
RoomService
PlayerService
ClueService
SubmissionService
ScoringService
AdminService
RevealService
NotificationService
```

The exact architecture can be simpler, but rules should not be scattered throughout UI components.

---

# 74. Pure Game Logic

Where possible, implement game rules as pure functions.

Examples:

```text
calculateClueNumbering(matrix)
calculateClueCells(matrix, clue)
isClueComplete(answerGrid, clue)
normalizeSolution(answer)
compareSolutions(candidate, authoritative)
calculateAward(clueState, submissionState, revealState)
```

These are excellent candidates for unit testing.

---

# 75. Hebrew Solution Normalization

The comparison system should define normalization carefully.

At minimum, consider:

- Leading/trailing whitespace
- Unicode consistency
- Letter case where applicable
- Direction-independent comparison
- Exact character sequence

Do not silently alter Hebrew characters unless explicitly intended.

Any normalization rules must be documented and tested.

---

# 76. Authoritative Solution Format

A clue solution should be represented consistently.

Recommended:

```text
clueNumber -> normalized answer string
```

The system should also be able to derive individual letters for filling cells.

The solution must correspond exactly to the calculated clue length.

---

# 77. Clue Length Validation

If a solution contains a different number of letters than the calculated clue length:

- Admin should receive an error before publishing.
- Player submissions should be rejected as invalid rather than scored.
- The system should log the reason.

This prevents inconsistent crossword state.

---

# 78. Persistence and Consistency

The database should preserve:

- Original puzzle input
- Parsed puzzle structure
- Calculated clue metadata
- Admin drafts
- Published solutions
- Player submissions
- Clue winners
- Scores
- Room lifecycle

Avoid destructive updates where history matters.

---

# 79. Event Logging

A lightweight game event log is recommended.

Events may include:

```text
ROOM_CREATED
PLAYER_JOINED
ADMIN_DRAFT_CREATED
ADMIN_SOLUTION_APPROVED
PLAYER_SUBMITTED
PLAYER_SOLUTION_APPROVED
PLAYER_SOLUTION_DECLINED
CLUE_WON
SOLUTION_REVEALED
ROOM_CLOSED
```

Events make debugging and later auditing much easier.

---

# 80. Git Workflow

The repository uses:

```text
develop
```

as the main integration branch.

Every milestone gets its own feature branch:

```text
feature/MileStone01
feature/MileStone02
feature/MileStone03
...
```

Recommended workflow:

```text
develop
   |
   +-- feature/MileStone01
   |
   +-- merge -> develop
   |
   +-- feature/MileStone02
   |
   +-- merge -> develop
```

Do not make unrelated changes on a milestone branch.

Each milestone should finish in a known working state.

---

# 81. Milestone Rules

Every milestone must have:

- Goal
- Scope
- Inputs
- Expected outputs
- Files/components affected
- Tests
- Manual verification
- Acceptance criteria
- Known limitations
- Git branch
- Completion status

A milestone is not complete merely because code compiles.

---

# 82. Progress Tracking

Create and maintain:

```text
DEVELOPMENT_PROGRESS.md
```

Recommended structure:

```markdown
# Development Progress

## Current Milestone
MileStoneXX

## Status
IN_PROGRESS

## Last Completed Step
...

## Next Step
...

## Completed
- [x] ...
- [x] ...

## In Progress
- [ ] ...

## Blocked
- [ ] ...

## Tests
- [x] ...
- [ ] ...

## Manual Verification
- [x] ...
- [ ] ...

## Notes
...
```

The AI agent must update this file whenever a milestone or significant step is completed.

---

# 83. Milestone Map

## MileStone01 — Environment Discovery

### Goal

Inspect the PC and determine what is already installed.

### Tasks

- Check Git
- Check Node.js
- Check npm/pnpm/yarn
- Check Python
- Check pip
- Check Firebase CLI
- Check Java if required by Firebase emulator
- Check Docker if needed
- Check available ports
- Check project folder
- Check repository access

### Tests

- Every required command reports version successfully or is marked missing.

### Definition of done

Environment report exists.

Branch:

```text
feature/MileStone01
```

---

# 84. MileStone02 — Repository Initialization

### Goal

Create/prepare the project repository structure.

### Tasks

- Clone repository if required
- Checkout develop
- Create milestone branch
- Create basic documentation structure
- Establish source directories
- Add `.gitignore`
- Add environment example files
- Establish coding conventions

### Definition of done

Repository opens cleanly and contains the initial project structure.

---

# 85. MileStone03 — Frontend Skeleton

### Goal

Create the basic web application.

### Tasks

- Initialize frontend
- Create application shell
- Create routing
- Add global styling
- Add RTL support
- Add basic header
- Add rooms page placeholder
- Add room page placeholder
- Add admin page placeholder

### Tests

- Application starts
- Pages render
- RTL is active where expected

---

# 86. MileStone04 — Firebase Local Environment

### Goal

Run Firebase locally.

### Tasks

- Configure Firebase project
- Configure emulators
- Add emulator configuration
- Add local environment variables
- Add emulator startup script
- Verify local connectivity

### Tests

- Firebase emulators start
- Application connects to emulator
- No production Firebase dependency exists in local mode

---

# 87. MileStone05 — Local Run Orchestrator

### Goal

Provide one command/script to start the complete local environment.

### Tasks

- Start frontend
- Start Firebase emulators
- Start supporting backend services
- Handle logs
- Detect port conflicts
- Print URLs
- Graceful shutdown

### Definition of done

A developer can start the local system predictably.

---

# 88. MileStone06 — Puzzle Data Model

### Goal

Implement the puzzle structure.

### Tasks

- Define puzzle schema
- Validate matrix
- Validate clues
- Store rows/cols
- Store original image reference
- Add supplied 11x11 fixture

### Tests

- Valid JSON accepted
- Invalid dimensions rejected
- Invalid matrix values rejected
- Invalid clues rejected

---

# 89. MileStone07 — Puzzle Processing Adapter

### Goal

Connect the application to the existing Render puzzle-processing service.

### Tasks

- Define processor interface
- Implement Render adapter
- Implement mock adapter
- Add timeout/error handling
- Add environment configuration

### Tests

- Mock processor works without network
- Render adapter can parse expected response
- Invalid response is rejected

---

# 90. MileStone08 — Clue Calculation Engine

### Goal

Calculate crossword metadata.

### Tasks

- Calculate clue numbers
- Calculate clue cells
- Calculate lengths
- Preserve horizontal/vertical state
- Handle Hebrew RTL presentation correctly

### Tests

Use the supplied 11x11 fixture.

Test:

- Numbering order
- Coordinates
- Directions
- Lengths
- Boundary conditions
- Black cells

---

# 91. MileStone09 — Crossword Rendering

### Goal

Display a real crossword.

### Tasks

- Build grid
- Render blue blocked cells
- Render white cells
- Render clue numbers
- Support RTL
- Make cells responsive
- Add selected-cell state

### Definition of done

The supplied puzzle fixture renders correctly.

---

# 92. MileStone10 — Interactive Player Grid

### Goal

Allow a player to solve the crossword.

### Tasks

- Cell selection
- Letter input
- Navigation
- Clue selection
- Current clue highlight
- Clear/delete
- Hebrew input support

### Tests

- Black cells cannot receive input
- White cells can
- Clue cells can
- Input remains in correct player state

---

# 93. MileStone11 — Player Identity

### Goal

Implement local/demo players.

### Tasks

- Create player by name
- Assign persistent player ID
- Assign bright color
- Display player identity
- Store player profile

### Tests

- Same player retains color
- Duplicate handling works
- Invalid names rejected

---

# 94. MileStone12 — Room Creation

### Goal

Allow admin to create rooms.

### Tasks

- Admin-only UI
- Image selection/upload
- Puzzle processing
- Room creation
- Room status
- Store puzzle structure
- Store original image reference

### Tests

- Room created successfully
- Invalid puzzle blocks room creation
- Admin identity enforced

---

# 95. MileStone13 — Room Lobby

### Goal

Display rooms and allow players to enter.

### Tasks

- Rooms page
- Room cards
- Status
- Player count
- Join button
- Room routing

### Definition of done

A player can create/select a demo identity and enter a room.

---

# 96. MileStone14 — Player Room State

### Goal

Persist individual player grids.

### Tasks

- Create player room state
- Save answer grid
- Load answer grid
- Prevent players from seeing each other's unsolved letters
- Handle reconnect

### Tests

- Player A input does not appear in Player B's private grid
- Refresh restores own state

---

# 97. MileStone15 — Clue Submission

### Goal

Implement Send.

### Tasks

- Determine selected clue
- Validate complete clue
- Extract solution
- Create submission
- Show pending status

### Tests

- Incomplete clue rejected
- Complete clue accepted
- Duplicate click safe

---

# 98. MileStone16 — Admin Solution Drafts

### Goal

Implement AdminDraft.

### Tasks

- Admin clue input
- Save draft
- Edit draft
- Display draft state

### Tests

- Draft does not become authoritative automatically
- Draft survives refresh

---

# 99. MileStone17 — Admin Publish

### Goal

Implement AdminApproved.

### Tasks

- Publish checklist
- Review drafts
- Approve selected drafts
- Validate solution length
- Store authoritative solution

### Tests

- Only approved items become authoritative
- Invalid length cannot publish

---

# 100. MileStone18 — Player Approval Workflow

### Goal

Connect pending player submissions to admin review.

### Tasks

- Pending log
- Approve
- Decline
- Player notification
- Correct state transitions

### Tests

- Approve changes state
- Decline changes state
- Correct player receives notification

---

# 101. MileStone19 — Automatic Approval

### Goal

Automatically validate player submissions when AdminApproved exists.

### Tasks

- Compare normalized solutions
- Auto-approve correct answer
- Auto-decline incorrect answer
- Handle already-solved clues

### Tests

- Correct answer approved
- Incorrect answer declined
- Duplicate winner prevented

---

# 102. MileStone20 — Scoring Engine

### Goal

Implement scoring authoritatively.

### Tasks

- First solver = 2
- Correct eligible suggestion = 1
- Reveal = 0
- Admin = 0
- Prevent double scoring
- Update room score
- Update total score

### Critical tests

Simulate simultaneous submissions.

Verify exactly one player receives the first-solver award.

---

# 103. MileStone21 — Solved Clue Ownership

### Goal

Implement player colors on solved clues.

### Tasks

- Store winner
- Store winner color reference
- Render color
- Synchronize other players

### Tests

- Winner color appears
- Other player cannot overwrite winner
- Winner remains stable after refresh

---

# 104. MileStone22 — Reveal

### Goal

Implement solution reveal.

### Tasks

- Confirmation
- Reveal selected clue
- Fill player's grid
- No score
- Persist reveal state

### Tests

- Reveal fills correct cells
- No score awarded
- Revealed clue cannot later earn points

---

# 105. MileStone23 — Room Scoreboard

### Goal

Build the competitive scoreboard.

### Tasks

- Player list
- Room score
- Bright colors
- Current-player emphasis
- Solved clue ownership

---

# 106. MileStone24 — Admin Room

### Goal

Combine admin tools with game view.

### Tasks

- Crossword
- Scoreboard
- Admin draft
- Publish
- Pending approvals
- Close room

### Definition of done

Admin can operate a complete game from one room screen.

---

# 107. MileStone25 — Room Closure

### Goal

Implement close room.

### Tasks

- Close button
- Confirmation
- Backend enforcement
- Read-only room state
- Prevent submissions
- Preserve scores

### Tests

- Closed room rejects submissions
- Repeated close is safe

---

# 108. MileStone26 — Notifications

### Goal

Improve player feedback.

### Tasks

- Approval notification
- Decline notification
- Solved notification
- Room closed notification
- Reveal notification where useful

---

# 109. MileStone27 — Visual Design Pass

### Goal

Make the game visually polished.

### Tasks

- Crossword motifs
- Blue/white grid
- Bright player colors
- Semi-transparent background clue words
- Cards/panels
- Typography
- Spacing
- Micro-interactions

Do not introduce a giant hero section.

Do not add unnecessary portraits or stock imagery.

---

# 110. MileStone28 — Responsive Pass

### Goal

Make the game comfortable on all target screen sizes.

### Tasks

- Desktop
- Tablet
- Mobile
- Touch interaction
- Grid sizing
- Scoreboard collapse
- Clue list behavior

---

# 111. MileStone29 — Accessibility Pass

### Goal

Improve usability for all players.

### Tasks

- Keyboard focus
- ARIA labels
- Accessible notifications
- Contrast
- Color ownership labels
- Screen reader considerations

---

# 112. MileStone30 — Error/Failure Hardening

### Goal

Make the system resilient.

### Tasks

- Network failures
- Render service failures
- Firebase failures
- Invalid data
- Closed rooms
- Unauthorized requests
- Duplicate submissions
- Race conditions

---

# 113. MileStone31 — Automated Test Expansion

### Goal

Build confidence in game rules.

### Test categories

### Unit

- Matrix parsing
- Clue numbering
- Clue length
- Solution normalization
- Submission validation
- Scoring
- Reveal

### Integration

- Room creation
- Join
- Submission
- Admin approval
- Auto approval
- Scoring
- Close room

### UI

- Crossword input
- Send
- Reveal
- Admin publish
- Scoreboard

---

# 114. MileStone32 — End-to-End Local Game

### Goal

Play a complete game locally.

Scenario:

1. Start environment.
2. Admin creates room.
3. Puzzle is processed.
4. Player A joins.
5. Player B joins.
6. Both see crossword.
7. Admin creates solution.
8. Player A submits.
9. Admin approves or system auto-approves.
10. Player A receives points.
11. Player B sees winner color.
12. Player B does not automatically see answer.
13. Player B reveals another clue.
14. No points awarded for revealed clue.
15. Admin closes room.
16. Final scores remain visible.

This milestone is a major acceptance checkpoint.

---

# 115. MileStone33 — Demo Reset/Seed

### Goal

Make local testing repeatable.

Provide:

- Seed data
- Example players
- Example room
- Example puzzle
- Reset emulator data
- Repeatable test scenario

---

# 116. MileStone34 — Deployment Preparation

### Goal

Prepare Firebase deployment.

Tasks:

- Production configuration
- Environment variables
- Security rules
- Admin authorization
- Authentication
- Storage
- Hosting
- Backend functions/services as required

Do not deploy until security is reviewed.

---

# 117. MileStone35 — Production Authentication

### Goal

Replace demo identity.

Tasks:

- User authentication
- Player identity
- Admin identity
- Authorization
- Account lifecycle
- Secure session handling

The hardcoded `Tal` admin must be removed.

---

# 118. MileStone36 — Production Security Review

### Goal

Verify that clients cannot cheat.

Check:

- Score writes
- Winner writes
- Solution reads
- Admin operations
- Room closure
- Player impersonation
- Database rules
- Callable/backend functions
- Storage permissions

---

# 119. MileStone37 — Deployment

### Goal

Deploy the production application.

Tasks:

- Build
- Deploy
- Verify production Firebase
- Verify hosting
- Verify puzzle processor connection
- Verify authentication
- Run smoke tests

---

# 120. MileStone38 — Final Acceptance

### Goal

Confirm the game meets the specification.

Acceptance checklist:

- [ ] Room creation works
- [ ] Puzzle image processing works
- [ ] Matrix is correct
- [ ] Hebrew RTL rendering is correct
- [ ] Clue numbering is correct
- [ ] Players can enter rooms
- [ ] Player grids are independent
- [ ] Clues can be submitted only when complete
- [ ] Admin drafts work
- [ ] Admin publish works
- [ ] Player approval works
- [ ] Automatic comparison works
- [ ] First solver gets 2 points
- [ ] Correct eligible suggestion gets 1 point
- [ ] Reveal gives 0 points
- [ ] Winner color is persistent
- [ ] Other players see ownership but not automatically the answer
- [ ] Admin does not score
- [ ] Room closure works
- [ ] Scoreboard works
- [ ] Local emulator workflow works
- [ ] Production authentication exists
- [ ] Security review passes

---

# 121. Traceability Matrix

Maintain a traceability table connecting requirements to implementation and tests.

Example:

| Requirement | Component | Test | Milestone | Status |
|---|---|---|---|---|
| Matrix 0/1/2 | Puzzle Engine | Matrix tests | MS06 | TODO |
| RTL grid | Crossword UI | RTL UI test | MS09 | TODO |
| First solver = 2 | Scoring | Race test | MS20 | TODO |
| Reveal = 0 | Reveal Service | Reveal test | MS22 | TODO |
| Admin approval | Admin Service | Integration | MS18 | TODO |
| Room closure | Room Service | Integration | MS25 | TODO |

The AI agent should expand this table as implementation progresses.

---

# 122. Definition of Done — General

A feature is done only when:

1. Code exists.
2. Code is integrated in the intended architecture.
3. Core behavior has automated tests where applicable.
4. Manual verification has been performed.
5. Error handling exists.
6. UI behavior is usable.
7. Documentation is updated.
8. Progress tracking is updated.
9. Git branch is clean.
10. The milestone can be merged into `develop`.

---

# 123. AI Agent Development Rules

The implementing AI agent should:

- Read this document before changing the project.
- Read `DEVELOPMENT_PROGRESS.md` before beginning work.
- Inspect the current repository before assuming a file exists.
- Never overwrite existing functionality blindly.
- Prefer small changes.
- Run tests after changes.
- Keep changes scoped to the active milestone.
- Update progress tracking.
- Report blockers explicitly.
- Do not silently change game rules.
- Do not invent unspecified behavior where it affects scoring or authority.
- Use mock services for deterministic tests.
- Keep production credentials out of source control.
- Maintain backwards compatibility with existing completed milestones.

---

# 124. AI Agent Workflow for Each Milestone

For every milestone:

## Step 1 — Read

Read:

- This master specification
- Development progress
- Existing code
- Existing tests

## Step 2 — Inspect

Determine:

- What already exists
- What is missing
- What must be changed
- What dependencies exist

## Step 3 — Plan

Create a short implementation plan.

## Step 4 — Implement

Implement the smallest coherent increment.

## Step 5 — Test

Run:

- Unit tests
- Relevant integration tests
- Build
- Lint/type checks if configured

## Step 6 — Manual verification

Run the application and verify the milestone acceptance criteria.

## Step 7 — Document

Update:

- Progress
- Traceability
- Known limitations

## Step 8 — Git

Commit the milestone changes.

The branch should remain focused.

---

# 125. Do Not Overengineer

This is a personal hobby game.

Do not introduce:

- Microservices without need
- Kubernetes
- Complex event streaming
- Large caching systems
- Unnecessary databases
- Excessive abstractions
- Complex analytics

Prefer:

```text
Simple
Reliable
Testable
Maintainable
```

---

# 126. Performance Priorities

The crossword grid is relatively small.

Optimize for:

- Fast interaction
- Low latency
- Smooth updates
- Reliable state synchronization

Do not sacrifice correctness for micro-optimizations.

---

# 127. Real-Time Synchronization

Players should receive important room changes promptly.

Useful synchronized events:

- Player joined
- Player left, if implemented
- Clue solved
- Winner color
- Score update
- Room closed

Player private input should not be broadcast as if it were authoritative public state.

---

# 128. Privacy Between Players

A player's unsent answer grid is private to that player.

Do not expose all players' live answer grids to every client.

Public room state should contain:

- Solved clue state
- Winner
- Score
- Allowed notifications

Private player state should remain scoped to that player.

---

# 129. Cheat Resistance

For MVP the game is friendly, but the architecture should avoid obvious cheating.

Never trust:

```text
clientScore
clientWinner
clientAdminApproved
```

Instead:

```text
client action
   -> backend validation
   -> authoritative state update
```

---

# 130. Logging

Use structured logs for important operations.

Example:

```text
roomId
playerId
clueNumber
eventType
timestamp
result
```

Do not log secrets.

Avoid logging entire private answer grids unnecessarily.

---

# 131. Image Storage

The original puzzle image should be preserved alongside puzzle metadata.

The UI should be able to display the original image for admin/reference purposes.

The application should distinguish:

```text
Original image
Parsed puzzle
Calculated crossword
Authoritative solutions
```

These are related but different assets.

---

# 132. Original Image + Matrix

Admin room should allow the admin to see the original picture alongside the calculated matrix.

This is useful for verification.

The original image should not replace the interactive crossword.

---

# 133. Room Controls

The room should provide:

- Back to rooms/main page
- Room status
- Player list
- Scoreboard
- Crossword
- Send data/submit
- Reveal solution
- Admin controls when admin is viewing

The Back button should not destroy room state.

---

# 134. UI Copy

Use concise game-oriented labels.

Examples:

```text
Rooms
Join
Enter Room
Send
Reveal Solution
Publish
Approve
Decline
Close Room
Score
Players
Solved
Pending
```

Avoid technical terminology in player-facing UI such as:

```text
AdminApproved
AdminDraft
PENDING_PLAYER_SUBMISSION
```

Those are internal state names.

---

# 135. Confirmation Dialogs

Use confirmation for destructive or score-affecting actions:

- Reveal solution
- Close room
- Publish solutions where appropriate

Do not use confirmation for every normal action.

---

# 136. Empty States

Provide useful empty states:

No rooms:

```text
No active rooms yet.
```

No pending admin submissions:

```text
No pending solutions.
```

No players:

```text
Waiting for players...
```

---

# 137. Loading States

Show loading indicators for:

- Puzzle processing
- Room creation
- Submission
- Publish
- Approval
- Reveal
- Room loading

Never leave the user wondering whether a button click worked.

---

# 138. Puzzle Processing UI

When admin uploads an image:

```text
Upload image
      ↓
Processing crossword
      ↓
Validate puzzle
      ↓
Preview matrix
      ↓
Create room
```

If processing fails:

- Keep the admin on the page.
- Explain failure.
- Allow retry.
- Do not create a partial room.

---

# 139. Puzzle Preview

Before room creation, admin should be able to verify:

- Original image
- Matrix dimensions
- Crossword rendering
- Clue numbering
- Directions

This catches image-processing errors before the game begins.

---

# 140. Data Migration Strategy

During development the schema may evolve.

When schema changes:

- Document the change.
- Provide migration/seed updates where required.
- Keep emulator reset easy.
- Avoid silently interpreting old data using new semantics.

For the hobby project, resetting local emulator data is acceptable during early milestones.

---

# 141. Testing Fixture

The supplied 11x11 matrix and clue metadata should become a permanent test fixture.

It should be used to validate:

- Matrix rendering
- RTL numbering
- Direction
- Length
- Interactive cells
- Clue selection

Do not manually reproduce expected values in multiple places.

Keep one canonical fixture.

---

# 142. Core Unit-Test Scenarios

At minimum:

## Matrix

- 0 is blocked
- 1 is answer
- 2 is clue start

## Numbering

- Top-right clue gets number 1
- Parsing continues leftward
- Next row continues correctly

## Length

- Stops at black
- Stops at boundary
- Horizontal and vertical lengths differ correctly

## Submission

- Empty clue rejected
- Partially filled clue rejected
- Full clue accepted

## Scoring

- First correct on an unsolved clue = 2 points
- Another player can independently submit an already-solved clue
- If that player has not revealed the solution and the answer is correct = 1 point
- The original clue owner cannot be replaced
- The clue color remains the original winner's color
- The same player cannot receive the 1-point award more than once for the same clue
- Reveal = 0 points for that clue
- Admin = 0 points

## Race

- Two simultaneous first submissions produce exactly one winner.

---

# 143. Core Integration-Test Scenario

A complete automated integration test should simulate:

```text
Create room
→ join Player A
→ join Player B
→ create admin solution
→ publish solution
→ Player A submits correct answer
→ Player A becomes winner
→ Player A gets 2
→ Player B sees solved state
→ Player B cannot overwrite winner
→ Player B reveal behaves correctly
→ room closes
→ further submission rejected
```

---

# 144. UI Test Scenario

Verify:

- Room list loads
- Room opens
- Grid renders
- Cell can be selected
- Hebrew letter enters
- Clue can be selected
- Incomplete Send is rejected
- Complete Send creates submission
- Result appears
- Score updates
- Solved color appears
- Reveal confirmation works

---

# 145. Deployment Architecture

Final conceptual architecture:

```text
                         Internet
                            |
                    Firebase Hosting
                            |
                      Web Application
                            |
                 Firebase application data
                            |
              +-------------+-------------+
              |                           |
       Auth / Users                  Room / Game Data
              |
              |
      Firebase services

External:
Puzzle Image Processing
        |
      Render
```

The existing puzzle processing container remains external.

---

# 146. Local Architecture

```text
Local PC
 |
 +-- Frontend
 |
 +-- Firebase Emulator
 |     +-- Auth (when enabled)
 |     +-- Database
 |     +-- Storage
 |     +-- Functions if used
 |
 +-- Mock Puzzle Processor
 |
 +-- Optional Render connection
```

The preferred test path should be completely deterministic.

---

# 147. Production Transition

Before production:

1. Replace name-only identity.
2. Remove hardcoded admin.
3. Configure secure authentication.
4. Configure Firebase security rules.
5. Configure storage permissions.
6. Verify backend authorization.
7. Protect authoritative solutions.
8. Protect scoring operations.
9. Configure production environment.
10. Verify Render service availability.
11. Run end-to-end smoke tests.

---

# 148. Unresolved Product Decisions

The following areas should not be silently invented if they materially change game behavior:

- Exact meaning/conditions of the 1-point "correct suggestion" path after another player's solve
- Whether revealed solutions are visible to all players or only to the player who reveals
- Whether reveal remains available after a room is closed
- Exact player color palette
- Exact Firebase product choice where multiple are viable
- Exact production authentication provider
- Exact notification implementation
- Exact room naming scheme
- Exact player removal/leave behavior

If a decision affects scoring, ownership, privacy, or authoritative state, stop and request clarification rather than silently changing the rules.

---

# 149. Interpretation Rule for Ambiguous Requirements

When the specification is ambiguous:

1. Prefer the explicit original rule.
2. Do not invent a new scoring rule.
3. Do not infer hidden permissions.
4. Keep implementation reversible.
5. Mark the ambiguity in `DEVELOPMENT_PROGRESS.md`.
6. Ask the user when the ambiguity can materially change game behavior.

---

# 150. Recommended Project Documentation

Maintain:

```text
/docs/
    CROSSWARD_MASTER_SPEC.md
    DEVELOPMENT_PROGRESS.md
    ARCHITECTURE.md
    GAME_RULES.md
    DATA_MODEL.md
    TEST_PLAN.md
    DEPLOYMENT.md
```

The master specification remains the product source of truth.

---

# 151. Final Implementation Principle

The application should feel simple to a player even though the backend correctly handles complex state.

The player experience should be:

```text
Join room
   ↓
See crossword
   ↓
Solve clue
   ↓
Fill all cells
   ↓
Send
   ↓
Get result
   ↓
Earn points if eligible
   ↓
Continue solving
```

The admin experience should be:

```text
Create room
   ↓
Upload crossword
   ↓
Verify puzzle
   ↓
Prepare solutions
   ↓
Publish
   ↓
Review player submissions
   ↓
Control game
   ↓
Close room
```

The implementation experience for the AI agent should be:

```text
Read specification
   ↓
Read progress
   ↓
Select one milestone
   ↓
Inspect existing code
   ↓
Implement small change
   ↓
Test
   ↓
Manually verify
   ↓
Update progress
   ↓
Commit feature/MileStoneXX
   ↓
Merge to develop
   ↓
Continue
```

---

# 152. Master Acceptance Principle

The Crossward project is successful when a group of friends can locally and eventually online:

- Enter a room
- See the same Hebrew crossword
- Solve independently
- Submit complete clues
- Compete fairly for clue ownership
- See bright player colors
- Earn the correct points
- Reveal answers without gaining points
- Receive approval/decline feedback
- See live game progress
- Have an admin control the game
- Close the game cleanly
- Trust that the scoring and winner selection cannot be accidentally overwritten by another player

The system should remain a fun crossword game first and a technical system second.
