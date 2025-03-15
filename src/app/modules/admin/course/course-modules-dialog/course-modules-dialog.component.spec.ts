import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseModulesDialogComponent } from './course-modules-dialog.component';

describe('CourseModulesDialogComponent', () => {
  let component: CourseModulesDialogComponent;
  let fixture: ComponentFixture<CourseModulesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseModulesDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CourseModulesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
