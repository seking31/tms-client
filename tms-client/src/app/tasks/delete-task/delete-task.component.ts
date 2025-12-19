import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../task';
import { TaskService } from '../tasks.service';

@Component({
  selector: 'app-delete-task',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="task-container">
      <!-- Dropdown -->
      <label class="header" for="taskSelect">
        <strong>Select Task ID to delete:</strong>
      </label>

      <select
        id="taskSelect"
        [disabled]="loadingIds || loading"
        (change)="onSelectId($event)"
      >
        <option value="">-- Select an ID --</option>
        <option *ngFor="let t of tasksList" [value]="t._id">
          {{ t._id }}
        </option>
      </select>

      <!-- Loading IDs -->
      <div *ngIf="loadingIds">Loading task IDs…</div>

      <!-- Deleting -->
      <div *ngIf="loading && !loadingIds">Deleting task…</div>

      <!-- Error Message -->
      <div *ngIf="error && !loading" class="error">
        {{ error }}
      </div>

      <!-- Success Message -->
      <div *ngIf="successMessage && !loading" class="success">
        {{ successMessage }}
      </div>
    </div>
  `,
  styles: [
    `
      .header {
        margin: 15px;
      }
      .task-container {
        padding: 1rem;
      }
      .error {
        color: red;
        margin-top: 1rem;
      }
      .success {
        color: green;
        margin-top: 1rem;
      }
    `,
  ],
})
export class DeleteTaskComponent implements OnInit {
  // dropdown data
  tasksList: Task[] = [];
  loadingIds = false;

  // delete state
  loading = false;
  error?: string;
  successMessage?: string;

  constructor(private tasks: TaskService) {}

  ngOnInit(): void {
    this.fetchTaskIds();
  }

  private fetchTaskIds(): void {
    this.loadingIds = true;
    this.error = undefined;

    this.tasks.getTasks().subscribe({
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

    // Reset messages
    this.error = undefined;
    this.successMessage = undefined;

    if (!id) {
      this.error = 'Please select a valid task ID.';
      return;
    }

    this.deleteTask(id);
  }

  private deleteTask(id: string): void {
    this.loading = true;

    this.tasks.deleteTask(id).subscribe({
      next: (res: { message: string }) => {
        this.loading = false;
        this.successMessage = res.message;

        // remove deleted task from dropdown
        this.tasksList = this.tasksList.filter((t) => t._id !== id);
      },
      error: (err: any) => {
        this.loading = false;
        this.error = `Unable to delete task. ${err?.message ?? ''}`.trim();
        console.error('Error deleting task:', err);
      },
    });
  }
}
