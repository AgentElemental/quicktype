const enemyArea = document.getElementById("enemy-area");
const wordInput = document.getElementById("word-input");
const scoreDisplay = document.getElementById("score");
const cannon = document.getElementById("cannon");
const startButton = document.getElementById("start-button"); // Reference to the start button
const gameOverPopup = document.getElementById("game-over-popup"); // Reference to the game over popup
const finalScoreDisplay = document.getElementById("final-score"); // Final score display in pop-up
const restartButton = document.getElementById("restart-button"); // Reference to the restart button

let words = ["comet", "asteroid", "planet", "galaxy", "nebula", "starship"];
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

// Create an enemy
function createEnemy() {
    const enemy = document.createElement("div");
    enemy.classList.add("enemy");
    const word = getRandomWord();
    enemy.textContent = word;
    enemy.style.left = `${Math.random() * 80 + 10}%`;
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
    gameRunning = false; // Set game running flag to false
    clearInterval(); // Clear any intervals that were running
    finalScoreDisplay.innerText = score; // Update final score in pop-up
    gameOverPopup.classList.remove('hidden'); // Show the pop-up
}

// Restart the game by refreshing the page
restartButton.addEventListener("click", () => {
    location.reload(); // Reload the page to restart the game
});

// Ensure the pop-up is hidden when the page loads
document.addEventListener("DOMContentLoaded", () => {
    gameOverPopup.classList.add('hidden'); // Initially hide the pop-up
});