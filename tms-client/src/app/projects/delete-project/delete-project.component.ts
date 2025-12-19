import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project } from '../project';
import { ProjectService } from '../projects.service';

@Component({
  selector: 'app-delete-project',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="project-container">
      <!-- Dropdown -->
      <label class="header" for="projectSelect">
        <strong>Select Project ID to delete:</strong>
      </label>

      <select
        id="projectSelect"
        [disabled]="loadingIds || loading"
        (change)="onSelectId($event)"
      >
        <option value="">-- Select an ID --</option>
        <option *ngFor="let p of projectsList" [value]="p._id">
          {{ p._id }}
        </option>
      </select>

      <!-- Loading project IDs -->
      <div *ngIf="loadingIds">Loading project IDs…</div>

      <!-- Deleting -->
      <div *ngIf="loading && !loadingIds">Deleting project…</div>

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
      .project-container {
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
export class DeleteProjectComponent implements OnInit {
  // dropdown data
  projectsList: Project[] = [];
  loadingIds = false;

  // delete state
  loading = false;
  error?: string;
  successMessage?: string;

  constructor(private projects: ProjectService) {}

  ngOnInit(): void {
    this.fetchProjectIds();
  }

  private fetchProjectIds(): void {
    this.loadingIds = true;
    this.error = undefined;

    this.projects.getProjects().subscribe({
      next: (list: Project[]) => {
        this.projectsList = (list ?? []).filter((p) => !!p?._id);
        this.loadingIds = false;

        if (this.projectsList.length === 0) {
          this.error = 'No projects found.';
        }
      },
      error: (err: any) => {
        this.loadingIds = false;
        this.error = `Unable to load project IDs. ${err?.message ?? ''}`.trim();
        console.error('Error loading project IDs:', err);
      },
    });
  }

  onSelectId(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;

    // Reset messages
    this.error = undefined;
    this.successMessage = undefined;

    if (!id) {
      this.error = 'Please select a valid project ID.';
      return;
    }

    this.deleteProject(id);
  }

  private deleteProject(id: string): void {
    this.loading = true;

    this.projects.deleteProjects(id).subscribe({
      next: (res: { message: string }) => {
        this.loading = false;
        this.successMessage = res.message;

        // remove deleted project from dropdown
        this.projectsList = this.projectsList.filter((p) => p._id !== id);
      },
      error: (err: any) => {
        this.loading = false;
        this.error = `Unable to delete project. ${err?.message ?? ''}`.trim();
        console.error('Error deleting project:', err);
      },
    });
  }
}
