import { Component } from '@angular/core';
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

      <select id="projectSelect" (change)="onSelectId($event)">
        <option value="">-- Select an ID --</option>
        <option value="650c1f1e1c9d440000a1b1c1">
          650c1f1e1c9d440000a1b1c1
        </option>
      </select>

      <!-- Loading -->
      <div *ngIf="loading">Deleting project…</div>

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
export class DeleteProjectComponent {
  loading = false;
  error?: string;
  successMessage?: string;

  constructor(private projects: ProjectService) {}

  onSelectId(event: Event) {
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

  deleteProject(id: string) {
    this.loading = true;

    this.projects.deleteProjects(id).subscribe({
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
