import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TaskService } from '../tasks.service';
import { AddTaskDTO, Task } from '../task';

@Component({
  selector: 'app-task-update',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <div class="task-update_container">
      <h1 class="task-update_title">Update Task</h1>
      <h4 class="task-update_subtitle">
        Select a task to update or make changes to.
      </h4>

      <div class="update-task_form-container">
        <form [formGroup]="taskForm" class="update-task_form" (ngSubmit)="onSubmit()">
          <!-- Task selector (dropdown) -->
          <div class="update-task_form-group">
            <label for="taskId" class="task-update-page_form-label">Select Task</label>
            <select
              id="taskId"
              class="task-update-page_form-control"
              formControlName="taskId"
            >
              <option value="">
                {{ loadingTasks ? 'Loading tasks…' : '-- Select a task --' }}
              </option>
              <option *ngFor="let t of tasks" [value]="t._id">
                {{ t.title }}
              </option>
            </select>
            <div class="error-message" style="color: #7c0505;" *ngIf="taskForm.controls['taskId'].invalid && taskForm.controls['taskId'].touched">
              <small *ngIf="taskForm.controls['taskId'].errors?.['required']">
                Please select a task to update.
              </small>
            </div>
          </div>

          <!-- Title -->
          <div class="update-task_form-group">
            <label for="title" class="task-update_form-label">Task Name</label>
            <input type="text" id="title" class="task-update_form-control" formControlName="title" />

            <div class="error-message" style="color: #7c0505;" *ngIf="taskForm.controls['title'].invalid && taskForm.controls['title'].touched">
              <small *ngIf="taskForm.controls['title'].errors?.['required']">Task name is required.</small>
              <small *ngIf="taskForm.controls['title'].errors?.['minlength']">Task name must be at least 3 characters long.</small>
              <small *ngIf="taskForm.controls['title'].errors?.['maxlength']">Task name cannot exceed 100 characters.</small>
            </div>
          </div>

          <!-- Description -->
          <div class="task-update_form-group">
            <label for="description" class="task-update_form-label">Task Description</label>
            <textarea id="description" rows="10" class="task-update_form-control" formControlName="description"></textarea>
            <div class="error-message" style="color: #7c0505;" *ngIf="taskForm.controls['description'].invalid && taskForm.controls['description'].touched">
              <small *ngIf="taskForm.controls['description'].errors?.['maxlength']">
                Task description cannot exceed more than 500 characters.
              </small>
            </div>
          </div>

          <!-- Status Dropdown -->
          <div class="task-update_form-group">
            <label for="status" class="task-update_form-label">Status</label>
            <select id="status" class="task-update_form-control" formControlName="status">
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <div class="error-message" style="color: #7c0505;" *ngIf="taskForm.controls['status'].invalid && taskForm.controls['status'].touched">
              <small>Status is required.</small>
            </div>
          </div>

          <!-- Priority Dropdown -->
          <div class="task-update_form-group">
            <label for="priority" class="task-update_form-label">Priority</label>
            <select id="priority" class="task-update_form-control" formControlName="priority">
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <div class="error-message" style="color: #7c0505;" *ngIf="taskForm.controls['priority'].invalid && taskForm.controls['priority'].touched">
              <small>Priority is required.</small>
            </div>
          </div>

          <!-- Due Date -->
          <div class="task-update_form-group">
            <label for="dueDate" class="task-update_form-label">Due Date</label>
            <input type="datetime-local" id="dueDate" class="task-update_form-control" formControlName="dueDate" />
          </div>

          <!-- Submit Button -->
          <button class="btn task-update_btn"
                  type="submit"
                  *ngIf="taskForm.get('taskId')?.value"
          >
            Update Task
          </button>

          <a class="task-update_link" routerLink="/tasks">Return</a>
        </form>
      </div>
    </div>
  `,
  styles: `
    .task-update_title {
      text-align: center;
      color: var(--dark_blue);
      margin-bottom: 0.25rem;
    }

    .task-update_subtitle {
      text-align: center;
      color: var(--medium_blue);
      font-size: 0.9rem;
      font-style: italic;
      margin-bottom: 1.5rem;
    }

    /* Card container for the form */
    .update-task_form-container {
      width: 60%;
      margin: 0 auto;
      border-radius: 0.5rem;
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.08);
      padding: 1.5rem;
    }

    /* Form layout */
    .update-task_form {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.25rem;
    }

    .update-task_form-group,
    .task-update_form-group {
      display: flex;
      flex-direction: column;
    }

    /* Labels */
    .task-update-page_form-label,
    .task-update_form-label {
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: var(--medium_blue);
    }

    /* Form controls (input, select, textarea) */
    .task-update-page_form-control,
    .task-update_form-control {
      padding: 0.75rem 1rem;
      border: 1px solid var(--light_blue);
      border-radius: 0.25rem;
      font-size: 1rem;
      width: 100%;
      box-sizing: border-box;
      transition: border-color 0.2s ease-in-out;
    }

    .task-update-page_form-control:focus,
    .task-update_form-control:focus {
      outline: none;
      border-color: var(--dark_blue);
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }

    .task-update-page_form-control:disabled {
      background-color: #e9ecef;
      cursor: not-allowed;
    }

    .error-message small {
      display: block;
      margin-top: 0.25rem;
      font-size: 0.875rem;
      color: #7c0505;
    }

    /* Submit Button */
    .btn.task-update_btn {
      border: 2px solid var(--dark_blue);
      background-color: #F0F0F0;
      color: var(--dark_blue);

    }

    .btn.task-update_btn:hover {
      background-color: var(--dark_blue);
      color: var(--bg_color);
    }

    .btn.task-update_btn:disabled {
      display: none;
    }

    /* Return Link */
    .task-update_link {
      display: block;
      margin-top: 1rem;
      text-align: center;
      text-decoration: none;
    }

    .task-update_link:hover {
      text-decoration: underline;
    }
  `
})
export class TaskUpdateComponent implements OnInit {
  loadingTasks = false;
  tasks: Task[] = [];

  taskForm: FormGroup = this.fb.group({
    taskId: [{ value: null, disabled: true }, Validators.required],
    title: [{ value: null, disabled: true }, [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    description: [{ value: null, disabled: true }, Validators.maxLength(500)],
    status: [{ value: null, disabled: true }, Validators.required],
    priority: [{ value: null, disabled: true }, Validators.required],
    dueDate: [{ value: null, disabled: true }],
    submitBtn: [{ value: null, disabled: true }]
  });


  constructor(private fb: FormBuilder, private router: Router, private taskService: TaskService) {}

  ngOnInit(): void {
    // Load tasks for dropdown
    this.loadingTasks = true;
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        // Sort tasks alphabetically by title for easier selection
        this.tasks = [...tasks].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        this.loadingTasks = false;
        this.taskForm.get('taskId')?.enable();
      },
      error: (err) => {
        this.loadingTasks = false;
      },
    });

    // When a task is selected, fetch its latest data and prefill the form
    this.taskForm.get('taskId')!.valueChanges.subscribe((id: string | null) => {
      if (!id) {
        // No task selected: clear and disable form fields
        this.taskForm.patchValue({
          title: null,
          description: null,
          status: null,
          priority: null,
          dueDate: null,
        });
        this.setEditControlsEnabled(false);
        return;
      }
      this.taskService.getTaskById(id).subscribe({
        next: (task) => {
          this.patchFormFromTask(task);
          this.setEditControlsEnabled(true);
        },
        error: (err) => {
          this.setEditControlsEnabled(false);
        },
      });
    });

    // Initially disable edit controls until a task is selected
    this.setEditControlsEnabled(false);
  }

  private patchFormFromTask(task: Task) {
    this.taskForm.patchValue({
      title: task.title ?? null,
      description: task.description ?? null,
      status: task.status ?? null,
      priority: task.priority ?? null,
      dueDate: task.dueDate ? this.toLocalDateTimeInput(task.dueDate) : null,
    });
  }

  // Converts ISO string (UTC) to yyyy-MM-ddTHH:mm for datetime-local input
  private toLocalDateTimeInput(iso: string): string {
    try {
      const d = new Date(iso);
      const pad = (n: number) => n.toString().padStart(2, '0');
      const yyyy = d.getFullYear();
      const mm = pad(d.getMonth() + 1);
      const dd = pad(d.getDate());
      const hh = pad(d.getHours());
      const min = pad(d.getMinutes());
      return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    } catch {
      return '';
    }
  }

  setEditControlsEnabled(enabled: boolean) {
    const controls = ['title', 'description', 'status', 'priority', 'dueDate'];
    controls.forEach((name) => {
      const control = this.taskForm.get(name);
      if (!control) return;
      if (enabled) {
        control.enable({ emitEvent: false });
      } else {
        control.disable({ emitEvent: true });
      }
    });
  }

  onSubmit() {
    if (this.taskForm.invalid) return;

    const id = this.taskForm.controls['taskId'].value as string;

    const updateTask: AddTaskDTO = {
      title: this.taskForm.controls['title'].value,
      description: this.taskForm.controls['description'].value ?? undefined,
      status: this.taskForm.controls['status'].value,
      priority: this.taskForm.controls['priority'].value,
      dueDate: this.taskForm.controls['dueDate'].value
        ? new Date(this.taskForm.controls['dueDate'].value).toISOString()
        : undefined,

    };

    console.log('Updating Task: ', updateTask);
    this.taskService.updateTask(id, updateTask).subscribe({
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
