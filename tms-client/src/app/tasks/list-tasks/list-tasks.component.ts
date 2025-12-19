import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../task';
import { TaskService } from '../tasks.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-list-tasks',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="task-container">
      <h2>All Tasks</h2>

      <p *ngIf="loading">Loading tasks...</p>
      <p *ngIf="serverMessage" [ngClass]="serverMessageType">
        {{ serverMessage }}
      </p>

      <ul *ngIf="!loading && tasks.length > 0; else noTasks">
        <li *ngFor="let task of tasks" class="task-item">
          <strong>Title:</strong> {{ task.title }}<br />

          <small *ngIf="task.description">
            <strong>Description:</strong> {{ task.description }} </small
          ><br />

          <small *ngIf="task.status">
            <strong>Status:</strong> {{ task.status }} </small
          ><br />

          <small *ngIf="task.priority">
            <strong>Priority:</strong> {{ task.priority }} </small
          ><br />

          <small *ngIf="task.dueDate">
            <strong>Due Date:</strong> {{ task.dueDate }} </small
          ><br />

          <small *ngIf="task.dateCreated">
            <strong>Created:</strong> {{ task.dateCreated }} </small
          ><br />

          <small *ngIf="task.dateModified">
            <strong>Modified:</strong> {{ task.dateModified }} </small
          ><br />

          <small *ngIf="task.projectId">
            <strong>Project ID:</strong> {{ task.projectId }} </small
          ><br />
        </li>
      </ul>

      <ng-template #noTasks>
        <p>No tasks found.</p>
      </ng-template>
    </div>
  `,
  styles: [
    `
      .task-container {
        padding: 1rem;
        max-width: 600px;
        margin: auto;
      }
      .task-item {
        padding: 0.5rem 0;
      }
      .success {
        color: green;
      }
      .error {
        color: red;
      }
    `,
  ],
})
export class ListTasksComponent {
  tasks: Task[] = [];
  loading = true;
  serverMessage: string | null = null;
  serverMessageType: 'success' | 'error' | null = null;

  constructor(private taskService: TaskService) {
    this.taskService.getTasks().subscribe({
      next: (tasks: Task[]) => {
        this.tasks = tasks;
        this.loading = false;
        this.serverMessage = `Retrieved ${tasks.length} task(s) successfully.`;
        this.serverMessageType = 'success';
      },
      error: (err: any) => {
        this.loading = false;
        this.serverMessage = `Error retrieving tasks. ${err.message}`;
        this.serverMessageType = 'error';
        console.error('Error occurred while retrieving tasks:', err);
      },
    });
  }
}
