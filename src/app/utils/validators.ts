import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function matchPasswords(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const password_confirmation = control.get('password_confirmation');

  if (password && password_confirmation && password.value !== password_confirmation.value) {
    password_confirmation.setErrors({ mismatch: true });
    return { mismatch: true };
  } else {
    password_confirmation?.setErrors(null);
    return null;
  }
}

export function fileTypeValidator(allowedTypes: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const file = control.value as File;
    if (file && !allowedTypes.includes(file.type)) {
      return { fileType: true };
    }
    return null;
  };
}