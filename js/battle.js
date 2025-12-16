const pokemonList = [
    "Bulbasaur", "Ivysaur", "Venusaur",
    "Charmander", "Charmeleon", "Charizard",
    "Squirtle", "Wartortle", "Blastoise",
    "Caterpie", "Metapod", "Butterfree",
    "Pikachu", "Raichu", "Sandshrew", "nidoran-f",
    "nidoran-m", "Vulpix", "Oddish", "Paras",
    "Venonat", "Psyduck", "Mankey", "Growlithe",
    "Poliwag", "Abra", "Machop", "Bellsprout",
    "Eevee", "Vaporeon", "Jolteon", "Flareon",
    "Mew", "Mewtwo"
];

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
    logEntries.scrollTop = logEntries.scrollHeight; // Auto-scroll
}

// === Message System (with animation) ===
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

// === Carousel Update ===
function updateCarousel() {
    const pokeName = pokemonList[currentIndex];
    const pokeLower = pokeName.toLowerCase();
    img.src = `https://img.pokemondb.net/sprites/black-white/anim/normal/${pokeLower}.gif`;
    nameText.textContent = pokeName;
}

document.getElementById("prevBtn").onclick = () => {
    currentIndex = (currentIndex - 1 + pokemonList.length) % pokemonList.length;
    updateCarousel();
};

document.getElementById("nextBtn").onclick = () => {
    currentIndex = (currentIndex + 1) % pokemonList.length;
    updateCarousel();
};

// === Select Pokémon ===
document.getElementById("selectBtn").onclick = () => {
    const selected = pokemonList[currentIndex];
    playerPokemon = selected.toLowerCase();

    selectedDisplay.innerHTML = `
        <div class="player-pokemon-container">
            <h2>Your ${selected}</h2>
            <img class="pokemon-selection-img" 
                 src="https://img.pokemondb.net/sprites/black-white/anim/back-normal/${playerPokemon}.gif"
                 alt="${selected}">
            <div class="hp-section">
                <span id="playerHPText" class="hp-text">100 / 100</span>
                <div class="hp-bar-container">
                    <div id="playerHPBar" class="hp-bar"></div>
                </div>
            </div>
        </div>
    `;

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

// === Initialize Each Battle (FIXED: enemyDisplayName declared first) ===
function initBattle(enemyName) {
    currentEnemyName = enemyName;
    enemyHP = 100;
    battleActive = true;

    const enemyDisplayName = enemyName.charAt(0).toUpperCase() + enemyName.slice(1).replace(/-/g, ' ');

    // Log enemy appearance
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
    updateMessage("Battle Start! Choose your move.");
    addToBattleLog("Battle Start! Choose your move.");
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
            <button id="attackBtn">Attack</button>
            <button id="defendBtn">Defend</button>
        </div>
        <div class="move-center">
            <button id="parryBtn">Parry</button>
        </div>
    `;

    document.body.appendChild(battleMenu);

    if (!battleMessage) {
        battleMessage = document.createElement('div');
        battleMessage.id = "battleMessage";
        document.body.appendChild(battleMessage);
    }

    document.getElementById('attackBtn').onclick = () => playerTurn('attack');
    document.getElementById('defendBtn').onclick = () => playerTurn('defend');
    document.getElementById('parryBtn').onclick = () => playerTurn('parry');

    // Initialize log when menu is created
    initBattleLog();
}

// === Player Turn (with logging) ===
function playerTurn(move) {
    if (!battleActive) return;
    battleActive = false;
    disableButtons();

    const moveText = move.charAt(0).toUpperCase() + move.slice(1);
    updateMessage(`You chose ${moveText}...`);
    addToBattleLog(`Player chose ${moveText}!`, true);

    setTimeout(() => {
        const aiMoves = ['attack', 'defend', 'parry'];
        const aiMove = aiMoves[Math.floor(Math.random() * 3)];
        const aiMoveText = aiMove.charAt(0).toUpperCase() + aiMove.slice(1);
        updateMessage(`Enemy used ${aiMoveText}!`);
        addToBattleLog(`Opponent used ${aiMoveText}!`, false);

        setTimeout(() => resolveTurn(move, aiMove), 1000);
    }, 1200);
}

// === Resolve Turn (with logging) ===
function resolveTurn(playerMove, aiMove) {
    let damageToPlayer = 0;
    let damageToEnemy = 0;
    let resultMsg = "";

    if (playerMove === aiMove) {
        resultMsg = "It's a tie! No damage.";
        addToBattleLog("It's a tie! No damage taken.");
    } else if (
        (playerMove === 'attack' && aiMove === 'defend') ||
        (playerMove === 'defend' && aiMove === 'parry') ||
        (playerMove === 'parry' && aiMove === 'attack')
    ) {
        damageToEnemy = 20;
        resultMsg = `Success! Enemy takes 20 damage!`;
        addToBattleLog(`Success! Enemy takes 20 damage!`, true);
    } else {
        damageToPlayer = 20;
        resultMsg = `Failed! You take 20 damage!`;
        addToBattleLog(`Failed! Player takes 20 damage!`, false);
    }

    playerHP = Math.max(0, playerHP - damageToPlayer);
    enemyHP = Math.max(0, enemyHP - damageToEnemy);

    updateHPBars();
    updateMessage(resultMsg);

    setTimeout(() => checkBattleEnd(), 1500);
}

// === Update HP Bars and Faint Animation ===
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

// === Check Win/Lose/Next Enemy ===
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

    updateCarousel();
}

// === Faint Animation ===
function triggerFaintAnimation(imgElement) {
    imgElement.style.animation = 'none';
    imgElement.offsetHeight;
    imgElement.style.animation = 'faintShake 0.4s ease-in-out, faintFade 1.2s ease-out forwards';
    imgElement.style.animationDelay = '0s, 0.4s';
}

// === Side Menu ===
document.getElementById("selectPokemonBtn").onclick = resetGame;

// === Initial Load ===
updateCarousel();