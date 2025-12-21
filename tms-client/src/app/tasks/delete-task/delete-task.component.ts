import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Task } from '../task';
import { TaskService } from '../tasks.service';

@Component({
  selector: 'app-delete-task',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="task-container" aria-labelledby="page-title">
      <a class="skip-link" href="#main-content">Skip to delete task</a>

      <header class="page-header">
        <h1 id="page-title" class="title">Delete task</h1>
        <p class="subtitle">Select a task, review, then confirm deletion.</p>
      </header>

      <!-- Live status for loading / success -->
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

      <!-- Errors should be asserted -->
      <p
        *ngIf="error && !loading && !loadingIds"
        class="status error"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        {{ error }}
      </p>

      <div id="main-content" class="content" tabindex="-1" #mainContent>
        <form
          class="form"
          (ngSubmit)="onConfirmDelete()"
          aria-describedby="help-text"
          novalidate
        >
          <p id="help-text" class="field-hint">
            Deleting a task cannot be undone.
          </p>

          <div class="field">
            <label class="label" for="taskSelect">
              Select task <span aria-hidden="true">*</span>
            </label>

            <select
              id="taskSelect"
              class="control"
              [disabled]="loadingIds || loading"
              [value]="selectedId"
              (change)="onSelectId($event)"
              [attr.aria-required]="true"
              [attr.aria-invalid]="selectInvalid ? 'true' : null"
              [attr.aria-describedby]="
                'select-hint' + (selectInvalid ? ' select-error' : '')
              "
            >
              <option value="" disabled>
                {{ loadingIds ? 'Loading tasks…' : '-- Select a task --' }}
              </option>
              <option *ngFor="let t of tasksList" [value]="t._id">
                {{ t._id }}
              </option>
            </select>

            <p id="select-hint" class="field-hint">
              Choose a task to enable the delete button.
            </p>

            <p
              *ngIf="selectInvalid"
              id="select-error"
              class="field-error"
              role="alert"
            >
              Please select a task.
            </p>
          </div>

          <div class="actions">
            <button
              type="submit"
              class="btn danger"
              [disabled]="loading || loadingIds || !selectedId"
              [attr.aria-disabled]="
                loading || loadingIds || !selectedId ? 'true' : null
              "
            >
              <span *ngIf="!loading">Delete task</span>
              <span *ngIf="loading">Deleting…</span>
            </button>

            <button
              type="button"
              class="btn secondary"
              (click)="refresh()"
              [disabled]="loading || loadingIds"
            >
              Refresh list
            </button>
          </div>

          <!-- Inline progress text for SR users -->
          <p
            *ngIf="loadingIds"
            class="status"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            Loading task IDs…
          </p>
          <p
            *ngIf="loading && !loadingIds"
            class="status"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            Deleting task…
          </p>
        </form>
      </div>
    </section>
  `,
  styles: [
    `
      .task-container {
        padding: 1rem;
        max-width: 720px;
        margin: 0 auto;
      }

      .page-header {
        margin-bottom: 1rem;
      }

      .title {
        margin: 0;
      }

      .subtitle {
        margin: 0.25rem 0 0;
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

      .label {
        font-weight: 600;
      }

      .control {
        padding: 0.6rem 0.75rem;
        border: 1px solid #c9d4e0;
        border-radius: 0.25rem;
        font-size: 1rem;
      }

      .control:focus-visible,
      .btn:focus-visible {
        outline: 3px solid currentColor;
        outline-offset: 3px;
        border-radius: 0.25rem;
      }

      .field-hint {
        margin: 0;
        font-size: 0.95rem;
      }

      .field-error {
        margin: 0;
        font-weight: 700;
        color: #8a0000;
      }

      .status {
        margin: 0.75rem 0;
      }

      /* Avoid relying on color alone; keep weight too */
      .status.error {
        font-weight: 800;
      }
      .status.success {
        font-weight: 800;
      }

      .actions {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
        align-items: center;
      }

      .btn {
        padding: 0.6rem 0.9rem;
        border-radius: 0.35rem;
        border: 1px solid #c9d4e0;
        background: white;
        cursor: pointer;
      }

      .btn[disabled] {
        cursor: not-allowed;
        opacity: 0.7;
      }

      .btn.danger {
        border-width: 2px;
      }

      .btn.secondary {
        border-style: dashed;
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
export class DeleteTaskComponent implements OnInit, OnDestroy {
  tasksList: Task[] = [];
  loadingIds = false;

  loading = false;
  error?: string;

  statusMessage = '';
  statusKind: 'info' | 'success' | 'error' = 'info';

  selectedId = '';
  selectInvalid = false;

  @ViewChild('mainContent', { static: true })
  mainContentRef!: ElementRef<HTMLElement>;

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
    this.clearMessages();
    this.selectedId = '';
    this.selectInvalid = false;
    this.fetchTaskIds();
    queueMicrotask(() => this.mainContentRef?.nativeElement.focus());
  }

  private fetchTaskIds(): void {
    this.loadingIds = true;
    this.clearMessages();
    this.setStatus('Loading task IDs…', 'info');

    this.tasks
      .getTasks()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (list: Task[]) => {
          this.tasksList = (list ?? []).filter((t) => !!t?._id);
          this.loadingIds = false;

          if (this.tasksList.length === 0) {
            this.setStatus('No tasks found.', 'error');
          } else {
            this.clearStatus();
          }
        },
        error: (err: any) => {
          this.loadingIds = false;
          this.error = `Unable to load task IDs. ${err?.message ?? ''}`.trim();
          this.setStatus('Unable to load task IDs.', 'error');
          console.error('Error loading task IDs:', err);
        },
      });
  }

  onSelectId(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;

    this.clearMessages();
    this.selectInvalid = false;

    this.selectedId = id ?? '';

    if (!this.selectedId) {
      this.selectInvalid = true;
      this.error = 'Please select a valid task.';
      queueMicrotask(() => this.mainContentRef?.nativeElement.focus());
      return;
    }

    // Provide a polite confirmation that selection changed
    this.setStatus(`Selected task ${this.selectedId}.`, 'info');
  }

  onConfirmDelete(): void {
    this.clearMessages();

    if (!this.selectedId) {
      this.selectInvalid = true;
      this.error = 'Please select a task to delete.';
      queueMicrotask(() => this.mainContentRef?.nativeElement.focus());
      return;
    }

    if (this.loading) return;

    this.deleteTask(this.selectedId);
  }

  private deleteTask(id: string): void {
    this.loading = true;
    this.setStatus('Deleting task…', 'info');

    this.tasks
      .deleteTask(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: { message: string }) => {
          this.loading = false;

          // remove deleted task from dropdown
          this.tasksList = this.tasksList.filter((t) => t._id !== id);

          // reset selection so the button disables
          this.selectedId = '';
          this.selectInvalid = false;

          this.setStatus(res?.message || 'Task deleted.', 'success');
          queueMicrotask(() => this.mainContentRef?.nativeElement.focus());
        },
        error: (err: any) => {
          this.loading = false;
          this.error = `Unable to delete task. ${err?.message ?? ''}`.trim();
          this.setStatus('Unable to delete task.', 'error');
          console.error('Error deleting task:', err);
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

  private clearMessages(): void {
    this.error = undefined;
    this.clearStatus();
  }
}
