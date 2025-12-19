import { Component } from '@angular/core';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProjectService } from '../projects.service';
import { Project } from '../project';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-project-find',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, NgIf, NgForOf],
  template: `
    <div class="project-find-page" [formGroup]="projectForm">
      <h1 class="project-find-page_title">Find Project</h1>
      <h4 class="project-find-page_subtitle">
        Fill in the search bar to find projects
      </h4>

      <div class="add-project-page_form-group">
        <label for="term" class="project-add-page_form-label">
          Project Name
        </label>

        <input
          type="text"
          id="term"
          class="project-add-page_form-control"
          formControlName="term"
        />

        <div
          class="error-message"
          style="color: #7c0505;"
          *ngIf="
            projectForm.controls['term'].invalid &&
            projectForm.controls['term'].touched
          "
        >
          <small *ngIf="projectForm.controls['term'].errors?.['required']">
            Project search term is required.
          </small>
          <small *ngIf="projectForm.controls['term'].errors?.['minlength']">
            Project search term must be at least 3 characters long.
          </small>
        </div>
      </div>

      <button
        type="button"
        class="project_btn"
        (click)="onSubmit()"
        [disabled]="projectForm.invalid"
      >
        Search Project
      </button>

      <!-- Results section -->
      <div *ngIf="searched">
        <h3>Search Results</h3>

        <ul *ngIf="projects.length > 0; else noProjects">
          <li *ngFor="let project of projects" class="project-item">
            <strong>Name:</strong> {{ project.name }}<br />

            <small *ngIf="project.description">
              <strong>Description:</strong> {{ project.description }}
            </small>
            <br />

            <small *ngIf="project.dateCreated">
              <strong>Created:</strong> {{ project.dateCreated }}
            </small>
            <br />

            <small *ngIf="project.dateModified">
              <strong>Modified:</strong> {{ project.dateModified }}
            </small>
            <br />

            <small *ngIf="project.projectId">
              <strong>Project ID:</strong> {{ project.projectId }}
            </small>
            <br />
          </li>
        </ul>
      </div>

      <ng-template #noProjects>
        <p>No projects found.</p>
      </ng-template>
    </div>
  `,
  styles: [
    `
      .project-find-page {
        max-width: 600px;
        margin: 2rem auto;
        padding: 1.5rem;
      }

      .project-find-page_title {
        text-align: center;
        color: var(--dark_blue);
        margin-bottom: 0.25rem;
      }

      .project-find-page_subtitle {
        text-align: center;
        color: var(--medium_blue);
        margin-bottom: 1.5rem;
        font-size: 0.9rem;
      }

      .add-project-page_form-group {
        margin-bottom: 1rem;
      }

      .project-add-page_form-label {
        display: block;
        margin-bottom: 0.35rem;
        font-weight: 600;
      }

      .project-add-page_form-control {
        width: 100%;
        padding: 0.6rem;
        border: 1px solid #ccc;
        border-radius: 6px;
        font-size: 0.95rem;
        box-sizing: border-box;
      }

      .project-add-page_form-control.ng-invalid.ng-touched {
        border-color: #c0392b;
      }

      .error-message {
        color: #c0392b;
        font-size: 0.8rem;
        margin-top: 0.25rem;
      }

      .project_btn {
        padding: 0.6rem 1.2rem;
        border: none;
        background-color: var(--dark_blue);
        color: white;
        cursor: pointer;
        font-size: 0.95rem;
      }

      .project_btn:disabled {
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
export class ProjectFindComponent {
  projectForm: FormGroup = this.fb.group({
    term: [null, [Validators.required, Validators.minLength(3)]],
  });

  projects: Project[] = [];
  searched = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private projectService: ProjectService
  ) {}

  onSubmit(): void {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }

    const term = this.projectForm.controls['term'].value;
    console.log('Searching Projects for:', term);

    this.projectService.findProject(term).subscribe({
      next: (result: Project[]) => {
        this.searched = true;
        this.projects = result;
        console.log('Projects found:', result);
      },
      error: (error: any) => {
        this.searched = true;
        this.projects = [];
        console.error('Error finding projects', error);
      },
    });
  }
}
