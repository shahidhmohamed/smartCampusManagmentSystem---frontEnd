import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceApprovalComponent } from './resource-approval.component';

describe('ResourceApprovalComponent', () => {
  let component: ResourceApprovalComponent;
  let fixture: ComponentFixture<ResourceApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResourceApprovalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ResourceApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
