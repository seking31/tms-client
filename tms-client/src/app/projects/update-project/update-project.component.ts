import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, distinctUntilChanged, filter, takeUntil } from 'rxjs';
import { Project, UpdateProjectDTO } from '../project';
import { ProjectService } from '../projects.service';

@Component({
  selector: 'app-project-update',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <section class="project-update_container" aria-labelledby="page-title">
      <a class="skip-link" href="#main-content">Skip to update form</a>

      <header class="page-header">
        <h1 id="page-title" class="project-update_title">Update Project</h1>
        <p class="project-update_subtitle">
          Select a project to view and make changes.
        </p>
      </header>

      <!-- Live region for async status and results -->
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

      <div
        id="main-content"
        class="update-project_form-container"
        tabindex="-1"
        #mainContent
      >
        <form
          [formGroup]="projectForm"
          class="update-project_form"
          (ngSubmit)="onSubmit()"
          aria-describedby="form-help"
          novalidate
        >
          <p id="form-help" class="sr-only">
            All fields marked required must be filled out before updating.
          </p>

          <!-- Project select -->
          <div class="update-project_form-group">
            <label for="_id" class="project-update-page_form-label">
              Select Project <span aria-hidden="true">*</span>
            </label>

            <select
              id="_id"
              class="project-update-page_form-control"
              formControlName="_id"
              [attr.aria-required]="true"
              [attr.aria-invalid]="isInvalid('_id')"
              [attr.aria-describedby]="
                'project-select-help' +
                (isInvalid('_id') ? ' project-select-error' : '')
              "
              [disabled]="loadingProjects"
            >
              <option value="" disabled>
                {{
                  loadingProjects
                    ? 'Loading projects…'
                    : '-- Select a project --'
                }}
              </option>

              <!-- Using [ngValue] is fine with reactive forms; ensure _id is stable -->
              <option *ngFor="let p of projects" [ngValue]="p._id">
                {{ p.name }}
              </option>
            </select>

            <p id="project-select-help" class="field-hint">
              Choose a project to enable editing.
            </p>

            <p
              *ngIf="isInvalid('_id')"
              id="project-select-error"
              class="field-error"
              role="alert"
            >
              Please select a project.
            </p>
          </div>

          <!-- Name -->
          <div class="update-project_form-group">
            <label for="name" class="project-update_form-label">
              Project Name <span aria-hidden="true">*</span>
            </label>

            <input
              type="text"
              id="name"
              class="project-update_form-control"
              formControlName="name"
              autocomplete="off"
              [attr.aria-required]="true"
              [attr.aria-invalid]="isInvalid('name')"
              [attr.aria-describedby]="
                'name-help' + (isInvalid('name') ? ' name-error' : '')
              "
            />

            <p id="name-help" class="field-hint">3–100 characters.</p>

            <p
              *ngIf="isInvalid('name')"
              id="name-error"
              class="field-error"
              role="alert"
            >
              <span *ngIf="projectForm.get('name')?.errors?.['required']">
                Project name is required.
              </span>
              <span *ngIf="projectForm.get('name')?.errors?.['minlength']">
                Project name must be at least 3 characters.
              </span>
              <span *ngIf="projectForm.get('name')?.errors?.['maxlength']">
                Project name must be 100 characters or fewer.
              </span>
            </p>
          </div>

          <!-- Description -->
          <div class="update-project_form-group">
            <label for="description" class="project-update_form-label">
              Project Description
            </label>

            <textarea
              id="description"
              rows="6"
              class="project-update_form-control"
              formControlName="description"
              [attr.aria-invalid]="isInvalid('description')"
              [attr.aria-describedby]="
                'description-help' +
                (isInvalid('description') ? ' description-error' : '')
              "
            ></textarea>

            <p id="description-help" class="field-hint">
              Up to 500 characters.
            </p>

            <p
              *ngIf="isInvalid('description')"
              id="description-error"
              class="field-error"
              role="alert"
            >
              Description must be 500 characters or fewer.
            </p>
          </div>

          <!-- Read-only metadata (announce changes politely) -->
          <div
            class="project-update_meta"
            *ngIf="selectedProject"
            aria-live="polite"
            aria-atomic="true"
          >
            <p class="meta-line" *ngIf="selectedProject.dateCreated">
              <span class="meta-label">Created:</span>
              <span>{{ selectedProject.dateCreated }}</span>
            </p>
            <p class="meta-line" *ngIf="selectedProject.dateModified">
              <span class="meta-label">Last modified:</span>
              <span>{{ selectedProject.dateModified }}</span>
            </p>
          </div>

          <div class="actions">
            <button
              class="btn"
              type="submit"
              [disabled]="
                submitting ||
                loadingProjectDetails ||
                !projectForm.get('_id')?.value
              "
              [attr.aria-disabled]="
                submitting ||
                loadingProjectDetails ||
                !projectForm.get('_id')?.value
                  ? 'true'
                  : null
              "
            >
              <span *ngIf="!submitting">Update Project</span>
              <span *ngIf="submitting">Updating…</span>
            </button>

            <a class="btn" routerLink="/projects"> Return </a>
          </div>
        </form>
      </div>
    </section>
  `,
  styles: `
    .project-update_container {
      padding: 1rem;
      max-width: 860px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 1rem;
    }

    .project-update_title {
      color: var(--dark_blue);
      margin-bottom: 0.25rem;
    }

    .project-update_subtitle {
      color: var(--medium_blue);
      font-size: 0.95rem;
      font-style: italic;
      margin: 0;
    }

    .update-project_form-container {
      width: min(60%, 720px);
      border-radius: 0.5rem;
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.08);
      padding: 1.5rem;
      background: #fff;
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

    .update-project_form {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.25rem;
    }

    .update-project_form-group {
      display: flex;
      flex-direction: column;
    }

    .project-update-page_form-label,
    .project-update_form-label {
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: var(--medium_blue);
    }

    .project-update-page_form-control,
    .project-update_form-control {
      padding: 0.75rem 1rem;
      border: 1px solid var(--light_blue);
      border-radius: 0.25rem;
      font-size: 1rem;
      width: 100%;
      box-sizing: border-box;
    }

    /* Strong focus style (not just color) */
    .project-update-page_form-control:focus-visible,
    .project-update_form-control:focus-visible,
    .link:focus-visible,
    .btn:focus-visible {
      outline: 3px solid currentColor;
      outline-offset: 3px;
      border-radius: 0.25rem;
    }

    .field-hint {
      margin: 0.35rem 0 0;
      font-size: 0.9rem;
      color: var(--medium_blue);
    }

    .field-error {
      margin: 0.35rem 0 0;
      font-size: 0.95rem;
      font-weight: 600;
      color: #8a0000;
    }

    .project-update_meta {
      font-size: 0.95rem;
      color: var(--medium_blue);
    }

    .meta-line {
      margin: 0.25rem 0;
    }

    .meta-label {
      font-weight: 600;
      margin-right: 0.25rem;
    }

    .actions {
      display: flex;
      gap: 1rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .status {
      margin: 0.75rem auto 1rem;
      max-width: 720px;
    }
    .status.error {
      font-weight: 700;
    }
    .status.success {
      font-weight: 700;
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
})
export class ProjectUpdateComponent implements OnInit, OnDestroy {
  loadingProjects = false;
  loadingProjectDetails = false;
  submitting = false;

  statusMessage = '';
  statusKind: 'info' | 'success' | 'error' = 'info';

  projects: Project[] = [];
  selectedProject: Project | null = null;

  projectForm!: FormGroup;

  @ViewChild('mainContent', { static: true })
  mainContentRef!: ElementRef<HTMLElement>;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.projectForm = this.fb.group({
      _id: [{ value: null, disabled: true }, Validators.required],
      name: [
        { value: null, disabled: true },
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ],
      ],
      description: [{ value: null, disabled: true }, Validators.maxLength(500)],
    });

    this.setEditControlsEnabled(false);

    // Load project list
    this.loadingProjects = true;
    this.setStatus('Loading projects…', 'info');

    this.projectService
      .getProjects()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (projects) => {
          this.projects = [...projects].sort((a, b) =>
            (a.name || '').localeCompare(b.name || '')
          );

          this.loadingProjects = false;
          this.projectForm.get('_id')?.enable({ emitEvent: false });
          this.clearStatus();
        },
        error: () => {
          this.loadingProjects = false;
          this.setStatus('Unable to load projects.', 'error');
        },
      });

    // When a project is selected
    this.projectForm
      .get('_id')!
      .valueChanges.pipe(takeUntil(this.destroy$), distinctUntilChanged())
      .subscribe((id: number | null) => {
        if (id == null) {
          this.selectedProject = null;
          this.projectForm.patchValue(
            { name: null, description: null },
            { emitEvent: false }
          );
          this.setEditControlsEnabled(false);
          return;
        }

        this.loadingProjectDetails = true;
        this.setEditControlsEnabled(false);
        this.setStatus('Loading project details…', 'info');

        this.projectService
          .getProjectById(String(id))
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (project) => {
              this.selectedProject = project;
              this.patchFormFromProject(project);
              this.setEditControlsEnabled(true);

              this.loadingProjectDetails = false;
              this.clearStatus();

              // Move focus to the start of the form content after selection change
              queueMicrotask(() => this.mainContentRef?.nativeElement.focus());
            },
            error: () => {
              this.selectedProject = null;
              this.loadingProjectDetails = false;
              this.setEditControlsEnabled(false);
              this.setStatus('Unable to load the selected project.', 'error');
              queueMicrotask(() => this.mainContentRef?.nativeElement.focus());
            },
          });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isInvalid(controlName: '_id' | 'name' | 'description'): 'true' | null {
    const control = this.projectForm.get(controlName);
    if (!control) return null;
    return control.invalid && (control.dirty || control.touched)
      ? 'true'
      : null;
  }

  private patchFormFromProject(project: Project): void {
    this.projectForm.patchValue(
      {
        name: project.name ?? null,
        description: project.description ?? null,
      },
      { emitEvent: false }
    );
  }

  private setEditControlsEnabled(enabled: boolean): void {
    (['name', 'description'] as const).forEach((controlName) => {
      const control = this.projectForm.get(controlName);
      if (!control) return;

      if (enabled) {
        control.enable({ emitEvent: false });
      } else {
        control.disable({ emitEvent: false });
      }
    });
  }

  onSubmit(): void {
    if (this.submitting) return;

    // Mark all fields so errors are announced and visible
    this.projectForm.markAllAsTouched();

    if (this.projectForm.invalid || !this.selectedProject) {
      this.setStatus('Please fix the errors in the form.', 'error');
      queueMicrotask(() => this.mainContentRef?.nativeElement.focus());
      return;
    }

    const id = this.projectForm.get('_id')!.value as number;

    const updateProject: UpdateProjectDTO = {
      name: String(this.projectForm.get('name')!.value).trim(),
      description: this.projectForm.get('description')!.value ?? undefined,
      startDate: this.selectedProject.startDate,
      endDate: this.selectedProject.endDate,
    };

    this.submitting = true;
    this.setStatus('Updating project…', 'info');

    this.projectService
      .updateProject(String(id), updateProject)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.submitting = false;
          this.setStatus('Project updated successfully.', 'success');

          // Navigate after success; keep the message briefly for SR users
          queueMicrotask(() =>
            this.router.navigate(['/projects/projects-list'])
          );
        },
        error: () => {
          this.submitting = false;
          this.setStatus('Error updating project. Please try again.', 'error');
          queueMicrotask(() => this.mainContentRef?.nativeElement.focus());
        },
      });
  }

  private setStatus(message: string, kind: 'info' | 'success' | 'error'): void {
    this.statusMessage = message;
    this.statusKind = kind;
  }

  private clearStatus(): void {
    this.statusMessage = '';
    this.statusKind = 'info';
  }
}
