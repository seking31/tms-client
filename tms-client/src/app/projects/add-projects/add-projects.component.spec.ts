import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddProjectsComponent } from './add-projects.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {By} from "@angular/platform-browser";

describe('AddProjectsComponent', () => {
  let component: AddProjectsComponent;
  let fixture: ComponentFixture<AddProjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddProjectsComponent, RouterTestingModule, HttpClientTestingModule],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display form in the DOM', () => {
    const form = fixture.debugElement.query(By.css('form'));
    expect(form).toBeTruthy();
  });

  it('should display error message when form is invalid', () => {
    const nameControl = component.projectForm.get('name');
    nameControl?.markAsTouched();   // mark the control as touched
    fixture.detectChanges();

    const error = fixture.debugElement.query(By.css('.error'));
    expect(error).toBeTruthy();
  });

  it('should display success message when form is valid', () => {
    component.projectForm.setValue({
      name: 'My Project',
      description: 'Description',
      startDate: '2025-01-01',
      endDate: '2025-01-10',
      dateCreated: '2025-01-01'
    });

    // Simulate successful API call
    component.successMessage = 'Project created successfully!';
    fixture.detectChanges();

    const success = fixture.debugElement.query(By.css('.success'));
    expect(success).toBeTruthy();
    expect(success.nativeElement.textContent).toContain('Project created successfully!');
  });

});
