import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, timer } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgOptimizedImage, RouterLink],
  template: `
    <main>
      <section class="hero" aria-labelledby="home-hero-title">
        <div class="hero-copy">
          <h1 id="home-hero-title">Organize Your Work Efficiently</h1>

          <p class="lead">
            Streamline your workflow with our intuitive task management system.
            Create, prioritize, and track tasks with ease.
          </p>

          <div class="btn_container" role="group" aria-label="Quick actions">
            <!-- Use links for navigation (not buttons) -->
            <a class="btn task_btn" routerLink="/tasks/add">
              <svg
                aria-hidden="true"
                focusable="false"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 12h14m-7 7V5"
                />
              </svg>
              <span>Create Task</span>
            </a>

            <a class="btn project_btn" routerLink="/projects/projects-add">
              <svg
                aria-hidden="true"
                focusable="false"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 12h14m-7 7V5"
                />
              </svg>
              <span>Create Project</span>
            </a>
          </div>

          <!-- Status region for async server message -->
          <div class="server-status" aria-live="polite" aria-atomic="true">
            <p class="sr-only" *ngIf="isLoadingServerMessage">
              Loading server message…
            </p>

            <p *ngIf="serverMessage && !isLoadingServerMessage">
              {{ serverMessage }}
            </p>

            <p
              *ngIf="serverError && !isLoadingServerMessage"
              class="error-text"
            >
              {{ serverError }}
            </p>
          </div>
        </div>

        <div class="hero-media">
          <img
            ngSrc="/assets/hero.jpg"
            alt="Person planning tasks on a board"
            height="300"
            width="500"
            priority
          />
        </div>
      </section>

      <section class="features" aria-labelledby="features-title">
        <div class="features-intro">
          <h2 id="features-title">Key Features</h2>
          <p>Everything you need to manage tasks effectively.</p>
        </div>

        <div class="features-grid" role="list">
          <article
            class="card"
            role="listitem"
            aria-labelledby="feature-task-title"
          >
            <svg
              aria-hidden="true"
              focusable="false"
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 9h6m-6 3h6m-6 3h6M6.996 9h.01m-.01 3h.01m-.01 3h.01M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"
              />
            </svg>

            <h3 id="feature-task-title">Task Management</h3>
            <p>
              Add, edit, and delete tasks with a simple and intuitive interface.
              Keep your workflow organized.
            </p>
          </article>

          <article
            class="card"
            role="listitem"
            aria-labelledby="feature-status-title"
          >
            <svg
              aria-hidden="true"
              focusable="false"
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 21a9 9 0 1 1 0-18c1.052 0 2.062.18 3 .512M7 9.577l3.923 3.923 8.5-8.5M17 14v6m-3-3h6"
              />
            </svg>

            <h3 id="feature-status-title">Status Tracking</h3>
            <p>
              Monitor progress with status options: Pending, In Progress, and
              Completed. Stay on top of deadlines.
            </p>
          </article>

          <article
            class="card"
            role="listitem"
            aria-labelledby="feature-priority-title"
          >
            <svg
              aria-hidden="true"
              focusable="false"
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 14v7M5 4.971v9.541c5.6-5.538 8.4 2.64 14-.086v-9.54C13.4 7.61 10.6-.568 5 4.97Z"
              />
            </svg>

            <h3 id="feature-priority-title">Priority Levels</h3>
            <p>
              Set priorities as High, Medium, or Low to focus on what matters
              most and optimize productivity.
            </p>
          </article>
        </div>
      </section>
    </main>
  `,
  styles: `
    /* Utility: screen-reader-only text */
    .sr-only {
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    }

    .hero {
      display: flex;
      gap: 2rem;
      align-items: center;
    }

    .hero-copy,
    .hero-media {
      flex-basis: 50%;
      flex-grow: 1;
    }

    .hero-copy {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .hero-media {
      display: flex;
      justify-content: center;
    }

    .lead {
      margin: 0;
    }

    .btn_container {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      margin-top: 0.25rem;
    }

    /* Make route navigation elements real links (a.btn) */
    a.btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 0.9rem;
      border-radius: 8px;
      text-decoration: none;
      border: 2px solid black;
      line-height: 1;
      cursor: pointer;
    }

    a.btn svg {
      flex: 0 0 auto;
    }

    .task_btn {
      background-color: var(--dark_blue);
      color: var(--bg_color);
    }

    .project_btn {
      border-color: var(--dark_blue);
      color: var(--dark_blue);
      background: transparent;
    }

    /* Visible focus for keyboard users */
    a.btn:focus-visible {
      outline: 3px solid currentColor;
      outline-offset: 3px;
    }

    .server-status {
      margin-top: 0.5rem;
      min-height: 1.25rem;
    }

    .error-text {
      margin: 0;
    }

    /* Features section */
    .features {
      background-color: var(--accent_color);
      padding: 1rem;
      margin-top: 2rem;
    }

    .features-intro {
      text-align: center;
    }

    .features-grid {
      display: flex;
      flex-direction: row;
      justify-content: space-evenly;
      gap: 1rem;
      flex-wrap: wrap;
      margin-top: 1rem;
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

    @media (max-width: 768px) {
      .hero {
        flex-direction: column;
        align-items: stretch;
      }

      .hero-copy,
      .hero-media {
        flex-basis: auto;
      }

      .features {
        padding: 1rem 0.75rem;
      }
    }
  `,
})
export class HomeComponent implements OnInit, OnDestroy {
  serverMessage = '';
  serverError = '';
  isLoadingServerMessage = false;

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly http: HttpClient) {}

  ngOnInit(): void {
    this.isLoadingServerMessage = true;
    this.serverError = '';

    // delay request without setTimeout (clean teardown + avoids memory leaks)
    timer(2000)
      .pipe(
        switchMap(() =>
          this.http.get<{ message?: string }>(`${environment.apiBaseUrl}/api`)
        ),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => {
          this.serverMessage = res?.message ?? '';
          this.isLoadingServerMessage = false;
        },
        error: () => {
          this.serverError = 'Error loading server message';
          this.isLoadingServerMessage = false;
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
