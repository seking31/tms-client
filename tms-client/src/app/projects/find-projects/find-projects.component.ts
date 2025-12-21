import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProjectService } from '../projects.service';
import { Project } from '../project';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subject, finalize, takeUntil } from 'rxjs';

@Component({
  selector: 'app-project-find',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, NgIf, NgForOf],
  template: `
    <main class="project-find-page" aria-labelledby="page-title">
      <h1 id="page-title" class="project-find-page_title">Find Project</h1>
      <p class="project-find-page_subtitle">
        Enter at least 3 characters to search for projects by name.
      </p>

      <!-- Live region for status updates -->
      <div class="status" role="status" aria-live="polite" aria-atomic="true">
        <p *ngIf="loading" class="status-text">Searching…</p>
        <p
          *ngIf="!loading && searched && projects.length > 0"
          class="status-text"
        >
          {{ projects.length }} result{{ projects.length === 1 ? '' : 's' }}
          found.
        </p>
        <p
          *ngIf="!loading && searched && projects.length === 0"
          class="status-text"
        >
          No projects found.
        </p>
      </div>

      <!-- Error (assertive) -->
      <div
        *ngIf="errorMessage"
        #errorEl
        class="error-message"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        tabindex="-1"
      >
        {{ errorMessage }}
      </div>

      <form [formGroup]="projectForm" (ngSubmit)="onSubmit()" novalidate>
        <div class="add-project-page_form-group">
          <label for="term" class="project-add-page_form-label">
            Project Name
          </label>

          <input
            #termInput
            type="text"
            id="term"
            class="project-add-page_form-control"
            formControlName="term"
            autocomplete="off"
            inputmode="search"
            [attr.aria-invalid]="
              termCtrl.invalid && (termCtrl.touched || submitted)
                ? 'true'
                : null
            "
            [attr.aria-describedby]="
              termCtrl.invalid && (termCtrl.touched || submitted)
                ? 'term-hint term-error'
                : 'term-hint'
            "
          />

          <small id="term-hint" class="hint">Minimum 3 characters.</small>

          <div
            id="term-error"
            *ngIf="termCtrl.invalid && (termCtrl.touched || submitted)"
            class="field-error"
          >
            <small *ngIf="termCtrl.errors?.['required']">
              Project search term is required.
            </small>
            <small *ngIf="termCtrl.errors?.['minlength']">
              Project search term must be at least 3 characters long.
            </small>
          </div>
        </div>

        <button
          type="submit"
          class="project_btn"
          [disabled]="projectForm.invalid || loading"
          [attr.aria-disabled]="projectForm.invalid || loading ? 'true' : null"
        >
          <span *ngIf="!loading">Search Project</span>
          <span *ngIf="loading">Searching…</span>
        </button>
      </form>

      <!-- Results section -->
      <section *ngIf="searched" class="results" aria-labelledby="results-title">
        <h2 id="results-title" class="results-title">Search Results</h2>

        <ul
          *ngIf="projects.length > 0; else noProjects"
          class="results-list"
          role="list"
        >
          <li *ngFor="let project of projects" class="project-item">
            <h3 class="project-name">{{ project.name }}</h3>

            <p class="project-meta" *ngIf="project.description">
              <strong>Description:</strong> {{ project.description }}
            </p>

            <p class="project-meta" *ngIf="project.dateCreated">
              <strong>Created:</strong> {{ project.dateCreated }}
            </p>

            <p class="project-meta" *ngIf="project.dateModified">
              <strong>Modified:</strong> {{ project.dateModified }}
            </p>

            <p class="project-meta" *ngIf="project.projectId">
              <strong>Project ID:</strong> {{ project.projectId }}
            </p>
          </li>
        </ul>

        <ng-template #noProjects>
          <p class="no-projects">No projects found.</p>
        </ng-template>
      </section>
    </main>
  `,
  styles: [
    `
      .project-find-page {
        max-width: 600px;
        margin: 2rem auto;
        padding: 1.5rem;
      }

      .project-find-page_title {
        text-align: center;
        color: var(--dark_blue);
        margin-bottom: 0.25rem;
      }

      .project-find-page_subtitle {
        text-align: center;
        color: var(--medium_blue);
        margin: 0 auto 1.25rem auto;
        font-size: 0.95rem;
      }

      .status {
        min-height: 1.25rem;
        margin-bottom: 0.75rem;
      }

      .status-text {
        margin: 0.25rem 0;
      }

      .add-project-page_form-group {
        margin-bottom: 1rem;
      }

      .project-add-page_form-label {
        display: block;
        margin-bottom: 0.35rem;
        font-weight: 600;
      }

      .project-add-page_form-control {
        width: 100%;
        padding: 0.6rem;
        border: 1px solid #ccc;
        border-radius: 6px;
        font-size: 0.95rem;
        box-sizing: border-box;
      }

      .project-add-page_form-control.ng-invalid.ng-touched {
        border-color: #c0392b;
      }

      .project-add-page_form-control:focus-visible,
      .project_btn:focus-visible {
        outline: 3px solid currentColor;
        outline-offset: 3px;
        border-radius: 6px;
      }

      .hint {
        display: block;
        color: #555;
        font-size: 0.85rem;
        margin-top: 0.35rem;
      }

      .field-error {
        color: #7c0505;
        font-size: 0.85rem;
        margin-top: 0.25rem;
      }

      .error-message {
        color: #7c0505;
        margin: 0.25rem 0 0.75rem 0;
      }

      .project_btn {
        padding: 0.6rem 1.2rem;
        border: none;
        background-color: var(--dark_blue);
        color: white;
        cursor: pointer;
        font-size: 0.95rem;
        border-radius: 6px;
      }

      .project_btn:disabled,
      .project_btn[aria-disabled='true'] {
        opacity: 0.55;
        cursor: not-allowed;
      }

      .results {
        margin-top: 1.5rem;
      }

      .results-title {
        margin: 0 0 0.75rem 0;
        font-size: 1.2rem;
      }

      .results-list {
        padding-left: 0;
        margin: 0.5rem 0 0 0;
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .project-item {
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 0.75rem;
        background: #fff;
      }

      .project-name {
        margin: 0 0 0.25rem 0;
        font-size: 1.05rem;
      }

      .project-meta {
        margin: 0.2rem 0;
      }

      .no-projects {
        margin: 0.25rem 0 0 0;
      }
    `,
  ],
})
export class ProjectFindComponent implements OnDestroy {
  @ViewChild('errorEl') errorEl?: ElementRef<HTMLElement>;
  @ViewChild('termInput') termInput?: ElementRef<HTMLInputElement>;

  projectForm: FormGroup = this.fb.group({
    term: [null, [Validators.required, Validators.minLength(3)]],
  });

  projects: Project[] = [];
  searched = false;
  loading = false;

  submitted = false;
  errorMessage = '';

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly projectService: ProjectService
  ) {}

  get termCtrl(): AbstractControl {
    return this.projectForm.get('term')!;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.successResetForNewSearch();

    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      queueMicrotask(() => this.termInput?.nativeElement?.focus());
      return;
    }

    const term = String(this.termCtrl.value ?? '').trim();
    if (!term) {
      this.errorMessage = 'Please enter a project name to search.';
      this.focusError();
      return;
    }

    this.loading = true;

    this.projectService
      .findProject(term)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
          this.searched = true;
        })
      )
      .subscribe({
        next: (result: Project[]) => {
          this.projects = Array.isArray(result) ? result : [];
        },
        error: (error: any) => {
          this.projects = [];
          this.errorMessage = `Error finding projects. ${
            error?.message ?? ''
          }`.trim();
          this.focusError();
          console.error('Error finding projects', error);
        },
      });
  }

  private successResetForNewSearch(): void {
    // Reset prior results when starting a new search attempt
    this.projects = [];
    this.searched = false;
  }

  private focusError(): void {
    queueMicrotask(() => this.errorEl?.nativeElement?.focus());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
