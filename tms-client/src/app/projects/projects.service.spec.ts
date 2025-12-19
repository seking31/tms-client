// project.service.spec.ts
import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ProjectService } from './projects.service';
import { environment } from '../../environments/environment';
import { Project } from './project';

describe('ProjectService', () => {
  let service: ProjectService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ProjectService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getProjects should call the correct URL and return Projects', () => {
    const mockProjects: Project[] = [
      {
        _id: '650c1f1e1c9d440000a1b1c1',
        projectId: 1000,
        name: 'Project Alpha',
        description: 'Initial phase of the project',
        startDate: '2021-01-01T00:00:00.000Z',
        endDate: '2021-06-01T00:00:00.000Z',
        dateCreated: '2021-01-01T00:00:00.000Z',
        dateModified: '2021-01-05T00:00:00.000Z',
      },
      {
        _id: '650c1f1e1c9d440000a1b1r4',
        projectId: 3000,
        name: 'Project Alpha',
        description: 'Initial phase of the project',
        startDate: '2021-01-01T00:00:00.000Z',
        endDate: '2021-06-01T00:00:00.000Z',
        dateCreated: '2021-01-01T00:00:00.000Z',
        dateModified: '2021-01-05T00:00:00.000Z',
      },
    ];

    service.getProjects().subscribe((Projects) => {
      expect(Projects.length).toBe(2);
      expect(Projects).toEqual(mockProjects);
    });

    const req = httpMock.expectOne(`http://localhost:3000/api/projects`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProjects);
  });
});
