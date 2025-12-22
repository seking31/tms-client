import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, finalize, takeUntil } from 'rxjs';

import { Project } from '../project';
import { ProjectService } from '../projects.service';

@Component({
  selector: 'app-list-project',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="project-container" aria-labelledby="page-title">
      <a class="skip-link" href="#project-list">Skip to project list</a>

      <header class="page-header">
        <h1 id="page-title" class="page-title">All Projects</h1>
      </header>

      <!-- Status updates (polite): loading + success ONLY -->
      <p
        *ngIf="loading"
        class="status"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        Loading projects…
      </p>

      <p
        *ngIf="!loading && serverMessageType === 'success' && serverMessage"
        class="status success"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {{ serverMessage }}
      </p>

      <!-- Errors (assertive + focusable): error ONLY -->
      <p
        *ngIf="!loading && serverMessageType === 'error' && serverMessage"
        #errorEl
        class="status error"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        tabindex="-1"
      >
        {{ serverMessage }}
      </p>

      <!-- Results -->
      <div class="content" tabindex="-1" #content>
        <section *ngIf="!loading" aria-labelledby="results-title">
          <h2 id="results-title" class="sr-only">Project results</h2>

          <ul
            id="project-list"
            *ngIf="projects.length > 0; else noProjects"
            class="project-list"
            aria-label="Project results"
          >
            <li *ngFor="let project of projects" class="project-item">
              <article
                class="project-card"
                [attr.aria-label]="'Project ' + (project.name || '')"
              >
                <h2 class="project-title">{{ project.name }}</h2>

                <dl class="project-meta">
                  <div *ngIf="project.description" class="meta-row">
                    <dt>Description</dt>
                    <dd>{{ project.description }}</dd>
                  </div>

                  <div *ngIf="project.dateCreated" class="meta-row">
                    <dt>Created</dt>
                    <dd>{{ project.dateCreated }}</dd>
                  </div>

                  <div *ngIf="project.dateModified" class="meta-row">
                    <dt>Modified</dt>
                    <dd>{{ project.dateModified }}</dd>
                  </div>

                  <div *ngIf="project.projectId" class="meta-row">
                    <dt>Project ID</dt>
                    <dd>{{ project.projectId }}</dd>
                  </div>
                </dl>
              </article>
            </li>
          </ul>

          <ng-template #noProjects>
            <p
              class="status"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              No projects found.
            </p>
          </ng-template>
        </section>
      </div>
    </main>
  `,
  styles: [
    `
      /* Utility: screen-reader-only */
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

      .project-container {
        padding: 1rem;
        max-width: 820px;
        margin: 0 auto;
      }

      /* Skip link (match tasks) */
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

      .page-header {
        margin-bottom: 0.75rem;
      }

      .page-title {
        margin: 0;
      }

      .content:focus {
        outline: 3px solid currentColor;
        outline-offset: 4px;
        border-radius: 0.5rem;
      }

      .status {
        margin: 0.75rem 0;
      }

      /* Don’t rely on color alone */
      .success {
        font-weight: 800;
      }
      .error {
        font-weight: 800;
      }

      .project-list {
        list-style: none;
        padding: 0;
        margin: 0.75rem 0 0;
        display: grid;
        gap: 0.75rem;
      }

      .project-item {
        padding: 0;
      }

      .project-card {
        border: 1px solid #d0d7de;
        border-radius: 0.75rem;
        padding: 1rem;
      }

      .project-title {
        margin: 0 0 0.5rem;
        font-size: 1.1rem;
      }

      .project-meta {
        margin: 0;
      }

      .meta-row {
        display: grid;
        grid-template-columns: 120px 1fr;
        gap: 0.75rem;
        padding: 0.2rem 0;
      }

      dt {
        font-weight: 700;
      }

      dd {
        margin: 0;
      }

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
export class ListProjectsComponent implements OnInit, OnDestroy {
  @ViewChild('errorEl') errorEl?: ElementRef<HTMLElement>;

  projects: Project[] = [];
  loading = true;

  serverMessage: string | null = null;
  serverMessageType: 'success' | 'error' | null = null;

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly projectService: ProjectService) {}

  ngOnInit(): void {
    this.fetchProjects();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private fetchProjects(): void {
    this.loading = true;
    this.serverMessage = null;
    this.serverMessageType = null;

    this.projectService
      .getProjects()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (projects: Project[]) => {
          this.projects = Array.isArray(projects) ? projects : [];
          this.serverMessage = `Retrieved ${this.projects.length} project(s) successfully.`;
          this.serverMessageType = 'success';
        },
        error: (err: any) => {
          this.projects = [];
          const msg = `${err?.message ?? ''}`.trim();

          this.serverMessage = `Error retrieving projects.${
            msg ? ' ' + msg : ''
          }`;
          this.serverMessageType = 'error';

          console.error('Error occurred while retrieving projects:', err);

          // Move focus after view updates so the element exists
          queueMicrotask(() => this.errorEl?.nativeElement?.focus());
        },
      });
  }
}
