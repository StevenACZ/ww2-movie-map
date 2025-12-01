<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>WELCOME TO WW2 MOVIE MAP</h2>
      </div>

      <div class="modal-body">
        <p class="intro-text">
          Explore the history of World War II through the lens of cinema.
          Discover film locations, historical context, and the stories that
          shaped the world.
        </p>

        <div class="instructions">
          <h3>HOW TO NAVIGATE</h3>
          <ul>
            <li>
              <span class="key">W</span><span class="key">A</span
              ><span class="key">S</span><span class="key">D</span> to move the
              map
            </li>
            <li>
              <span class="icon">🖱️</span> Click markers to view film details
            </li>
            <li>
              <span class="icon">⏱️</span> Use the timeline to filter by year
            </li>
          </ul>
        </div>

        <div class="checkbox-container">
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="dontShowAgain"
              @change="handleCheckboxChange"
            />
            <span class="checkmark"></span>
            Don't show this again
          </label>
        </div>
      </div>

      <div class="modal-footer">
        <button class="start-btn" @click="handleStart">START EXPLORING</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const emit = defineEmits(["close"]);

const dontShowAgain = ref(false);

const handleCheckboxChange = () => {
  // Logic handled in parent or here?
  // Plan said: "If 'Don't show again' is selected, set localStorage.setItem('welcome_seen', 'true')"
  // It's cleaner to pass the preference to the parent or handle it here.
  // Let's pass the preference when closing or handle it in the parent based on a prop/event?
  // Actually, the plan said "Handle close event: If 'Don't show again' is selected...".
  // So I will just emit close with the value, or let the parent read the state if I bound it?
  // Simpler: Just emit 'close' with the payload of the checkbox state.
};

const handleStart = () => {
  emit("close", dontShowAgain.value);
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: rgba(30, 30, 35, 0.95);
  border: 2px solid #8b4513;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  padding: 0;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.8);
  font-family: "Courier New", monospace;
  color: #e0e0e0;
  animation: fadeIn 0.3s ease-out;
}

.modal-header {
  background: rgba(139, 69, 19, 0.2);
  padding: 20px;
  border-bottom: 1px solid #8b4513;
  text-align: center;
}

.modal-header h2 {
  margin: 0;
  color: #d4af37;
  font-size: 24px;
  letter-spacing: 2px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.modal-body {
  padding: 30px;
}

.intro-text {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 30px;
  text-align: center;
  color: #ccc;
}

.instructions {
  background: rgba(0, 0, 0, 0.3);
  padding: 20px;
  border-radius: 4px;
  border: 1px solid rgba(139, 69, 19, 0.3);
  margin-bottom: 30px;
}

.instructions h3 {
  color: #d4af37;
  font-size: 14px;
  margin-top: 0;
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.instructions ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.instructions li {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.key {
  background: #333;
  border: 1px solid #666;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 12px;
  font-weight: bold;
  color: #fff;
  box-shadow: 0 2px 0 #111;
}

.icon {
  font-size: 15px;
}

.checkbox-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  color: #aaa;
  font-size: 14px;
}

.checkbox-label input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  height: 18px;
  width: 18px;
  background-color: #333;
  border: 1px solid #666;
  margin-right: 10px;
  position: relative;
  transition: all 0.2s;
}

.checkbox-label:hover input ~ .checkmark {
  background-color: #444;
}

.checkbox-label input:checked ~ .checkmark {
  background-color: #d4af37;
  border-color: #d4af37;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.checkbox-label input:checked ~ .checkmark:after {
  display: block;
}

.checkbox-label .checkmark:after {
  left: 5px;
  top: 1px;
  width: 5px;
  height: 10px;
  border: solid #1a1a1a;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.modal-footer {
  padding: 20px;
  text-align: center;
  border-top: 1px solid rgba(139, 69, 19, 0.3);
}

.start-btn {
  background: linear-gradient(to bottom, #d4af37, #b4941f);
  color: #1a1a1a;
  border: none;
  padding: 12px 40px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  border-radius: 4px;
  font-family: "Courier New", monospace;
  letter-spacing: 1px;
  transition: all 0.2s;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(212, 175, 55, 0.4);
  background: linear-gradient(to bottom, #e5c14d, #c4a32a);
}

.start-btn:active {
  transform: translateY(0);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
