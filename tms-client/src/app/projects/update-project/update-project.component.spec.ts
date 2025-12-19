import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

import { ProjectUpdateComponent } from './update-project.component';
import { ProjectService } from '../projects.service';
import { Project } from '../project';

describe('ProjectUpdateComponent', () => {
  let fixture: ComponentFixture<ProjectUpdateComponent>;
  let component: ProjectUpdateComponent;
  let projectService: ProjectService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        ProjectUpdateComponent,
      ],
      providers: [ProjectService],
    }).compileComponents();

    projectService = TestBed.inject(ProjectService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectUpdateComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display Projects in the DOM (as select options)', () => {
    const mockProjects: Project[] = [
      {
        _id: '2',
        projectId: 1000,
        name: 'Project 2',
        description: 'Should add a new Project.',
        startDate: '2026-01-01T00:00:00.000Z',
        dateCreated: '2025-12-02T00:00:00.000Z',
        dateModified: '2025-12-05T00:00:00.000Z',
      },
    ];

    spyOn(projectService, 'getProjects').and.returnValue(of(mockProjects));

    fixture.detectChanges();

    const selectDebugEl = fixture.debugElement.query(
      By.css('select[formControlName="_id"]')
    );
    const options = selectDebugEl.queryAll(By.css('option'));

    expect(options.length).toBe(mockProjects.length + 1);

    const projectOptionEl: HTMLOptionElement = options[1].nativeElement;
    expect(projectOptionEl.textContent?.trim()).toBe('Project 2');

    expect(component.projects.length).toBe(1);
    expect(component.projects[0].name).toBe('Project 2');
  });

  it('should handle error when fetching Projects', () => {
    spyOn(projectService, 'getProjects').and.returnValue(
      throwError(() => new Error('Error fetching Projects'))
    );

    fixture.detectChanges();

    expect(component.projects.length).toBe(0);
    expect(component.loadingProjects).toBeFalse();
  });
});
