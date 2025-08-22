// src/app/app.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: '<app-book-list></app-book-list>',
  standalone: false
})
export class AppComponent {
  title = 'biblioflow';
}
