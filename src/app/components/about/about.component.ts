// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-about',
//   templateUrl: './about.component.html',
//   styleUrls: ['./about.component.scss']
// })
// export class AboutComponent {

// }
import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent {
  
  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    // Fallback to default image
    imgElement.src = 'assets/images/default-profile.jpg';
  }
}
