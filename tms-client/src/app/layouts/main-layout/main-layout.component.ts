import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AsideNavbarComponent } from '../../aside-navbar/aside-navbar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, AsideNavbarComponent],
  template: `
    <div class="layout">
      <app-aside-navbar class="layout_aside"></app-aside-navbar>
      <section class="layout_content">
        <router-outlet></router-outlet>
      </section>
    </div>
  `,
  styles: `
    .layout { display: flex; flex-direction: row; gap: 1.5rem; align-items: flex-start; width: 100%; }
    .layout_aside { flex: 0 0 240px; position: sticky; top: 1rem; align-self: flex-start; }
    .layout_content { flex: 1 1 auto; min-width: 0; }
    @media (max-width: 768px) {
      .layout { flex-direction: column; }
      .layout_aside { position: static; flex: 0 0 auto; }
    }
  `
})
export class MainLayoutComponent {}
