import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ProjectService } from '../projects.service';
import { Project } from '../project';

@Component({
  selector: 'app-project-find',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, NgIf, NgForOf],
  template: `
    <section class="project-find-page" aria-labelledby="page-title">
      <a class="skip-link" href="#main-content">Skip to search</a>

      <header class="page-header">
        <h1 id="page-title" class="project-find-page_title">Search Projects</h1>
      </header>

      <!-- Live status for search lifecycle -->
      <p
        *ngIf="statusMessage"
        class="status"
        [class.error]="statusKind === 'error'"
        [class.success]="statusKind === 'success'"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {{ statusMessage }}
      </p>

      <div id="main-content" class="content" tabindex="-1" #mainContent>
        <form
          class="form"
          [formGroup]="projectForm"
          (ngSubmit)="onSubmit()"
          aria-describedby="form-help"
          novalidate
        >
          <p id="form-help" class="sr-only">
            Type a project name then press Search. Results will appear below.
          </p>

          <div class="field">
            <label for="term" class="task-add-page_form-label">
              Project name <span aria-hidden="true">*</span>
            </label>

            <input
              #termInput
              type="text"
              id="term"
              class="task-add-page_form-control"
              formControlName="term"
              inputmode="search"
              autocomplete="off"
              [attr.aria-required]="true"
              [attr.aria-invalid]="isInvalid('term')"
              [attr.aria-describedby]="
                'term-hint' + (isInvalid('term') ? ' term-error' : '')
              "
            />

            <p id="term-hint" class="field-hint">Minimum 3 characters.</p>

            <p
              *ngIf="isInvalid('term')"
              id="term-error"
              class="field-error"
              role="alert"
            >
              <span *ngIf="projectForm.get('term')?.errors?.['required']">
                Project search term is required.
              </span>
              <span *ngIf="projectForm.get('term')?.errors?.['minlength']">
                Project search term must be at least 3 characters long.
              </span>
            </p>
          </div>

          <div class="actions">
            <button
              type="submit"
              class="task_btn"
              [disabled]="projectForm.invalid || searching"
              [attr.aria-disabled]="
                projectForm.invalid || searching ? 'true' : null
              "
            >
              <span *ngIf="!searching">Search projects</span>
              <span *ngIf="searching">Searching…</span>
            </button>

            <button type="button" class="task_btn secondary" (click)="clear()">
              Clear
            </button>
          </div>
        </form>

        <!-- Results -->
        <section
          *ngIf="searched"
          class="results"
          aria-labelledby="results-title"
        >
          <h2 id="results-title">Search results</h2>

          <!-- Screen-reader friendly summary -->
          <p class="sr-only" aria-live="polite" aria-atomic="true">
            {{ projects.length }} project{{ projects.length === 1 ? '' : 's' }}
            found.
          </p>

          <ul *ngIf="projects.length > 0; else noProjects" class="results-list">
            <li *ngFor="let project of projects" class="task-item">
              <article class="task-card" aria-label="Project details">
                <h3 class="task-title">{{ project.name }}</h3>

                <dl class="task-meta">
                  <div class="meta-row" *ngIf="project.description">
                    <dt>Description</dt>
                    <dd>{{ project.description }}</dd>
                  </div>

                  <div class="meta-row" *ngIf="project.dateCreated">
                    <dt>Created</dt>
                    <dd>{{ project.dateCreated }}</dd>
                  </div>

                  <div class="meta-row" *ngIf="project.dateModified">
                    <dt>Modified</dt>
                    <dd>{{ project.dateModified }}</dd>
                  </div>

                  <div class="meta-row" *ngIf="project.projectId">
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
    </section>
  `,
  styles: [
    `
      .project-find-page {
        max-width: 680px;
        margin: 2rem auto;
        padding: 1.5rem;
      }

      .page-header {
        margin-bottom: 1rem;
      }

      .project-find-page_title {
        color: var(--dark_blue);
        margin: 0 0 0.25rem;
      }

      .project-find-page_subtitle {
        color: var(--medium_blue);
        margin: 0;
        font-size: 0.95rem;
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
        margin-bottom: 0.75rem;
        border: 2px solid currentColor;
        border-radius: 0.5rem;
      }

      .content:focus {
        outline: 3px solid currentColor;
        outline-offset: 4px;
        border-radius: 0.5rem;
      }

      .form {
        display: grid;
        gap: 1rem;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }

      /* Keep same class names as TaskFind for consistent look */
      .task-add-page_form-label {
        display: block;
        margin-bottom: 0.1rem;
        font-weight: 600;
      }

      .task-add-page_form-control {
        width: 100%;
        padding: 0.65rem;
        border: 1px solid #c9d4e0;
        border-radius: 0.35rem;
        font-size: 1rem;
        box-sizing: border-box;
      }

      .task-add-page_form-control.ng-invalid.ng-touched {
        border-width: 2px;
      }

      .field-hint {
        margin: 0;
        font-size: 0.95rem;
        color: var(--medium_blue);
      }

      .field-error {
        margin: 0;
        font-weight: 700;
        color: #8a0000;
      }

      .actions {
        display: flex;
        gap: 0.75rem;
        align-items: center;
        flex-wrap: wrap;
      }

      .task_btn {
        padding: 0.65rem 1.1rem;
        border: none;
        background-color: var(--dark_blue);
        color: white;
        cursor: pointer;
        font-size: 1rem;
        border-radius: 0.35rem;
      }

      .task_btn.secondary {
        background: transparent;
        color: inherit;
        border: 2px solid currentColor;
      }

      .task_btn:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }

      .task_btn:focus-visible,
      .task-add-page_form-control:focus-visible,
      .link:focus-visible {
        outline: 3px solid currentColor;
        outline-offset: 3px;
        border-radius: 0.35rem;
      }

      .status {
        margin: 0.75rem 0;
      }

      .status.error {
        font-weight: 800;
      }

      .status.success {
        font-weight: 800;
      }

      .results {
        margin-top: 1.5rem;
      }

      .results-list {
        padding-left: 0;
        list-style: none;
        margin: 0.75rem 0 0;
        display: grid;
        gap: 0.75rem;
      }

      .task-card {
        border: 1px solid #d0d7de;
        border-radius: 0.75rem;
        padding: 1rem;
      }

      .task-title {
        margin: 0 0 0.5rem;
        font-size: 1.1rem;
      }

      .task-meta {
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

      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
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
export class ProjectFindComponent implements OnDestroy {
  projectForm: FormGroup = this.fb.group({
    term: [null, [Validators.required, Validators.minLength(3)]],
  });

  projects: Project[] = [];
  searched = false;
  searching = false;

  statusMessage = '';
  statusKind: 'info' | 'success' | 'error' = 'info';
  errorMessage = '';

  @ViewChild('mainContent', { static: true })
  mainContentRef!: ElementRef<HTMLElement>;

  @ViewChild('termInput')
  termInput?: ElementRef<HTMLInputElement>;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly projectService: ProjectService
  ) {}

  isInvalid(controlName: 'term'): 'true' | null {
    const control = this.projectForm.get(controlName);
    if (!control) return null;
    return control.invalid && (control.dirty || control.touched)
      ? 'true'
      : null;
  }

  clear(): void {
    this.projectForm.reset();
    this.projects = [];
    this.searched = false;
    this.searching = false;
    this.clearMessages();
    queueMicrotask(() => this.mainContentRef?.nativeElement.focus());
  }

  onSubmit(): void {
    this.projectForm.markAllAsTouched();

    if (this.projectForm.invalid) {
      this.setError('Please enter at least 3 characters to search.');
      queueMicrotask(() => this.termInput?.nativeElement.focus());
      return;
    }

    const raw = this.projectForm.get('term')!.value;
    const term = String(raw ?? '').trim();

    if (term.length < 3) {
      this.setError('Please enter at least 3 characters to search.');
      queueMicrotask(() => this.termInput?.nativeElement.focus());
      return;
    }

    this.searching = true;
    this.searched = false;
    this.projects = [];
    this.clearMessages();
    this.setStatus('Searching…', 'info');

    this.projectService
      .findProject(term)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: Project[]) => {
          this.searching = false;
          this.searched = true;
          this.projects = Array.isArray(result) ? result : [];

          if (this.projects.length === 0) {
            this.setStatus('No projects found.', 'info');
          } else {
            this.setStatus(
              `${this.projects.length} project${
                this.projects.length === 1 ? '' : 's'
              } found.`,
              'success'
            );
          }

          queueMicrotask(() => this.mainContentRef?.nativeElement.focus());
        },
        error: (err: any) => {
          this.searching = false;
          this.searched = true;
          this.projects = [];
          const msg = (err?.message ?? '').toString().trim();
          this.setError(`Error finding projects.${msg ? ' ' + msg : ''}`);
          queueMicrotask(() => this.mainContentRef?.nativeElement.focus());
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setStatus(message: string, kind: 'info' | 'success' | 'error'): void {
    this.statusMessage = message;
    this.statusKind = kind;
  }

  private setError(message: string): void {
    this.errorMessage = message;
    this.setStatus(message, 'error');
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.statusMessage = '';
    this.statusKind = 'info';
  }
}
