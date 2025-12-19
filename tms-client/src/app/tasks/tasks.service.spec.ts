// tasks.service.spec.ts
import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TaskService } from './tasks.service';
import { environment } from '../../environments/environment';
import { Task } from './task';

// import { AddTaskDTO } from './task'
describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getTasks should call the correct URL and return tasks', () => {
    const mockTasks: Task[] = [
      {
        _id: '1',
        title: 'Complete project documentation',
        description: 'Write the documentation for the project',
        status: 'In Progress',
        priority: 'High',
        dueDate: '2021-01-10T00:00:00.000Z',
        dateCreated: '2021-01-01T00:00:00.000Z',
        dateModified: '2021-01-05T00:00:00.000Z',
        projectId: 1000,
      },
      {
        _id: '2',
        title: 'Kickoff meeting',
        description: 'Hold the initial kickoff with stakeholders',
        status: 'Pending',
        priority: 'Medium',
        dueDate: '2021-01-03T00:00:00.000Z',
        dateCreated: '2021-01-01T00:00:00.000Z',
        dateModified: '2021-01-02T00:00:00.000Z',
        projectId: 2000,
      },
    ];

    service.getTasks().subscribe((tasks) => {
      expect(tasks.length).toBe(2);
      expect(tasks).toEqual(mockTasks);
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/api/tasks`);
    expect(req.request.method).toBe('GET');
    req.flush(mockTasks);
  });

  it('should add a new task', () => {
    const newTask: Task = {
      _id: '2',
      title: 'Task 2',
      description: 'Should add a new task.',
      status: 'In Progress',
      priority: 'High',
      dueDate: '2026-01-01T00:00:00.000Z',
      dateCreated: '2025-12-02T00:00:00.000Z',
      dateModified: '2025-12-05T00:00:00.000Z',
      projectId: 1000,
    };

    service.addTask(newTask).subscribe((task) => {
      expect(task).toEqual(newTask);
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/api/tasks/1000`);
    expect(req.request.method).toBe('POST');
    req.flush(newTask);
  });
});
