import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

import { TaskService } from '../tasks.service';
import { Task } from '../task';
import { TaskFindComponent } from './find-tasks.component';

describe('TaskFindComponent', () => {
  let fixture: ComponentFixture<TaskFindComponent>;
  let component: TaskFindComponent;
  let taskService: TaskService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        TaskFindComponent,
      ],
      providers: [TaskService],
    }).compileComponents();

    taskService = TestBed.inject(TaskService);
  });

  it('should create', () => {
    fixture = TestBed.createComponent(TaskFindComponent);
    component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should not submit when form is invalid', () => {
    fixture = TestBed.createComponent(TaskFindComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const spyFind = spyOn(taskService, 'findTask');

    const button = fixture.debugElement.query(By.css('button.task_btn'));
    button.triggerEventHandler('click', null);

    expect(component.taskForm.invalid).toBeTrue();
  });

  it('should call findTask and display results', () => {
    const mockTasks: Task[] = [
      {
        _id: '1000',
        title: 'Write unit tests',
        description: 'Write tests for TaskFindComponent',
        status: 'In Progress',
        priority: 'High',
        dueDate: '2025-01-10T00:00:00.000Z',
        dateCreated: '2025-01-01T00:00:00.000Z',
        dateModified: '2025-01-05T00:00:00.000Z',
        projectId: 1000,
      },
      {
        _id: '2000',
        title: 'Refactor search form',
        description: 'Improve validation and UX for search form',
        status: 'Pending',
        priority: 'Medium',
        dueDate: '2025-01-15T00:00:00.000Z',
        dateCreated: '2025-01-02T00:00:00.000Z',
        dateModified: '2025-01-06T00:00:00.000Z',
        projectId: 2000,
      },
    ];

    spyOn(taskService, 'findTask').and.returnValue(of(mockTasks));

    fixture = TestBed.createComponent(TaskFindComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.taskForm.controls['term'].setValue('Write');
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button.task_btn'));
    button.triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(component.tasks.length).toBe(2);
  });

  it('should handle no tasks found', () => {
    spyOn(taskService, 'findTask').and.returnValue(of([]));

    fixture = TestBed.createComponent(TaskFindComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.taskForm.controls['term'].setValue('nope');
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button.task_btn'));
    button.triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(component.tasks.length).toBe(0);
  });
});
