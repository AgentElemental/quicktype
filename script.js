
const enemyArea = document.getElementById("enemy-area");
const wordInput = document.getElementById("word-input");
const scoreDisplay = document.getElementById("score");
const cannon = document.getElementById("cannon");
const startButton = document.getElementById("start-button"); // Reference to the start button
const gameOverPopup = document.getElementById("game-over-popup"); // Reference to the game over popup
const finalScoreDisplay = document.getElementById("final-score"); // Final score display in pop-up
const restartButton = document.getElementById("restart-button"); // Reference to the restart button

let words = ["cat", "dog", "sun", "moon", "tree", "rock", "car", "ship", "bird", "fish", "light", "snow", "cloud", "leaf", "chair", "book", "river", "wall", "sand", "shoe", "star", "house", "apple", "bread", "grass", "blue", "red", "ball", "game", "snow", "sky", "boat", "table", "glass", "milk", "bread", "ring", "shoe", "horse", "hat", "cup", "pen", "bell", "map", "egg", "bell", "rock", "bird", "wolf", "moon", "dragon", "comet", "galaxy", "laser", "engine", "cloud", "radar", "planet", "rocket", "spaceship", "wizard", "thunder", "tornado", "galaxy", "asteroid", "lightning", "plasma", "volcano", "ice", "ocean", "shield", "cannon", "nebula", "vortex", "lunar", "shield", "storm", "pulse", "wave", "force", "cosmic", "myth", "weapon", "armor", "comet", "steam", "orbital", "radio", "photon", "blade", "exo", "android", "gravity", "hacker", "reactor", "crystal", "energy", "rover", "nebula", "vortex", "algorithm", "parasite", "nebula", "pulsar", "quasar", "quantum", "terraform", "radiance", "solar", "hydro", "machine", "infinity", "chaos", "gravity", "satellite", "distortion", "radiation", "electron", "singularity", "equation", "cryptic", "fortress", "doctrine", "mission", "hologram", "illusion", "abyss", "vector", "shadow", "synthetic", "drone", "theory", "fractal", "cybernet", "neutron", "scanner", "shield", "predator", "velocity", "mutant", "reactor", "android", "vacuum", "android", "dimension", "biome", "parallel", "exile", "eternal", "vortex", "hyperbole", "ultraviolet", "oscillate", "electromagnetic", "bioluminescent", "photosynthesis", "displacement", "chronoform", "superconductive", "thermodynamics", "exoplanet", "cosmology", "gene-splicing", "nanotechnology", "neuroscience", "archetype", "metamorphosis", "thermonuclear", "subatomic", "gravitational", "telecommunication", "biotechnology", "phytoplankton", "biogenesis", "cybernetics", "fusion", "nanomachine", "biotechnology", "paleontology", "neurotoxin", "radioactive", "transmutation", "biomechanical", "quantum leap", "string theory", "multiverse", "antimatter", "retrograde", "nanobot", "cyborg", "exoskeleton", "holography", "transistor", "wormhole", "electrostatic", "isotropic", "tachyon", "geneticist", "singularity", "transcendence"];
let activeEnemies = [];
let score = 0;
let gameRunning = false; // Flag to check if the game is running

// Load sounds
const typingSound = new Audio("typing-sound.mp3"); // Ensure correct path
const blastSound = new Audio("blast-sound.mp3");   // Ensure correct path
const bgMusic1 = new Audio("background1.mp3");     // Ensure correct path
const bgMusic2 = new Audio("background2.mp3");     // Ensure correct path

// Function to alternate background music
function playBackgroundMusic() {
    bgMusic1.currentTime = 0;  // Reset the first track position to start
    bgMusic2.currentTime = 0;  // Reset the second track position to start

    bgMusic1.play().then(() => {
        bgMusic1.onended = () => {
            bgMusic2.play().then(() => {
                bgMusic2.onended = () => {
                    playBackgroundMusic(); // Go back to the beginning and play bgMusic1
                };
            });
        };
    }).catch(error => {
        console.error("Error playing background music:", error);
    });
}

// Implementation for Start Button
startButton.addEventListener("click", () => {
    if (!gameRunning) {
        playBackgroundMusic(); // Play background music on start
        gameRunning = true; // Update flag to true
        gameLoop(); // Start the game loop
        setInterval(createEnemy, 2500); // Start spawning enemies every 2.5 seconds
        startButton.style.display = 'none'; // Hide button after starting
    }
});

// Play typing sound
function playTypingSound() {
    typingSound.currentTime = 0; // Reset sound to the start
    typingSound.play();
}

// Play blast sound
function playBlastSound() {
    blastSound.currentTime = 0; // Reset sound to the start
    blastSound.play();
}

// Generate random word
function getRandomWord() {
    return words[Math.floor(Math.random() * words.length)];
}

function createEnemy() {
    if (!gameRunning) return; // Stop creating enemies if the game is over

    const enemy = document.createElement("div");
    enemy.classList.add("enemy");
    const word = getRandomWord();
    enemy.textContent = word;

    // Temporary element to calculate the width of the enemy text
    document.body.appendChild(enemy);
    const wordWidth = enemy.offsetWidth; // Get the width of the word
    document.body.removeChild(enemy); // Remove the temporary element

    const gameAreaWidth = enemyArea.offsetWidth; // Get the width of the game area
    const maxLeft = gameAreaWidth - wordWidth; // Calculate the maximum allowed left position

    // Generate a random left position ensuring the word fits within the game area
    const randomLeft = Math.random() * maxLeft;
    enemy.style.left = `${randomLeft}px`; // Use px for precise positioning
    enemy.style.top = "0%";
    enemy.dataset.word = word;

    enemyArea.appendChild(enemy); // Add enemy to the game area
    activeEnemies.push(enemy);
}

// Move enemies
function moveEnemies() {
    if (!gameRunning) return; // Stop moving enemies if the game has ended

    activeEnemies.forEach((enemy) => {
        const currentTop = parseFloat(enemy.style.top);
        if (currentTop >= 90) {
            endGame(); // Call endGame function if an enemy reaches the bottom
        } else {
            enemy.style.top = `${currentTop + 1}%`; // Move enemy down
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

    // Set initial bullet position at cannon
    bullet.style.left = `${cannonRect.left + cannonRect.width / 2 - gameAreaRect.left - 5}px`;
    bullet.style.top = `${cannonRect.top + cannonRect.height / 2 - gameAreaRect.top - 5}px`;

    enemyArea.appendChild(bullet);

    // Calculate trajectory
    const xDistance = enemyRect.left + enemyRect.width / 2 - (cannonRect.left + cannonRect.width / 2);
    const yDistance = enemyRect.top + enemyRect.height / 2 - (cannonRect.top + cannonRect.height / 2);

    // Animate bullet
    setTimeout(() => {
        bullet.style.transform = `translate(${xDistance}px, ${yDistance}px)`;
    }, 10); // Small delay for transition to take effect

    // Remove bullet and enemy upon collision
    setTimeout(() => {
        if (bullet) bullet.remove();
        if (enemy.parentElement === enemyArea) {
            playBlastSound(); // Play blast sound when the enemy is hit
            enemyArea.removeChild(enemy);
            activeEnemies = activeEnemies.filter((e) => e !== enemy);
            score += 10;
            scoreDisplay.textContent = score;
        }
    }, 500); // Matches bullet animation duration
}

// Check input
wordInput.addEventListener("input", () => {
    playTypingSound(); // Play typing sound on every input
    const inputText = wordInput.value.toLowerCase(); // Convert input to lowercase
    activeEnemies.forEach((enemy) => {
        if (enemy.dataset.word.toLowerCase() === inputText) { // Compare words in lowercase
            createBullet(enemy);
            wordInput.value = ""; // Clear input field
        }
    });
});

// Game loop
function gameLoop() {
    moveEnemies(); // Move enemies down the game area
    setTimeout(gameLoop, 200); // Continue the game loop
}

// End the game
function endGame() {
    if (!gameRunning) return; // Prevent multiple executions of endGame

    gameRunning = false; // Set game running flag to false
    clearInterval(enemySpawnInterval); // Stop enemy creation
    finalScoreDisplay.innerText = score; // Update final score in the pop-up

    // Stop all animations and keep enemies in place
    activeEnemies.forEach(enemy => {
        enemy.style.animationPlayState = "paused"; // Pause any CSS animations
    });

    wordInput.disabled = true; // Disable typing input
    wordInput.value = ""; // Clear the input field
    bgMusic1.pause(); // Stop background music
    bgMusic2.pause(); // Stop alternate background music
    gameOverPopup.classList.remove('hidden'); // Show the game-over pop-up
}

// Modified Start Button Logic
let enemySpawnInterval; // Declare the interval globally
startButton.addEventListener("click", () => {
    if (!gameRunning) {
        playBackgroundMusic(); // Play background music on start
        gameRunning = true; // Update flag to true
        gameLoop(); // Start the game loop
        enemySpawnInterval = setInterval(createEnemy, 2500); // Start spawning enemies every 2.5 seconds
        startButton.style.display = 'none'; // Hide button after starting
        wordInput.disabled = false; // Enable input if it was disabled
    }
});

// Restart the game by refreshing the page
restartButton.addEventListener("click", () => {
    location.reload(); // Reload the page to restart the game
});

// Ensure the pop-up is hidden when the page loads
document.addEventListener("DOMContentLoaded", () => {
    gameOverPopup.classList.add('hidden'); // Initially hide the pop-up
});
