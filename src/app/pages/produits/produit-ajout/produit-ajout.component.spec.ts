import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProduitAjoutComponent } from './produit-ajout.component';

describe('ProduitAjoutComponent', () => {
  let component: ProduitAjoutComponent;
  let fixture: ComponentFixture<ProduitAjoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProduitAjoutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProduitAjoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
