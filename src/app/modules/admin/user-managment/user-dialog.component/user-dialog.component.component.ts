import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import {
    MAT_DIALOG_DATA,
    MatDialogModule,
    MatDialogRef,
} from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelect } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { IUser } from 'app/services/user/service/user-management.model';
import { UserManagementService } from 'app/services/user/service/user.service';

@Component({
    selector: 'app-user-dialog.component',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatFormFieldModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatDividerModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelect,
        MatOptionModule,
        MatSlideToggleModule,
    ],
    templateUrl: './user-dialog.component.component.html',
    styleUrl: './user-dialog.component.component.scss',
})
export class UserDialogComponentComponent implements OnInit{
    userForm: FormGroup;
    authoritiesList: string[] = [];

    constructor(
        public dialogRef: MatDialogRef<UserDialogComponentComponent>,
        @Inject(MAT_DIALOG_DATA) public data: IUser,
        private fb: FormBuilder,
        private userService: UserManagementService
    ) {
        this.userForm = this.fb.group({
            login: [data?.login || '', Validators.required],
            email: [data?.email || '', [Validators.required, Validators.email]],
            firstName: [data?.firstName || ''],
            lastName: [data?.lastName || ''],
            activated: [data?.activated ?? true],
            authorities: [data?.authorities || []],
        });
    }

    ngOnInit(): void {
        this.userService.authorities().subscribe((authorities) => {
            this.authoritiesList = authorities;
        });
    }

    saveUser(): void {
        this.dialogRef.close(this.userForm.value);
    }
}
