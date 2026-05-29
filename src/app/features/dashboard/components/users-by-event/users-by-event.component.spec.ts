import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersByEventComponent } from './users-by-event.component';

describe('UsersByEventComponent', () => {
  let component: UsersByEventComponent;
  let fixture: ComponentFixture<UsersByEventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UsersByEventComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UsersByEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
