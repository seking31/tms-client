import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
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
      <select id="taskSelect" (change)="onSelectId($event)">
        <option value="">-- Select an ID --</option>
        <option value="650c1f1e1c9d440000a1b1c1">
          650c1f1e1c9d440000a1b1c1
        </option>
      </select>

      <div *ngIf="loading">Loading task…</div>

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
    `,
  ],
})
export class ReadTaskComponent implements OnInit {
  task?: Task;
  loading = false;
  error?: string;

  constructor(private route: ActivatedRoute, private tasks: TaskService) {}

  ngOnInit(): void {
    // No task loaded until selection
  }

  onSelectId(event: Event) {
    const id = (event.target as HTMLSelectElement).value;

    if (!id) {
      this.task = undefined;
      this.error = 'Please select a valid task ID.';
      return;
    }

    this.loadTask(id);
  }

  loadTask(id: string) {
    this.loading = true;
    this.error = undefined;

    this.tasks.getTaskById(id).subscribe({
      next: (t: Task) => {
        this.task = t;
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load task.';
        this.loading = false;
      },
    });
  }
}
