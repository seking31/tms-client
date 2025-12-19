import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ReadTaskComponent } from './read-task.component';
import { TaskService } from '../tasks.service';
import { Task } from '../task';

describe('ReadTaskComponent', () => {
  let fixture: ComponentFixture<ReadTaskComponent>;
  let component: ReadTaskComponent;

  const routeStub = {
    snapshot: { paramMap: { get: (_: string) => '123' } },
  };

  const mockTask: Task = {
    _id: '123',
    title: 'Test Task',
    status: 'pending',
    priority: 'low',
    dueDate: '2025-12-31',
    description: 'Demo description',
  };

  let serviceStub: jasmine.SpyObj<TaskService>;

  beforeEach(async () => {
    serviceStub = jasmine.createSpyObj<TaskService>('TaskService', [
      'getTaskById',
    ]);
    serviceStub.getTaskById.and.returnValue(of(mockTask));

    await TestBed.configureTestingModule({
      imports: [ReadTaskComponent],
      providers: [
        { provide: ActivatedRoute, useValue: routeStub },
        { provide: TaskService, useValue: serviceStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReadTaskComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should call service when a task id is selected and render title', () => {
    const select: HTMLSelectElement =
      fixture.nativeElement.querySelector('#taskSelect');

    const selectedId = select.options[1].value; // "650c1f1e1c9d440000a1b1c1"
    select.value = selectedId;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(serviceStub.getTaskById).toHaveBeenCalledTimes(1);
    expect(serviceStub.getTaskById).toHaveBeenCalledWith(selectedId);

    const compiled: HTMLElement = fixture.nativeElement;
    expect(compiled.querySelector('h2')?.textContent).toContain('Test Task');
  });

  it('should show error message when service fails after selection', () => {
    serviceStub.getTaskById.and.returnValue(
      throwError(() => new Error('boom'))
    );

    const select: HTMLSelectElement =
      fixture.nativeElement.querySelector('#taskSelect');

    const selectedId = select.options[1].value;
    select.value = selectedId;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(component.error).toBeDefined();
    const compiled: HTMLElement = fixture.nativeElement;
    expect(compiled.textContent).toContain('Unable to load task.');
  });
});
