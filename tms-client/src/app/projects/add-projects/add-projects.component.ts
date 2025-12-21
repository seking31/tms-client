import { Component, ElementRef, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { AddProjectDTO } from '../project';
import { ProjectService } from '../projects.service';

@Component({
  selector: 'app-add-projects',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  template: `
    <main class="task-add-page">
      <h1 class="task-add-page_title" id="page-title">Add New Project</h1>
      <p class="task-add-page_subtitle" id="page-subtitle">
        Create a project by providing its name, description, and dates.
      </p>

      <!-- Live region for submission outcomes -->
      <div class="status" aria-live="polite" aria-atomic="true" role="status">
        <p *ngIf="successMessage" class="success">{{ successMessage }}</p>
        <p *ngIf="errorMessage" class="error">{{ errorMessage }}</p>
      </div>

      <form
        [formGroup]="projectForm"
        (ngSubmit)="onSubmit()"
        novalidate
        aria-labelledby="page-title page-subtitle"
      >
        <!-- Form-level error summary (announced + focusable) -->
        <div
          *ngIf="showErrorSummary"
          #errorSummary
          class="error-summary"
          tabindex="-1"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <h2 class="error-summary__title">Please fix the following</h2>
          <ul class="error-summary__list">
            <li *ngIf="nameCtrl.invalid">
              <a href="#" (click)="focusField($event, nameInput)"
                >Project Name is required.</a
              >
            </li>
            <li *ngIf="projectForm.errors?.dateRangeInvalid">
              <a href="#" (click)="focusField($event, endDateInput)"
                >End Date must be on or after Start Date.</a
              >
            </li>
          </ul>
        </div>

        <div class="task-add-page_form-group">
          <label for="name" class="task-add-page_form-label"
            >Project Name</label
          >

          <input
            #nameInput
            id="name"
            type="text"
            class="task-add-page_form-control"
            formControlName="name"
            placeholder="Enter project name"
            autocomplete="off"
            [attr.aria-invalid]="
              nameCtrl.invalid && (nameCtrl.touched || submitted)
                ? 'true'
                : null
            "
            [attr.aria-describedby]="
              nameCtrl.invalid && (nameCtrl.touched || submitted)
                ? 'name-hint name-error'
                : 'name-hint'
            "
          />

          <small id="name-hint" class="hint">Minimum 3 characters.</small>

          <small
            id="name-error"
            class="error"
            *ngIf="nameCtrl.invalid && (nameCtrl.touched || submitted)"
          >
            <span *ngIf="nameCtrl.errors?.['required']"
              >Project Name is required.</span
            >
            <span *ngIf="nameCtrl.errors?.['minlength']"
              >Project Name must be at least 3 characters.</span
            >
          </small>
        </div>

        <div class="task-add-page_form-group">
          <label for="description" class="task-add-page_form-label"
            >Description</label
          >

          <textarea
            id="description"
            rows="4"
            class="task-add-page_form-control"
            formControlName="description"
            placeholder="Brief description of the project"
            [attr.aria-describedby]="'description-hint'"
          ></textarea>

          <small id="description-hint" class="hint">
            Optional. A short description helps others understand the scope.
          </small>
        </div>

        <fieldset class="date-fieldset">
          <legend class="date-legend">Project dates</legend>

          <div class="task-add-page_form-group">
            <label for="startDate" class="task-add-page_form-label"
              >Start Date</label
            >

            <input
              #startDateInput
              id="startDate"
              type="date"
              class="task-add-page_form-control"
              formControlName="startDate"
              [attr.aria-invalid]="
                dateRangeInvalid && (submitted || startDateCtrl.touched)
                  ? 'true'
                  : null
              "
              [attr.aria-describedby]="
                dateRangeInvalid ? 'date-range-error' : null
              "
            />
          </div>

          <div class="task-add-page_form-group">
            <label for="endDate" class="task-add-page_form-label"
              >End Date</label
            >

            <input
              #endDateInput
              id="endDate"
              type="date"
              class="task-add-page_form-control"
              formControlName="endDate"
              [attr.aria-invalid]="
                dateRangeInvalid && (submitted || endDateCtrl.touched)
                  ? 'true'
                  : null
              "
              [attr.aria-describedby]="
                dateRangeInvalid ? 'date-range-error' : null
              "
            />
          </div>

          <small
            id="date-range-error"
            class="error"
            *ngIf="dateRangeInvalid && submitted"
          >
            End Date must be on or after Start Date.
          </small>
        </fieldset>

        <button
          class="btn task-add-page_btn"
          type="submit"
          [disabled]="isSubmitting"
          [attr.aria-disabled]="isSubmitting ? 'true' : null"
        >
          <span *ngIf="!isSubmitting">Submit</span>
          <span *ngIf="isSubmitting">Submitting…</span>
        </button>
      </form>
    </main>
  `,
  styles: `
    .task-add-page {
      max-width: 720px;
      margin: 0 auto;
      padding: 1rem;
    }

    .task-add-page_title {
      margin: 0 0 0.25rem 0;
    }

    .task-add-page_subtitle {
      margin: 0 0 1rem 0;
      color: #666;
      font-weight: 400;
    }

    .task-add-page_form-group {
      margin-bottom: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .task-add-page_form-label {
      font-weight: 600;
    }

    .task-add-page_form-control {
      padding: 0.5rem 0.75rem;
      border: 1px solid #ccc;
      border-radius: 4px;
    }

    /* Strong visible focus for keyboard users */
    .task-add-page_form-control:focus-visible {
      outline: 3px solid currentColor;
      outline-offset: 3px;
    }

    .task-add-page_btn {
      background: var(--medium_blue);
      color: #fff;
      border: 0;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    }

    .task-add-page_btn[aria-disabled='true'],
    .task-add-page_btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .hint {
      color: #555;
      margin: 0;
      font-size: 0.875rem;
    }

    .success {
      color: #1abc9c;
      margin: 0.75rem 0;
    }

    .error {
      color: #e74c3c;
      margin: 0.25rem 0 0 0;
      font-size: 0.875rem;
    }

    .status {
      min-height: 1.25rem;
    }

    .date-fieldset {
      border: 1px solid #ccc;
      border-radius: 6px;
      padding: 0.75rem;
      margin: 0 0 1rem 0;
    }

    .date-legend {
      font-weight: 600;
      padding: 0 0.25rem;
    }

    .error-summary {
      border: 2px solid #e74c3c;
      border-radius: 6px;
      padding: 0.75rem;
      margin: 0 0 1rem 0;
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

    .error-summary a:focus-visible {
      outline: 3px solid currentColor;
      outline-offset: 3px;
      border-radius: 4px;
    }
  `,
})
export class AddProjectsComponent {
  @ViewChild('errorSummary') errorSummaryEl?: ElementRef<HTMLElement>;

  submitted = false;
  isSubmitting = false;

  successMessage = '';
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

    // type="date" returns "YYYY-MM-DD" (local date). Compare as dates safely.
    const startDate = new Date(`${start}T00:00:00`);
    const endDate = new Date(`${end}T00:00:00`);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()))
      return null;

    return endDate >= startDate ? null : { dateRangeInvalid: true };
  }

  focusField(event: Event, el: HTMLElement): void {
    event.preventDefault();
    el.focus();
  }

  private showAndFocusErrorSummary(): void {
    this.showErrorSummary = true;
    queueMicrotask(() => {
      this.errorSummaryEl?.nativeElement?.focus();
    });
  }

  onSubmit(): void {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      this.showAndFocusErrorSummary();
      return;
    }

    this.isSubmitting = true;
    this.showErrorSummary = false;

    // Use start/end as ISO only if they exist; otherwise omit (or send null)
    const startRaw = this.startDateCtrl.value as string | null;
    const endRaw = this.endDateCtrl.value as string | null;

    const startDateIso = startRaw
      ? new Date(`${startRaw}T00:00:00`).toISOString()
      : null;
    const endDateIso = endRaw
      ? new Date(`${endRaw}T00:00:00`).toISOString()
      : null;

    const newProject: AddProjectDTO = {
      name: this.nameCtrl.value,
      description: this.projectForm.controls['description'].value,
      startDate: startDateIso,
      endDate: endDateIso,
      // Always set dateCreated to "now" (previous code tried to read an unset control)
      dateCreated: new Date().toISOString(),
    };

    this.projectService.addProject(newProject).subscribe({
      next: () => {
        this.successMessage = 'Project created successfully!';
        this.isSubmitting = false;

        // Navigation will typically change the page; keep message for screen readers briefly if needed.
        this.router.navigate(['/projects/projects-list']);
      },
      error: () => {
        this.errorMessage = 'Error creating project. Please try again.';
        this.isSubmitting = false;
        this.showAndFocusErrorSummary();
      },
    });
  }
}
