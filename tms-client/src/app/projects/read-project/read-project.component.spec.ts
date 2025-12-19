import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReadProjectComponent } from './read-project.component';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { Project } from '../project';

describe('ReadProjectComponent', () => {
  let component: ReadProjectComponent;
  let fixture: ComponentFixture<ReadProjectComponent>;
  let httpMock: HttpTestingController;

  const mockProject: Project = {
    _id: '650c1f1e1c9d440000a1b1c1',
    projectId: 1000,
    name: 'Project Alpha',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReadProjectComponent, HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => '1000',
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReadProjectComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should retrieve project by ID on init', () => {
    fixture.detectChanges(); // triggers ngOnInit

    const req = httpMock.expectOne('http://localhost:3000/api/projects/1000');
    expect(req.request.method).toBe('GET');

    req.flush(mockProject);

    expect(component.project).toEqual(mockProject);
    expect(component.loading).toBeFalse();
  });

  it('should handle error when project retrieval fails', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne('http://localhost:3000/api/projects/1000');

    req.flush('Error', {
      status: 500,
      statusText: 'Server Error',
    });

    expect(component.error).toBe('Unable to load project.');
    expect(component.loading).toBeFalse();
  });
});
