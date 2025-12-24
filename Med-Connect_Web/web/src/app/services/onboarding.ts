import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Onboarding { 

  private currentStepSubject = new BehaviorSubject<number>(1);
  currentStep$ = this.currentStepSubject.asObservable();

  private openSubject = new BehaviorSubject<boolean>(false);
  open$ = this.openSubject.asObservable();

  open() {
    this.openSubject.next(true);
  }

  close() {
    this.openSubject.next(false);
    this.currentStepSubject.next(1); // reset steps when closing
  }

  isOpen(): Observable<boolean> {
    return this.open$;
  }

  currentStep(): Observable<number> {
    return this.currentStep$;
  }

  nextStep() {
    const step = this.currentStepSubject.value;
    if (step < 4) { // total steps
      this.currentStepSubject.next(step + 1);
    } else {
      this.close(); // finish onboarding
      localStorage.setItem('doctorOnboardingComplete', 'true');
    }
  }

  previousStep() {
    const step = this.currentStepSubject.value;
    if (step > 1) {
      this.currentStepSubject.next(step - 1);
    }
  }
  
}
