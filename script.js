const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreValue = document.getElementById('scoreValue');
const bestValue = document.getElementById('bestValue');

const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const startGameBtn = document.getElementById('startGameBtn');

const bestKey = 'pixelquest-best-score';
const state = {
  running: false,
  paused: false,
  score: 0,
  best: Number(localStorage.getItem(bestKey) || 0),
  frames: 0,
  lastTime: 0,
  spawnTimer: 0,
  player: {
    x: canvas.width / 2 - 26,
    y: canvas.height - 76,
    width: 52,
    height: 42,
    speed: 6,
    dx: 0,
  },
  enemies: [],
  stars: [],
};

bestValue.textContent = state.best;

function resetPlayer() {
  state.player.x = canvas.width / 2 - 26;
  state.player.y = canvas.height - 76;
  state.player.dx = 0;
}

function resetGame() {
  state.running = true;
  state.paused = false;
  state.score = 0;
  state.frames = 0;
  state.spawnTimer = 0;
  state.enemies = [];
  state.stars = [];
  resetPlayer();
  scoreValue.textContent = '0';
}

function startGame() {
  resetGame();
  pauseBtn.textContent = 'Pause';
}

function togglePause() {
  if (!state.running) return;
  state.paused = !state.paused;
  pauseBtn.textContent = state.paused ? 'Resume' : 'Pause';
}

function endGame() {
  state.running = false;
  if (state.score > state.best) {
    state.best = state.score;
    localStorage.setItem(bestKey, String(state.best));
    bestValue.textContent = String(state.best);
  }
}

function createEnemy() {
  const size = 20 + Math.random() * 26;
  state.enemies.push({
    x: Math.random() * (canvas.width - size),
    y: -size,
    width: size,
    height: size,
    speed: 2 + Math.random() * 3,
  });
}

function createStar() {
  state.stars.push({
    x: Math.random() * canvas.width,
    y: -14,
    radius: 6 + Math.random() * 6,
    speed: 3 + Math.random() * 2,
  });
}

function updatePlayer() {
  const player = state.player;
  player.x += player.dx;

  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) {
    player.x = canvas.width - player.width;
  }
}

function updateGame() {
  if (!state.running || state.paused) return;

  state.frames += 1;
  state.score += 1;
  scoreValue.textContent = String(state.score);

  if (state.frames % 30 === 0) {
    createEnemy();
  }

  if (state.frames % 20 === 0) {
    createStar();
  }

  updatePlayer();

  for (const enemy of state.enemies) {
    enemy.y += enemy.speed;
  }

  for (const star of state.stars) {
    star.y += star.speed;
  }

  state.enemies = state.enemies.filter((enemy) => enemy.y < canvas.height + enemy.height);
  state.stars = state.stars.filter((star) => star.y < canvas.height + star.radius);

  const player = state.player;
  for (const enemy of state.enemies) {
    const hit =
      player.x < enemy.x + enemy.width &&
      player.x + player.width > enemy.x &&
      player.y < enemy.y + enemy.height &&
      player.y + player.height > enemy.y;

    if (hit) {
      endGame();
      return;
    }
  }

  for (const star of state.stars) {
    const collected =
      player.x < star.x + star.radius &&
      player.x + player.width > star.x - star.radius &&
      player.y < star.y + star.radius &&
      player.y + player.height > star.y - star.radius;

    if (collected) {
      state.score += 35;
      scoreValue.textContent = String(state.score);
      star.y = canvas.height + 100;
    }
  }
}

function drawBackground() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#0c1221');
  gradient.addColorStop(1, '#070d17');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 40; i += 1) {
    const x = (i * 73) % canvas.width;
    const y = (i * 61 + (state.frames * 0.7)) % (canvas.height + 40) - 30;
    ctx.fillStyle = 'rgba(155, 176, 210, 0.6)';
    ctx.fillRect(x, y, 2, 2);
  }
}

function drawPlayer() {
  const { x, y, width, height } = state.player;
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);

  ctx.fillStyle = '#7c5cff';
  ctx.beginPath();
  ctx.moveTo(0, -height / 2);
  ctx.lineTo(width / 2, height / 2);
  ctx.lineTo(0, height / 3);
  ctx.lineTo(-width / 2, height / 2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#18d1ff';
  ctx.fillRect(-7, height / 2 - 4, 14, 12);
  ctx.restore();
}

function drawEnemies() {
  for (const enemy of state.enemies) {
    ctx.fillStyle = '#ff5a7a';
    ctx.beginPath();
    ctx.arc(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd4dc';
    ctx.fillRect(enemy.x + enemy.width / 2 - 2, enemy.y + 4, 4, 10);
  }
}

function drawStars() {
  for (const star of state.stars) {
    ctx.fillStyle = '#ffb84d';
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawOverlay() {
  if (state.running) return;

  ctx.fillStyle = 'rgba(8, 12, 18, 0.5)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#edf3ff';
  ctx.textAlign = 'center';
  ctx.font = '700 40px Inter';
  ctx.fillText(state.score > 0 ? 'Run Over' : 'Ready?', canvas.width / 2, canvas.height / 2 - 20);
  ctx.font = '500 22px Inter';
  ctx.fillStyle = '#aabddf';
  ctx.fillText('Press Start to launch again', canvas.width / 2, canvas.height / 2 + 22);
}

function render() {
  drawBackground();
  drawStars();
  drawEnemies();
  drawPlayer();
  drawOverlay();
}

function gameLoop(timestamp) {
  const delta = timestamp - state.lastTime;
  if (delta > 0) {
    updateGame();
    render();
    state.lastTime = timestamp;
  }
  requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
    state.player.dx = -state.player.speed;
  }
  if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
    state.player.dx = state.player.speed;
  }
  if (event.key === ' ') {
    if (!state.running) startGame();
    else togglePause();
  }
});

window.addEventListener('keyup', () => {
  state.player.dx = 0;
});

canvas.addEventListener('pointermove', (event) => {
  if (!state.running || state.paused) return;
  const rect = canvas.getBoundingClientRect();
  const xRatio = (event.clientX - rect.left) / rect.width;
  state.player.x = xRatio * canvas.width - state.player.width / 2;
});

startBtn.addEventListener('click', startGame);
startGameBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
restartBtn.addEventListener('click', startGame);

resetGame();
state.running = false;
render();
requestAnimationFrame(gameLoop);
