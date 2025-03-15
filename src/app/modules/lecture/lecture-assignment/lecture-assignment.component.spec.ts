import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LectureAssignmentComponent } from './lecture-assignment.component';

describe('LectureAssignmentComponent', () => {
  let component: LectureAssignmentComponent;
  let fixture: ComponentFixture<LectureAssignmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LectureAssignmentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LectureAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
