import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ProjectService } from '../projects.service';
import { Project } from '../project';

@Component({
  selector: 'app-read-project',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Landmarks + focus management anchor -->
    <section class="read-project" aria-labelledby="project-page-title">
      <!-- This helps keyboard/screen reader users land on meaningful content after navigation -->
      <a class="skip-link" href="#project-content">Skip to project details</a>

      <header class="page-header">
        <h1 id="project-page-title">Select Project</h1>
      </header>

      <!-- Live region for async states (loading/error/success) -->
      <p
        *ngIf="loading"
        class="status loading"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        Loading project…
      </p>

      <p
        *ngIf="!loading && error"
        class="status error"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        {{ error }}
      </p>

      <!-- Main content -->
      <div id="project-content" tabindex="-1" class="content">
        <article
          *ngIf="!loading && project"
          class="project-card"
          aria-labelledby="project-title"
        >
          <header>
            <h2 id="project-title" class="project-title">{{ project.name }}</h2>
          </header>

          <p class="project-description" *ngIf="project.description">
            {{ project.description }}
          </p>

          <!-- Use dl for name/value metadata (better semantics than ul for this pattern) -->
          <dl class="project-meta">
            <div class="meta-row">
              <dt>Project ID</dt>
              <dd>{{ project.projectId }}</dd>
            </div>

            <div class="meta-row" *ngIf="project.startDate">
              <dt>Start date</dt>
              <dd>{{ project.startDate | date }}</dd>
            </div>

            <div class="meta-row" *ngIf="project.endDate">
              <dt>End date</dt>
              <dd>{{ project.endDate | date }}</dd>
            </div>
          </dl>
        </article>

        <!-- Optional helpful empty state (when no error but no project returned) -->
        <p
          *ngIf="!loading && !error && !project"
          class="status"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          No project found.
        </p>
      </div>

      <!-- Optional nav affordance (if you have a list route) -->
      <nav class="page-actions" aria-label="Project actions">
        <a class="link" routerLink="/projects">Back to projects</a>
      </nav>
    </section>
  `,
  styles: [
    `
      .read-project {
        padding: 1rem;
        max-width: 720px;
        margin: 0 auto;
      }

      .page-header {
        margin-bottom: 1rem;
      }

      /* Skip link becomes visible on focus */
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
        margin-bottom: 0.75rem;
        border: 2px solid currentColor;
        border-radius: 0.5rem;
      }

      .content:focus {
        outline: 3px solid currentColor;
        outline-offset: 4px;
      }

      .project-card {
        border: 1px solid #d0d7de;
        border-radius: 0.75rem;
        padding: 1rem;
      }

      .project-title {
        margin: 0 0 0.5rem 0;
      }

      .project-description {
        margin: 0 0 1rem 0;
      }

      .project-meta {
        margin: 0;
      }

      .meta-row {
        display: grid;
        grid-template-columns: 160px 1fr;
        gap: 0.75rem;
        padding: 0.25rem 0;
      }

      dt {
        font-weight: 600;
      }

      dd {
        margin: 0;
      }

      .status {
        margin: 0.75rem 0;
      }

      /* Don’t rely on color alone; keep it readable and distinct */
      .loading {
        font-style: italic;
      }

      .error {
        font-weight: 600;
      }

      /* Strong focus visibility for keyboard users */
      .link:focus-visible {
        outline: 3px solid currentColor;
        outline-offset: 3px;
        border-radius: 0.25rem;
      }

      .page-actions {
        margin-top: 1rem;
      }

      /* Respect reduced motion preferences (if you add transitions later) */
      @media (prefers-reduced-motion: reduce) {
        * {
          scroll-behavior: auto !important;
          transition: none !important;
          animation: none !important;
        }
      }
    `,
  ],
})
export class ReadProjectComponent implements OnInit, OnDestroy {
  project?: Project;
  loading = true;
  error?: string;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly projectService: ProjectService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error = 'Invalid project ID.';
      this.loading = false;
      return;
    }

    this.projectService
      .getProjectById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.project = data;
          this.loading = false;

          // Move focus to the content region after async load for better SR/keyboard UX
          queueMicrotask(() => {
            const el = document.getElementById('project-content');
            el?.focus();
          });
        },
        error: () => {
          this.error = 'Unable to load project.';
          this.loading = false;

          queueMicrotask(() => {
            const el = document.getElementById('project-content');
            el?.focus();
          });
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
