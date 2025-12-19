import { TestBed, ComponentFixture } from '@angular/core/testing';
import { DeleteProjectComponent } from './delete-project.component';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { ProjectService } from '../projects.service';
import { Project } from '../project';

describe('DeleteProjectComponent', () => {
  let fixture: ComponentFixture<DeleteProjectComponent>;
  let component: DeleteProjectComponent;
  let projectService: ProjectService;

  let serviceStub: jasmine.SpyObj<ProjectService>;

  beforeEach(async () => {
    serviceStub = jasmine.createSpyObj<ProjectService>('ProjectService', [
      'deleteProjects',
    ]);
    serviceStub.deleteProjects.and.returnValue(
      of({ message: 'project deleted', projectId: '123' })
    );
    await TestBed.configureTestingModule({
      imports: [
        DeleteProjectComponent,
        RouterTestingModule,
        HttpClientTestingModule,
      ],
      providers: [{ provide: ProjectService, useValue: serviceStub }],
    }).compileComponents();

    projectService = TestBed.inject(ProjectService);
  });
  it('should call service when a project id is selected and delete project', () => {
    fixture = TestBed.createComponent(DeleteProjectComponent);
    const select: HTMLSelectElement =
      fixture.nativeElement.querySelector('#projectSelect');

    const selectedId = select.options[1].value;
    select.value = selectedId;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(projectService.deleteProjects).toHaveBeenCalledTimes(1);
  });

  it('should create', () => {
    fixture = TestBed.createComponent(DeleteProjectComponent);
    component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
