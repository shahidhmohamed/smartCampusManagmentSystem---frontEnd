import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentAttendenceComponent } from './student-attendence.component';

describe('StudentAttendenceComponent', () => {
  let component: StudentAttendenceComponent;
  let fixture: ComponentFixture<StudentAttendenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentAttendenceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StudentAttendenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
