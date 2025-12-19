import { Component } from '@angular/core';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TaskService } from '../tasks.service';
import { Task } from '../task';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-task-find',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, NgIf, NgForOf],
  template: `
    <div class="task-find-page" [formGroup]="taskForm">
      <h1 class="task-find-page_title">Find Task</h1>
      <h4 class="task-find-page_subtitle">
        Fill in the search bar to find tasks
      </h4>

      <div class="add-task-page_form-group">
        <label for="term" class="task-add-page_form-label">Task Name</label>
        <input
          type="text"
          id="term"
          class="task-add-page_form-control"
          formControlName="term"
        />

        <div
          class="error-message"
          style="color: #7c0505;"
          *ngIf="
            taskForm.controls['term'].invalid &&
            taskForm.controls['term'].touched
          "
        >
          <small *ngIf="taskForm.controls['term'].errors?.['required']">
            Task search term is required.
          </small>
          <small *ngIf="taskForm.controls['term'].errors?.['minlength']">
            Task search term must be at least 3 characters long.
          </small>
        </div>
      </div>

      <button
        type="button"
        class="task_btn"
        (click)="onSubmit()"
        [disabled]="taskForm.invalid"
      >
        Search Task
      </button>

      <!-- Results section -->
      <div *ngIf="searched">
        <h3>Search Results</h3>
        <ul *ngIf="tasks.length > 0; else noTasks">
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
      </div>

      <ng-template #noTasks>
        <p>No tasks found.</p>
      </ng-template>
    </div>
  `,
  styles: [
    `
      .task-find-page {
        max-width: 600px;
        margin: 2rem auto;
        padding: 1.5rem;
      }

      .task-find-page_title {
        text-align: center;
        color: var(--dark_blue);
        margin-bottom: 0.25rem;
      }

      .task-find-page_subtitle {
        text-align: center;
        color: var(--medium_blue);
        margin-bottom: 1.5rem;
        font-size: 0.9rem;
      }

      .add-task-page_form-group {
        margin-bottom: 1rem;
      }

      .task-add-page_form-label {
        display: block;
        margin-bottom: 0.35rem;
        font-weight: 600;
      }

      .task-add-page_form-control {
        width: 100%;
        padding: 0.6rem;
        border: 1px solid #ccc;
        border-radius: 6px;
        font-size: 0.95rem;
        box-sizing: border-box;
      }

      .task-add-page_form-control.ng-invalid.ng-touched {
        border-color: #c0392b;
      }

      .error-message {
        color: #c0392b;
        font-size: 0.8rem;
        margin-top: 0.25rem;
      }

      .task_btn {
        padding: 0.6rem 1.2rem;
        border: none;
        background-color: var(--dark_blue);
        color: white;
        cursor: pointer;
        font-size: 0.95rem;
      }

      .task_btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* Results */
      h3 {
        margin-top: 1.5rem;
        margin-bottom: 0.5rem;
        font-size: 1.2rem;
      }

      ul {
        padding-left: 1rem;
        margin: 0.5rem 0;
      }

      li {
        margin-bottom: 0.5rem;
      }
    `,
  ],
})
export class TaskFindComponent {
  taskForm: FormGroup = this.fb.group({
    term: [null, [Validators.required, Validators.minLength(3)]],
  });

  tasks: Task[] = [];
  searched = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private taskService: TaskService
  ) {}

  onSubmit() {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const term = this.taskForm.controls['term'].value;
    console.log('Searching Tasks for:', term);

    this.taskService.findTask(term).subscribe({
      next: (result: Task[]) => {
        this.searched = true;
        this.tasks = result;
        console.log('Tasks found:', result);
      },
      error: (error) => {
        this.searched = true;
        this.tasks = [];
        console.error('Error finding task', error);
      },
    });
  }
}
