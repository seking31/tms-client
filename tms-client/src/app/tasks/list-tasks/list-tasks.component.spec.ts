import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

import { ListTasksComponent } from './list-tasks.component';
import { TaskService } from '../tasks.service';
import { Task } from '../task';

describe('ListTasksComponent', () => {
  let fixture: ComponentFixture<ListTasksComponent>;
  let component: ListTasksComponent;
  let taskService: TaskService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        ListTasksComponent,
      ],
      providers: [TaskService],
    }).compileComponents();

    taskService = TestBed.inject(TaskService);
  });

  it('should create', () => {
    fixture = TestBed.createComponent(ListTasksComponent);
    component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should display tasks in the DOM', () => {
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

    spyOn(taskService, 'getTasks').and.returnValue(of(mockTasks));

    fixture = TestBed.createComponent(ListTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // render

    const items = fixture.debugElement.queryAll(By.css('li.task-item'));
    expect(items.length).toBe(2);
    expect(items[0].nativeElement.textContent).toContain(
      'Complete project documentation'
    );
    expect(items[1].nativeElement.textContent).toContain('Kickoff meeting');
  });

  it('should handle error when fetching tasks', () => {
    spyOn(taskService, 'getTasks').and.returnValue(
      throwError(() => new Error('Error fetching tasks'))
    );

    fixture = TestBed.createComponent(ListTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.tasks.length).toBe(0);
    expect(component.serverMessageType).toBe('error');
    expect(component.loading).toBeFalse();
  });
});
