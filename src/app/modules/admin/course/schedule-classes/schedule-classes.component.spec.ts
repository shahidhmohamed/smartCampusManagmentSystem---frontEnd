import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleClassesComponent } from './schedule-classes.component';

describe('ScheduleClassesComponent', () => {
  let component: ScheduleClassesComponent;
  let fixture: ComponentFixture<ScheduleClassesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleClassesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ScheduleClassesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
