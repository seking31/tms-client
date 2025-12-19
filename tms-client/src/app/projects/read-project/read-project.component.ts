import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from '../projects.service';
import { Project } from '../project';

@Component({
  selector: 'app-read-project',
  standalone: true,
  imports: [CommonModule],
  template: `
  <section class="read-project">

    <!-- Loading state -->
    <p *ngIf="loading" class="status loading">
      Loading project...
    </p>

    <!-- Error state -->
    <p *ngIf="error" class="status error">
      {{ error }}
    </p>

    <!-- Project details -->
    <div *ngIf="!loading && project" class="project-card">
      <h2 class="project-title">{{ project.name }}</h2>

      <p class="project-description" *ngIf="project.description">
        {{ project.description }}
      </p>

      <ul class="project-meta">
        <li><strong>Project ID:</strong> {{ project.projectId }}</li>
        <li *ngIf="project.startDate">
          <strong>Start Date:</strong> {{ project.startDate | date }}
        </li>
        <li *ngIf="project.endDate">
          <strong>End Date:</strong> {{ project.endDate | date }}
        </li>
      </ul>
    </div>

  </section>
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
  `
  ],
})

export class ReadProjectComponent implements OnInit {
  project!: Project;
  loading = true;
  error?: string;

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error = 'Invalid project ID.';
      this.loading = false;
      return;
    }

    this.projectService.getProjectById(id).subscribe({
      next: (data) => {
        this.project = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load project.';
        this.loading = false;
      }
    });
  }
}