import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  contactForm: FormGroup;
  faqs = [
    {
      question: 'Do you take reservations?',
      answer: 'Yes, we accept reservations for parties of any size. You can book online or call us directly.'
    },
    {
      question: 'Is there parking available?',
      answer: 'We offer complimentary valet parking for all our guests during dinner hours.'
    },
    {
      question: 'Do you accommodate dietary restrictions?',
      answer: 'Absolutely! Our chefs are happy to accommodate dietary restrictions with advance notice.'
    },
    {
      question: 'What is your cancellation policy?',
      answer: 'We require 2 hours notice for reservation cancellations. Large parties may have different policies.'
    }
  ];

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.contactForm.valid) {
      console.log('Form submitted:', this.contactForm.value);
      // Implement form submission logic
      alert('Thank you for your message! We will get back to you soon.');
      this.contactForm.reset();
    }
  }
}