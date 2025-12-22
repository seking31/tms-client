import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project } from '../project';
import { ProjectService } from '../projects.service';
import { Subject, finalize, takeUntil } from 'rxjs';

@Component({
  selector: 'app-delete-project',
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="project-container" aria-labelledby="page-title">
      <h1 id="page-title" class="page-title">Delete Project</h1>
      <!-- Status messages (announced) -->
      <div class="status" role="status" aria-live="polite" aria-atomic="true">
        <p *ngIf="loadingIds" class="status-text">Loading project IDs…</p>
        <p *ngIf="loading && !loadingIds" class="status-text">
          Deleting project…
        </p>
        <p *ngIf="successMessage && !loading" class="success">
          {{ successMessage }}
        </p>
      </div>

      <!-- Errors (assertive announcement) -->
      <div
        *ngIf="error && !loading"
        #errorEl
        class="error"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        tabindex="-1"
      >
        {{ error }}
      </div>

      <div class="field">
        <label class="label" for="projectSelect">
          <strong>Select Project ID to delete</strong>
        </label>

        <select
          #selectEl
          id="projectSelect"
          class="select"
          [disabled]="loadingIds || loading || projectsList.length === 0"
          [attr.aria-describedby]="helpTextId"
          (change)="onSelectId($event)"
        >
          <option value="">
            {{
              projectsList.length
                ? '-- Select an ID --'
                : '-- No projects available --'
            }}
          </option>

          <option *ngFor="let p of projectsList" [value]="p._id">
            {{ p.name || 'Untitled Project' }} (ID: {{ p._id }})
          </option>
        </select>

        <p [id]="helpTextId" class="help">
          After you select an ID, the project will be deleted immediately.
        </p>
      </div>

      <!-- Safer: explicit confirmation button (keyboard + SR friendly) -->
      <div class="actions">
        <button
          type="button"
          class="btn"
          [disabled]="!selectedId || loadingIds || loading"
          [attr.aria-disabled]="
            !selectedId || loadingIds || loading ? 'true' : null
          "
          (click)="confirmDelete()"
        >
          <span *ngIf="!loading">Delete selected project</span>
          <span *ngIf="loading">Deleting…</span>
        </button>

        <button
          type="button"
          class="btn"
          [disabled]="loadingIds || loading"
          [attr.aria-disabled]="loadingIds || loading ? 'true' : null"
          (click)="refresh()"
        >
          Refresh list
        </button>
      </div>
    </main>
  `,
  styles: [
    `
      .project-container {
        padding: 1rem;
        max-width: 720px;
        margin: 0 auto;
      }

      .page-title {
        margin: 0 0 0.25rem 0;
      }

      .page-subtitle {
        margin: 0 0 1rem 0;
        color: #555;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-top: 1rem;
      }

      .label {
        margin: 0;
      }

      .select {
        padding: 0.5rem 0.75rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        max-width: 420px;
      }

      .select:focus-visible,
      .btn:focus-visible {
        outline: 3px solid currentColor;
        outline-offset: 3px;
        border-radius: 4px;
      }

      .help {
        margin: 0;
        color: #555;
        font-size: 0.875rem;
      }

      .status {
        min-height: 1.25rem;
      }

      .status-text {
        margin: 0.25rem 0;
      }

      .error {
        color: #b00020;
        margin-top: 0.75rem;
      }

      .success {
        color: #1b7f3a;
        margin-top: 0.75rem;
      }

      .actions {
        display: flex;
        gap: 0.75rem;
        margin-top: 1rem;
        flex-wrap: wrap;
      }

      .danger {
        border-color: #b00020;
        color: #b00020;
      }
    `,
  ],
})
export class DeleteProjectComponent implements OnInit, OnDestroy {
  @ViewChild('errorEl') errorEl?: ElementRef<HTMLElement>;
  @ViewChild('selectEl') selectEl?: ElementRef<HTMLSelectElement>;

  readonly helpTextId = 'delete-project-help';

  // dropdown data
  projectsList: Project[] = [];
  loadingIds = false;

  // selection
  selectedId = '';

  // delete state
  loading = false;
  error = '';
  successMessage = '';

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly projects: ProjectService) {}

  ngOnInit(): void {
    this.fetchProjectIds();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  refresh(): void {
    this.selectedId = '';
    this.successMessage = '';
    this.error = '';
    this.fetchProjectIds();
    queueMicrotask(() => this.selectEl?.nativeElement?.focus());
  }

  private fetchProjectIds(): void {
    this.loadingIds = true;
    this.error = '';
    this.successMessage = '';

    this.projects
      .getProjects()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loadingIds = false;
        })
      )
      .subscribe({
        next: (list: Project[]) => {
          this.projectsList = (list ?? []).filter((p) => !!p?._id);

          if (this.projectsList.length === 0) {
            this.error = 'No projects found.';
            this.focusError();
          }
        },
        error: (err: any) => {
          this.error = `Unable to load project IDs. ${
            err?.message ?? ''
          }`.trim();
          this.focusError();
          // keep console log for devs
          console.error('Error loading project IDs:', err);
        },
      });
  }

  onSelectId(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;

    // Reset messages when selection changes
    this.error = '';
    this.successMessage = '';

    this.selectedId = id ?? '';
    // Do NOT auto-delete on change: prevents accidental deletes and improves a11y/UX.
  }

  confirmDelete(): void {
    this.error = '';
    this.successMessage = '';

    if (!this.selectedId) {
      this.error = 'Please select a valid project ID.';
      this.focusError();
      return;
    }

    this.deleteProject(this.selectedId);
  }

  private deleteProject(id: string): void {
    this.loading = true;

    this.projects
      .deleteProjects(id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (res: { message: string }) => {
          this.successMessage = res?.message || 'Project deleted.';
          // remove deleted project from dropdown
          this.projectsList = this.projectsList.filter((p) => p._id !== id);
          this.selectedId = '';

          // If list is now empty, announce it clearly
          if (this.projectsList.length === 0) {
            this.error = 'No projects found.';
            this.focusError();
          } else {
            queueMicrotask(() => this.selectEl?.nativeElement?.focus());
          }
        },
        error: (err: any) => {
          this.error = `Unable to delete project. ${err?.message ?? ''}`.trim();
          this.focusError();
          console.error('Error deleting project:', err);
        },
      });
  }

  private focusError(): void {
    queueMicrotask(() => this.errorEl?.nativeElement?.focus());
  }
}
