import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { UpdateProfileRequest, UserProfile } from '../../../../core/core-profile/models/profile.model';

@Component({
  selector: 'app-profile-edit-modal',
  templateUrl: './profile-edit-modal.component.html',
  styleUrl: './profile-edit-modal.component.scss'
})
export class ProfileEditModalComponent implements OnChanges {
  @Input({ required: true }) profile!: UserProfile;
  @Input() saving = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveProfile = new EventEmitter<UpdateProfileRequest>();

  profileForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    phoneNumber: ['', [Validators.required, Validators.minLength(7)]]
  });

  constructor(private fb: NonNullableFormBuilder) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['profile'] && this.profile) {
      this.profileForm.reset({
        name: this.profile.name,
        lastName: this.profile.lastName,
        phoneNumber: this.profile.phoneNumber
      });
    }
  }

  submit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.saveProfile.emit(this.profileForm.getRawValue());
  }

  isInvalid(controlName: keyof UpdateProfileRequest): boolean {
    const control = this.profileForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }
}