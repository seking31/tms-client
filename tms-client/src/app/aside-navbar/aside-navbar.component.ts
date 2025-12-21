import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-aside-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="aside-nav" aria-label="Secondary navigation">
      <ul class="aside-list" role="list">
        <li class="aside-section" role="presentation">
          <h2 class="aside-heading" id="aside-tasks-heading">Tasks</h2>
        </li>

        <li>
          <a
            routerLink="/task-list"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            [attr.aria-current]="rlaTasksAll.isActive ? 'page' : null"
            #rlaTasksAll="routerLinkActive"
          >
            All Tasks
          </a>
        </li>

        <li>
          <a
            routerLink="/tasks/add"
            routerLinkActive="active"
            [attr.aria-current]="rlaTasksAdd.isActive ? 'page' : null"
            #rlaTasksAdd="routerLinkActive"
          >
            Add Task
          </a>
        </li>

        <li>
          <a
            routerLink="/tasks/delete"
            routerLinkActive="active"
            [attr.aria-current]="rlaTasksDelete.isActive ? 'page' : null"
            #rlaTasksDelete="routerLinkActive"
          >
            Delete Task
          </a>
        </li>

        <li>
          <a
            routerLink="/tasks/update"
            routerLinkActive="active"
            [attr.aria-current]="rlaTasksUpdate.isActive ? 'page' : null"
            #rlaTasksUpdate="routerLinkActive"
          >
            Update Task
          </a>
        </li>

        <li>
          <a
            routerLink="/tasks/search"
            routerLinkActive="active"
            [attr.aria-current]="rlaTasksFind.isActive ? 'page' : null"
            #rlaTasksFind="routerLinkActive"
          >
            Find Task
          </a>
        </li>

        <li>
          <a
            routerLink="/tasks/read"
            routerLinkActive="active"
            [attr.aria-current]="rlaTasksRead.isActive ? 'page' : null"
            #rlaTasksRead="routerLinkActive"
          >
            Read Task
          </a>
        </li>

        <li class="aside-section mt" role="presentation">
          <h2 class="aside-heading" id="aside-projects-heading">Projects</h2>
        </li>

        <li>
          <a
            routerLink="/projects/projects-list"
            routerLinkActive="active"
            [attr.aria-current]="rlaProjectsAll.isActive ? 'page' : null"
            #rlaProjectsAll="routerLinkActive"
          >
            All Projects
          </a>
        </li>

        <li>
          <a
            routerLink="/projects/projects-add"
            routerLinkActive="active"
            [attr.aria-current]="rlaProjectsAdd.isActive ? 'page' : null"
            #rlaProjectsAdd="routerLinkActive"
          >
            Add Project
          </a>
        </li>

        <li>
          <a
            routerLink="/projects/projects-find"
            routerLinkActive="active"
            [attr.aria-current]="rlaProjectsFind.isActive ? 'page' : null"
            #rlaProjectsFind="routerLinkActive"
          >
            Search Project
          </a>
        </li>

        <li>
          <a
            routerLink="/projects/project-update"
            routerLinkActive="active"
            [attr.aria-current]="rlaProjectsUpdate.isActive ? 'page' : null"
            #rlaProjectsUpdate="routerLinkActive"
          >
            Update Project
          </a>
        </li>

        <li>
          <a
            routerLink="/projects/projects-delete"
            routerLinkActive="active"
            [attr.aria-current]="rlaProjectsDelete.isActive ? 'page' : null"
            #rlaProjectsDelete="routerLinkActive"
          >
            Delete Project
          </a>
        </li>
      </ul>
    </nav>
  `,
  styles: `
    .aside-nav {
      background-color: var(--accent_color);
      color: var(--dark_blue);
      padding: 1rem;
      width: 100%;
      height: 100vh;
    }

    .aside-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    /* Keep indentation for link items only */
    .aside-list li:not(.aside-section) {
      padding-left: 1.5rem;
    }

    /* Headings instead of plain text for section labels */
    .aside-section {
      margin-top: 1rem;
    }

    .aside-heading {
      margin: 0;
      font-weight: 600;
      font-size: 1rem;
      line-height: 1.25;
      color: var(--dark_blue);
    }

    a {
      color: var(--medium_blue);
      text-decoration: none;
      padding: 0.25rem 0;
      display: inline-block;
    }

    a.active {
      color: #1abc9c;
      font-weight: 600;
    }

    a:hover {
      text-decoration: underline;
    }

    /* Strong visible focus for keyboard users */
    a:focus-visible {
      outline: 3px solid currentColor;
      outline-offset: 3px;
      border-radius: 4px;
    }

    /* Hide sidebar on mobile */
    @media (max-width: 768px) {
      .aside-nav {
        display: none;
      }
    }
  `,
})
export class AsideNavbarComponent {}
