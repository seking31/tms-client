import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Task } from '../task';
import { TaskService } from '../tasks.service';

@Component({
  selector: 'app-list-tasks',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="task-container" aria-labelledby="page-title">
      <a class="skip-link" href="#task-list">Skip to task list</a>

      <header class="page-header">
        <h1 id="page-title">All tasks</h1>
      </header>

      <!-- Live region for loading + summary -->
      <p
        *ngIf="loading"
        class="status"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        Loading tasks…
      </p>

      <p
        *ngIf="!loading && serverMessage"
        class="status"
        [class.success]="serverMessageType === 'success'"
        [class.error]="serverMessageType === 'error'"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {{ serverMessage }}
      </p>

      <!-- Assertive error message (separate to ensure SR reads it promptly) -->
      <p
        *ngIf="!loading && serverMessageType === 'error' && serverMessage"
        class="status error sr-alert"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        {{ serverMessage }}
      </p>

      <!-- Results -->
      <div class="content" tabindex="-1" #content>
        <ul
          id="task-list"
          *ngIf="!loading && tasks.length > 0; else noTasks"
          class="task-list"
          aria-label="Task results"
        >
          <li *ngFor="let task of tasks" class="task-item">
            <article
              class="task-card"
              [attr.aria-label]="'Task: ' + (task.title || 'Untitled')"
            >
              <h2 class="task-title">{{ task.title || 'Untitled task' }}</h2>

              <dl class="task-meta">
                <div class="meta-row" *ngIf="task.description">
                  <dt>Description</dt>
                  <dd>{{ task.description }}</dd>
                </div>

                <div class="meta-row" *ngIf="task.status">
                  <dt>Status</dt>
                  <dd>{{ task.status }}</dd>
                </div>

                <div class="meta-row" *ngIf="task.priority">
                  <dt>Priority</dt>
                  <dd>{{ task.priority }}</dd>
                </div>

                <div class="meta-row" *ngIf="task.dueDate">
                  <dt>Due date</dt>
                  <dd>{{ task.dueDate }}</dd>
                </div>

                <div class="meta-row" *ngIf="task.dateCreated">
                  <dt>Created</dt>
                  <dd>{{ task.dateCreated }}</dd>
                </div>

                <div class="meta-row" *ngIf="task.dateModified">
                  <dt>Modified</dt>
                  <dd>{{ task.dateModified }}</dd>
                </div>

                <div class="meta-row" *ngIf="task.projectId">
                  <dt>Project ID</dt>
                  <dd>{{ task.projectId }}</dd>
                </div>
              </dl>
            </article>
          </li>
        </ul>

        <ng-template #noTasks>
          <p
            *ngIf="!loading"
            class="status"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            No tasks found.
          </p>
        </ng-template>
      </div>
    </section>
  `,
  styles: [
    `
      .task-container {
        padding: 1rem;
        max-width: 820px;
        margin: 0 auto;
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

      .page-header {
        margin-bottom: 0.75rem;
      }

      .content:focus {
        outline: 3px solid currentColor;
        outline-offset: 4px;
        border-radius: 0.5rem;
      }

      .status {
        margin: 0.75rem 0;
      }

      /* Don’t rely on color alone */
      .success {
        font-weight: 800;
      }
      .error {
        font-weight: 800;
      }

      /* If both role=status and role=alert render, avoid duplicate spacing */
      .sr-alert {
        margin-top: -0.25rem;
      }

      .task-list {
        list-style: none;
        padding: 0;
        margin: 0.75rem 0 0;
        display: grid;
        gap: 0.75rem;
      }

      .task-item {
        padding: 0;
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
export class ListTasksComponent implements OnInit, OnDestroy {
  tasks: Task[] = [];
  loading = true;

  serverMessage: string | null = null;
  serverMessageType: 'success' | 'error' | null = null;

  @ViewChild('content', { static: true }) contentRef!: ElementRef<HTMLElement>;

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly taskService: TaskService) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTasks(): void {
    this.loading = true;
    this.serverMessage = null;
    this.serverMessageType = null;

    this.taskService
      .getTasks()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tasks: Task[]) => {
          this.tasks = Array.isArray(tasks) ? tasks : [];
          this.loading = false;

          this.serverMessage = `Retrieved ${this.tasks.length} task(s) successfully.`;
          this.serverMessageType = 'success';

          // Put focus on content after load for keyboard/SR users
          queueMicrotask(() => this.contentRef?.nativeElement.focus());
        },
        error: (err: any) => {
          this.loading = false;
          const msg = (err?.message ?? '').toString().trim();

          this.serverMessage = `Error retrieving tasks.${msg ? ' ' + msg : ''}`;
          this.serverMessageType = 'error';

          console.error('Error occurred while retrieving tasks:', err);
          queueMicrotask(() => this.contentRef?.nativeElement.focus());
        },
      });
  }
}
