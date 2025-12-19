import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-aside-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="aside-nav" aria-label="Secondary">
      <ul class="aside-list">
        <li class="aside-section">Tasks</li>
        <li>
          <a
            routerLink="/task-list"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            >View All Tasks</a
          >
        </li>
        <li>
          <a routerLink="/tasks/add" routerLinkActive="active">Add Task</a>
        </li>
        <li>
          <a routerLink="/tasks/delete">Delete Task</a>
        </li>
        <li>
          <a routerLink="/tasks/update">Update Task</a>
        </li>
        <li>
          <a routerLink="/tasks/search" routerLinkActive="active">Find Task</a>
        </li>
        <li>
          <a routerLink="/tasks/read" routerLinkActive="active">Read Task</a>
        </li>
        <li class="aside-section mt">Projects</li>
        <li>
          <a routerLink="/projects/projects-list">All Projects</a>
        </li>
        <li>
          <a routerLink="/projects/projects-add">Add Project</a>
        </li>
        <li>
          <a routerLink="/projects/project-update">Update Project</a>
        </li>
        <li>
          <a routerLink="/projects/projects-delete">Delete Project</a>
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

    .aside-list li:not(.aside-section) {
      padding-left: 1.5rem;
    }

    .aside-section {
      margin-top: 1rem;
      font-weight: 600;
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

      /* Hide sidebar on mobile */
  @media (max-width: 768px) {
    .aside-nav {
      display: none;
    }
  }
  `,
})
export class AsideNavbarComponent {}
