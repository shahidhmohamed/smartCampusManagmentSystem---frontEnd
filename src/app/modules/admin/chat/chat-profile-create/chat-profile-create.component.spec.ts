import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatProfileCreateComponent } from './chat-profile-create.component';

describe('ChatProfileCreateComponent', () => {
  let component: ChatProfileCreateComponent;
  let fixture: ComponentFixture<ChatProfileCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatProfileCreateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChatProfileCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
