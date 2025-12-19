import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgOptimizedImage],
  template: `
    <div class="app_container">
      <header class="header">
        <nav class="nav">
          <div class="logo">
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="34"
              height="34"
              fill="currentColor"
              viewBox="0 0 24 24"
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

            <p>Task Management System</p>
          </div>

          <div class="navbar_links">
            <ul class="navbar_list">
              <li class="nav_item">
                <a class="navbar_link" routerLink="/">Home</a>
              </li>
              <li class="nav_item">
                <a class="navbar_link" routerLink="/task-list">All Tasks</a>
              </li>
              <li class="nav_item">
                <a class="navbar_link" routerLink="/tasks/delete"
                  >Delete Task</a
                >
              </li>
              <li class="nav_item">
                <a class="navbar_link" routerLink="/tasks/search"
                  >Search Tasks</a
                >
              </li>
              <li class="nav_item">
                <a class="navbar_link" routerLink="/tasks/add">Add Task</a>
              </li>
              <li class="nav_item">
                <a class="navbar_link" routerLink="tasks/read">Read Task</a>
              </li>
              <li class="nav_item">
                <a class="navbar_link" routerLink="/projects/projects-list"
                  >All Projects</a
                >
              </li>
              <li class="nav_item">
                <a class="navbar_link" routerLink="/projects/project-update"
                  >Update Project</a
                >
              </li>
              <li class="nav_item">
                <a class="navbar_link" routerLink="/projects/projects-delete"
                  >Delete Project</a
                >
              </li>
              <li class="nav_item">
                <a class="navbar_link" routerLink="/projects/projects-find"
                  >Find Project</a
                >
              </li>
              <li class="nav_item">
                <a class="navbar_link" routerLink="/projects/projects-add"
                  >Add Project</a
                >
              </li>
            </ul>
            <button class="btn login_btn">
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fill-rule="evenodd"
                  d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2ZM7.99 9a1 1 0 0 1 1-1H9a1 1 0 0 1 0 2h-.01a1 1 0 0 1-1-1ZM14 9a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H15a1 1 0 0 1-1-1Zm-5.506 7.216A5.5 5.5 0 0 1 6.6 13h10.81a5.5 5.5 0 0 1-8.916 3.216Z"
                  clip-rule="evenodd"
                />
              </svg>
              <span class="login_label">Account</span>
            </button>
          </div>
        </nav>
      </header>

      <main class="main">
        <router-outlet></router-outlet>
      </main>

      <footer class="footer">
        <p class="footer_text">&copy;2025 MEAN Stack - Group Project</p>
      </footer>
    </div>
  `,
  styles: `
    .app_container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
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

    .nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap; /* help on very narrow screens */
    }

    .logo {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      color: var(--dark_blue);
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
    }

    .navbar_link {
      text-decoration: none;
      color: var(--medium_blue);
      transition: color 0.3s ease-in-out;
      font-size: 0.95rem;
    }

    .navbar_link:hover {
      color: var(--dark_blue);
    }

    .login_btn {
      background-color: var(--dark_blue);
      color: var(--bg_color);
      border: none;
      padding: 0.4rem 0.8rem;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      border-radius: 0.25rem;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .login_btn svg {
      color: var(--bg_color);
    }

    .footer_text {
      font-size: 0.8rem;
      margin: 0.25rem 0;
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

      .navbar_link {
        font-size: 0.95rem;
      }

      .login_btn {
        align-self: stretch;
        justify-content: center;
      }

      .main {
        padding: 0.75rem;
      }
    }
  `,
})
export class AppComponent {
  title = 'tms-client';
}
