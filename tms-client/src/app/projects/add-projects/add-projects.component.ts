import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgIf } from '@angular/common';
import { AddProjectDTO } from '../project';
import { Router } from '@angular/router';
import { ProjectService } from '../projects.service';

@Component({
  selector: 'app-add-projects',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  template: `
    <div class="task-add-page">
      <h1 class="task-add-page_title">Add New Project</h1>
      <h4 class="task-add-page_subtitle">
        Create a project by providing its name, description, and dates.
      </h4>

      <form [formGroup]="projectForm" (ngSubmit)="onSubmit()" novalidate>
        <div class="task-add-page_form-group">
          <label for="name" class="task-add-page_form-label"
            >Project Name</label
          >
          <input
            id="name"
            type="text"
            class="task-add-page_form-control"
            formControlName="name"
            placeholder="Enter project name"
          />
          <small
            class="error"
            *ngIf="
              projectForm.get('name')?.invalid &&
              projectForm.get('name')?.touched
            "
          >
            Name is required (min 3 characters).
          </small>
        </div>

        <div class="task-add-page_form-group">
          <label for="description" class="task-add-page_form-label"
            >Description</label
          >
          <textarea
            id="description"
            rows="4"
            class="task-add-page_form-control"
            formControlName="description"
            placeholder="Brief description of the project"
          ></textarea>
        </div>

        <div class="task-add-page_form-group">
          <label for="startDate" class="task-add-page_form-label"
            >Start Date</label
          >
          <input
            id="startDate"
            type="date"
            class="task-add-page_form-control"
            formControlName="startDate"
          />
        </div>

        <div class="task-add-page_form-group">
          <label for="endDate" class="task-add-page_form-label">End Date</label>
          <input
            id="endDate"
            type="date"
            class="task-add-page_form-control"
            formControlName="endDate"
          />
        </div>

        <button
          class="btn task-add-page_btn"
          type="submit"
          [disabled]="projectForm.invalid"
        >
          Submit
        </button>
      </form>

      <div>
        <small class="success" *ngIf="successMessage">{{
          successMessage
        }}</small>
      </div>
    </div>
  `,
  styles: `
    .task-add-page {
      max-width: 720px;
      margin: 0 auto;
      padding: 1rem;
    }
    .task-add-page_title {
      margin: 0 0 .25rem 0;
    }
    .task-add-page_subtitle {
      margin: 0 0 1rem 0;
      color: #666; font-weight: 400;
    }
    .task-add-page_form-group {
      margin-bottom: 1rem;
      display: flex;
      flex-direction: column;
      gap: .25rem;
    }
    .task-add-page_form-label {
      font-weight: 600;
    }
    .task-add-page_form-control {
      padding: .5rem .75rem;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    .task-add-page_btn {
      background: var(--medium_blue);
      color: #fff;
      border: 0;
      padding: .5rem 1rem;
      border-radius: 4px; cursor: pointer;
    }
    .task-add-page_btn:disabled {
      opacity: .6;
      cursor: not-allowed;
    }
    .success {
      color: #1abc9c;
      margin-top: .75rem;
    }
    .error {
      color: #e74c3c;
      margin-top: .75rem;
    }
  `,
})
export class AddProjectsComponent {
  projectForm: FormGroup = this.fb.group({
    name: [null, Validators.required],
    description: [null],
    startDate: [null],
    endDate: [null],
    dateCreated: [null],
  });
  successMessage: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private projectService: ProjectService
  ) {}

  onSubmit() {
    if (this.projectForm.valid) {
      const startDate = new Date(
        this.projectForm.controls['startDate'].value
      ).toISOString();
      const endDate = new Date(
        this.projectForm.controls['endDate'].value
      ).toISOString();
      const dateCreated = new Date(
        this.projectForm.controls['dateCreated'].value
      ).toISOString();

      const newProject: AddProjectDTO = {
        name: this.projectForm.controls['name'].value,
        description: this.projectForm.controls['description'].value,
        startDate: startDate,
        endDate: endDate,
        dateCreated: dateCreated,
      };

      console.log('Creating Project:', newProject);

      this.projectService.addProject(newProject).subscribe({
        next: (result) => {
          console.log('Project created:', result);
          this.successMessage = 'Project created successfully!';
          this.router.navigate(['/projects/projects-list']);
        },
        error: (error) => {
          console.error('Error creating project:', error);
        },
      });
    }
  }
}
