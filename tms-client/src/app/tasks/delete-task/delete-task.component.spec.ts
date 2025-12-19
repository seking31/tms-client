import { TestBed, ComponentFixture } from '@angular/core/testing';
import { DeleteTaskComponent } from './delete-task.component';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { TaskService } from '../tasks.service';
import { Task } from '../task';

describe('DeleteTaskComponent', () => {
  let fixture: ComponentFixture<DeleteTaskComponent>;
  let component: DeleteTaskComponent;
  let taskService: TaskService;

  let serviceStub: jasmine.SpyObj<TaskService>;

  beforeEach(async () => {
    serviceStub = jasmine.createSpyObj<TaskService>('TaskService', [
      'deleteTask',
    ]);
    serviceStub.deleteTask.and.returnValue(
      of({ message: 'task deleted', taskId: '123' })
    );
    await TestBed.configureTestingModule({
      imports: [
        DeleteTaskComponent,
        RouterTestingModule,
        HttpClientTestingModule,
      ],
      providers: [{ provide: TaskService, useValue: serviceStub }],
    }).compileComponents();

    taskService = TestBed.inject(TaskService);
  });
  it('should call service when a task id is selected and delete task', () => {
    fixture = TestBed.createComponent(DeleteTaskComponent);
    const select: HTMLSelectElement =
      fixture.nativeElement.querySelector('#taskSelect');

    const selectedId = select.options[1].value;
    select.value = selectedId;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(taskService.deleteTask).toHaveBeenCalledTimes(1);
  });

  it('should create', () => {
    fixture = TestBed.createComponent(DeleteTaskComponent);
    component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
