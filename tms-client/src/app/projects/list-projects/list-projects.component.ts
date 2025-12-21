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
      <h1 id="page-title" class="page-title">All Projects</h1>

      <!-- Status updates (announced) -->
      <div class="status" role="status" aria-live="polite" aria-atomic="true">
        <p *ngIf="loading" class="status-text">Loading projects…</p>

        <p
          *ngIf="!loading && serverMessage"
          class="status-text"
          [ngClass]="serverMessageType"
        >
          {{ serverMessage }}
        </p>
      </div>

      <!-- Errors (assertive + focusable) -->
      <div
        *ngIf="!loading && serverMessageType === 'error' && serverMessage"
        #errorEl
        class="error"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        tabindex="-1"
      >
        {{ serverMessage }}
      </div>

      <section *ngIf="!loading" aria-labelledby="results-title">
        <h2 id="results-title" class="sr-only">Project results</h2>

        <ul
          *ngIf="projects.length > 0; else noProjects"
          class="project-list"
          role="list"
        >
          <li *ngFor="let project of projects" class="project-item">
            <article class="project-card">
              <header class="project-card__header">
                <h3 class="project-card__title">{{ project.name }}</h3>
              </header>

              <dl class="project-card__meta">
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

              <!-- Optional: add links/actions here if you have routes
              <footer class="project-card__actions">
                <a class="link" [routerLink]="['/projects', project.projectId]">View</a>
              </footer>
              -->
            </article>
          </li>
        </ul>

        <ng-template #noProjects>
          <p class="empty">No projects found.</p>
        </ng-template>
      </section>
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
        max-width: 720px;
        margin: auto;
      }

      .page-title {
        margin: 0 0 0.75rem 0;
      }

      .status {
        min-height: 1.25rem;
        margin-bottom: 0.75rem;
      }

      .status-text {
        margin: 0.25rem 0;
      }

      .success {
        color: #1b7f3a;
      }

      .error {
        color: #b00020;
        margin-top: 0.5rem;
      }

      .project-list {
        list-style: none;
        padding: 0;
        margin: 0.5rem 0 0 0;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .project-item {
        padding: 0;
      }

      .project-card {
        border: 1px solid #ddd;
        border-radius: 10px;
        padding: 0.9rem;
        background: #fff;
      }

      .project-card__header {
        margin-bottom: 0.5rem;
      }

      .project-card__title {
        margin: 0;
        font-size: 1.05rem;
      }

      .project-card__meta {
        margin: 0;
      }

      .meta-row {
        display: grid;
        grid-template-columns: 120px 1fr;
        gap: 0.5rem;
        padding: 0.25rem 0;
      }

      dt {
        font-weight: 600;
      }

      dd {
        margin: 0;
      }

      .empty {
        margin: 0.5rem 0 0 0;
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
          this.serverMessage = `Error retrieving projects. ${
            err?.message ?? ''
          }`.trim();
          this.serverMessageType = 'error';
          console.error('Error occurred while retrieving projects:', err);

          // Move focus to the error so SR + keyboard users notice it immediately
          queueMicrotask(() => this.errorEl?.nativeElement?.focus());
        },
      });
  }
}
