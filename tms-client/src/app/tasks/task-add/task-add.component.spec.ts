import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { TaskAddComponent } from './task-add.component';
import { RouterTestingModule } from '@angular/router/testing';
import { AddTaskDTO } from '../task';

describe('TaskAddComponent', () => {
  let component: TaskAddComponent;
  let fixture: ComponentFixture<TaskAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TaskAddComponent, // standalone component
        RouterTestingModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Form should be invalid when empty', () => {
    expect(component.taskForm.valid).toBeFalsy();
  });

  it('should mark title as required', () => {
    const title = component.taskForm.controls['title'];
    title.setValue('');
    expect(title.hasError('required')).toBeTruthy();
  });
});
