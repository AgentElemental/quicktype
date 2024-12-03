let words = {};

(async function loadWords() {
  try {
    const response = await fetch("./words.json");
    words = await response.json();
  } catch (error) {
    console.error("Error loading words:", error);
  }
})();

const enemyArea = document.getElementById("enemy-area");
const wordInput = document.getElementById("word-input");
const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("high-score");
const cannon = document.getElementById("cannon");
const startButton = document.getElementById("start-button");
const gameOverPopup = document.getElementById("game-over-popup");
const finalScoreDisplay = document.getElementById("final-score");
const restartButton = document.getElementById("restart-button");

let activeEnemies = [];
let score = 0;
let high_score = Number(localStorage.getItem("high-score")) || 0;
let words_on_screen = [];
let gameRunning = false;

const typingSound = new Audio("typing-sound.mp3");
const blastSound = new Audio("blast-sound.mp3");
const bgMusic1 = new Audio("background1.mp3");
const bgMusic2 = new Audio("background2.mp3");

highScoreDisplay.textContent = high_score;
function playBackgroundMusic() {
  bgMusic1.currentTime = 0;
  bgMusic2.currentTime = 0;
  bgMusic1
    .play()
    .then(() => {
      bgMusic1.onended = () => {
        bgMusic2.play().then(() => {
          bgMusic2.onended = () => {
            playBackgroundMusic();
          };
        });
      };
    })
    .catch((error) => {
      console.error("Error playing background music:", error);
    });
}
//* If for deciding words
function wordsInitialization() {
  if (score < 50) {
    words_on_screen = words["short words"];
  } else if (score < 100) {
    words_on_screen = words_on_screen.concat(words["medium words"]);
  } else {
    words_on_screen = words_on_screen.concat(words["long words"]);
  }
}

startButton.addEventListener("click", () => {
  if (!gameRunning) {
    playBackgroundMusic();
    gameRunning = true;
    gameLoop();
    setInterval(createEnemy, 2500);
    startButton.style.display = "none";
  }
});

function playTypingSound() {
  typingSound.currentTime = 0;
  typingSound.play();
}

function playBlastSound() {
  blastSound.currentTime = 0;
  blastSound.play();
}

function getRandomWord() {
  wordsInitialization();
  return words_on_screen[Math.floor(Math.random() * words_on_screen.length)];
}

function createEnemy() {
  if (!gameRunning) return;

  const enemy = document.createElement("div");
  enemy.classList.add("enemy");
  const word = getRandomWord();
  enemy.textContent = word;

  document.body.appendChild(enemy);
  const wordWidth = enemy.offsetWidth;
  document.body.removeChild(enemy);

  const gameAreaWidth = enemyArea.offsetWidth;
  const maxLeft = gameAreaWidth - wordWidth;

  const randomLeft = Math.random() * maxLeft;
  enemy.style.left = `${randomLeft}px`;
  enemy.style.top = "0%";
  enemy.dataset.word = word;

  enemyArea.appendChild(enemy);
  activeEnemies.push(enemy);
}

function moveEnemies() {
  if (!gameRunning) return;

  activeEnemies.forEach((enemy) => {
    const currentTop = parseFloat(enemy.style.top);
    if (currentTop >= 90) {
      endGame();
    } else {
      enemy.style.top = `${currentTop + 1}%`;
    }
  });
}

function createBullet(enemy) {
  const bullet = document.createElement("div");
  bullet.classList.add("bullet");

  const cannonRect = cannon.getBoundingClientRect();
  const enemyRect = enemy.getBoundingClientRect();
  const gameAreaRect = enemyArea.getBoundingClientRect();

  bullet.style.left = `${
    cannonRect.left + cannonRect.width / 2 - gameAreaRect.left - 5
  }px`;
  bullet.style.top = `${
    cannonRect.top + cannonRect.height / 2 - gameAreaRect.top - 5
  }px`;

  enemyArea.appendChild(bullet);

  const xDistance =
    enemyRect.left +
    enemyRect.width / 2 -
    (cannonRect.left + cannonRect.width / 2);
  const yDistance =
    enemyRect.top +
    enemyRect.height / 2 -
    (cannonRect.top + cannonRect.height / 2);

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
      high_score = score > high_score ? score : high_score;
      localStorage.setItem("high-score", high_score);
      scoreDisplay.textContent = score;
      highScoreDisplay.textContent = high_score;
    }
  }, 500);
}

wordInput.addEventListener("input", () => {
  playTypingSound();
  const inputText = wordInput.value.toLowerCase().trim();
  activeEnemies.forEach((enemy) => {
    if (enemy.dataset.word.toLowerCase() === inputText) {
      createBullet(enemy);
      wordInput.value = "";
    }
  });
});

function gameLoop() {
  moveEnemies();
  setTimeout(gameLoop, 200);
}

function endGame() {
  if (!gameRunning) return;

  gameRunning = false;
  clearInterval(enemySpawnInterval);
  finalScoreDisplay.innerText = score;

  activeEnemies.forEach((enemy) => {
    enemy.style.animationPlayState = "paused";
  });

  wordInput.disabled = true;
  wordInput.value = "";
  bgMusic1.pause();
  bgMusic2.pause();
  gameOverPopup.classList.remove("hidden");
}

let enemySpawnInterval;
startButton.addEventListener("click", () => {
  if (!gameRunning) {
    playBackgroundMusic();
    gameRunning = true;
    gameLoop();
    enemySpawnInterval = setInterval(createEnemy, 2500);
    startButton.style.display = "none";
    wordInput.disabled = false;
  }
});

restartButton.addEventListener("click", () => {
  location.reload();
});

document.addEventListener("DOMContentLoaded", () => {
  gameOverPopup.classList.add("hidden");
});
