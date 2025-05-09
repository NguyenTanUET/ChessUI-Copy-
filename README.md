## The Folder `modules`
The folder contains JavaScript files that handle game functionality at a higher level, focusing on user interface and game mechanics. These modules are more focused on the application layer. `modules`
### Key modules:
1. - Handles the interaction between a human player and the AI: **playerVsAI.js**
- Manages the game state when a human plays against the AI
- Configures player color (white or black)
- Handles user interactions with the chessboard
- Processes player moves and triggers AI responses

2. - Manages games where two AI engines play against each other: **botVsBot.js**
- Sets up two separate chess engines (for white and black)
- Controls the automatic flow of moves between the engines
- Handles animation and display of the AI vs AI game
- Provides controls to toggle auto-play and reset the game

3. - Likely handles the visual board setup: **boardSetup.js**
- Creates the chessboard UI
- Places pieces in their initial positions
- Manages orientation based on player color

4. - Handles communication with chess engines: **engineCommunication.js**
- Creates and manages processes for the chess engine executables
- Sends commands to the engines
- Parses responses from the engines

5. - Maintains the state of the current game: **gameState.js**
- Tracks the position of all pieces
- Keeps record of move history
- Monitors game conditions (check, checkmate, etc.)

6. - Handles the movement logic and animations: **pieceMovement.js**
- Animates piece movements on the board
- Handles special moves like castling and en passant
- Manages move execution and board updates

## The `game` Folder
The `game` folder contains files that implement the core chess engine, including the rules and logic of chess at a low level. These are generally more focused on the domain logic and chess-specific algorithms.
### Key subfolders and files:
1. - Core chess engine functionality: **engine/**
- - Initializes the chess engine components **engine.js**
- - Defines core game structures and state management **game.js**

2. **bitboard/** - Implements bitboard representation of the chess position:
    - - Defines constants and structures for bitboard representation **bit_boards.js**
    - - Provides bitwise operations for efficient board manipulation **bit_operations.js**
    - - Converts between different chess notation formats **conversions.js**

3. **pieces/** - Contains logic for each chess piece:
    - , , , etc. - Define movement patterns and attack tables for each piece **bishop.js****king.js****knight.js**
    - Each file implements piece-specific attack generation and validation

4. **moves/** - Move generation and validation:
    - - Determines if squares are under attack **attacks.js**
    - - Defines move structure and flags **move.js**
    - - Generates all legal moves in a position **movegen.js**
    - - Applies moves to the game state **execute_move.js**

5. **fen/** - Handles Forsyth-Edwards Notation:
    - - Parses FEN strings to set up board positions **parse.js**

6. **positions/** - Position handling:
    - - Implements Zobrist hashing for efficient position comparison **zobrist_hashing.js**

## How They Work Together
1. The entry point files (`app.js` and `app2.js`) initialize the chess engine and set up event listeners for the DOM.
2. When the DOM is loaded, they initialize either the player vs AI game or the bot vs bot game from the modules folder.
3. The modules use the low-level chess engine from the game folder to:
    - Generate legal moves
    - Validate moves
    - Execute moves
    - Check for game-ending conditions

4. The core chess logic in the game folder is mostly agnostic to the UI and uses bitboards for efficient representation and calculation.
5. The modules in the modules folder translate between user actions and the engine, and handle the visual representation of the game state.
