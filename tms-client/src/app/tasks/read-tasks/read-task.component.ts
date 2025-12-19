import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../tasks.service';
import { Task } from '../task';

@Component({
  selector: 'app-read-task',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="task-container">
      <!-- Dropdown -->
      <label class="header" for="taskSelect"
        ><strong>Select Task ID:</strong></label
      >

      <select
        id="taskSelect"
        [disabled]="loadingIds"
        (change)="onSelectId($event)"
      >
        <option value="">-- Select an ID --</option>
        <option *ngFor="let t of tasksList" [value]="t._id">
          {{ t._id }}
        </option>
      </select>

      <div *ngIf="loadingIds">Loading task IDs…</div>

      <div *ngIf="loading && !loadingIds">Loading task…</div>

      <div *ngIf="error && !loading" class="error">
        {{ error }}
      </div>

      <section *ngIf="task && !loading">
        <h2>{{ task.title }}</h2>

        <p *ngIf="task.description">{{ task.description }}</p>

        <ul>
          <li><strong>Status:</strong> {{ task.status }}</li>
          <li><strong>Priority:</strong> {{ task.priority }}</li>
          <li *ngIf="task.dueDate">
            <strong>Due:</strong> {{ task.dueDate | date : 'mediumDate' }}
          </li>
          <li *ngIf="task._id"><strong>ID:</strong> {{ task._id }}</li>
        </ul>
      </section>
    </div>
  `,
  styles: [
    `
      .header {
        margin: 15px;
      }
      .error {
        color: red;
        margin-top: 10px;
      }
    `,
  ],
})
export class ReadTaskComponent implements OnInit {
  // dropdown data
  tasksList: Task[] = [];
  loadingIds = false;

  // selected task details
  task?: Task;
  loading = false;
  error?: string;

  constructor(private tasks: TaskService) {}

  ngOnInit(): void {
    this.fetchTaskIds();
  }

  private fetchTaskIds(): void {
    this.loadingIds = true;
    this.error = undefined;

    this.tasks.getTasks().subscribe({
      next: (list: Task[]) => {
        // Keep only tasks that actually have an _id
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

    if (!id) {
      this.task = undefined;
      this.error = 'Please select a valid task ID.';
      return;
    }

    this.loadTask(id);
  }

  private loadTask(id: string): void {
    this.loading = true;
    this.error = undefined;

    this.tasks.getTaskById(id).subscribe({
      next: (t: Task) => {
        this.task = t;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = `Unable to load task. ${err?.message ?? ''}`.trim();
        this.loading = false;
        console.error('Error loading task by id:', err);
      },
    });
  }
}
