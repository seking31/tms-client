import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { TaskService } from '../tasks.service';
import { Task } from '../task';

@Component({
  selector: 'app-read-task',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="task-container" aria-labelledby="page-title">
      <a class="skip-link" href="#task-details">Skip to task details</a>

      <header class="page-header">
        <h1 id="page-title" class="title">Task details</h1>
        <p class="subtitle">Select a task ID to view details.</p>
      </header>

      <!-- Status region (loading ids / loading task) -->
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
        Loading task…
      </p>

      <!-- Error: assertive -->
      <p
        *ngIf="error && !loading"
        class="status error"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        {{ error }}
      </p>

      <div class="controls" aria-label="Task selection">
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
            'task-select-hint' + (selectInvalid ? ' task-select-error' : '')
          "
        >
          <option value="" disabled>
            {{ loadingIds ? 'Loading tasks…' : '-- Select a task --' }}
          </option>
          <option *ngFor="let t of tasksList" [value]="t._id">
            {{ t._id }}
          </option>
        </select>

        <p id="task-select-hint" class="field-hint">
          Choose a task ID to load task details.
        </p>

        <p
          *ngIf="selectInvalid"
          id="task-select-error"
          class="field-error"
          role="alert"
        >
          Please select a valid task.
        </p>
      </div>

      <!-- Details -->
      <div id="task-details" class="content" tabindex="-1" #details>
        <article
          *ngIf="task && !loading"
          class="task-card"
          aria-labelledby="task-title"
        >
          <header>
            <h2 id="task-title" class="task-title">
              {{ task.title || 'Untitled task' }}
            </h2>
          </header>

          <p *ngIf="task.description" class="task-description">
            {{ task.description }}
          </p>

          <!-- Better semantics for label/value fields -->
          <dl class="task-meta">
            <div class="meta-row" *ngIf="task.status">
              <dt>Status</dt>
              <dd>{{ task.status }}</dd>
            </div>

            <div class="meta-row" *ngIf="task.priority">
              <dt>Priority</dt>
              <dd>{{ task.priority }}</dd>
            </div>

            <div class="meta-row" *ngIf="task.dueDate">
              <dt>Due</dt>
              <dd>{{ task.dueDate | date : 'mediumDate' }}</dd>
            </div>

            <div class="meta-row" *ngIf="task._id">
              <dt>ID</dt>
              <dd>{{ task._id }}</dd>
            </div>
          </dl>
        </article>

        <p
          *ngIf="!loading && !error && !task"
          class="status"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          Select a task to see details.
        </p>
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

      .controls {
        display: grid;
        gap: 0.4rem;
        margin-bottom: 1rem;
      }

      .label {
        font-weight: 600;
      }

      .control {
        padding: 0.6rem 0.75rem;
        border: 1px solid #c9d4e0;
        border-radius: 0.35rem;
        font-size: 1rem;
      }

      .control:focus-visible,
      .content:focus-visible {
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
        font-weight: 800;
        color: #8a0000;
      }

      .status {
        margin: 0.75rem 0;
      }

      .status.error {
        font-weight: 800;
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

      .task-description {
        margin: 0 0 1rem;
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
export class ReadTaskComponent implements OnInit, OnDestroy {
  tasksList: Task[] = [];
  loadingIds = false;

  task?: Task;
  loading = false;
  error?: string;

  selectedId = '';
  selectInvalid = false;

  @ViewChild('details', { static: true }) detailsRef!: ElementRef<HTMLElement>;

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly tasks: TaskService) {}

  ngOnInit(): void {
    this.fetchTaskIds();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private fetchTaskIds(): void {
    this.loadingIds = true;
    this.error = undefined;

    this.tasks
      .getTasks()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (list: Task[]) => {
          this.tasksList = (list ?? []).filter((t) => !!t?._id);
          this.loadingIds = false;

          if (this.tasksList.length === 0) {
            this.error = 'No tasks found.';
          }
        },
        error: (err: any) => {
          this.loadingIds = false;
          this.error = `Unable to load task IDs. ${err?.message ?? ''}`.trim();
          console.error('Error loading task IDs:', err);
        },
      });
  }

  onSelectId(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;

    // reset state for new selection
    this.error = undefined;
    this.selectInvalid = false;

    this.selectedId = id ?? '';

    if (!this.selectedId) {
      this.task = undefined;
      this.selectInvalid = true;
      this.error = 'Please select a valid task.';
      queueMicrotask(() => this.detailsRef?.nativeElement.focus());
      return;
    }

    this.loadTask(this.selectedId);
  }

  private loadTask(id: string): void {
    this.loading = true;
    this.error = undefined;
    this.task = undefined;

    this.tasks
      .getTaskById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (t: Task) => {
          this.task = t;
          this.loading = false;
          queueMicrotask(() => this.detailsRef?.nativeElement.focus());
        },
        error: (err: any) => {
          this.error = `Unable to load task. ${err?.message ?? ''}`.trim();
          this.loading = false;
          console.error('Error loading task by id:', err);
          queueMicrotask(() => this.detailsRef?.nativeElement.focus());
        },
      });
  }
}
