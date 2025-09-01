/**
 * Web Components for Header and Footer
 * Loads HTML templates from partials folder
 */

// Site Header Component
class SiteHeader extends HTMLElement {
  async connectedCallback() {
    try {
      // Fetch header HTML from partials
      const response = await fetch('/partials/header.html');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const html = await response.text();
      this.innerHTML = html;

      // Initialize mobile menu after rendering
      this.initMobileMenu();
      this.initScrollEffect();
    } catch (error) {
      console.error('Error loading header:', error);
      // Fallback header
      this.innerHTML = `
        <header class="site-header">
          <nav class="nav-container">
            <a href="/" class="nav-logo">NOMAD REHEARSAL</a>
          </nav>
        </header>
      `;
    }
  }

  initMobileMenu() {
    const navToggle = this.querySelector('.nav-toggle');
    const navMenu = this.querySelector('.nav-menu');

    if (navToggle) {
      navToggle.addEventListener('click', function() {
        this.classList.toggle('active');
        navMenu.classList.toggle('active');
      });

      // Close menu when clicking on a link
      this.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
          navToggle.classList.remove('active');
          navMenu.classList.remove('active');
        });
      });
    }
  }

  initScrollEffect() {
    const header = this.querySelector('.site-header');
    if (header) {
      let lastScroll = 0;

      window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
      });
    }
  }
}

// Site Footer Component
class SiteFooter extends HTMLElement {
  async connectedCallback() {
    try {
      // Fetch footer HTML from partials
      const response = await fetch('/partials/footer.html');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const html = await response.text();
      this.innerHTML = html;
    } catch (error) {
      console.error('Error loading footer:', error);
      // Fallback footer
      this.innerHTML = `
        <footer class="site-footer">
          <div class="footer-container">
            <div class="footer-bottom">
              <p class="footer-copyright">© 2025 Nomad Rehearsal. All rights reserved.</p>
            </div>
          </div>
        </footer>
      `;
    }
  }
}

// Register custom elements
customElements.define('site-header', SiteHeader);
customElements.define('site-footer', SiteFooter);

// Add body class when header is loaded
document.addEventListener('DOMContentLoaded', function() {
  if (document.querySelector('site-header')) {
    document.body.classList.add('has-header');
  }
});
