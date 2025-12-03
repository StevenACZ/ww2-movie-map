<template>
  <div class="about-page">
    <!-- Background Elements -->
    <div class="world-map-bg"></div>
    <div class="grid-pattern"></div>

    <!-- Main Content -->
    <div class="about-container">
      <!-- Hero Section with Logo -->
      <header class="hero-section">
        <div class="logo-showcase">
          <span class="logo-ww2">WW2</span>
          <span class="logo-text">MAP FILMS</span>
        </div>
        <p class="tagline">Exploring World War II Through Cinema</p>
      </header>

      <!-- Mission Section -->
      <section class="content-section mission-section">
        <h2 class="section-title">Our Purpose</h2>
        <p class="section-text">
          This project was born from the desire to raise awareness and provide knowledge 
          about the timeline of films depicting <strong>World War II</strong> — the largest 
          armed conflict in human history. Through an interactive map and timeline, we aim 
          to give visitors a comprehensive overview of this pivotal period while discovering 
          the cinematic masterpieces that bring these stories to life.
        </p>
      </section>

      <!-- What You'll Find Section -->
      <section class="content-section features-section">
        <h2 class="section-title">What You'll Discover</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3>Interactive Map</h3>
            <p>Explore filming locations and historical sites across the globe</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            </div>
            <h3>Film Collection</h3>
            <p>Curated selection of the most impactful WW2 films ever made</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3>Historical Timeline</h3>
            <p>Navigate through key events and their cinematic representations</p>
          </div>
        </div>
      </section>

      <!-- Recommendations Section -->
      <section class="content-section recommendations-section">
        <h2 class="section-title">Must-Watch Films</h2>
        <p class="section-text">
          Whether you're a history enthusiast or simply looking for powerful storytelling, 
          our collection offers something for everyone. From the beaches of Normandy to the 
          Pacific theater, from the home front to the battlefield — immerse yourself in 
          stories of courage, sacrifice, and humanity.
        </p>
        <NuxtLink to="/films" class="explore-btn">
          <span>Explore Films</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </NuxtLink>
      </section>

      <!-- Divider -->
      <div class="section-divider"></div>

      <!-- Credits Section -->
      <section class="content-section credits-section">
        <h2 class="section-title">Created By</h2>
        <div class="creator-card">
          <!-- TODO: Reemplazar con tu foto real de GitHub/perfil -->
          <img 
            src="https://github.com/StevenACZ.png" 
            alt="StevenACZ" 
            class="creator-avatar"
          />
          <div class="creator-info">
            <h3 class="creator-name">StevenACZ</h3>
            <p class="creator-role">Full-Stack Developer</p>
          </div>
        </div>

        <div class="links-grid">
          <a 
            href="https://github.com/StevenACZ" 
            target="_blank" 
            rel="noopener noreferrer"
            class="link-card"
          >
            <div class="link-icon github-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </div>
            <div class="link-content">
              <span class="link-label">GitHub Profile</span>
              <span class="link-url">@StevenACZ</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" class="link-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>

          <a 
            href="https://github.com/StevenACZ/ww2-movie-map" 
            target="_blank" 
            rel="noopener noreferrer"
            class="link-card"
          >
            <div class="link-icon code-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <div class="link-content">
              <span class="link-label">Source Code</span>
              <span class="link-url">View on GitHub</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" class="link-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>

          <a 
            href="https://github.com/StevenACZ/ww2-movie-map/issues" 
            target="_blank" 
            rel="noopener noreferrer"
            class="link-card issues-card"
          >
            <div class="link-icon issues-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="link-content">
              <span class="link-label">Report Issues</span>
              <span class="link-url">Bugs & Suggestions</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" class="link-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </section>

      <!-- Footer Quote -->
      <footer class="about-footer">
        <p class="footer-quote">
          "Those who cannot remember the past are condemned to repeat it."
        </p>
        <p class="footer-author">— George Santayana</p>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
// No additional script needed for this static page
</script>

<style lang="scss" scoped>
@use "@/assets/scss/variables" as *;
@use "@/assets/scss/mixins" as *;

.about-page {
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    rgba(20, 25, 30, 0.98) 0%,
    rgba(15, 20, 25, 0.96) 50%,
    rgba(25, 30, 35, 0.95) 100%
  );
  color: $text-primary;
  font-family: "Inter", sans-serif;
  position: relative;
  padding: 120px $spacing-lg 80px;
}

.world-map-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg");
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  opacity: 0.03;
  pointer-events: none;
  filter: invert(1);
}

.grid-pattern {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: linear-gradient(
      rgba(255, 255, 255, 0.02) 1px,
      transparent 1px
    ),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
}

.about-container {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: $z-dropdown;
}

// ===== HERO SECTION =====
.hero-section {
  text-align: center;
  margin-bottom: $spacing-2xl;
}

.logo-showcase {
  display: inline-flex;
  align-items: baseline;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;
}

.logo-ww2 {
  font-size: 4rem;
  font-weight: 800;
  color: $beige;
  letter-spacing: -2px;
  text-shadow: 0 0 40px rgba($beige, 0.3);
}

.logo-text {
  font-size: 4rem;
  font-weight: 300;
  color: $gray;
  letter-spacing: 2px;
}

.tagline {
  font-size: 1.25rem;
  color: $text-secondary;
  letter-spacing: 3px;
  text-transform: uppercase;
  margin: 0;
}

// ===== CONTENT SECTIONS =====
.content-section {
  margin-bottom: $spacing-2xl;
}

.section-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: $text-primary;
  margin: 0 0 $spacing-md 0;
  text-align: center;
  letter-spacing: -0.5px;
}

.section-text {
  color: $text-secondary;
  font-size: 1.05rem;
  line-height: 1.8;
  text-align: center;
  margin: 0;

  strong {
    color: $beige;
    font-weight: 600;
  }
}

// ===== FEATURES GRID =====
.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-md;
  margin-top: $spacing-lg;
}

.feature-card {
  background: $bg-card;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: $border-radius-md;
  padding: $spacing-lg;
  text-align: center;
  transition: all $transition-normal;

  &:hover {
    border-color: rgba($beige, 0.3);
    transform: translateY(-4px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }
}

.feature-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto $spacing-md;
  color: $beige;

  svg {
    width: 100%;
    height: 100%;
  }
}

.feature-card h3 {
  font-size: 1rem;
  font-weight: 600;
  color: $text-primary;
  margin: 0 0 $spacing-sm 0;
}

.feature-card p {
  font-size: 0.85rem;
  color: $text-muted;
  margin: 0;
  line-height: 1.5;
}

// ===== RECOMMENDATIONS =====
.recommendations-section {
  text-align: center;
}

.explore-btn {
  display: inline-flex;
  align-items: center;
  gap: $spacing-sm;
  margin-top: $spacing-lg;
  padding: 14px $spacing-xl;
  background: rgba($beige, 0.15);
  border: 1px solid rgba($beige, 0.4);
  border-radius: $border-radius-md;
  color: $beige;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  transition: all $transition-normal;

  &:hover {
    background: rgba($beige, 0.25);
    border-color: $beige;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba($beige, 0.2);
  }
}

.btn-icon {
  width: 20px;
  height: 20px;
  transition: transform $transition-fast;

  .explore-btn:hover & {
    transform: translateX(4px);
  }
}

// ===== DIVIDER =====
.section-divider {
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.15),
    transparent
  );
  margin: $spacing-2xl 0;
}

// ===== CREDITS SECTION =====
.credits-section {
  text-align: center;
}

.creator-card {
  display: inline-flex;
  align-items: center;
  gap: $spacing-md;
  background: $bg-card;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: $border-radius-lg;
  padding: $spacing-md $spacing-xl;
  margin-bottom: $spacing-xl;
}

.creator-avatar {
  width: 56px;
  height: 56px;
  border: 2px solid rgba($beige, 0.3);
  border-radius: 50%;
  object-fit: cover;
}

.creator-info {
  text-align: left;
}

.creator-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: $text-primary;
  margin: 0;
}

.creator-role {
  font-size: 0.9rem;
  color: $text-muted;
  margin: $spacing-xs 0 0 0;
}

// ===== LINKS GRID =====
.links-grid {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.link-card {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  background: $bg-card;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: $border-radius-md;
  padding: $spacing-md $spacing-lg;
  text-decoration: none;
  transition: all $transition-normal;

  &:hover {
    border-color: rgba($beige, 0.3);
    background: rgba(255, 255, 255, 0.03);

    .link-arrow {
      transform: translate(2px, -2px);
      opacity: 1;
    }
  }

  &.issues-card:hover {
    border-color: rgba($warning, 0.4);
  }
}

.link-icon {
  width: 44px;
  height: 44px;
  border-radius: $border-radius-sm;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 22px;
    height: 22px;
  }

  &.github-icon {
    background: rgba(255, 255, 255, 0.1);
    color: $text-primary;
  }

  &.code-icon {
    background: rgba($beige, 0.15);
    color: $beige;
  }

  &.issues-icon {
    background: rgba($warning, 0.15);
    color: $warning;
  }
}

.link-content {
  flex: 1;
  text-align: left;
}

.link-label {
  display: block;
  font-size: 1rem;
  font-weight: 600;
  color: $text-primary;
}

.link-url {
  display: block;
  font-size: 0.85rem;
  color: $text-muted;
  margin-top: 2px;
}

.link-arrow {
  width: 18px;
  height: 18px;
  color: $text-muted;
  opacity: 0.5;
  transition: all $transition-fast;
}

// ===== FOOTER =====
.about-footer {
  text-align: center;
  margin-top: $spacing-2xl;
  padding-top: $spacing-xl;
}

.footer-quote {
  font-size: 1.1rem;
  font-style: italic;
  color: $text-secondary;
  margin: 0 0 $spacing-sm 0;
  line-height: 1.6;
}

.footer-author {
  font-size: 0.9rem;
  color: $text-muted;
  margin: 0;
}

// ===== RESPONSIVE =====
@include mobile {
  .about-page {
    padding: 100px $spacing-md 60px;
  }

  .logo-ww2,
  .logo-text {
    font-size: 2.5rem;
  }

  .tagline {
    font-size: 0.9rem;
    letter-spacing: 2px;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .section-text {
    font-size: 1rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: $spacing-md;
  }

  .creator-card {
    padding: $spacing-md;
  }

  .link-card {
    padding: $spacing-md;
  }

  .link-icon {
    width: 40px;
    height: 40px;

    svg {
      width: 18px;
      height: 18px;
    }
  }
}
</style>

