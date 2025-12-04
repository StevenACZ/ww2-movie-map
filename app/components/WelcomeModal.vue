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
            <li class="desktop-only">
              <span class="key">W</span><span class="key">A</span
              ><span class="key">S</span><span class="key">D</span> to move the
              map
            </li>
            <li>
              <span class="icon">📍</span> 
              <span class="desktop-only">Click markers to view film details</span>
              <span class="mobile-only">Tap markers to view film details</span>
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

<style lang="scss" scoped>
@use '@/assets/scss/variables' as *;
@use '@/assets/scss/mixins' as *;

// Visibility utilities
.desktop-only {
  display: inline;
  @media (max-width: 768px) {
    display: none;
  }
}

.mobile-only {
  display: none;
  @media (max-width: 768px) {
    display: inline;
  }
}

.modal {
  &-overlay {
    @include modal-overlay;
    z-index: 2000; // Mayor que timeline
  }

  &-content {
    background: $bg-dark;
    border: $border-width solid $brown;
    border-radius: $border-radius-sm;
    width: 90%;
    max-width: 600px;
    padding: 0;
    box-shadow: $shadow-lg;
    font-family: "Courier New", monospace;
    color: $text-secondary;
    @include fade-in;

    @media (max-width: 768px) {
      width: 95%;
      max-width: 400px;
      max-height: 90vh;
      overflow-y: auto;
    }
  }

  &-header {
    background: rgba($brown, 0.2);
    padding: $spacing-lg;
    border-bottom: 1px solid $brown;
    text-align: center;

    h2 {
      margin: 0;
      color: $gold;
      font-size: 24px;
      letter-spacing: 2px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);

      @media (max-width: 768px) {
        font-size: 18px;
        letter-spacing: 1.5px;
      }
    }

    @media (max-width: 768px) {
      padding: $spacing-md;
    }
  }

  &-body {
    padding: 30px;

    @media (max-width: 768px) {
      padding: $spacing-md;
    }
  }

  &-footer {
    padding: $spacing-lg;
    text-align: center;
    border-top: 1px solid rgba($brown, 0.3);

    @media (max-width: 768px) {
      padding: $spacing-md;
    }
  }
}

.intro-text {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 30px;
  text-align: center;
  color: #ccc;

  @media (max-width: 768px) {
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: $spacing-md;
  }
}

.instructions {
  background: rgba(0, 0, 0, 0.3);
  padding: $spacing-lg;
  border-radius: 4px;
  border: 1px solid rgba($brown, 0.3);
  margin-bottom: 30px;

  @media (max-width: 768px) {
    padding: $spacing-md;
    margin-bottom: $spacing-md;
  }

  h3 {
    color: $gold;
    font-size: 14px;
    margin-top: 0;
    margin-bottom: $spacing-md;
    text-transform: uppercase;
    letter-spacing: 1px;

    @media (max-width: 768px) {
      font-size: 12px;
      margin-bottom: $spacing-sm;
    }
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    margin-bottom: $spacing-sm;
    display: flex;
    align-items: center;
    gap: $spacing-sm;

    @media (max-width: 768px) {
      font-size: 13px;
      margin-bottom: 8px;
      gap: 6px;
    }
  }
}

.key {
  background: #333;
  border: 1px solid #666;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 12px;
  font-weight: bold;
  color: $text-primary;
  box-shadow: 0 2px 0 #111;

  @media (max-width: 768px) {
    padding: 2px 5px;
    font-size: 10px;
  }
}

.icon {
  font-size: 15px;

  @media (max-width: 768px) {
    font-size: 14px;
  }
}

.checkbox {
  &-container {
    display: flex;
    justify-content: center;
    margin-top: $spacing-lg;

    @media (max-width: 768px) {
      margin-top: $spacing-md;
    }
  }

  &-label {
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
    color: #aaa;
    font-size: 14px;

    @media (max-width: 768px) {
      font-size: 12px;
    }

    input {
      position: absolute;
      opacity: 0;
      cursor: pointer;
      height: 0;
      width: 0;

      &:checked ~ .checkmark {
        background-color: $gold;
        border-color: $gold;

        &:after {
          display: block;
        }
      }
    }

    &:hover input ~ .checkmark {
      background-color: #444;
    }

    .checkmark {
      &:after {
        left: 5px;
        top: 1px;
        width: 5px;
        height: 10px;
        border: solid #1a1a1a;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);

        @media (max-width: 768px) {
          left: 4px;
          top: 1px;
          width: 4px;
          height: 8px;
        }
      }
    }
  }
}

.checkmark {
  height: 18px;
  width: 18px;
  background-color: #333;
  border: 1px solid #666;
  margin-right: $spacing-sm;
  position: relative;
  transition: all $transition-fast;

  @media (max-width: 768px) {
    height: 16px;
    width: 16px;
    margin-right: 6px;
  }

  &:after {
    content: "";
    position: absolute;
    display: none;
  }
}

.start-btn {
  background: linear-gradient(to bottom, $gold, $gold-dark);
  color: #1a1a1a;
  border: none;
  padding: $spacing-md $spacing-xl;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  border-radius: 4px;
  font-family: "Courier New", monospace;
  letter-spacing: 1px;
  transition: all $transition-fast;
  box-shadow: $shadow-md;

  @media (max-width: 768px) {
    padding: $spacing-sm $spacing-lg;
    font-size: 14px;
    width: 100%;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba($gold, 0.4);
    background: linear-gradient(to bottom, $gold-light, #c4a32a);
  }

  &:active {
    transform: translateY(0);
  }
}
</style>
