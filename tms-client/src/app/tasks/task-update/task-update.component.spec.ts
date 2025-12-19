import {ComponentFixture, fakeAsync, TestBed} from '@angular/core/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';

import { TaskUpdateComponent } from './task-update.component';

describe('TaskUpdateComponent', () => {
  let component: TaskUpdateComponent;
  let fixture: ComponentFixture<TaskUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskUpdateComponent, HttpClientTestingModule, RouterTestingModule],
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set form controls as disabled', () => {
    expect(component.taskForm.get('title')?.disabled).toBeTrue();
    expect(component.taskForm.get('status')?.disabled).toBeTrue();
    expect(component.taskForm.get('priority')?.disabled).toBeTrue();
  });

  it('should enable edit controls when setEditControlsEnabled(true) is called', () => {
    component.setEditControlsEnabled(true);
    expect(component.taskForm.get('title')?.enabled).toBeTrue();
    expect(component.taskForm.get('description')?.enabled).toBeTrue();
    expect(component.taskForm.get('dueDate')?.enabled).toBeTrue();
  });


  it('should invalidate title shorter than 3 characters', () => {
    const titleControl = component.taskForm.get('title');
    titleControl?.enable();
    titleControl?.setValue('ab');
    expect(titleControl?.invalid).toBeTrue();
    expect(titleControl?.errors?.['minlength']).toBeTruthy();
  });
});
