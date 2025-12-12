const pokemonList = [
    "Bulbasaur", "Charmander", "Squirtle",
    "Pikachu", "Eevee", "Mew", "Mewtwo"
];

let currentIndex = 0;

const img = document.getElementById("pokemonSprite");
const nameText = document.getElementById("pokemonName");
const selectedDisplay = document.getElementById("selectedDisplay");

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

document.getElementById("selectBtn").onclick = () => {
    const selected = pokemonList[currentIndex];

    selectedDisplay.innerHTML =
        `<h2>You selected: ${selected}</h2>
         <img class="pokemon-selection-img" 
              src="https://img.pokemondb.net/sprites/black-white/anim/back-normal/${selected.toLowerCase()}.gif">`;

    document.getElementById("pokemonCarouselContainer").style.display = "none";

    document.getElementById("opponentSelect").classList.remove("hidden");
};

let chosenOpponentCount = null;


document.querySelectorAll(".opp-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".opp-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        chosenOpponentCount = btn.dataset.count;
        document.getElementById("startRoundRobin").classList.remove("hidden");
    });
});


document.getElementById("startRoundRobin").addEventListener("click", () => {
    if (!chosenOpponentCount) return;

    
    document.getElementById("opponentSelect").classList.add("hidden");

    
    startBattle(chosenOpponentCount);
});


let enemyQueue = [];
let currentEnemyIndex = 0;

function startBattle(count) {
    const enemyList = [
        "bulbasaur", "charmander", "squirtle",
        "pikachu", "pidgey", "rattata",
        "geodude", "abra", "machop", "gastly"
    ];

    enemyQueue = [];

    // Generate opponent list
    for (let i = 0; i < count; i++) {
        const enemy = enemyList[Math.floor(Math.random() * enemyList.length)];
        enemyQueue.push(enemy);
    }

    currentEnemyIndex = 0;
    showNextEnemy();
}

function showNextEnemy() {
    const enemyDisplay = document.getElementById("enemyDisplay");
    const defeatBtn = document.getElementById("defeatEnemyBtn");

    if (currentEnemyIndex >= enemyQueue.length) {
        enemyDisplay.innerHTML = `<h2>All opponents defeated!</h2>`;
        defeatBtn.classList.add("hidden");
        return;
    }

    const enemyName = enemyQueue[currentEnemyIndex];

    enemyDisplay.innerHTML = `
        <h2>Enemy ${currentEnemyIndex + 1}</h2>
        <img class="enemy-pokemon"
            src="https://img.pokemondb.net/sprites/black-white/anim/normal/${enemyName}.gif"
            alt="${enemyName}">
    `;

    defeatBtn.classList.remove("hidden");
}

document.getElementById("defeatEnemyBtn").addEventListener("click", () => {
    currentEnemyIndex++;
    showNextEnemy();
});



document.getElementById("selectPokemonBtn").onclick = () => {
    const container = document.getElementById("pokemonCarouselContainer");

    if (container.style.display === "none") {
        container.style.display = "block";
    } else {
        container.style.display = "none";
    }

    
    const enemyDisplay = document.getElementById("enemyDisplay");
    const defeatBtn = document.getElementById("defeatEnemyBtn");

    enemyDisplay.innerHTML = "";

    currentEnemyIndex = 0;

    defeatBtn.classList.add("hidden");
};


updateCarousel();
