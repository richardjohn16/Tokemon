// battle.js - FULL COMPLETE VERSION
// Owned Pokémon carousel with animated sprites + fallback to your static images

function getOwnedPokemon() {
    const stored = localStorage.getItem('ownedPokemon');
    return stored ? JSON.parse(stored) : [];
}

let ownedPokemon = getOwnedPokemon();

// Build pokemonList with animated front + fallback to saved static img
let pokemonList = ownedPokemon.map(p => {
    const lowerName = p.name.toLowerCase();
    const animatedFront = `https://img.pokemondb.net/sprites/black-white/anim/normal/${lowerName}.gif`;

    return {
        name: p.name.charAt(0).toUpperCase() + p.name.slice(1),
        lower: lowerName,
        frontImg: animatedFront,           // Try animated first in carousel
        fallbackImg: p.img || '/assets/placeholder.png'  // Your original captured image
    };
});

const enemyList = [
    "bulbasaur", "ivysaur", "venusaur",
    "charmander", "charmeleon", "charizard",
    "squirtle", "wartortle", "blastoise",
    "caterpie", "metapod", "butterfree",
    "pikachu", "raichu", "sandshrew", "nidoran-f",
    "nidoran-m", "vulpix", "oddish", "paras",
    "venonat", "psyduck", "mankey", "growlithe",
    "poliwag", "abra", "machop", "bellsprout",
    "pidgey", "rattata", "spearow", "zubat",
    "geodude", "gastly"
];

let currentIndex = 0;
let playerPokemon = "";
let playerHP = 100;
let enemyHP = 100;
let currentEnemyName = "";
let enemyQueue = [];
let currentEnemyIndex = 0;
let battleActive = false;
let battleMenu = null;
let battleMessage = null;
let battleLogContainer = null;
let chosenOpponentCount = null;

const img = document.getElementById("pokemonSprite");
const nameText = document.getElementById("pokemonName");
const selectedDisplay = document.getElementById("selectedDisplay");

// === Battle Log Functions ===
function initBattleLog() {
    if (battleLogContainer) return;

    battleLogContainer = document.createElement('div');
    battleLogContainer.className = 'battle-log';
    battleLogContainer.innerHTML = `
        <h3>Battle Log</h3>
        <div id="logEntries"></div>
    `;
    document.body.appendChild(battleLogContainer);
}

function addToBattleLog(message, isPlayer = false) {
    if (!battleLogContainer) initBattleLog();

    const logEntries = document.getElementById('logEntries');
    const entry = document.createElement('p');
    entry.textContent = message;
    entry.className = isPlayer ? 'log-player' : 'log-enemy';
    logEntries.appendChild(entry);
    logEntries.scrollTop = logEntries.scrollHeight;
}

// === Message System ===
function updateMessage(msg) {
    if (battleMessage) {
        battleMessage.textContent = msg;
        battleMessage.style.opacity = '1';
        battleMessage.style.transform = 'translateX(-50%) scale(1)';
        setTimeout(() => {
            if (battleMessage) {
                battleMessage.style.opacity = '1';
                battleMessage.style.transform = 'translateX(-50%) scale(1)';
            }
        }, 1500);
    }
}

// === Carousel Update with Animated + Fallback ===
function updateCarousel() {
    if (pokemonList.length === 0) {
        img.src = '/assets/placeholder.png';
        nameText.textContent = 'No Pokémon Owned';
        document.getElementById("prevBtn").disabled = true;
        document.getElementById("nextBtn").disabled = true;
        document.getElementById("selectBtn").disabled = true;
        return;
    }

    const poke = pokemonList[currentIndex];
    img.src = poke.frontImg;  // Try animated GIF first

    // If animated fails, fall back to your static image
    img.onerror = () => {
        img.onerror = null;
        img.src = poke.fallbackImg;
    };

    nameText.textContent = poke.name;

    document.getElementById("prevBtn").disabled = false;
    document.getElementById("nextBtn").disabled = false;
    document.getElementById("selectBtn").disabled = false;
}

// === Navigation ===
document.getElementById("prevBtn").onclick = () => {
    if (pokemonList.length === 0) return;
    currentIndex = (currentIndex - 1 + pokemonList.length) % pokemonList.length;
    updateCarousel();
};

document.getElementById("nextBtn").onclick = () => {
    if (pokemonList.length === 0) return;
    currentIndex = (currentIndex + 1) % pokemonList.length;
    updateCarousel();
};

// === Select Pokémon - with Animated Back Sprite + Fallback ===
document.getElementById("selectBtn").onclick = () => {
    if (pokemonList.length === 0) {
        alert("You don't own any Pokémon yet!");
        return;
    }

    const selected = pokemonList[currentIndex];
    const selectedName = selected.name;
    playerPokemon = selected.lower;

    const animatedBack = `https://img.pokemondb.net/sprites/black-white/anim/back-normal/${selected.lower}.gif`;

    selectedDisplay.innerHTML = `
        <div class="player-pokemon-container">
            <h2>Your ${selectedName}</h2>
            <img class="pokemon-selection-img" src="${animatedBack}" alt="${selectedName}">
            <div class="hp-section">
                <span id="playerHPText" class="hp-text">100 / 100</span>
                <div class="hp-bar-container">
                    <div id="playerHPBar" class="hp-bar"></div>
                </div>
            </div>
        </div>
    `;

    // Fallback if back animated sprite doesn't exist
    const battleImg = selectedDisplay.querySelector('.pokemon-selection-img');
    battleImg.onerror = () => {
        battleImg.onerror = null;
        battleImg.src = selected.fallbackImg;
    };

    document.getElementById("pokemonCarouselContainer").style.display = "none";
    document.getElementById("opponentSelect").classList.remove("hidden");
};

// === Opponent Selection ===
document.querySelectorAll(".opp-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".opp-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        chosenOpponentCount = parseInt(btn.dataset.count);
        document.getElementById("startRoundRobin").classList.remove("hidden");
    });
});

document.getElementById("startRoundRobin").addEventListener("click", () => {
    if (!chosenOpponentCount) return;
    document.getElementById("opponentSelect").classList.add("hidden");
    startBattle(chosenOpponentCount);
});

// === Start Battle ===
function startBattle(count) {
    playerHP = 100;
    enemyQueue = [];
    for (let i = 0; i < count; i++) {
        const enemy = enemyList[Math.floor(Math.random() * enemyList.length)];
        enemyQueue.push(enemy);
    }
    currentEnemyIndex = 0;
    initBattle(enemyQueue[0]);
}

function initBattle(enemyName) {
    currentEnemyName = enemyName;
    enemyHP = 100;
    battleActive = true;

    const enemyDisplayName = enemyName.charAt(0).toUpperCase() + enemyName.slice(1).replace(/-/g, ' ');

    addToBattleLog(`Wild ${enemyDisplayName} appeared!`, false);

    document.getElementById("enemyDisplay").innerHTML = `
        <div class="enemy-pokemon-container">
            <h2>Enemy: ${enemyDisplayName}</h2>
            <img class="enemy-pokemon" src="https://img.pokemondb.net/sprites/black-white/anim/normal/${enemyName}.gif" alt="${enemyName}">
            <div class="hp-section">
                <span id="enemyHPText" class="hp-text">100 / 100</span>
                <div class="hp-bar-container">
                    <div id="enemyHPBar" class="hp-bar enemy"></div>
                </div>
            </div>
        </div>
    `;

    createBattleMenu();
    updateMessage("Battle Start! Throw Rock, Paper, or Scissors!");
    addToBattleLog("Battle Start! Choose your throw.");
    updateHPBars();
    enableButtons();
}

// === Create Move Selection Menu ===
function createBattleMenu() {
    if (battleMenu) {
        battleMenu.style.display = "block";
        return;
    }

    battleMenu = document.createElement('div');
    battleMenu.className = "floating-battle-move";

    battleMenu.innerHTML = `
        <div class="move-grid">
            <button id="rockBtn">✊ Rock</button>
            <button id="paperBtn">✋ Paper</button>
        </div>
        <div class="move-center">
            <button id="scissorsBtn">✌️ Scissors</button>
        </div>
    `;

    document.body.appendChild(battleMenu);

    if (!battleMessage) {
        battleMessage = document.createElement('div');
        battleMessage.id = "battleMessage";
        document.body.appendChild(battleMessage);
    }

    document.getElementById('rockBtn').onclick = () => playerTurn('rock');
    document.getElementById('paperBtn').onclick = () => playerTurn('paper');
    document.getElementById('scissorsBtn').onclick = () => playerTurn('scissors');

    initBattleLog();
}

// === Player Turn ===
function playerTurn(move) {
    if (!battleActive) return;
    battleActive = false;
    disableButtons();

    const moveDisplay = {
        rock: "✊ Rock",
        paper: "✋ Paper",
        scissors: "✌️ Scissors"
    };

    const moveText = moveDisplay[move];
    updateMessage(`You threw ${moveText}...`);
    addToBattleLog(`You threw ${moveText}!`, true);

    setTimeout(() => {
        const aiMoves = ['rock', 'paper', 'scissors'];
        const aiMove = aiMoves[Math.floor(Math.random() * 3)];
        const aiMoveText = moveDisplay[aiMove];

        updateMessage(`Enemy threw ${aiMoveText}!`);
        addToBattleLog(`Enemy threw ${aiMoveText}!`, false);

        setTimeout(() => resolveTurn(move, aiMove), 1000);
    }, 1200);
}

// === Resolve Turn ===
function resolveTurn(playerMove, aiMove) {
    let damageToPlayer = 0;
    let damageToEnemy = 0;
    let resultMsg = "";
    let logMsg = "";

    if (playerMove === aiMove) {
        resultMsg = "It's a tie! Both threw the same!";
        logMsg = "It's a tie! No damage taken.";
        addToBattleLog(logMsg);
    } 
    else if (
        (playerMove === 'rock' && aiMove === 'scissors') ||
        (playerMove === 'paper' && aiMove === 'rock') ||
        (playerMove === 'scissors' && aiMove === 'paper')
    ) {
        damageToEnemy = 20;
        const winReason = 
            playerMove === 'rock' ? "Rock crushes Scissors!" :
            playerMove === 'paper' ? "Paper covers Rock!" :
                                    "Scissors cuts Paper!";
        resultMsg = `You win! ${winReason} Enemy takes 20 damage!`;
        logMsg = `Player wins! ${winReason} Enemy -20 HP`;
        addToBattleLog(logMsg, true);
    } 
    else {
        damageToPlayer = 20;
        const loseReason = 
            aiMove === 'rock' ? "Rock crushes Scissors!" :
            aiMove === 'paper' ? "Paper covers Rock!" :
                                "Scissors cuts Paper!";
        resultMsg = `You lose! ${loseReason} You take 20 damage!`;
        logMsg = `Enemy wins! ${loseReason} Player -20 HP`;
        addToBattleLog(logMsg, false);
    }

    playerHP = Math.max(0, playerHP - damageToPlayer);
    enemyHP = Math.max(0, enemyHP - damageToEnemy);

    updateHPBars();
    updateMessage(resultMsg);

    setTimeout(() => checkBattleEnd(), 1500);
}

// === Update HP Bars ===
function updateHPBars() {
    const pText = document.querySelector('#playerHPText');
    const pBar = document.getElementById('playerHPBar');
    const eText = document.querySelector('#enemyHPText');
    const eBar = document.getElementById('enemyHPBar');

    if (pText) pText.textContent = `${playerHP} / 100`;
    if (pBar) {
        pBar.style.width = `${playerHP}%`;
        pBar.style.background = playerHP <= 30 ? 'linear-gradient(to right, #ff4444, #cc0000)' :
                                 playerHP <= 60 ? 'linear-gradient(to right, #ffaa00, #cc8800)' :
                                                  'linear-gradient(to right, #4CAF50, #8BC34A)';
    }

    if (eText) eText.textContent = `${enemyHP} / 100`;
    if (eBar) {
        eBar.style.width = `${enemyHP}%`;
        eBar.style.background = enemyHP <= 30 ? 'linear-gradient(to right, #ff4444, #cc0000)' :
                                enemyHP <= 60 ? 'linear-gradient(to right, #ffaa00, #cc8800)' :
                                                 'linear-gradient(to right, #f44336, #e91e63)';
    }

    const playerImg = document.querySelector('.pokemon-selection-img');
    if (playerHP <= 0 && playerImg && !playerImg.classList.contains('fainted')) {
        playerImg.classList.add('fainted');
        triggerFaintAnimation(playerImg);
    }

    const enemyImg = document.querySelector('.enemy-pokemon');
    if (enemyHP <= 0 && enemyImg && !enemyImg.classList.contains('fainted')) {
        enemyImg.classList.add('fainted');
        triggerFaintAnimation(enemyImg);
    }
}

// === Button States ===
function disableButtons() {
    if (battleMenu) {
        battleMenu.querySelectorAll('button').forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.6';
            btn.style.cursor = 'not-allowed';
        });
    }
}

function enableButtons() {
    if (battleMenu) {
        battleMenu.querySelectorAll('button').forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        });
    }
    battleActive = true;
}

// === Check Battle End ===
function checkBattleEnd() {
    if (playerHP <= 0) {
        showLose();
        return;
    }

    if (enemyHP <= 0) {
        playerHP = Math.min(100, playerHP + 30);
        updateHPBars();
        updateMessage("Enemy defeated! You recovered 30 HP!");
        addToBattleLog("Enemy defeated! +30 HP recovered!", true);

        setTimeout(() => {
            currentEnemyIndex++;
            if (currentEnemyIndex >= enemyQueue.length) {
                showVictory();
            } else {
                initBattle(enemyQueue[currentEnemyIndex]);
            }
        }, 2000);
        return;
    }

    updateMessage("Your turn!");
    enableButtons();
}

// === Game Over Screens ===
function showLose() {
    updateMessage("💀 You fainted! Game Over 💀");
    addToBattleLog("Player fainted! Game Over", false);
    disableButtons();
    setTimeout(() => createRestartButton(false), 1500);
}

function showVictory() {
    updateMessage(`🏆 Victory! All ${enemyQueue.length} enemies defeated! 🏆`);
    addToBattleLog(`Player won! All enemies defeated!`, true);
    disableButtons();
    setTimeout(() => createRestartButton(true), 2000);
}

function createRestartButton(isVictory = false) {
    const restartBtn = document.createElement('button');
    restartBtn.textContent = isVictory ? 'Play Again' : 'Restart Game';
    restartBtn.className = `restart-btn ${isVictory ? 'victory' : ''}`;
    restartBtn.onclick = resetGame;
    document.body.appendChild(restartBtn);
}

// === Reset Everything ===
function resetGame() {
    if (battleMenu) battleMenu.remove();
    if (battleMessage) battleMessage.remove();
    if (battleLogContainer) battleLogContainer.remove();
    document.querySelector('.restart-btn')?.remove();

    battleMenu = null;
    battleMessage = null;
    battleLogContainer = null;

    playerHP = 100;
    currentEnemyIndex = 0;
    battleActive = false;
    chosenOpponentCount = null;

    document.getElementById("pokemonCarouselContainer").style.display = "block";
    document.getElementById("opponentSelect").classList.add("hidden");
    selectedDisplay.innerHTML = "";
    document.getElementById("enemyDisplay").innerHTML = "";
    document.getElementById("startRoundRobin").classList.add("hidden");
    document.querySelectorAll('.opp-btn').forEach(b => b.classList.remove('selected'));
    document.querySelectorAll('.fainted').forEach(el => el.classList.remove('fainted'));

    // Refresh owned Pokémon in case new ones were caught
    ownedPokemon = getOwnedPokemon();
    pokemonList = ownedPokemon.map(p => {
        const lowerName = p.name.toLowerCase();
        const animatedFront = `https://img.pokemondb.net/sprites/black-white/anim/normal/${lowerName}.gif`;
        return {
            name: p.name.charAt(0).toUpperCase() + p.name.slice(1),
            lower: lowerName,
            frontImg: animatedFront,
            fallbackImg: p.img || '/assets/placeholder.png'
        };
    });
    currentIndex = 0;

    if (pokemonList.length === 0) {
        document.getElementById("pokemonCarouselContainer").innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: #3466AF;">
                <h2>You don't own any Pokémon yet!</h2>
                <p>Catch some first before battling.</p>
                <button onclick="window.location.href='/inventory.html'" 
                        style="padding: 15px 30px; margin-top: 20px; font-family: 'Press Start 2P', cursive; 
                               font-size: 16px; background: #FFCB05; color: #3466AF; border: none; 
                               border-radius: 8px; cursor: pointer;">
                    Go to Inventory
                </button>
            </div>
        `;
    } else {
        updateCarousel();
    }
}

// === Faint Animation ===
function triggerFaintAnimation(imgElement) {
    imgElement.style.animation = 'none';
    imgElement.offsetHeight;
    imgElement.style.animation = 'faintShake 0.4s ease-in-out, faintFade 1.2s ease-out fogitwards';
    imgElement.style.animationDelay = '0s, 0.4s';
}

// === Side Menu ===
document.getElementById("selectPokemonBtn").onclick = resetGame;

// === Initial Load ===
if (pokemonList.length === 0) {
    document.getElementById("pokemonCarouselContainer").innerHTML = `
        <div style="text-align: center; padding: 60px 20px; color: #3466AF;">
            <h2>You don't own any Pokémon yet!</h2>
            <p>Catch some first before battling.</p>
            <button onclick="window.location.href='/inventory.html'" 
                    style="padding: 15px 30px; margin-top: 20px; font-family: 'Press Start 2P', cursive; 
                           font-size: 16px; background: #FFCB05; color: #3466AF; border: none; 
                           border-radius: 8px; cursor: pointer;">
                Go to Inventory
            </button>
        </div>
    `;
} else {
    updateCarousel();
}