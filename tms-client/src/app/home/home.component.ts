import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {NgOptimizedImage} from "@angular/common";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    NgOptimizedImage,
    RouterLink
  ],
  template: `
    <section class="hero">
      <div>
        <h1>Organize Your Work Efficiently</h1>
        <p>Streamline your workflow with out intuitive task management system. Create, prioritize, and track tasks
          with ease.</p>
        <div class="btn_container">
          <button class="btn task_btn" routerLink="/tasks/add">
            <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                 width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M5 12h14m-7 7V5"/>
            </svg>
            Create Task
          </button>
          <button class="btn project_btn" routerLink="/projects">
            <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                 width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path fill-rule="evenodd"
                    d="M5 4a2 2 0 0 0-2 2v1h10.968l-1.9-2.28A2 2 0 0 0 10.532 4H5ZM3 19V9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Zm9-8.5a1 1 0 0 1 1 1V13h1.5a1 1 0 1 1 0 2H13v1.5a1 1 0 1 1-2 0V15H9.5a1 1 0 1 1 0-2H11v-1.5a1 1 0 0 1 1-1Z"
                    clip-rule="evenodd"/>
            </svg>
            View Projects
          </button>
        </div>
      </div>
      <div>
        <img ngSrc="/assets/hero.jpg" alt="hero image" height="300" width="500">
      </div>
    </section>

    <section>
      <div>
        <h2>Key Features</h2>
        <p>Everything you need to manage tasks effectively</p>
      </div>
      <div>
        <div class="card">
          <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 9h6m-6 3h6m-6 3h6M6.996 9h.01m-.01 3h.01m-.01 3h.01M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"/>
          </svg>
          <h3>Task Management</h3>
          <p>Add, edit, and delete tasks with a simple and intuitive interface. Keep your workflow organized.</p>
        </div>
        <div class="card">
          <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 21a9 9 0 1 1 0-18c1.052 0 2.062.18 3 .512M7 9.577l3.923 3.923 8.5-8.5M17 14v6m-3-3h6"/>
          </svg>
          <h3>Status Tracking</h3>
          <p>Monitor progress with status options: Pending, In Progrss, and Completed. Stay on top of deadlines.</p>
        </div>
        <div class="card">
          <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 14v7M5 4.971v9.541c5.6-5.538 8.4 2.64 14-.086v-9.54C13.4 7.61 10.6-.568 5 4.97Z"/>
          </svg>
          <h3>Priority Levels</h3>
          <p>Set priorities as High, Medium, or Low to focus on what matters most and optimize productivity.</p>
        </div>
      </div>
    </section>
  `,
  styles: `
    section:nth-child(2) {
      background-color: var(--accent_color);
    }

    .hero {
      display: flex;
      gap: 2rem;
    }

    /* Set flex basis to 50% for each div */
    .hero > div {
      flex-basis: 50%;
      flex-grow: 1;
    }

    /* First div - left side */
    .hero > div:first-child {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    /* Second div - right side */
    .hero > div:nth-child(2) {
      display: flex;
      justify-content: center;
    }

    .btn_container {
      display: flex;
      gap: 2rem;
    }

    .task_btn {
      background-color: var(--dark_blue);
      color: var(--bg_color);
    }

    .project_btn {
      border: 2px solid var(--dark_blue);
      color: var(--dark_blue);
    }

    /* First div - top */
    section:nth-child(2) > div:first-child {
      text-align: center;
    }

    /* Second div - bottom */
    section:nth-child(2) > div:nth-child(2) {
      display: flex;
      flex-direction: row;
      justify-content: space-evenly;
    }

    .card {
      border: 2px solid var(--dark_blue);
      border-radius: 10px;
      width: 250px;
      padding: 1rem;
      background-color: var(--bg_color);
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    }

    .card svg {
      padding: 0.5rem;
      background-color: var(--dark_blue);
      color: var(--bg_color);
      border-radius: 6px;

    }
  `
})
export class HomeComponent {
  serverMessage: string;

  constructor(private http: HttpClient) {
    this.serverMessage = '';

    // Simulate a server request that takes 2 seconds to complete
    setTimeout(() => {
      this.http.get(`${environment.apiBaseUrl}/api`).subscribe({
        next: (res: any) => {
          this.serverMessage = res['message'];
        },
        error: (err) => {
          this.serverMessage = 'Error loading server message';
        }
      });
    }, 2000);
  }
}
