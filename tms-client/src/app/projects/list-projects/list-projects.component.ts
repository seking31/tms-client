import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project } from '../project';
import { ProjectService } from '../projects.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-list-project',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="project-container">
      <h2>All Projects</h2>

      <p *ngIf="loading">Loading projects...</p>
      <p *ngIf="serverMessage" [ngClass]="serverMessageType">
        {{ serverMessage }}
      </p>

      <ul *ngIf="!loading && projects.length > 0; else noProjects">
        <li *ngFor="let project of projects" class="project-item">
          <strong>Title:</strong> {{ project.name }}<br />

          <small *ngIf="project.description">
            <strong>Description:</strong> {{ project.description }} </small
          ><br />

          <small *ngIf="project.dateCreated">
            <strong>Created:</strong> {{ project.dateCreated }} </small
          ><br />

          <small *ngIf="project.dateModified">
            <strong>Modified:</strong> {{ project.dateModified }} </small
          ><br />

          <small *ngIf="project.projectId">
            <strong>Project ID:</strong> {{ project.projectId }} </small
          ><br />
        </li>
      </ul>

      <ng-template #noProjects>
        <p>No projects found.</p>
      </ng-template>
    </div>
  `,
  styles: [
    `
      .project-container {
        padding: 1rem;
        max-width: 600px;
        margin: auto;
      }
      .project-item {
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
export class ListProjectsComponent {
  projects: Project[] = [];
  loading = true;
  serverMessage: string | null = null;
  serverMessageType: 'success' | 'error' | null = null;

  constructor(private projectService: ProjectService) {
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
}
