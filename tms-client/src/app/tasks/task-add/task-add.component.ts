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
import { Subject, takeUntil } from 'rxjs';
import { TaskService } from '../tasks.service';
import { AddTaskDTO } from '../task';
import { Project } from '../../projects/project';
import { ProjectService } from '../../projects/projects.service';

@Component({
  selector: 'app-task-add',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <section class="task-add-page" aria-labelledby="page-title">
      <a class="skip-link" href="#main-content">Skip to add task form</a>

      <header class="page-header">
        <h1 id="page-title" class="task-add-page_title">Add new task</h1>
        <p class="task-add-page_subtitle">
          Fill in the details to create a new task.
        </p>
      </header>

      <!-- Project loading + global messages -->
      <p
        *ngIf="loadingProjects"
        class="status"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        Loading projects…
      </p>

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
        class="add-task-page_card"
        tabindex="-1"
        #mainContent
      >
        <form
          [formGroup]="taskForm"
          class="add-task-page_form"
          (ngSubmit)="onSubmit()"
          aria-describedby="form-help"
          novalidate
        >
          <p id="form-help" class="sr-only">
            Required fields are marked with an asterisk. Errors will be
            announced after you interact with a field or after you submit.
          </p>

          <!-- Title -->
          <div class="task-add-page_form-group">
            <label for="title" class="task-add-page_form-label">
              Task name <span aria-hidden="true">*</span>
            </label>

            <input
              type="text"
              id="title"
              class="task-add-page_form-control"
              formControlName="title"
              autocomplete="off"
              [attr.aria-required]="true"
              [attr.aria-invalid]="isInvalid('title')"
              [attr.aria-describedby]="
                'title-hint' + (isInvalid('title') ? ' title-error' : '')
              "
            />

            <p id="title-hint" class="field-hint">3–100 characters.</p>

            <p
              *ngIf="isInvalid('title')"
              id="title-error"
              class="field-error"
              role="alert"
            >
              <span *ngIf="taskForm.get('title')?.errors?.['required']">
                Task name is required.
              </span>
              <span *ngIf="taskForm.get('title')?.errors?.['minlength']">
                Task name must be at least 3 characters long.
              </span>
              <span *ngIf="taskForm.get('title')?.errors?.['maxlength']">
                Task name cannot exceed 100 characters.
              </span>
            </p>
          </div>

          <!-- Description -->
          <div class="task-add-page_form-group full-width">
            <label for="description" class="task-add-page_form-label">
              Task description <span aria-hidden="true">*</span>
            </label>

            <textarea
              id="description"
              rows="8"
              class="task-add-page_form-control"
              formControlName="description"
              [attr.aria-required]="true"
              [attr.aria-invalid]="isInvalid('description')"
              [attr.aria-describedby]="
                'desc-hint' + (isInvalid('description') ? ' desc-error' : '')
              "
            ></textarea>

            <p id="desc-hint" class="field-hint">
              Required. Up to 500 characters.
            </p>

            <p
              *ngIf="isInvalid('description')"
              id="desc-error"
              class="field-error"
              role="alert"
            >
              <span *ngIf="taskForm.get('description')?.errors?.['required']">
                Task description is required.
              </span>
              <span *ngIf="taskForm.get('description')?.errors?.['maxlength']">
                Task description cannot exceed 500 characters.
              </span>
            </p>
          </div>

          <!-- Status -->
          <div class="task-add-page_form-group">
            <label for="status" class="task-add-page_form-label">
              Status <span aria-hidden="true">*</span>
            </label>

            <select
              id="status"
              class="task-add-page_form-control"
              formControlName="status"
              [attr.aria-required]="true"
              [attr.aria-invalid]="isInvalid('status')"
              [attr.aria-describedby]="
                isInvalid('status') ? 'status-error' : null
              "
            >
              <option value="" disabled>Select status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

            <p
              *ngIf="isInvalid('status')"
              id="status-error"
              class="field-error"
              role="alert"
            >
              Task status is required.
            </p>
          </div>

          <!-- Priority -->
          <div class="task-add-page_form-group">
            <label for="priority" class="task-add-page_form-label">
              Priority <span aria-hidden="true">*</span>
            </label>

            <select
              id="priority"
              class="task-add-page_form-control"
              formControlName="priority"
              [attr.aria-required]="true"
              [attr.aria-invalid]="isInvalid('priority')"
              [attr.aria-describedby]="
                isInvalid('priority') ? 'priority-error' : null
              "
            >
              <option value="" disabled>Select priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>

            <p
              *ngIf="isInvalid('priority')"
              id="priority-error"
              class="field-error"
              role="alert"
            >
              Task priority is required.
            </p>
          </div>

          <!-- Due Date -->
          <div class="task-add-page_form-group">
            <label for="dueDate" class="task-add-page_form-label">
              Due date <span aria-hidden="true">*</span>
            </label>

            <input
              type="datetime-local"
              id="dueDate"
              class="task-add-page_form-control"
              formControlName="dueDate"
              [attr.aria-required]="true"
              [attr.aria-invalid]="isInvalid('dueDate')"
              [attr.aria-describedby]="
                isInvalid('dueDate') ? 'due-error' : 'due-hint'
              "
            />

            <p id="due-hint" class="field-hint">Local time.</p>

            <p
              *ngIf="isInvalid('dueDate')"
              id="due-error"
              class="field-error"
              role="alert"
            >
              Task due date is required.
            </p>
          </div>

          <!-- Project Dropdown -->
          <div class="task-add-page_form-group full-width">
            <label for="project" class="task-add-page_form-label">
              Project <span aria-hidden="true">*</span>
            </label>

            <select
              id="project"
              class="task-add-page_form-control"
              formControlName="project"
              [disabled]="loadingProjects"
              [attr.aria-required]="true"
              [attr.aria-invalid]="isInvalid('project')"
              [attr.aria-describedby]="
                'project-hint' + (isInvalid('project') ? ' project-error' : '')
              "
            >
              <option value="" disabled>
                {{
                  loadingProjects
                    ? 'Loading projects…'
                    : '-- Select a project --'
                }}
              </option>

              <option
                *ngFor="let project of projects"
                [value]="project.projectId"
              >
                {{ project.name }} ({{ project.projectId }})
              </option>
            </select>

            <p id="project-hint" class="field-hint">
              The task will be created under the selected project.
            </p>

            <p
              *ngIf="isInvalid('project')"
              id="project-error"
              class="field-error"
              role="alert"
            >
              Task project is required.
            </p>
          </div>

          <!-- Actions -->
          <div class="actions full-width">
            <button
              type="submit"
              class="btn task-add-page_btn"
              [disabled]="submitting || loadingProjects"
              [attr.aria-disabled]="
                submitting || loadingProjects ? 'true' : null
              "
            >
              <span *ngIf="!submitting">Add task</span>
              <span *ngIf="submitting">Adding…</span>
            </button>

            <a class="task-add-page_link link" routerLink="/tasks">Return</a>
          </div>
        </form>
      </div>
    </section>
  `,
  styles: `
    :host { display: block; }

    .task-add-page {
      max-width: 900px;
      margin: 0 auto;
      padding: 1.5rem;
    }

    .page-header { margin-bottom: 1rem; }

    .task-add-page_title {
      text-align: center;
      color: var(--dark_blue);
      margin-bottom: 0.25rem;
    }

    .task-add-page_subtitle {
      text-align: center;
      color: var(--medium_blue);
      font-size: 0.95rem;
      margin: 0;
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

    .add-task-page_card {
      background-color: var(--bg_color, #ffffff);
      border-radius: 0.75rem;
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.08);
      padding: 1.5rem;
    }

    .add-task-page_form {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.25rem;
    }

    .task-add-page_form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .task-add-page_form-label {
      font-weight: 700;
      margin: 0;
    }

    .task-add-page_form-control {
      width: 100%;
      padding: 0.6rem 0.75rem;
      border: 2px solid var(--medium_blue);
      border-radius: 0.35rem;
      box-sizing: border-box;
      font-size: 1rem;
    }

    textarea.task-add-page_form-control { resize: vertical; }

    .task-add-page_form-control:focus-visible,
    .btn:focus-visible,
    .link:focus-visible {
      outline: 3px solid currentColor;
      outline-offset: 3px;
      border-radius: 0.35rem;
    }

    .field-hint {
      margin: 0;
      font-size: 0.95rem;
      color: var(--medium_blue);
    }

    .field-error {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 800;
      color: #8a0000;
    }

    .actions {
      display: flex;
      gap: 1rem;
      align-items: center;
      flex-wrap: wrap;
      margin-top: 0.25rem;
    }

    .task-add-page_btn {
      padding: 0.65rem 1.2rem;
      border-radius: 0.35rem;
    }

    .task-add-page_link {
      color: var(--medium_blue);
      text-decoration: none;
      display: inline-block;
    }
    .task-add-page_link:hover { text-decoration: underline; }

    .status { margin: 0.75rem 0; }
    .status.error { font-weight: 800; }
    .status.success { font-weight: 800; }

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

    @media (min-width: 768px) {
      .add-task-page_form {
        grid-template-columns: repeat(2, 1fr);
        column-gap: 2rem;
      }
      .full-width { grid-column: 1 / -1; }
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
export class TaskAddComponent implements OnInit, OnDestroy {
  projects: Project[] = [];
  loadingProjects = false;

  submitting = false;

  statusMessage = '';
  statusKind: 'info' | 'success' | 'error' = 'info';
  errorMessage = '';

  taskForm: FormGroup = this.fb.group({
    title: [
      null,
      [Validators.required, Validators.minLength(3), Validators.maxLength(100)],
    ],
    description: [null, [Validators.required, Validators.maxLength(500)]],
    status: [null, Validators.required],
    priority: [null, Validators.required],
    dueDate: [null, Validators.required],
    project: [null, Validators.required],
  });

  @ViewChild('mainContent', { static: true })
  mainContentRef!: ElementRef<HTMLElement>;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly taskService: TaskService,
    private readonly projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isInvalid(
    controlName:
      | 'title'
      | 'description'
      | 'status'
      | 'priority'
      | 'dueDate'
      | 'project'
  ): 'true' | null {
    const control = this.taskForm.get(controlName);
    if (!control) return null;
    return control.invalid && (control.dirty || control.touched)
      ? 'true'
      : null;
  }

  private loadProjects(): void {
    this.loadingProjects = true;
    this.clearMessages();
    this.setStatus('Loading projects…', 'info');

    this.projectService
      .getProjects()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (projects: Project[]) => {
          this.projects = Array.isArray(projects) ? projects : [];
          this.loadingProjects = false;

          if (this.projects.length === 0) {
            this.setStatus(
              'No projects available. You may need to create a project first.',
              'error'
            );
          } else {
            this.clearStatus();
          }
        },
        error: (err: any) => {
          this.loadingProjects = false;
          const msg = (err?.message ?? '').toString().trim();
          this.setError(`Error retrieving projects.${msg ? ' ' + msg : ''}`);
          console.error('Error occurred while retrieving projects:', err);
        },
      });
  }

  onSubmit(): void {
    this.taskForm.markAllAsTouched();

    if (this.submitting) return;

    if (this.taskForm.invalid) {
      this.setError('Please fix the errors in the form.');
      queueMicrotask(() => this.mainContentRef?.nativeElement.focus());
      return;
    }

    const dueRaw = this.taskForm.get('dueDate')!.value;
    const dueDateIso = new Date(dueRaw).toISOString();

    const newTask: AddTaskDTO = {
      title: String(this.taskForm.get('title')!.value).trim(),
      description: String(this.taskForm.get('description')!.value).trim(),
      status: this.taskForm.get('status')!.value,
      priority: this.taskForm.get('priority')!.value,
      dueDate: dueDateIso,
    };

    const projectId = String(this.taskForm.get('project')!.value);

    this.submitting = true;
    this.clearMessages();
    this.setStatus('Creating task…', 'info');

    this.taskService
      // If your service expects a number, change String(...) to Number(...)
      .addTask(newTask, projectId as any)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.submitting = false;
          this.setStatus('Task created successfully.', 'success');
          queueMicrotask(() => this.router.navigate(['/tasks']));
        },
        error: (err: any) => {
          this.submitting = false;
          const msg = (err?.message ?? '').toString().trim();
          this.setError(`Error creating task.${msg ? ' ' + msg : ''}`);
          console.error('Error creating task', err);
          queueMicrotask(() => this.mainContentRef?.nativeElement.focus());
        },
      });
  }

  private setStatus(message: string, kind: 'info' | 'success' | 'error'): void {
    this.statusMessage = message;
    this.statusKind = kind;
  }

  private setError(message: string): void {
    this.errorMessage = message;
    this.setStatus(message, 'error');
  }

  private clearStatus(): void {
    this.statusMessage = '';
    this.statusKind = 'info';
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.clearStatus();
  }
}
