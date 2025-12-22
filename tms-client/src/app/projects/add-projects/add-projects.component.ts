import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AddProjectDTO } from '../project';
import { ProjectService } from '../projects.service';

@Component({
  selector: 'app-add-projects',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <section class="page" aria-labelledby="page-title">
      <a class="skip-link" href="#main-content">Skip to add project form</a>

      <header class="page-header">
        <h1 class="page_title" id="page-title">Add New Project</h1>
        <p class="page_subtitle" id="page-subtitle">
          Create a project by providing its name, description, and dates.
        </p>
      </header>

      <!-- Global messages -->
      <p
        *ngIf="statusMessage"
        class="status"
        [class.success]="statusKind === 'success'"
        [class.error]="statusKind === 'error'"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {{ statusMessage }}
      </p>

      <p
        *ngIf="errorMessage && !isSubmitting"
        class="status error"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        {{ errorMessage }}
      </p>

      <div id="main-content" class="card" tabindex="-1" #mainContent>
        <form
          [formGroup]="projectForm"
          (ngSubmit)="onSubmit()"
          class="form"
          novalidate
          aria-labelledby="page-title page-subtitle"
        >
          <!-- Form-level error summary (focusable + announced) -->
          <section
            *ngIf="showErrorSummary"
            #errorSummary
            class="error-summary"
            tabindex="-1"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            aria-label="Form errors"
          >
            <h2 class="error-summary__title">Please fix the following</h2>
            <ul class="error-summary__list">
              <li *ngIf="isFieldInvalid('name')">
                <a href="#" (click)="focusField($event, nameInput)">
                  Project name is required and must be at least 3 characters.
                </a>
              </li>
              <li *ngIf="dateRangeInvalid">
                <a href="#" (click)="focusField($event, endDateInput)">
                  End date must be on or after start date.
                </a>
              </li>
            </ul>
          </section>

          <!-- Name -->
          <div class="field">
            <label for="name" class="label">
              Project name <span aria-hidden="true">*</span>
            </label>

            <input
              #nameInput
              id="name"
              type="text"
              class="control"
              formControlName="name"
              autocomplete="off"
              placeholder="Enter project name"
              [attr.aria-required]="true"
              [attr.aria-invalid]="isFieldInvalid('name') ? 'true' : null"
              [attr.aria-describedby]="
                'name-hint' + (isFieldInvalid('name') ? ' name-error' : '')
              "
            />

            <p id="name-hint" class="hint">Minimum 3 characters.</p>

            <p
              *ngIf="isFieldInvalid('name')"
              id="name-error"
              class="field-error"
              role="alert"
            >
              <span *ngIf="nameCtrl.errors?.['required']"
                >Project name is required.</span
              >
              <span *ngIf="nameCtrl.errors?.['minlength']">
                Project name must be at least 3 characters.
              </span>
            </p>
          </div>

          <!-- Description -->
          <div class="field">
            <label for="description" class="label">Description</label>

            <textarea
              id="description"
              rows="4"
              class="control"
              formControlName="description"
              placeholder="Brief description of the project"
              [attr.aria-describedby]="'description-hint'"
            ></textarea>

            <p id="description-hint" class="hint">
              Optional. A short description helps others understand the scope.
            </p>
          </div>

          <!-- Dates -->
          <fieldset
            class="fieldset"
            [attr.aria-describedby]="
              dateRangeInvalid ? 'date-range-error' : null
            "
          >
            <legend class="legend">Project dates</legend>

            <div class="field">
              <label for="startDate" class="label">Start date</label>
              <input
                #startDateInput
                id="startDate"
                type="date"
                class="control"
                formControlName="startDate"
                [attr.aria-invalid]="
                  dateRangeInvalid && submitted ? 'true' : null
                "
              />
            </div>

            <div class="field">
              <label for="endDate" class="label">End date</label>
              <input
                #endDateInput
                id="endDate"
                type="date"
                class="control"
                formControlName="endDate"
                [attr.aria-invalid]="
                  dateRangeInvalid && submitted ? 'true' : null
                "
              />
            </div>

            <p
              *ngIf="dateRangeInvalid && submitted"
              id="date-range-error"
              class="field-error"
              role="alert"
            >
              End date must be on or after start date.
            </p>
          </fieldset>

          <div class="actions">
            <button
              class="btn"
              type="submit"
              [disabled]="isSubmitting"
              [attr.aria-disabled]="isSubmitting ? 'true' : null"
            >
              <span *ngIf="!isSubmitting">Create project</span>
              <span *ngIf="isSubmitting">Creating…</span>
            </button>

            <a class="link" routerLink="/projects/projects-list">Return</a>
          </div>
        </form>
      </div>
    </section>
  `,
  styles: `
    .page {
      max-width: 720px;
      margin: 0 auto;
      padding: 1rem;
    }

    .page-header { margin-bottom: 1rem; }

    .page_title { margin: 0 0 0.25rem 0; }
    .page_subtitle {
      margin: 0;
      color: #666;
      font-weight: 400;
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
      background: #fff;
    }

    .card {
      background: var(--bg_color, #fff);
      border-radius: 0.75rem;
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.08);
      padding: 1.5rem;
    }

    #main-content:focus {
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

    .label { font-weight: 700; }

    .control {
      padding: 0.6rem 0.75rem;
      border: 1px solid #ccc;
      border-radius: 0.35rem;
      font-size: 1rem;
    }

    .control:focus-visible,
    .btn:focus-visible,
    .link:focus-visible,
    .error-summary a:focus-visible {
      outline: 3px solid currentColor;
      outline-offset: 3px;
      border-radius: 0.35rem;
    }

    .hint {
      margin: 0;
      color: #555;
      font-size: 0.95rem;
    }

    .status { margin: 0.75rem 0; }
    .status.success { font-weight: 800; }
    .status.error { font-weight: 800; }

    .field-error {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 800;
      color: #8a0000;
    }

    .fieldset {
      border: 1px solid #ccc;
      border-radius: 0.75rem;
      padding: 0.75rem;
      margin: 0;
      display: grid;
      gap: 0.75rem;
    }

    .legend {
      font-weight: 700;
      padding: 0 0.25rem;
    }

    .actions {
      display: flex;
      gap: 1rem;
      align-items: center;
      flex-wrap: wrap;
      margin-top: 0.25rem;
    }

    .btn {
      background: var(--medium_blue);
      color: #fff;
      border: 0;
      padding: 0.65rem 1.1rem;
      border-radius: 0.35rem;
      cursor: pointer;
    }

    .btn[disabled] {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .link {
      text-decoration: none;
      color: var(--medium_blue);
    }
    .link:hover { text-decoration: underline; }

    .error-summary {
      border: 2px solid #8a0000;
      border-radius: 0.75rem;
      padding: 0.75rem;
      background: #fff;
    }

    .error-summary__title {
      margin: 0 0 0.5rem 0;
      font-size: 1rem;
    }

    .error-summary__list {
      margin: 0;
      padding-left: 1.25rem;
    }

    .error-summary a {
      color: inherit;
      text-decoration: underline;
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
export class AddProjectsComponent implements OnDestroy {
  @ViewChild('errorSummary') errorSummaryEl?: ElementRef<HTMLElement>;
  @ViewChild('mainContent', { static: true })
  mainContentRef!: ElementRef<HTMLElement>;

  submitted = false;
  isSubmitting = false;

  statusMessage = '';
  statusKind: 'info' | 'success' | 'error' = 'info';
  errorMessage = '';

  showErrorSummary = false;

  projectForm: FormGroup = this.fb.group(
    {
      name: [null, [Validators.required, Validators.minLength(3)]],
      description: [null],
      startDate: [null],
      endDate: [null],
    },
    { validators: [AddProjectsComponent.dateRangeValidator] }
  );

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly projectService: ProjectService
  ) {}

  get nameCtrl(): AbstractControl {
    return this.projectForm.get('name')!;
  }

  get startDateCtrl(): AbstractControl {
    return this.projectForm.get('startDate')!;
  }

  get endDateCtrl(): AbstractControl {
    return this.projectForm.get('endDate')!;
  }

  get dateRangeInvalid(): boolean {
    return !!this.projectForm.errors?.['dateRangeInvalid'];
  }

  static dateRangeValidator(group: AbstractControl): ValidationErrors | null {
    const start = group.get('startDate')?.value;
    const end = group.get('endDate')?.value;

    if (!start || !end) return null;

    const startDate = new Date(`${start}T00:00:00`);
    const endDate = new Date(`${end}T00:00:00`);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()))
      return null;

    return endDate >= startDate ? null : { dateRangeInvalid: true };
  }

  isFieldInvalid(controlName: 'name'): boolean {
    const c = this.projectForm.get(controlName);
    return !!c && c.invalid && (c.touched || this.submitted);
  }

  focusField(event: Event, el: HTMLElement): void {
    event.preventDefault();
    el.focus();
  }

  private showAndFocusErrorSummary(): void {
    this.showErrorSummary = true;
    queueMicrotask(() => this.errorSummaryEl?.nativeElement?.focus());
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.statusMessage = '';
    this.statusKind = 'info';

    this.projectForm.markAllAsTouched();

    if (this.projectForm.invalid) {
      this.showAndFocusErrorSummary();
      return;
    }

    this.isSubmitting = true;
    this.showErrorSummary = false;
    this.setStatus('Creating project…', 'info');

    const startRaw = this.startDateCtrl.value as string | null;
    const endRaw = this.endDateCtrl.value as string | null;

    const startDateIso = startRaw
      ? new Date(`${startRaw}T00:00:00`).toISOString()
      : null;
    const endDateIso = endRaw
      ? new Date(`${endRaw}T00:00:00`).toISOString()
      : null;

    const newProject: AddProjectDTO = {
      name: String(this.nameCtrl.value).trim(),
      description: this.projectForm.get('description')?.value ?? null,
      startDate: startDateIso,
      endDate: endDateIso,
      dateCreated: new Date().toISOString(),
    };

    this.projectService
      .addProject(newProject)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.setStatus('Project created successfully.', 'success');
          queueMicrotask(() =>
            this.router.navigate(['/projects/projects-list'])
          );
        },
        error: () => {
          this.isSubmitting = false;
          this.setError('Error creating project. Please try again.');
          this.showAndFocusErrorSummary();
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
}
