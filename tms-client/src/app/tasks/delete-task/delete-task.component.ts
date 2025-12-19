import { Component } from '@angular/core';
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

      <select id="taskSelect" (change)="onSelectId($event)">
        <option value="">-- Select an ID --</option>
        <option value="650c1f1e1c9d440000a1b1c1">
          650c1f1e1c9d440000a1b1c1
        </option>
      </select>

      <!-- Loading -->
      <div *ngIf="loading">Deleting task…</div>

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
export class DeleteTaskComponent {
  loading = false;
  error?: string;
  successMessage?: string;

  constructor(private tasks: TaskService) {}

  onSelectId(event: Event) {
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

  deleteTask(id: string) {
    this.loading = true;

    this.tasks.deleteTask(id).subscribe({
      next: (res) => {
        this.loading = false;
        this.successMessage = res.message; // <- show backend message
      },
      error: () => {
        this.loading = false;
        this.error = 'Unable to delete task.';
      },
    });
  }
}
