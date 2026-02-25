import { Component } from '@angular/core';
import { ZardButtonComponent } from '../button';
import { ZardIconComponent } from '../icon';
import { ZardTooltipDirective } from '../tooltip';

@Component({
  selector: 'app-nav-bar',
  imports: [ZardButtonComponent, ZardIconComponent, ZardTooltipDirective],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.css',
})
export class NavBar {}
