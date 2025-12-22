import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
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
    <section class="page" aria-labelledby="page-title">
      <a class="skip-link" href="#main-content">Skip to add task form</a>

      <header class="page-header">
        <h1 class="page_title" id="page-title">Add New Task</h1>
        <p class="page_subtitle" id="page-subtitle">
          Fill in the details to create a new task.
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
        *ngIf="errorMessage && !submitting"
        class="status error"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        {{ errorMessage }}
      </p>

      <div id="main-content" class="card" tabindex="-1" #mainContent>
        <form
          [formGroup]="taskForm"
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
              <li *ngIf="isFieldInvalid('title')">
                <a href="#" (click)="focusField($event, titleInput)">
                  Task name is required and must be 3–100 characters.
                </a>
              </li>
              <li *ngIf="isFieldInvalid('description')">
                <a href="#" (click)="focusField($event, descriptionInput)">
                  Task description is required (max 500 characters).
                </a>
              </li>
              <li *ngIf="isFieldInvalid('status')">
                <a href="#" (click)="focusField($event, statusInput)">
                  Task status is required.
                </a>
              </li>
              <li *ngIf="isFieldInvalid('priority')">
                <a href="#" (click)="focusField($event, priorityInput)">
                  Task priority is required.
                </a>
              </li>
              <li *ngIf="isFieldInvalid('dueDate')">
                <a href="#" (click)="focusField($event, dueDateInput)">
                  Task due date is required.
                </a>
              </li>
              <li *ngIf="isFieldInvalid('project')">
                <a href="#" (click)="focusField($event, projectInput)">
                  Task project is required.
                </a>
              </li>
              <li *ngIf="dueDateInvalid">
                <a href="#" (click)="focusField($event, dueDateInput)">
                  Due date must be a valid date/time.
                </a>
              </li>
            </ul>
          </section>

          <!-- Title -->
          <div class="field">
            <label for="title" class="label">
              Task name <span aria-hidden="true">*</span>
            </label>

            <input
              #titleInput
              id="title"
              type="text"
              class="control"
              formControlName="title"
              autocomplete="off"
              placeholder="Enter task name"
              [attr.aria-required]="true"
              [attr.aria-invalid]="isFieldInvalid('title') ? 'true' : null"
              [attr.aria-describedby]="
                'title-hint' + (isFieldInvalid('title') ? ' title-error' : '')
              "
            />

            <p id="title-hint" class="hint">3–100 characters.</p>

            <p
              *ngIf="isFieldInvalid('title')"
              id="title-error"
              class="field-error"
              role="alert"
            >
              <span *ngIf="titleCtrl.errors?.['required']">
                Task name is required.
              </span>
              <span *ngIf="titleCtrl.errors?.['minlength']">
                Task name must be at least 3 characters long.
              </span>
              <span *ngIf="titleCtrl.errors?.['maxlength']">
                Task name cannot exceed 100 characters.
              </span>
            </p>
          </div>

          <!-- Description -->
          <div class="field">
            <label for="description" class="label">
              Task description <span aria-hidden="true">*</span>
            </label>

            <textarea
              #descriptionInput
              id="description"
              rows="6"
              class="control"
              formControlName="description"
              placeholder="Describe the task"
              [attr.aria-required]="true"
              [attr.aria-invalid]="
                isFieldInvalid('description') ? 'true' : null
              "
              [attr.aria-describedby]="
                'desc-hint' +
                (isFieldInvalid('description') ? ' desc-error' : '')
              "
            ></textarea>

            <p id="desc-hint" class="hint">Required. Up to 500 characters.</p>

            <p
              *ngIf="isFieldInvalid('description')"
              id="desc-error"
              class="field-error"
              role="alert"
            >
              <span *ngIf="descriptionCtrl.errors?.['required']">
                Task description is required.
              </span>
              <span *ngIf="descriptionCtrl.errors?.['maxlength']">
                Task description cannot exceed 500 characters.
              </span>
            </p>
          </div>

          <!-- Status -->
          <div class="field">
            <label for="status" class="label">
              Status <span aria-hidden="true">*</span>
            </label>

            <select
              #statusInput
              id="status"
              class="control"
              formControlName="status"
              [attr.aria-required]="true"
              [attr.aria-invalid]="isFieldInvalid('status') ? 'true' : null"
              [attr.aria-describedby]="
                isFieldInvalid('status') ? 'status-error' : null
              "
            >
              <option value="" disabled>Select status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

            <p
              *ngIf="isFieldInvalid('status')"
              id="status-error"
              class="field-error"
              role="alert"
            >
              Task status is required.
            </p>
          </div>

          <!-- Priority -->
          <div class="field">
            <label for="priority" class="label">
              Priority <span aria-hidden="true">*</span>
            </label>

            <select
              #priorityInput
              id="priority"
              class="control"
              formControlName="priority"
              [attr.aria-required]="true"
              [attr.aria-invalid]="isFieldInvalid('priority') ? 'true' : null"
              [attr.aria-describedby]="
                isFieldInvalid('priority') ? 'priority-error' : null
              "
            >
              <option value="" disabled>Select priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>

            <p
              *ngIf="isFieldInvalid('priority')"
              id="priority-error"
              class="field-error"
              role="alert"
            >
              Task priority is required.
            </p>
          </div>

          <!-- Due date -->
          <div class="field">
            <label for="dueDate" class="label">
              Due date <span aria-hidden="true">*</span>
            </label>

            <input
              #dueDateInput
              id="dueDate"
              type="datetime-local"
              class="control"
              formControlName="dueDate"
              [attr.aria-required]="true"
              [attr.aria-invalid]="
                isFieldInvalid('dueDate') || (submitted && dueDateInvalid)
                  ? 'true'
                  : null
              "
              [attr.aria-describedby]="
                submitted && dueDateInvalid
                  ? 'due-invalid-error'
                  : isFieldInvalid('dueDate')
                  ? 'due-error'
                  : 'due-hint'
              "
            />

            <p id="due-hint" class="hint">Local time.</p>

            <p
              *ngIf="isFieldInvalid('dueDate')"
              id="due-error"
              class="field-error"
              role="alert"
            >
              Task due date is required.
            </p>

            <p
              *ngIf="submitted && dueDateInvalid"
              id="due-invalid-error"
              class="field-error"
              role="alert"
            >
              Due date must be a valid date/time.
            </p>
          </div>

          <!-- Project -->
          <div class="field">
            <label for="project" class="label">
              Project <span aria-hidden="true">*</span>
            </label>

            <select
              #projectInput
              id="project"
              class="control"
              formControlName="project"
              [disabled]="loadingProjects"
              [attr.aria-required]="true"
              [attr.aria-invalid]="isFieldInvalid('project') ? 'true' : null"
              [attr.aria-describedby]="
                'project-hint' +
                (isFieldInvalid('project') ? ' project-error' : '')
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

            <p id="project-hint" class="hint">
              The task will be created under the selected project.
            </p>

            <p
              *ngIf="isFieldInvalid('project')"
              id="project-error"
              class="field-error"
              role="alert"
            >
              Task project is required.
            </p>
          </div>

          <div class="actions">
            <button
              class="btn"
              type="submit"
              [disabled]="submitting || loadingProjects"
              [attr.aria-disabled]="
                submitting || loadingProjects ? 'true' : null
              "
            >
              <span *ngIf="!submitting">Add task</span>
              <span *ngIf="submitting">Adding…</span>
            </button>

            <a class="btn" routerLink="/tasks">Return</a>
          </div>
        </form>
      </div>
    </section>
  `,
  styles: `
    :host { display: block; }

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
      box-sizing: border-box;
      width: 100%;
    }

    textarea.control { resize: vertical; }

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
export class TaskAddComponent implements OnInit, OnDestroy {
  @ViewChild('errorSummary') errorSummaryEl?: ElementRef<HTMLElement>;
  @ViewChild('mainContent', { static: true })
  mainContentRef!: ElementRef<HTMLElement>;

  projects: Project[] = [];
  loadingProjects = false;

  submitting = false;
  submitted = false;

  statusMessage = '';
  statusKind: 'info' | 'success' | 'error' = 'info';
  errorMessage = '';

  showErrorSummary = false;

  taskForm: FormGroup = this.fb.group(
    {
      title: [
        null,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ],
      ],
      description: [null, [Validators.required, Validators.maxLength(500)]],
      status: [null, Validators.required],
      priority: [null, Validators.required],
      dueDate: [null, Validators.required],
      project: [null, Validators.required],
    },
    { validators: [TaskAddComponent.dueDateValidator] }
  );

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly taskService: TaskService,
    private readonly projectService: ProjectService
  ) {}

  get titleCtrl(): AbstractControl {
    return this.taskForm.get('title')!;
  }

  get descriptionCtrl(): AbstractControl {
    return this.taskForm.get('description')!;
  }

  get dueDateCtrl(): AbstractControl {
    return this.taskForm.get('dueDate')!;
  }

  get dueDateInvalid(): boolean {
    return !!this.taskForm.errors?.['dueDateInvalid'];
  }

  static dueDateValidator(group: AbstractControl): ValidationErrors | null {
    const raw = group.get('dueDate')?.value as string | null;
    if (!raw) return null;

    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return { dueDateInvalid: true };

    return null;
  }

  ngOnInit(): void {
    this.loadProjects();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isFieldInvalid(
    controlName:
      | 'title'
      | 'description'
      | 'status'
      | 'priority'
      | 'dueDate'
      | 'project'
  ): boolean {
    const c = this.taskForm.get(controlName);
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

  private clearStatus(): void {
    this.statusMessage = '';
    this.statusKind = 'info';
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.clearStatus();
  }

  private setStatus(message: string, kind: 'info' | 'success' | 'error'): void {
    this.statusMessage = message;
    this.statusKind = kind;
  }

  private setError(message: string): void {
    this.errorMessage = message;
    this.setStatus(message, 'error');
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
            this.setError(
              'No projects available. You may need to create a project first.'
            );
          } else {
            this.clearMessages();
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
    this.submitted = true;
    this.clearMessages();

    this.taskForm.markAllAsTouched();

    if (this.submitting) return;

    if (this.taskForm.invalid) {
      this.setError('Please fix the errors in the form.');
      this.showAndFocusErrorSummary();
      queueMicrotask(() => this.mainContentRef?.nativeElement.focus());
      return;
    }

    const dueRaw = this.dueDateCtrl.value as string;
    const dueDateIso = new Date(dueRaw).toISOString();

    const newTask: AddTaskDTO = {
      title: String(this.titleCtrl.value).trim(),
      description: String(this.descriptionCtrl.value).trim(),
      status: this.taskForm.get('status')!.value,
      priority: this.taskForm.get('priority')!.value,
      dueDate: dueDateIso,
    };

    const projectId = String(this.taskForm.get('project')!.value);

    this.submitting = true;
    this.showErrorSummary = false;
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
          this.showAndFocusErrorSummary();
          queueMicrotask(() => this.mainContentRef?.nativeElement.focus());
        },
      });
  }
}
