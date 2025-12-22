import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';

type MenuKey = 'tasks' | 'projects' | null;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgOptimizedImage],
  template: `
    <div class="app_container">
      <!-- Skip link for keyboard users -->
      <a class="skip-link" href="#main-content">Skip to main content</a>

      <header class="header" role="banner">
        <nav class="nav" aria-label="Primary">
          <div class="logo" aria-label="Task Management System home">
            <!-- Decorative icon -->
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="34"
              height="34"
              fill="currentColor"
              viewBox="0 0 24 24"
              focusable="false"
            >
              <path
                d="M9 7V2.221a2 2 0 0 0-.5.365L4.586 6.5a2 2 0 0 0-.365.5H9Z"
              />
              <path
                fill-rule="evenodd"
                d="M11 7V2h7a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9h5a2 2 0 0 0 2-2Zm4.707 5.707a1 1 0 0 0-1.414-1.414L11 14.586l-1.293-1.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4Z"
                clip-rule="evenodd"
              />
            </svg>

            <p class="logo_text">Task Management System</p>
          </div>

          <div class="navbar_links">
            <ul class="navbar_list">
              <li class="nav_item">
                <a class="navbar_link" routerLink="/">Home</a>
              </li>

              <!-- Tasks menu (keyboard + screen reader accessible) -->
              <li class="nav_item dropdown">
                <button
                  type="button"
                  class="navbar_link dropdown_toggle"
                  [class.dropdown_toggle--open]="openMenu === 'tasks'"
                  (click)="toggleMenu('tasks')"
                  (keydown)="onMenuKeydown($event, 'tasks')"
                  [attr.aria-expanded]="openMenu === 'tasks'"
                  aria-haspopup="true"
                  aria-controls="tasks-menu"
                >
                  Tasks
                  <span aria-hidden="true">▾</span>
                </button>

                <ul
                  id="tasks-menu"
                  class="dropdown_menu"
                  role="menu"
                  [class.dropdown_menu--open]="openMenu === 'tasks'"
                  (keydown)="onMenuListKeydown($event)"
                >
                  <li role="none">
                    <a
                      role="menuitem"
                      class="dropdown_link"
                      routerLink="/task-list"
                      (click)="closeMenus()"
                    >
                      All tasks
                    </a>
                  </li>
                  <li role="none">
                    <a
                      role="menuitem"
                      class="dropdown_link"
                      routerLink="/tasks/add"
                      (click)="closeMenus()"
                    >
                      Add task
                    </a>
                  </li>
                  <li role="none">
                    <a
                      role="menuitem"
                      class="dropdown_link"
                      routerLink="/tasks/read"
                      (click)="closeMenus()"
                    >
                      Read task
                    </a>
                  </li>
                  <li role="none">
                    <a
                      role="menuitem"
                      class="dropdown_link"
                      routerLink="/tasks/search"
                      (click)="closeMenus()"
                    >
                      Search tasks
                    </a>
                  </li>
                  <li role="none">
                    <a
                      role="menuitem"
                      class="dropdown_link"
                      routerLink="/tasks/delete"
                      (click)="closeMenus()"
                    >
                      Delete task
                    </a>
                  </li>
                </ul>
              </li>

              <!-- Projects menu -->
              <li class="nav_item dropdown">
                <button
                  type="button"
                  class="navbar_link dropdown_toggle"
                  [class.dropdown_toggle--open]="openMenu === 'projects'"
                  (click)="toggleMenu('projects')"
                  (keydown)="onMenuKeydown($event, 'projects')"
                  [attr.aria-expanded]="openMenu === 'projects'"
                  aria-haspopup="true"
                  aria-controls="projects-menu"
                >
                  Projects
                  <span aria-hidden="true">▾</span>
                </button>

                <ul
                  id="projects-menu"
                  class="dropdown_menu"
                  role="menu"
                  [class.dropdown_menu--open]="openMenu === 'projects'"
                  (keydown)="onMenuListKeydown($event)"
                >
                  <li role="none">
                    <a
                      role="menuitem"
                      class="dropdown_link"
                      routerLink="/projects/projects-list"
                      (click)="closeMenus()"
                    >
                      All projects
                    </a>
                  </li>
                  <li role="none">
                    <a
                      role="menuitem"
                      class="dropdown_link"
                      routerLink="/projects/projects-add"
                      (click)="closeMenus()"
                    >
                      Add project
                    </a>
                  </li>
                  <li role="none">
                    <a
                      role="menuitem"
                      class="dropdown_link"
                      routerLink="/projects/project-update"
                      (click)="closeMenus()"
                    >
                      Update project
                    </a>
                  </li>
                  <li role="none">
                    <a
                      role="menuitem"
                      class="dropdown_link"
                      routerLink="/projects/projects-find"
                      (click)="closeMenus()"
                    >
                      Search project
                    </a>
                  </li>
                  <li role="none">
                    <a
                      role="menuitem"
                      class="dropdown_link"
                      routerLink="/projects/projects-delete"
                      (click)="closeMenus()"
                    >
                      Delete project
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </nav>
      </header>

      <main id="main-content" class="main" role="main" tabindex="-1">
        <router-outlet></router-outlet>
      </main>

      <footer class="footer" role="contentinfo">
        <p class="footer_text">&copy;2025 MEAN Stack Project</p>
      </footer>
    </div>
  `,
  styles: `
    .app_container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    /* Skip link */
    .skip-link {
      position: absolute;
      left: -999px;
      top: auto;
      width: 1px;
      height: 1px;
      overflow: hidden;
    }
    .skip-link:focus {
      position: static;
      width: auto;
      height: auto;
      padding: 0.5rem 0.75rem;
      display: inline-block;
      margin: 0.5rem 0.75rem;
      border: 2px solid currentColor;
      border-radius: 0.5rem;
      background: var(--bg_color, #fff);
    }

    .header,
    .footer {
      background-color: var(--header_footer_color);
      text-align: center;
      padding: 0.5rem 1rem;
    }

    .main {
      flex: 1;
      padding: 1rem;
    }

    .main:focus-visible {
      outline: 3px solid currentColor;
      outline-offset: 4px;
      border-radius: 0.5rem;
    }

    .nav {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .logo {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 0.5rem;
      font-weight: 700;
      color: var(--dark_blue);
    }

    .logo_text {
      margin: 0;
    }

    .logo svg {
      color: var(--dark_blue);
      flex-shrink: 0;
    }

    .navbar_links {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 1.5rem;
    }

    .navbar_list {
      display: flex;
      gap: 1.5rem;
      list-style: none;
      padding: 0;
      margin: 0;
      flex-wrap: wrap;
      justify-content: flex-end;
      align-items: center;
    }

    /* Use same class for links + buttons for consistent styling */
    .navbar_link {
      background: transparent;
      border: none;
      padding: 0.25rem 0.2rem;
      text-decoration: none;
      color: var(--medium_blue);
      font-size: 0.95rem;
      cursor: pointer;
      line-height: 1.2;
    }

    .navbar_link:hover {
      color: var(--dark_blue);
    }

    .navbar_link:focus-visible {
      outline: 3px solid currentColor;
      outline-offset: 3px;
      border-radius: 0.35rem;
    }

    .footer_text {
      font-size: 0.85rem;
      margin: 0.25rem 0;
    }

    /* ---------- Dropdown ---------- */
    .dropdown {
      position: relative;
    }

    .dropdown_toggle {
      user-select: none;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }

    /* Menu defaults: hidden but still accessible when opened via class */
    .dropdown_menu {
      position: absolute;
      top: calc(100% + 0.35rem);
      left: 0;
      background: var(--bg_color, #ffffff);
      border: 1px solid #ddd;
      border-radius: 0.5rem;
      padding: 0.35rem 0;
      min-width: 200px;
      display: none;
      z-index: 1000;
      text-align: left;
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.08);
    }

    .dropdown_menu--open {
      display: block;
      list-style: none;
    }

    .dropdown_link {
      display: block;
      padding: 0.5rem 1rem;
      text-decoration: none;
      color: var(--medium_blue);
      font-size: 0.95rem;
      white-space: nowrap;
    }

    .dropdown_link:hover {
      background-color: #f3f4f6;
      color: var(--dark_blue);
    }

    .dropdown_link:focus-visible {
      outline: 3px solid currentColor;
      outline-offset: -3px;
      border-radius: 0.35rem;
    }

    /* ---------- Mobile styles ---------- */
    @media (max-width: 768px) {
      .header {
        padding: 0.5rem 0.75rem;
      }

      .nav {
        flex-direction: column;
        align-items: flex-start;
      }

      .navbar_links {
        width: 100%;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
      }

      .navbar_list {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      /* Put dropdown menus inline on mobile to avoid off-screen popups */
      .dropdown_menu {
        position: static;
        min-width: unset;
        width: 100%;
        box-shadow: none;
        border-radius: 0.5rem;
      }

      .dropdown_link {
        padding-left: 0.75rem;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      * {
        scroll-behavior: auto !important;
        transition: none !important;
        animation: none !important;
      }
    }
  `,
})
export class AppComponent {
  title = 'tms-client';

  openMenu: MenuKey = null;

  toggleMenu(menu: Exclude<MenuKey, null>): void {
    this.openMenu = this.openMenu === menu ? null : menu;
  }

  closeMenus(): void {
    this.openMenu = null;
  }

  // Close on Escape globally
  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMenus();
  }

  // Close when clicking outside
  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    // If click is inside a dropdown, ignore
    const insideDropdown = !!target.closest('.dropdown');
    if (!insideDropdown) this.closeMenus();
  }

  onMenuKeydown(event: KeyboardEvent, menu: Exclude<MenuKey, null>): void {
    const key = event.key;

    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      this.toggleMenu(menu);

      // After opening, move focus to first menu item for keyboard users
      queueMicrotask(() => {
        if (this.openMenu !== menu) return;
        const menuEl = document.getElementById(
          menu === 'tasks' ? 'tasks-menu' : 'projects-menu'
        );
        const firstItem =
          menuEl?.querySelector<HTMLElement>('a[role="menuitem"]');
        firstItem?.focus();
      });
      return;
    }

    if (key === 'ArrowDown') {
      event.preventDefault();
      this.openMenu = menu;
      queueMicrotask(() => {
        const menuEl = document.getElementById(
          menu === 'tasks' ? 'tasks-menu' : 'projects-menu'
        );
        const firstItem =
          menuEl?.querySelector<HTMLElement>('a[role="menuitem"]');
        firstItem?.focus();
      });
      return;
    }

    if (key === 'Escape') {
      event.preventDefault();
      this.closeMenus();
    }
  }

  onMenuListKeydown(event: KeyboardEvent): void {
    const key = event.key;

    if (key === 'Escape') {
      event.preventDefault();
      this.closeMenus();
      // Return focus to the corresponding toggle if possible
      queueMicrotask(() => {
        const toggles = Array.from(
          document.querySelectorAll<HTMLButtonElement>('.dropdown_toggle')
        );
        // Focus the first open toggle; if none, focus first toggle
        const target =
          toggles.find((t) => t.getAttribute('aria-expanded') === 'true') ??
          toggles[0];
        target?.focus();
      });
      return;
    }

    // Simple roving focus with ArrowUp/ArrowDown inside open menu
    if (key === 'ArrowDown' || key === 'ArrowUp') {
      event.preventDefault();

      const menuEl = (event.target as HTMLElement).closest<HTMLElement>(
        '[role="menu"]'
      );
      if (!menuEl) return;

      const items = Array.from(
        menuEl.querySelectorAll<HTMLElement>('a[role="menuitem"]')
      );
      const currentIndex = items.findIndex(
        (el) => el === document.activeElement
      );
      if (currentIndex === -1) return;

      const delta = key === 'ArrowDown' ? 1 : -1;
      const nextIndex = (currentIndex + delta + items.length) % items.length;
      items[nextIndex]?.focus();
    }
  }
}
