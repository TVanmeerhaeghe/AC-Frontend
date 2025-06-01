import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GalleryAboutUsComponent } from './gallery-about-us.component';

describe('GalleryAboutUsComponent', () => {
  let component: GalleryAboutUsComponent;
  let fixture: ComponentFixture<GalleryAboutUsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GalleryAboutUsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GalleryAboutUsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
