import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TaskService } from '../tasks.service';
import { AddTaskDTO } from '../task';
import { Project } from '../../projects/project';
import { ProjectService } from '../../projects/projects.service';

@Component({
  selector: 'app-task-add',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <div class="task-add-page">
      <h1 class="task-add-page_title">Add New Task</h1>
      <h4 class="task-add-page_subtitle">
        Fill in the details to create a new task
      </h4>

      <div class="add-task-page_card">
        <form [formGroup]="taskForm" class="add-task-page_form">
          <!-- Title -->
          <div class="add-task-page_form-group">
            <label for="title" class="task-add-page_form-label"
              >Task Name</label
            >
            <input
              type="text"
              id="title"
              class="task-add-page_form-control"
              formControlName="title"
            />

            <div
              class="error-message"
              style="color: #7c0505;"
              *ngIf="
                taskForm.controls['title'].invalid &&
                taskForm.controls['title'].touched
              "
            >
              <small *ngIf="taskForm.controls['title'].errors?.['required']">
                Task name is required.
              </small>
              <small *ngIf="taskForm.controls['title'].errors?.['minlength']">
                Task name must be at least 3 characters long.
              </small>
              <small *ngIf="taskForm.controls['title'].errors?.['maxlength']">
                Task name cannot exceed 100 characters.
              </small>
            </div>
          </div>

          <!-- Description -->
          <div class="task-add-page_form-group">
            <label for="description" class="task-add-page_form-label"
              >Task Description</label
            >
            <textarea
              id="description"
              rows="10"
              class="task-add-page_form-control"
              formControlName="description"
            >
            </textarea>

            <div
              class="error-message"
              style="color: #7c0505;"
              *ngIf="
                taskForm.controls['description'].invalid &&
                taskForm.controls['description'].touched
              "
            >
              <small
                *ngIf="taskForm.controls['description'].errors?.['required']"
              >
                Task description is required.
              </small>
              <small *ngIf="taskForm.controls['title'].errors?.['minlength']">
                Task description cannot exceed more than 500 characters.
              </small>
            </div>
          </div>

          <!-- Status Dropdown -->
          <div class="task-add-page_form-group">
            <label for="status" class="task-add-page_form-label">Status</label>
            <select
              id="status"
              class="task-add-page_form-control"
              formControlName="status"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

            <div
              class="error-message"
              style="color: #7c0505;"
              *ngIf="
                taskForm.controls['status'].invalid &&
                taskForm.controls['status'].touched
              "
            >
              <small *ngIf="taskForm.controls['status'].errors?.['required']">
                Task status is required.
              </small>
            </div>
          </div>

          <!-- Priority Dropdown -->
          <div class="task-add-page_form-group">
            <label for="priority" class="task-add-page_form-label"
              >Priority</label
            >
            <select
              id="priority"
              class="task-add-page_form-control"
              formControlName="priority"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>

            <div
              class="error-message"
              style="color: #7c0505;"
              *ngIf="
                taskForm.controls['priority'].invalid &&
                taskForm.controls['priority'].touched
              "
            >
              <small *ngIf="taskForm.controls['priority'].errors?.['required']">
                Task priority is required.
              </small>
            </div>
          </div>

          <!-- Due Date -->
          <div class="task-add-page_form-group">
            <label for="dueDate" class="task-add-page_form-label"
              >Due Date</label
            >
            <input
              type="datetime-local"
              id="dueDate"
              class="task-add-page_form-control"
              formControlName="dueDate"
            />

            <div
              class="error-message"
              style="color: #7c0505;"
              *ngIf="
                taskForm.controls['dueDate'].invalid &&
                taskForm.controls['dueDate'].touched
              "
            >
              <small *ngIf="taskForm.controls['dueDate'].errors?.['required']">
                Task due date is required.
              </small>
            </div>
          </div>

          <!-- Project Dropdown -->
          <div class="task-add-page_form-group">
            <label for="project" class="task-add-page_form-label">
              Select from a Project
            </label>

            <select
              id="project"
              class="task-add-page_form-control"
              formControlName="project"
            >
              <option value="">-- Select a project --</option>

              <option
                *ngFor="let project of projects"
                [value]="project.projectId"
              >
                {{ project.name }} ({{ project.projectId }})
              </option>
            </select>

            <div
              class="error-message"
              style="color: #7c0505;"
              *ngIf="
                taskForm.controls['project'].invalid &&
                taskForm.controls['project'].touched
              "
            >
              <small *ngIf="taskForm.controls['project'].errors?.['required']">
                Task project is required.
              </small>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="btn task-add-page_btn"
            (click)="onSubmit()"
          >
            Add Task
          </button>
        </form>
      </div>
      <a class="task-add-page_link" routerLink="/tasks">Return</a>
    </div>
  `,
  styles: `
  :host {
    display: block;
  }

  .task-add-page {
    max-width: 900px;
    margin: 0 auto;
    padding: 1.5rem;
  }

  .task-add-page_title {
    text-align: center;
    color: var(--dark_blue);
    margin-bottom: 0.25rem;
  }

  .task-add-page_subtitle {
    text-align: center;
    color: var(--medium_blue);
    font-size: 0.9rem;
    font-style: italic;
    margin-bottom: 1.5rem;
  }

  .add-task-page_card {
    background-color: var(--bg_color, #ffffff);
    border-radius: 0.5rem;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.08);
    padding: 1.5rem;
  }

  /* Form layout */
  .add-task-page_form {
    display: grid;
    grid-template-columns: 1fr; /* mobile: single column */
    gap: 1.25rem;
  }

  /* Form group layout */
  .add-task-page_form-group,
  .task-add-page_form-group {
    display: flex;
    flex-direction: column;
  }

  /* Uniform label spacing */
  .task-add-page_form-label {
    font-weight: bold;
    margin-bottom: 0.4rem;
    margin-top: 0.1rem;
  }

  /* Inputs */
  .task-add-page_form-control {
    width: 100%;
    padding: 0.5rem;
    border: 2px solid var(--medium_blue);
    border-radius: 0.25rem;
    box-sizing: border-box;
  }

  textarea.task-add-page_form-control {
    resize: vertical;
  }

  /* Error text spacing */
  .error-message {
    margin-top: 0.25rem;
    font-size: 0.8rem;
  }

  /* Button */
  .task-add-page_btn {
    margin-top: 0.5rem;
    padding: 0.6rem 1.2rem;
    border-radius: 0.25rem;
  }

  .task-add-page_link {
    color: var(--medium_blue);
    text-decoration: none;
    display: inline-block;
    margin-top: 1rem;
  }

  .task-add-page_link:hover {
    text-decoration: underline;
  }

  /* Responsive: two-column layout on larger screens only */
  @media (min-width: 768px) {
    .add-task-page_form {
      grid-template-columns: repeat(2, 1fr);
      column-gap: 2rem;
    }

    /* Description + Project full width */
    .task-add-page_form-group:nth-child(2),
    .task-add-page_form-group:nth-child(6) {
      grid-column: 1 / -1;
    }

    /* Button full width row */
    .task-add-page_btn {
      grid-column: 1 / -1;
      justify-self: flex-start;
    }
  }
`,
})
export class TaskAddComponent {
  projects: Project[] = [];
  loading = true;
  serverMessage: string | null = null;
  serverMessageType: 'success' | 'error' | null = null;

  taskForm: FormGroup = this.fb.group({
    title: [
      null,
      Validators.compose([
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
      ]),
    ],
    description: [
      null,
      Validators.compose([Validators.required, Validators.maxLength(500)]),
    ],
    status: [null, Validators.required],
    priority: [null, Validators.required],
    dueDate: [null, Validators.required],
    project: [null, Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private taskService: TaskService,
    private projectService: ProjectService
  ) {
    this.projectService.getProjects().subscribe({
      next: (projects: Project[]) => {
        this.projects = projects;
        this.loading = false;
        this.serverMessage = `Retrieved ${projects.length} project(s) successfully.`;
        this.serverMessageType = 'success';
      },
      error: (err: any) => {
        this.loading = false;
        this.serverMessage = `Error retrieving projects. ${err.message}`;
        this.serverMessageType = 'error';
        console.error('Error occurred while retrieving projects:', err);
      },
    });
  }

  onSubmit() {
    if (this.taskForm.valid) {
      const dueDate = new Date(
        this.taskForm.controls['dueDate'].value
      ).toISOString();

      const newTask: AddTaskDTO = {
        title: this.taskForm.controls['title'].value,
        description: this.taskForm.controls['description'].value,
        status: this.taskForm.controls['status'].value,
        priority: this.taskForm.controls['priority'].value,
        dueDate: dueDate,
      };

      console.log('Creating Task: ', newTask);
      const projectId = 1000;
      this.taskService.addTask(newTask, projectId).subscribe({
        next: (result: any) => {
          console.log(`Task created successfully: ${result.message}`);
          this.router.navigate(['/tasks']);
        },

        error: (error) => {
          console.error('Error creating task', error);
        },
      });
    }
  }
}
