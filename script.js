const enemyArea = document.getElementById("enemy-area");
const wordInput = document.getElementById("word-input");
const scoreDisplay = document.getElementById("score");
const cannon = document.getElementById("cannon");
const startButton = document.getElementById("start-button");
const gameOverPopup = document.getElementById("game-over-popup");
const finalScoreDisplay = document.getElementById("final-score");
const restartButton = document.getElementById("restart-button");

const waves = [
    { words: ["cat", "dog", "sun", "moon", "tree", "rock", "car", "ship", "bird", "fish", "light", "snow", "cloud", "leaf", "chair", "book", "river", "wall", "sand", "shoe", "star", "house", "apple", "bread", "grass", "blue", "red", "ball", "game", "snow", "sky", "boat", "table", "glass", "milk", "bread", "ring", "shoe", "horse", "hat", "cup", "pen", "bell", "map", "egg", "bell", "rock", "bird", "wolf", "moon"], spawnInterval: 2500, enemySpeed: 1 },
    { words: ["dragon", "comet", "galaxy", "laser", "engine", "cloud", "radar", "planet", "rocket", "spaceship", "wizard", "thunder", "tornado", "galaxy", "asteroid", "lightning", "plasma", "volcano", "ice", "ocean", "shield", "cannon", "nebula", "vortex", "lunar", "shield", "storm", "pulse", "wave", "force", "cosmic", "myth", "weapon", "armor", "comet", "steam", "orbital", "radio", "photon", "blade", "exo", "android", "gravity", "hacker", "reactor", "crystal", "energy", "rover", "nebula", "vortex"], spawnInterval: 2000, enemySpeed: 1.5 },
    { words: ["algorithm", "parasite", "nebula", "pulsar", "quasar", "quantum", "terraform", "radiance", "solar", "hydro", "machine", "infinity", "chaos", "gravity", "satellite", "distortion", "radiation", "electron", "singularity", "equation", "cryptic", "fortress", "doctrine", "mission", "hologram", "illusion", "abyss", "vector", "shadow", "synthetic", "drone", "theory", "fractal", "cybernet", "neutron", "scanner", "shield", "predator", "velocity", "mutant", "reactor", "android", "vacuum", "android", "dimension", "biome", "parallel", "exile", "eternal", "vortex"], spawnInterval: 1500, enemySpeed: 2 },
    { words: ["hyperbole", "ultraviolet", "oscillate", "electromagnetic", "bioluminescent", "photosynthesis", "displacement", "chronoform", "superconductive", "thermodynamics", "exoplanet", "cosmology", "gene-splicing", "nanotechnology", "neuroscience", "archetype", "metamorphosis", "thermonuclear", "subatomic", "gravitational", "telecommunication", "biotechnology", "phytoplankton", "biogenesis", "cybernetics", "fusion", "nanomachine", "biotechnology", "paleontology", "neurotoxin", "radioactive", "transmutation", "biomechanical", "quantum leap", "string theory", "multiverse", "antimatter", "retrograde", "nanobot", "cyborg", "exoskeleton", "holography", "transistor", "wormhole", "electrostatic", "isotropic", "tachyon", "geneticist", "singularity", "transcendence"], spawnInterval: 1000, enemySpeed: 2.5 }
];

let words = waves[0].words; // Start with the first wave's words
let activeEnemies = [];
let score = 0;
let gameRunning = false;
let currentWave = 0;
let enemiesDefeatedInWave = 0;
let enemySpawnInterval;

// Load sounds
const typingSound = new Audio("typing-sound.mp3");
const blastSound = new Audio("blast-sound.mp3");
const bgMusic1 = new Audio("background1.mp3");
const bgMusic2 = new Audio("background2.mp3");

function playBackgroundMusic() {
    bgMusic1.currentTime = 0;
    bgMusic2.currentTime = 0;
    bgMusic1.play().then(() => {
        bgMusic1.onended = () => {
            bgMusic2.play().then(() => {
                bgMusic2.onended = () => {
                    playBackgroundMusic();
                };
            });
        };
    }).catch(error => console.error("Error playing background music:", error));
}

// Function to play typing sound
function playTypingSound() {
    typingSound.currentTime = 0;
    typingSound.play();
}

// Function to play blast sound
function playBlastSound() {
    blastSound.currentTime = 0;
    blastSound.play();
}

// Generate random word
function getRandomWord() {
    return words[Math.floor(Math.random() * words.length)];
}

// Create an enemy
function createEnemy() {
    const enemy = document.createElement("div");
    enemy.classList.add("enemy");
    const word = getRandomWord();
    enemy.textContent = word;
    enemy.style.left = `${Math.random() * 80 + 10}%`; // Ensure enemies spawn fully inside
    enemy.style.top = "0%";
    enemy.dataset.word = word;
    enemyArea.appendChild(enemy);
    activeEnemies.push(enemy);
}

// Move enemies
function moveEnemies() {
    activeEnemies.forEach((enemy) => {
        const currentTop = parseFloat(enemy.style.top);
        if (currentTop >= 90) {
            endGame(); // End the game if an enemy reaches the bottom
        } else {
            enemy.style.top = `${currentTop + waves[currentWave].enemySpeed}%`; // Adjust speed based on wave
        }
    });
}

// Create and animate bullet
function createBullet(enemy) {
    const bullet = document.createElement("div");
    bullet.classList.add("bullet");

    const cannonRect = cannon.getBoundingClientRect();
    const enemyRect = enemy.getBoundingClientRect();
    const gameAreaRect = enemyArea.getBoundingClientRect();

    bullet.style.left = `${cannonRect.left + cannonRect.width / 2 - gameAreaRect.left - 5}px`;
    bullet.style.top = `${cannonRect.top + cannonRect.height / 2 - gameAreaRect.top - 5}px`;

    enemyArea.appendChild(bullet);

    const xDistance = enemyRect.left + enemyRect.width / 2 - (cannonRect.left + cannonRect.width / 2);
    const yDistance = enemyRect.top + enemyRect.height / 2 - (cannonRect.top + cannonRect.height / 2);

    setTimeout(() => {
        bullet.style.transform = `translate(${xDistance}px, ${yDistance}px)`;
    }, 10);

    setTimeout(() => {
        if (bullet) bullet.remove();
        if (enemy.parentElement === enemyArea) {
            playBlastSound();
            enemyArea.removeChild(enemy);
            activeEnemies = activeEnemies.filter((e) => e !== enemy);
            score += 10;
            scoreDisplay.textContent = score;

            enemiesDefeatedInWave++;
            if (enemiesDefeatedInWave >= 10) {
                advanceWave();
            }
        }
    }, 500);
}

// Check input
wordInput.addEventListener("input", () => {
    playTypingSound();
    const inputText = wordInput.value.toLowerCase();
    activeEnemies.forEach((enemy) => {
        if (enemy.dataset.word.toLowerCase() === inputText) {
            createBullet(enemy);
            wordInput.value = "";
        }
    });
});

// Start wave
function startWave() {
    if (currentWave >= waves.length) {
        endGame();
        return;
    }

    const waveConfig = waves[currentWave];
    words = waveConfig.words;

    enemySpawnInterval = setInterval(createEnemy, waveConfig.spawnInterval);
    console.log(`Wave ${currentWave + 1} started!`);
}

// Advance to the next wave
function advanceWave() {
    clearInterval(enemySpawnInterval);
    currentWave++;
    enemiesDefeatedInWave = 0;
    startWave();
}

// Game loop
function gameLoop() {
    if (gameRunning) {
        moveEnemies();
        setTimeout(gameLoop, 200);
    }
}

// End the game
function endGame() {
    gameRunning = false;
    clearInterval(enemySpawnInterval);
    activeEnemies.forEach((enemy) => enemy.remove()); // Remove all enemies
    activeEnemies = [];
    finalScoreDisplay.textContent = score;
    gameOverPopup.classList.remove("hidden");
    wordInput.disabled = true;
}

// Restart the game
restartButton.addEventListener("click", () => {
    location.reload();
});

// Start the game
startButton.addEventListener("click", () => {
    if (!gameRunning) {
        playBackgroundMusic();
        gameRunning = true;
        startWave();
        gameLoop();
        startButton.style.display = "none";
        wordInput.disabled = false;
    }
});

// Hide the game-over popup initially
document.addEventListener("DOMContentLoaded", () => {
    gameOverPopup.classList.add("hidden");
});
