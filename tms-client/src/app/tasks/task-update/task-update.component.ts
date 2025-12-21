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
import { Subject, distinctUntilChanged, takeUntil } from 'rxjs';
import { TaskService } from '../tasks.service';
import { AddTaskDTO, Task } from '../task';

@Component({
  selector: 'app-task-update',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <section class="task-update_container" aria-labelledby="page-title">
      <a class="skip-link" href="#main-content">Skip to update task form</a>

      <header class="page-header">
        <h1 id="page-title" class="task-update_title">Update task</h1>
        <p class="task-update_subtitle">
          Select a task to update or make changes to.
        </p>
      </header>

      <!-- Global status messages (polite) -->
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

      <!-- Assertive error (for failures) -->
      <p
        *ngIf="errorMessage && !submitting"
        class="status error"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        {{ errorMessage }}
      </p>

      <div
        id="main-content"
        class="update-task_form-container"
        tabindex="-1"
        #mainContent
      >
        <form
          [formGroup]="taskForm"
          class="update-task_form"
          (ngSubmit)="onSubmit()"
          novalidate
        >
          <!-- Task selector -->
          <div class="update-task_form-group">
            <label for="taskId" class="task-update-page_form-label">
              Select task <span aria-hidden="true">*</span>
            </label>

            <select
              id="taskId"
              class="task-update-page_form-control"
              formControlName="taskId"
              [disabled]="loadingTasks || submitting"
              [attr.aria-required]="true"
              [attr.aria-invalid]="isInvalid('taskId')"
              [attr.aria-describedby]="
                'taskId-hint' + (isInvalid('taskId') ? ' taskId-error' : '')
              "
            >
              <option value="" disabled>
                {{ loadingTasks ? 'Loading tasks…' : '-- Select a task --' }}
              </option>
              <option *ngFor="let t of tasks" [value]="t._id">
                {{ t.title || t._id }}
              </option>
            </select>

            <p id="taskId-hint" class="field-hint">
              Choose a task to enable editing.
            </p>

            <p
              *ngIf="isInvalid('taskId')"
              id="taskId-error"
              class="field-error"
              role="alert"
            >
              Please select a task to update.
            </p>
          </div>

          <!-- Title -->
          <div class="update-task_form-group">
            <label for="title" class="task-update_form-label">
              Task name <span aria-hidden="true">*</span>
            </label>

            <input
              type="text"
              id="title"
              class="task-update_form-control"
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
          <div class="task-update_form-group">
            <label for="description" class="task-update_form-label"
              >Task description</label
            >

            <textarea
              id="description"
              rows="8"
              class="task-update_form-control"
              formControlName="description"
              [attr.aria-invalid]="isInvalid('description')"
              [attr.aria-describedby]="
                'desc-hint' + (isInvalid('description') ? ' desc-error' : '')
              "
            ></textarea>

            <p id="desc-hint" class="field-hint">Up to 500 characters.</p>

            <p
              *ngIf="isInvalid('description')"
              id="desc-error"
              class="field-error"
              role="alert"
            >
              Task description cannot exceed 500 characters.
            </p>
          </div>

          <!-- Status -->
          <div class="task-update_form-group">
            <label for="status" class="task-update_form-label">
              Status <span aria-hidden="true">*</span>
            </label>

            <select
              id="status"
              class="task-update_form-control"
              formControlName="status"
              [attr.aria-required]="true"
              [attr.aria-invalid]="isInvalid('status')"
              [attr.aria-describedby]="
                isInvalid('status') ? 'status-error' : null
              "
            >
              <option value="" disabled>Select status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In progress</option>
              <option value="Completed">Completed</option>
            </select>

            <p
              *ngIf="isInvalid('status')"
              id="status-error"
              class="field-error"
              role="alert"
            >
              Status is required.
            </p>
          </div>

          <!-- Priority -->
          <div class="task-update_form-group">
            <label for="priority" class="task-update_form-label">
              Priority <span aria-hidden="true">*</span>
            </label>

            <select
              id="priority"
              class="task-update_form-control"
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
              Priority is required.
            </p>
          </div>

          <!-- Due Date -->
          <div class="task-update_form-group">
            <label for="dueDate" class="task-update_form-label">Due date</label>

            <input
              type="datetime-local"
              id="dueDate"
              class="task-update_form-control"
              formControlName="dueDate"
              [attr.aria-describedby]="'due-hint'"
            />

            <p id="due-hint" class="field-hint">Local time.</p>
          </div>

          <!-- Actions -->
          <div class="actions">
            <button
              class="btn task-update_btn"
              type="submit"
              [disabled]="
                submitting || loadingTasks || !taskForm.get('taskId')?.value
              "
              [attr.aria-disabled]="
                submitting || loadingTasks || !taskForm.get('taskId')?.value
                  ? 'true'
                  : null
              "
            >
              <span *ngIf="!submitting">Update task</span>
              <span *ngIf="submitting">Updating…</span>
            </button>

            <a class="task-update_link link" routerLink="/tasks">Return</a>
          </div>
        </form>
      </div>
    </section>
  `,
  styles: `
    .task-update_container {
      padding: 1rem;
      max-width: 960px;
      margin: 0 auto;
    }

    .page-header { margin-bottom: 1rem; }

    .task-update_title {
      text-align: center;
      color: var(--dark_blue);
      margin-bottom: 0.25rem;
    }

    .task-update_subtitle {
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

    .update-task_form-container {
      width: min(60%, 720px);
      margin: 0 auto;
      border-radius: 0.75rem;
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.08);
      padding: 1.5rem;
      background: #fff;
    }

    #main-content:focus {
      outline: 3px solid currentColor;
      outline-offset: 4px;
      border-radius: 0.5rem;
    }

    .update-task_form {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.25rem;
    }

    .update-task_form-group,
    .task-update_form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .task-update-page_form-label,
    .task-update_form-label {
      font-weight: 700;
      margin: 0;
      color: var(--medium_blue);
    }

    .task-update-page_form-control,
    .task-update_form-control {
      padding: 0.75rem 1rem;
      border: 1px solid var(--light_blue);
      border-radius: 0.35rem;
      font-size: 1rem;
      width: 100%;
      box-sizing: border-box;
    }

    .task-update-page_form-control:focus-visible,
    .task-update_form-control:focus-visible,
    .btn:focus-visible,
    .link:focus-visible {
      outline: 3px solid currentColor;
      outline-offset: 3px;
      border-radius: 0.35rem;
    }

    .task-update-page_form-control:disabled {
      background-color: #e9ecef;
      cursor: not-allowed;
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
    }

    .btn.task-update_btn {
      border: 2px solid var(--dark_blue);
      background-color: #f0f0f0;
      color: var(--dark_blue);
      padding: 0.65rem 1.2rem;
      border-radius: 0.35rem;
      cursor: pointer;
    }

    .btn.task-update_btn:hover {
      background-color: var(--dark_blue);
      color: var(--bg_color);
    }

    .btn.task-update_btn[disabled] {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .task-update_link {
      display: inline-block;
      text-decoration: none;
    }
    .task-update_link:hover { text-decoration: underline; }

    .status { margin: 0.75rem auto 1rem; max-width: 720px; }
    .status.error { font-weight: 800; }
    .status.success { font-weight: 800; }

    @media (prefers-reduced-motion: reduce) {
      * {
        scroll-behavior: auto !important;
        transition: none !important;
        animation: none !important;
      }
    }
  `,
})
export class TaskUpdateComponent implements OnInit, OnDestroy {
  loadingTasks = false;
  tasks: Task[] = [];

  submitting = false;

  statusMessage = '';
  statusKind: 'info' | 'success' | 'error' = 'info';
  errorMessage = '';

  taskForm: FormGroup = this.fb.group({
    taskId: [{ value: null, disabled: true }, Validators.required],
    title: [
      { value: null, disabled: true },
      [Validators.required, Validators.minLength(3), Validators.maxLength(100)],
    ],
    description: [{ value: null, disabled: true }, Validators.maxLength(500)],
    status: [{ value: null, disabled: true }, Validators.required],
    priority: [{ value: null, disabled: true }, Validators.required],
    dueDate: [{ value: null, disabled: true }],
  });

  @ViewChild('mainContent', { static: true })
  mainContentRef!: ElementRef<HTMLElement>;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly taskService: TaskService
  ) {}

  ngOnInit(): void {
    this.setEditControlsEnabled(false);
    this.loadTasks();

    this.taskForm
      .get('taskId')!
      .valueChanges.pipe(takeUntil(this.destroy$), distinctUntilChanged())
      .subscribe((id: string | null) => {
        if (!id) {
          this.taskForm.patchValue(
            {
              title: null,
              description: null,
              status: null,
              priority: null,
              dueDate: null,
            },
            { emitEvent: false }
          );
          this.setEditControlsEnabled(false);
          return;
        }

        this.setStatus('Loading task details…', 'info');
        this.errorMessage = '';
        this.taskService
          .getTaskById(id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (task) => {
              this.patchFormFromTask(task);
              this.setEditControlsEnabled(true);
              this.clearStatus();
              queueMicrotask(() => this.mainContentRef?.nativeElement.focus());
            },
            error: () => {
              this.setEditControlsEnabled(false);
              this.setError('Unable to load the selected task.');
              queueMicrotask(() => this.mainContentRef?.nativeElement.focus());
            },
          });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTasks(): void {
    this.loadingTasks = true;
    this.clearMessages();
    this.setStatus('Loading tasks…', 'info');

    this.taskService
      .getTasks()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tasks) => {
          this.tasks = [...(tasks ?? [])].sort((a, b) =>
            (a.title || '').localeCompare(b.title || '')
          );
          this.loadingTasks = false;

          this.taskForm.get('taskId')?.enable({ emitEvent: false });

          if (this.tasks.length === 0) {
            this.setError('No tasks available to update.');
          } else {
            this.clearStatus();
          }
        },
        error: () => {
          this.loadingTasks = false;
          this.setError('Unable to load tasks.');
        },
      });
  }

  private patchFormFromTask(task: Task): void {
    this.taskForm.patchValue(
      {
        title: task.title ?? null,
        description: task.description ?? null,
        status: task.status ?? null,
        priority: task.priority ?? null,
        dueDate: task.dueDate ? this.toLocalDateTimeInput(task.dueDate) : null,
      },
      { emitEvent: false }
    );
  }

  private toLocalDateTimeInput(iso: string): string {
    try {
      const d = new Date(iso);
      const pad = (n: number) => n.toString().padStart(2, '0');
      const yyyy = d.getFullYear();
      const mm = pad(d.getMonth() + 1);
      const dd = pad(d.getDate());
      const hh = pad(d.getHours());
      const min = pad(d.getMinutes());
      return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    } catch {
      return '';
    }
  }

  private setEditControlsEnabled(enabled: boolean): void {
    (
      ['title', 'description', 'status', 'priority', 'dueDate'] as const
    ).forEach((name) => {
      const control = this.taskForm.get(name);
      if (!control) return;
      enabled
        ? control.enable({ emitEvent: false })
        : control.disable({ emitEvent: false });
    });
  }

  isInvalid(
    controlName:
      | 'taskId'
      | 'title'
      | 'description'
      | 'status'
      | 'priority'
      | 'dueDate'
  ): 'true' | null {
    const control = this.taskForm.get(controlName);
    if (!control) return null;
    return control.invalid && (control.dirty || control.touched)
      ? 'true'
      : null;
  }

  onSubmit(): void {
    this.taskForm.markAllAsTouched();

    if (this.submitting) return;

    if (this.taskForm.invalid) {
      this.setError('Please fix the errors in the form.');
      queueMicrotask(() => this.mainContentRef?.nativeElement.focus());
      return;
    }

    const id = String(this.taskForm.get('taskId')!.value ?? '');
    if (!id) {
      this.setError('Please select a task to update.');
      queueMicrotask(() => this.mainContentRef?.nativeElement.focus());
      return;
    }

    const updateTask: AddTaskDTO = {
      title: String(this.taskForm.get('title')!.value).trim(),
      description: this.taskForm.get('description')!.value ?? undefined,
      status: this.taskForm.get('status')!.value,
      priority: this.taskForm.get('priority')!.value,
      dueDate: this.taskForm.get('dueDate')!.value
        ? new Date(this.taskForm.get('dueDate')!.value).toISOString()
        : undefined,
    };

    this.submitting = true;
    this.clearMessages();
    this.setStatus('Updating task…', 'info');

    this.taskService
      .updateTask(id, updateTask)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.submitting = false;
          this.setStatus('Task updated successfully.', 'success');
          queueMicrotask(() => this.router.navigate(['/tasks']));
        },
        error: () => {
          this.submitting = false;
          this.setError('Error updating task. Please try again.');
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
