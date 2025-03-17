import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LectureAssignmentSubmitionsComponent } from './lecture-assignment-submitions.component';

describe('LectureAssignmentSubmitionsComponent', () => {
  let component: LectureAssignmentSubmitionsComponent;
  let fixture: ComponentFixture<LectureAssignmentSubmitionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LectureAssignmentSubmitionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LectureAssignmentSubmitionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
