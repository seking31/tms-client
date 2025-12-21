import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, finalize, takeUntil } from 'rxjs';

import { Task } from '../task';
import { TaskService } from '../tasks.service';

@Component({
  selector: 'app-delete-task',
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="task-container" aria-labelledby="page-title">
      <h1 id="page-title" class="page-title">Delete Task</h1>

      <p class="page-subtitle">
        Select a task ID to delete. This action cannot be undone.
      </p>

      <!-- Status messages (announced) -->
      <div class="status" role="status" aria-live="polite" aria-atomic="true">
        <p *ngIf="loadingIds" class="status-text">Loading task IDs…</p>
        <p *ngIf="loading && !loadingIds" class="status-text">Deleting task…</p>
        <p *ngIf="successMessage && !loading" class="success">
          {{ successMessage }}
        </p>
      </div>

      <!-- Errors (assertive announcement) -->
      <div
        *ngIf="error && !loading"
        #errorEl
        class="error"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        tabindex="-1"
      >
        {{ error }}
      </div>

      <div class="field">
        <label class="label" for="taskSelect">
          <strong>Select Task ID to delete</strong>
        </label>

        <select
          #selectEl
          id="taskSelect"
          class="select"
          [disabled]="loadingIds || loading || tasksList.length === 0"
          [attr.aria-describedby]="helpTextId"
          (change)="onSelectId($event)"
        >
          <option value="">
            {{
              tasksList.length
                ? '-- Select an ID --'
                : '-- No tasks available --'
            }}
          </option>

          <option *ngFor="let t of tasksList" [value]="t._id">
            {{ t.title || 'Untitled task' }} (ID: {{ t._id }})
          </option>
        </select>

        <p [id]="helpTextId" class="help">
          After you select an ID, the task will not be deleted until you
          confirm.
        </p>
      </div>

      <!-- Safer: explicit confirmation button (keyboard + SR friendly) -->
      <div class="actions">
        <button
          type="button"
          class="btn danger"
          [disabled]="!selectedId || loadingIds || loading"
          [attr.aria-disabled]="
            !selectedId || loadingIds || loading ? 'true' : null
          "
          (click)="confirmDelete()"
        >
          <span *ngIf="!loading">Delete selected task</span>
          <span *ngIf="loading">Deleting…</span>
        </button>

        <button
          type="button"
          class="btn"
          [disabled]="loadingIds || loading"
          [attr.aria-disabled]="loadingIds || loading ? 'true' : null"
          (click)="refresh()"
        >
          Refresh list
        </button>
      </div>
    </main>
  `,
  styles: [
    `
      .task-container {
        padding: 1rem;
        max-width: 720px;
        margin: 0 auto;
      }

      .page-title {
        margin: 0 0 0.25rem 0;
      }

      .page-subtitle {
        margin: 0 0 1rem 0;
        color: #555;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-top: 1rem;
      }

      .label {
        margin: 0;
      }

      .select {
        padding: 0.5rem 0.75rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        max-width: 420px;
      }

      .select:focus-visible,
      .btn:focus-visible {
        outline: 3px solid currentColor;
        outline-offset: 3px;
        border-radius: 4px;
      }

      .help {
        margin: 0;
        color: #555;
        font-size: 0.875rem;
      }

      .status {
        min-height: 1.25rem;
      }

      .status-text {
        margin: 0.25rem 0;
      }

      .error {
        color: #b00020;
        margin-top: 0.75rem;
        font-weight: 800;
      }

      .success {
        color: #1b7f3a;
        margin-top: 0.75rem;
        font-weight: 700;
      }

      .actions {
        display: flex;
        gap: 0.75rem;
        margin-top: 1rem;
        flex-wrap: wrap;
      }

      .btn {
        border: 1px solid #333;
        border-radius: 6px;
        padding: 0.5rem 0.9rem;
        cursor: pointer;
        background: transparent;
      }

      .btn[aria-disabled='true'],
      .btn:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }

      .danger {
        border-color: #b00020;
        color: #b00020;
      }
    `,
  ],
})
export class DeleteTaskComponent implements OnInit, OnDestroy {
  @ViewChild('errorEl') errorEl?: ElementRef<HTMLElement>;
  @ViewChild('selectEl') selectEl?: ElementRef<HTMLSelectElement>;

  readonly helpTextId = 'delete-task-help';

  // dropdown data
  tasksList: Task[] = [];
  loadingIds = false;

  // selection
  selectedId = '';

  // delete state
  loading = false;
  error = '';
  successMessage = '';

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly tasks: TaskService) {}

  ngOnInit(): void {
    this.fetchTaskIds();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  refresh(): void {
    this.selectedId = '';
    this.successMessage = '';
    this.error = '';
    this.fetchTaskIds();
    queueMicrotask(() => this.selectEl?.nativeElement?.focus());
  }

  private fetchTaskIds(): void {
    this.loadingIds = true;
    this.error = '';
    this.successMessage = '';

    this.tasks
      .getTasks()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loadingIds = false;
        })
      )
      .subscribe({
        next: (list: Task[]) => {
          this.tasksList = (list ?? []).filter((t) => !!t?._id);

          if (this.tasksList.length === 0) {
            this.error = 'No tasks found.';
            this.focusError();
          }
        },
        error: (err: any) => {
          this.error = `Unable to load task IDs. ${err?.message ?? ''}`.trim();
          this.focusError();
          console.error('Error loading task IDs:', err);
        },
      });
  }

  onSelectId(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;

    // Reset messages when selection changes
    this.error = '';
    this.successMessage = '';

    this.selectedId = id ?? '';
    // Do NOT auto-delete on change: prevents accidental deletes and improves a11y/UX.
  }

  confirmDelete(): void {
    this.error = '';
    this.successMessage = '';

    if (!this.selectedId) {
      this.error = 'Please select a valid task ID.';
      this.focusError();
      return;
    }

    this.deleteTask(this.selectedId);
  }

  private deleteTask(id: string): void {
    this.loading = true;

    this.tasks
      .deleteTask(id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (res: { message: string }) => {
          this.successMessage = res?.message || 'Task deleted.';

          // remove deleted task from dropdown
          this.tasksList = this.tasksList.filter((t) => t._id !== id);
          this.selectedId = '';

          // If list is now empty, announce it clearly
          if (this.tasksList.length === 0) {
            this.error = 'No tasks found.';
            this.focusError();
          } else {
            queueMicrotask(() => this.selectEl?.nativeElement?.focus());
          }
        },
        error: (err: any) => {
          this.error = `Unable to delete task. ${err?.message ?? ''}`.trim();
          this.focusError();
          console.error('Error deleting task:', err);
        },
      });
  }

  private focusError(): void {
    queueMicrotask(() => this.errorEl?.nativeElement?.focus());
  }
}
