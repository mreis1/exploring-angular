import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventEmitterDialogueComponent } from './event-emitter-dialogue.component';

describe('EventEmitterDialogueComponent', () => {
  let component: EventEmitterDialogueComponent;
  let fixture: ComponentFixture<EventEmitterDialogueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventEmitterDialogueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventEmitterDialogueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
