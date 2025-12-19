import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

import { ListProjectsComponent } from './list-projects.component';
import { ProjectService } from '../projects.service';
import { Project } from '../project';

describe('ListProjectsComponent', () => {
  let fixture: ComponentFixture<ListProjectsComponent>;
  let component: ListProjectsComponent;
  let projectService: ProjectService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        ListProjectsComponent,
      ],
      providers: [ProjectService],
    }).compileComponents();

    projectService = TestBed.inject(ProjectService);
  });

  it('should create', () => {
    fixture = TestBed.createComponent(ListProjectsComponent);
    component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should display Projects in the DOM', () => {
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

    fixture = TestBed.createComponent(ListProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // render

    const items = fixture.debugElement.queryAll(By.css('li.project-item'));
    expect(items.length).toBe(1);
  });

  it('should handle error when fetching Projects', () => {
    spyOn(projectService, 'getProjects').and.returnValue(
      throwError(() => new Error('Error fetching Projects'))
    );

    fixture = TestBed.createComponent(ListProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.projects.length).toBe(0);
    expect(component.serverMessageType).toBe('error');
    expect(component.loading).toBeFalse();
  });
});
