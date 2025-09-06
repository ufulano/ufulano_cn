<template>
  <div class="fishing-game">
    <div class="game-header">
      <h3>🎣 星露谷钓鱼</h3>
      <div class="score-board">
        <span>分数: {{ score }}</span>
        <span>等级: {{ level }}</span>
      </div>
    </div>

    <!-- 咬钩提示 -->
    <div class="bite-prompt" v-if="fishBiting && !miniGameActive">
      <div class="bite-animation">🐟 鱼儿咬钩了！快点击收线！</div>
      <button class="control-btn" @click="startMiniGame">收线</button>
    </div>

    <!-- 钓鱼小游戏 -->
    <div class="mini-game" v-if="miniGameActive && !gameOver">
      <!-- 进度条 -->
      <div class="progress-container">
        <div class="progress-bar" :style="{ width: catchProgress + '%' }"></div>
        <div class="progress-text">{{ Math.round(catchProgress) }}%</div>
      </div>

      <!-- 完美提示 -->
      <div class="perfect-text" v-if="showPerfect">完美！</div>

      <!-- 游戏区域 -->
      <div class="fishing-area">
        <!-- 绿条 -->
        <div class="green-bar" :style="{ top: greenBarPosition + '%' }"></div>

        <!-- 鱼 -->
        <div class="fish-sprite" :style="{ top: fishSpritePosition + '%' }">
          {{ currentFish?.type || '🐟' }}
        </div>

        <!-- 捕获区域 -->
        <div class="catch-area" :style="{ top: catchAreaTop + '%', height: catchAreaHeight + '%' }"></div>
      </div>

      <!-- 状态信息 -->
      <div class="mini-game-status">
        <div class="fish-details">
          <span>{{ currentFish?.name || '未知鱼类' }}</span>
          <span v-if="currentFish?.length">{{ currentFish.length }}cm</span>
        </div>
        <div class="quality-indicator" v-if="currentFish?.quality">
          品质: {{ currentFish.quality }}
        </div>
      </div>
    </div>

    <!-- 捕获结果 -->
    <div class="catch-result" v-if="showCatchResult">
      <div class="result-content">
        <h4>捕获成功！</h4>
        <div class="fish-display">
          <span class="fish-icon-large">{{ currentFish?.type }}</span>
          <div class="fish-info-result">
            <p>{{ currentFish?.name }}</p>
            <p>{{ currentFish?.length }}cm</p>
            <p class="quality">{{ currentFish?.quality }}</p>
          </div>
        </div>
        <div class="new-record" v-if="newRecord">🎉 新记录！</div>
        <button class="control-btn" @click="closeResult">继续</button>
      </div>
    </div>

    <!-- 游戏结束界面 -->
    <div class="game-over" v-if="gameOver">
      <h3>🎉 钓鱼结束！</h3>
      <div class="final-score">
        <p>最终分数: {{ score }}</p>
        <p>达到等级: {{ level }}</p>
        <p>捕获鱼类: {{ caughtFishCount }} 条</p>
      </div>
      <button class="control-btn restart-btn" @click="restartGame">
        🔄 再次钓鱼
      </button>
    </div>

    <!-- 等待界面 -->
    <div class="waiting-screen" v-if="!fishBiting && !miniGameActive && !gameOver">
      <div class="waiting-animation">
        <div class="float">🎣</div>
        <p>等待鱼儿上钩...</p>
      </div>
      <button class="control-btn" @click="castLine" :disabled="isCasting">
        {{ isCasting ? '抛竿中...' : '抛竿' }}
      </button>
    </div>

    <!-- 游戏说明 -->
    <div class="game-instructions" v-if="!miniGameActive">
      <p>💡 当鱼咬钩时快速点击收线进入小游戏！</p>
      <p>🎯 按住鼠标保持绿条覆盖鱼，填满进度条即可捕获</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// 游戏状态
const score = ref(0)
const level = ref(1)
const gameOver = ref(false)
const fishBiting = ref(false)
const miniGameActive = ref(false)
const isCasting = ref(false)
const showCatchResult = ref(false)
const newRecord = ref(false)
const showPerfect = ref(false)

// 小游戏状态
const greenBarPosition = ref(50)
const fishSpritePosition = ref(50)
const catchProgress = ref(50)
const catchAreaTop = ref(40)
const catchAreaHeight = ref(20)
const isPressing = ref(false)
const perfectCatch = ref(true) // 是否完美捕获

// 当前鱼类
const currentFish = ref(null)
const caughtFishCount = ref(0)

// 鱼类配置 - 星露谷风格
const fishTypes = [
  { 
    type: '🐟', 
    name: '鲈鱼', 
    rarity: '普通', 
    difficulty: '简单', 
    basePoints: 10, 
    zoneSize: 25, 
    speed: 1,
    minLength: 20,
    maxLength: 40,
    quality: '普通'
  },
  { 
    type: '🐠', 
    name: '金鱼', 
    rarity: '普通', 
    difficulty: '简单', 
    basePoints: 15, 
    zoneSize: 20, 
    speed: 1.2,
    minLength: 15,
    maxLength: 25,
    quality: '普通'
  },
  { 
    type: '🐡', 
    name: '河豚', 
    rarity: '稀有', 
    difficulty: '中等', 
    basePoints: 30, 
    zoneSize: 15, 
    speed: 1.5,
    minLength: 25,
    maxLength: 45,
    quality: '银星'
  },
  { 
    type: '🦈', 
    name: '鲨鱼', 
    rarity: '传说', 
    difficulty: '困难', 
    basePoints: 100, 
    zoneSize: 8, 
    speed: 2,
    minLength: 60,
    maxLength: 120,
    quality: '金星',
    isLegendary: true
  },
  { 
    type: '🐙', 
    name: '章鱼', 
    rarity: '稀有', 
    difficulty: '中等', 
    basePoints: 40, 
    zoneSize: 12, 
    speed: 1.8,
    minLength: 30,
    maxLength: 50,
    quality: '银星'
  },
  { 
    type: '🦑', 
    name: '鱿鱼', 
    rarity: '稀有', 
    difficulty: '中等', 
    basePoints: 35, 
    zoneSize: 14, 
    speed: 1.6,
    minLength: 25,
    maxLength: 40,
    quality: '银星'
  },
  { 
    type: '🦀', 
    name: '螃蟹', 
    rarity: '普通', 
    difficulty: '简单', 
    basePoints: 20, 
    zoneSize: 18, 
    speed: 1.1,
    minLength: 10,
    maxLength: 20,
    quality: '普通'
  },
  { 
    type: '🦐', 
    name: '虾', 
    rarity: '普通', 
    difficulty: '简单', 
    basePoints: 12, 
    zoneSize: 22, 
    speed: 1.3,
    minLength: 8,
    maxLength: 15,
    quality: '普通'
  }
]

// 记录
const fishRecords = ref({})

// 游戏循环
let gameLoop = null
let fishMovementTimer = null
let biteTimer = null

// 抛竿
const castLine = () => {
  if (isCasting.value || fishBiting.value) return
  
  isCasting.value = true
  fishBiting.value = false
  
  // 随机时间后鱼咬钩
  const biteTime = 2000 + Math.random() * 3000
  biteTimer = setTimeout(() => {
    fishBiting.value = true
    isCasting.value = false
  }, biteTime)
}

// 开始小游戏
const startMiniGame = () => {
  if (!fishBiting.value) return
  
  clearTimeout(biteTimer)
  fishBiting.value = false
  miniGameActive.value = true
  
  // 生成鱼
  spawnFishForMiniGame()
  
  // 开始游戏循环
  startMiniGameLoop()
}

// 生成鱼用于小游戏
const spawnFishForMiniGame = () => {
  const fish = fishTypes[Math.floor(Math.random() * fishTypes.length)]
  const length = fish.minLength + Math.round(Math.random() * (fish.maxLength - fish.minLength))
  
  currentFish.value = { 
    ...fish, 
    length,
    originalQuality: fish.quality
  }
  
  // 设置捕获区域
  catchAreaHeight.value = fish.zoneSize
  catchAreaTop.value = 30 + Math.random() * (70 - fish.zoneSize)
  
  // 重置状态
  catchProgress.value = 50
  greenBarPosition.value = 50
  fishSpritePosition.value = 50
  perfectCatch.value = true
  showPerfect.value = false
  
  // 开始鱼移动
  startFishMovement()
}

// 鱼移动
const startFishMovement = () => {
  if (fishMovementTimer) clearInterval(fishMovementTimer)
  
  fishMovementTimer = setInterval(() => {
    if (!miniGameActive.value || !currentFish.value) {
      clearInterval(fishMovementTimer)
      return
    }
    
    // 鱼随机移动
    const moveAmount = (Math.random() - 0.5) * currentFish.value.speed * 3
    fishSpritePosition.value = Math.max(5, Math.min(95, fishSpritePosition.value + moveAmount))
  }, 100)
}

// 小游戏主循环
const startMiniGameLoop = () => {
  const loop = () => {
    if (!miniGameActive.value) return
    
    // 绿条控制
    if (isPressing.value) {
      greenBarPosition.value = Math.max(0, greenBarPosition.value - 3)
    } else {
      greenBarPosition.value = Math.min(100, greenBarPosition.value + 2)
    }
    
    // 检查是否捕获
    const greenBarTop = greenBarPosition.value
    const greenBarBottom = greenBarPosition.value + 15
    const fishTop = fishSpritePosition.value
    const fishBottom = fishSpritePosition.value + 5
    
    const isOverlapping = greenBarTop <= fishTop && greenBarBottom >= fishBottom
    
    if (isOverlapping) {
      catchProgress.value = Math.min(100, catchProgress.value + 1)
      if (catchProgress.value === 100) {
        // 捕获成功
        completeCatch()
        return
      }
    } else {
      perfectCatch.value = false
      catchProgress.value = Math.max(0, catchProgress.value - 0.5)
      if (catchProgress.value === 0) {
        // 鱼逃跑
        fishEscape()
        return
      }
    }
    
    requestAnimationFrame(loop)
  }
  
  loop()
}

// 鼠标控制
const handleMouseDown = () => {
  isPressing.value = true
}

const handleMouseUp = () => {
  isPressing.value = false
}

// 捕获成功
const completeCatch = () => {
  miniGameActive.value = false
  clearInterval(fishMovementTimer)
  
  // 检查完美捕获
  if (perfectCatch.value && currentFish.value) {
    showPerfect.value = true
    // 提升品质
    if (currentFish.value.originalQuality === '银星') {
      currentFish.value.quality = '金星'
    } else if (currentFish.value.originalQuality === '金星') {
      currentFish.value.quality = '铱星'
    }
    // 经验加成
    currentFish.value.points = Math.round(currentFish.value.basePoints * 2.4)
  } else {
    currentFish.value.points = currentFish.value.basePoints
  }
  
  // 检查记录
  const fishType = currentFish.value.name
  if (!fishRecords.value[fishType] || currentFish.value.length > fishRecords.value[fishType]) {
    fishRecords.value[fishType] = currentFish.value.length
    newRecord.value = true
  } else {
    newRecord.value = false
  }
  
  // 传说鱼提示
  if (currentFish.value.isLegendary) {
    alert('你抓到了一条传说中的鱼！')
  }
  
  // 更新分数
  score.value += currentFish.value.points
  caughtFishCount.value++
  level.value = Math.floor(score.value / 100) + 1
  
  // 显示结果
  setTimeout(() => {
    showCatchResult.value = true
  }, 500)
}

// 鱼逃跑
const fishEscape = () => {
  miniGameActive.value = false
  clearInterval(fishMovementTimer)
  currentFish.value = null
  
  setTimeout(() => {
    // 继续钓鱼
  }, 1000)
}

// 关闭结果
const closeResult = () => {
  showCatchResult.value = false
  showPerfect.value = false
  currentFish.value = null
}

// 重新开始
const restartGame = () => {
  gameOver.value = false
  score.value = 0
  level.value = 1
  caughtFishCount.value = 0
  fishRecords.value = {}
  currentFish.value = null
  miniGameActive.value = false
  fishBiting.value = false
}

// 事件监听
onMounted(() => {
  document.addEventListener('mousedown', handleMouseDown)
  document.addEventListener('mouseup', handleMouseUp)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleMouseDown)
  document.removeEventListener('mouseup', handleMouseUp)
  clearInterval(fishMovementTimer)
  clearTimeout(biteTimer)
})
</script>

<style scoped>
.fishing-game {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 
    0 15px 35px rgba(0, 0, 0, 0.1),
    0 5px 15px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border: 2px solid transparent;
  background-clip: padding-box;
  position: relative;
  overflow: hidden;
  width: 320px;
  height: 450px;
}

.game-header {
  text-align: center;
  margin-bottom: 15px;
}

.game-header h3 {
  margin: 0 0 10px 0;
  color: #1890ff;
  font-size: 1.2em;
}

.score-board {
  display: flex;
  justify-content: space-between;
  font-size: 0.9em;
  color: #666;
}

/* 咬钩提示 */
.bite-prompt {
  text-align: center;
  margin: 20px 0;
}

.bite-animation {
  font-size: 1.2em;
  color: #ff4d4f;
  margin-bottom: 15px;
  animation: bitePulse 0.5s ease-in-out infinite;
}

@keyframes bitePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* 小游戏 */
.mini-game {
  margin: 20px 0;
}

.progress-container {
  position: relative;
  width: 100%;
  height: 20px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 15px;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(to right, #52c41a, #73d13d);
  transition: width 0.1s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.8em;
  font-weight: bold;
  color: #333;
}

.perfect-text {
  text-align: center;
  font-size: 1.5em;
  color: #ffd700;
  font-weight: bold;
  margin-bottom: 10px;
  animation: perfectPulse 0.5s ease-in-out;
}

@keyframes perfectPulse {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.fishing-area {
  position: relative;
  width: 100%;
  height: 200px;
  background: linear-gradient(to bottom, 
    #87CEEB 0%, 
    #4682B4 30%,
    #2E8B57 60%,
    #191970 100%);
  border-radius: 15px;
  overflow: hidden;
  margin-bottom: 15px;
  box-shadow: 
    inset 0 0 20px rgba(0, 0, 0, 0.2),
    0 0 20px rgba(64, 191, 255, 0.3);
}

.green-bar {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 40px;
  background: linear-gradient(to bottom, #52c41a, #73d13d);
  border-radius: 5px;
  transition: top 0.05s ease;
  box-shadow: 0 0 10px rgba(82, 196, 26, 0.5);
}

.fish-sprite {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 24px;
  transition: top 0.1s ease;
  z-index: 10;
}

.catch-area {
  position: absolute;
  left: 0;
  right: 0;
  background: rgba(82, 196, 26, 0.2);
  border: 2px solid #52c41a;
  border-radius: 5px;
  z-index: 5;
}

.mini-game-status {
  text-align: center;
  font-size: 0.9em;
}

.fish-details {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.quality-indicator {
  color: #666;
}

/* 捕获结果 */
.catch-result {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.result-content {
  background: white;
  padding: 20px;
  border-radius: 15px;
  text-align: center;
  max-width: 300px;
}

.fish-display {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 15px 0;
}

.fish-icon-large {
  font-size: 48px;
  margin-right: 15px;
}

.fish-info-result p {
  margin: 5px 0;
}

.quality {
  font-weight: bold;
  color: #ffd700;
}

.new-record {
  color: #ff4d4f;
  font-weight: bold;
  margin: 10px 0;
  animation: recordPulse 0.5s ease-in-out infinite;
}

@keyframes recordPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* 等待界面 */
.waiting-screen {
  text-align: center;
  margin: 40px 0;
}

.waiting-animation {
  margin-bottom: 20px;
}

.float {
  font-size: 48px;
  animation: float 2s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* 游戏结束 */
.game-over {
  text-align: center;
  margin: 40px 0;
}

.final-score {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 15px;
  margin: 15px 0;
}

/* 控制按钮 */
.control-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.control-btn:hover {
  background: linear-gradient(135deg, #40a9ff 0%, #1890ff 100%);
  transform: translateY(-2px);
}

.control-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.restart-btn {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
}

/* 游戏说明 */
.game-instructions {
  text-align: center;
  font-size: 0.85em;
  color: #666;
  margin-top: 20px;
}

.game-instructions p {
  margin: 5px 0;
}
</style>