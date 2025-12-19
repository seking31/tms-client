import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AddProjectDTO, Project, UpdateProjectDTO } from '../project';
import { ProjectService } from '../projects.service';

@Component({
  selector: 'app-project-update',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <div class="project-update_container">
      <h1 class="project-update_title">Update Project</h1>
      <h4 class="project-update_subtitle">
        Select a project to view and make changes.
      </h4>

      <div class="update-project_form-container">
        <form
          [formGroup]="projectForm"
          class="update-project_form"
          (ngSubmit)="onSubmit()"
        >
          <div class="update-project_form-group">
            <label for="_id" class="project-update-page_form-label">
              Select Project
            </label>
            <select
              id="_id"
              class="project-update-page_form-control"
              formControlName="_id"
            >
              <option value="" disabled>
                {{
                  loadingProjects
                    ? 'Loading projects…'
                    : '-- Select a project --'
                }}
              </option>
              <option *ngFor="let p of projects" [ngValue]="p._id">
                {{ p.name }}
              </option>
            </select>
          </div>

          <div class="update-project_form-group">
            <label for="name" class="project-update_form-label">
              Project Name
            </label>
            <input
              type="text"
              id="name"
              class="project-update_form-control"
              formControlName="name"
            />
          </div>

          <div class="project-update_form-group">
            <label for="description" class="project-update_form-label">
              Project Description
            </label>
            <textarea
              id="description"
              rows="6"
              class="project-update_form-control"
              formControlName="description"
            ></textarea>
          </div>

          <div class="project-update_meta" *ngIf="selectedProject">
            <small *ngIf="selectedProject.dateCreated">
              <strong>Created:</strong> {{ selectedProject.dateCreated }}
            </small>
            <br />
            <small *ngIf="selectedProject.dateModified">
              <strong>Last Modified:</strong> {{ selectedProject.dateModified }}
            </small>
          </div>

          <button
            class="btn project-update_btn"
            type="submit"
            *ngIf="projectForm.get('_id')?.value"
          >
            Update Project
          </button>

          <a class="project-update_link" routerLink="/projects">Return</a>
        </form>
      </div>
    </div>
  `,
  styles: `
    .project-update_title {
      text-align: center;
      color: var(--dark_blue);
      margin-bottom: 0.25rem;
    }
    .project-update_subtitle {
      text-align: center;
      color: var(--medium_blue);
      font-size: 0.9rem;
      font-style: italic;
      margin-bottom: 1.5rem;
    }
    .update-project_form-container {
      width: 60%;
      margin: 0 auto;
      border-radius: 0.5rem;
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.08);
      padding: 1.5rem;
    }
    .update-project_form {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.25rem;
    }
    .update-project_form-group,
    .project-update_form-group {
      display: flex;
      flex-direction: column;
    }
    .project-update-page_form-label,
    .project-update_form-label {
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: var(--medium_blue);
    }
    .project-update-page_form-control,
    .project-update_form-control {
      padding: 0.75rem 1rem;
      border: 1px solid var(--light_blue);
      border-radius: 0.25rem;
      font-size: 1rem;
      width: 100%;
      box-sizing: border-box;
      transition: border-color 0.2s ease-in-out;
    }
    .project-update-page_form-control:focus,
    .project-update_form-control:focus {
      outline: none;
      border-color: var(--dark_blue);
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }
    .project-update_meta {
      font-size: 0.85rem;
      color: var(--medium_blue);
    }
  `,
})
export class ProjectUpdateComponent implements OnInit {
  loadingProjects = false;
  projects: Project[] = [];
  selectedProject: Project | null = null;

  projectForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.projectForm = this.fb.group({
      _id: [{ value: null, disabled: true }, Validators.required],
      name: [
        { value: null, disabled: true },
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ],
      ],
      description: [{ value: null, disabled: true }, Validators.maxLength(500)],
    });

    this.setEditControlsEnabled(false);

    // Load project list
    this.loadingProjects = true;
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.projects = [...projects].sort((a, b) =>
          (a.name || '').localeCompare(b.name || '')
        );
        this.loadingProjects = false;
        this.projectForm.get('_id')?.enable();
      },
      error: () => (this.loadingProjects = false),
    });

    // When a project is selected
    this.projectForm.get('_id')!.valueChanges.subscribe((id: number | null) => {
      if (id == null) {
        this.selectedProject = null;
        this.projectForm.patchValue({ name: null, description: null });
        this.setEditControlsEnabled(false);
        return;
      }

      this.projectService.getProjectById(id.toString()).subscribe({
        next: (project) => {
          this.selectedProject = project;
          this.patchFormFromProject(project);
          this.setEditControlsEnabled(true);
        },
        error: () => {
          this.selectedProject = null;
          this.setEditControlsEnabled(false);
        },
      });
    });
  }

  private patchFormFromProject(project: Project) {
    this.projectForm.patchValue({
      name: project.name ?? null,
      description: project.description ?? null,
    });
  }

  private setEditControlsEnabled(enabled: boolean) {
    ['name', 'description'].forEach((controlName) => {
      const control = this.projectForm.get(controlName);
      if (!control) return;

      enabled
        ? control.enable({ emitEvent: false })
        : control.disable({ emitEvent: true });
    });
  }

  onSubmit() {
    if (this.projectForm.invalid || !this.selectedProject) return;

    const id = this.projectForm.get('_id')!.value as number;

    const updateProject: UpdateProjectDTO = {
      name: this.projectForm.get('name')!.value!,
      description: this.projectForm.get('description')!.value ?? undefined,
      startDate: this.selectedProject.startDate, // optional
      endDate: this.selectedProject.endDate, // optional
    };

    this.projectService.updateProject(id.toString(), updateProject).subscribe({
      next: () => this.router.navigate(['/projects/projects-list']),
      error: (error) => console.error('Error updating project', error),
    });
  }
}
