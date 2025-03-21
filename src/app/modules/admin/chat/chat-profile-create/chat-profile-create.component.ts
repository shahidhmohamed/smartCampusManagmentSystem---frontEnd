import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormsModule,
    ReactiveFormsModule,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelect } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { ChatUserService } from 'app/services/chat-user/service/chat-user.service';
import { NewChat } from 'app/services/chat/chat.model';
import { ChatService } from 'app/services/chat/service/chat.service';
import { IUser } from 'app/services/user/service/user-management.model';
import { UserManagementService } from 'app/services/user/service/user.service';
import { environment } from 'environments/environment';
import { Observable, map, startWith } from 'rxjs';

@Component({
    selector: 'app-chat-profile-create',
    standalone: true,
    imports: [
        MatTableModule,
        CommonModule,
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
        MatDatepickerModule,
        MatPaginatorModule,
        MatButtonToggleModule,
        MatAutocompleteModule,
    ],
    templateUrl: './chat-profile-create.component.html',
    styleUrl: './chat-profile-create.component.scss',
})
export class ChatProfileCreateComponent implements OnInit {
    pagination = {
        length: 0,
        size: 10,
        page: 0,
    };

    registerForm: UntypedFormGroup;
    createChatForm: UntypedFormGroup;

    studentControl = new FormControl();
    filteredStudents$: Observable<IUser[]>;
    allStudents: IUser[] = [];
    isEditMode = false;

    constructor(
        private _dialogRef: MatDialogRef<ChatProfileCreateComponent>,
        private _userService: UserManagementService,
        private _chatUserService: ChatUserService,
        private _formBuilder: FormBuilder,
        private _changeDetectorRef: ChangeDetectorRef,
        private _chatService: ChatService
    ) {}

    ngOnInit(): void {
        this.registerForm = this._formBuilder.group({
            id: [''],
            userId: ['', Validators.required],
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
        });

        this.createChatForm = this._formBuilder.group({
            id: [''],
            contactId: ['', Validators.required],
            contact: ['', Validators.required],
            type: [''],
        });

        this.loadUsers();

        this.filteredStudents$ = this.studentControl.valueChanges.pipe(
            startWith(''),
            map((value) =>
                typeof value === 'string'
                    ? value.toLowerCase()
                    : value?.firstName?.toLowerCase() || ''
            ),
            map((name) => this.filterStudents(name))
        );
    }

    loadUsers(): void {
        this._userService.query().subscribe((res) => {
            setTimeout(() => {
                this.allStudents = res.body;
                this._changeDetectorRef.detectChanges(); // Explicitly trigger change detection
            });
        });
    }

    filterStudents(name: string): IUser[] {
        if (!name) return this.allStudents;
        const filterValue = name.toLowerCase();
        return this.allStudents.filter(
            (student) =>
                student.firstName?.toLowerCase().includes(filterValue) ||
                student.lastName?.toLowerCase().includes(filterValue) ||
                student.login?.toLowerCase().includes(filterValue) ||
                student.id?.toLowerCase().includes(filterValue)
        );
    }

    onSelectStudent(event: any) {
        const selectedStudent: IUser = event.option.value;
        if (selectedStudent) {
            this.registerForm.patchValue({
                userId: selectedStudent.id,
                name: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
                email: selectedStudent.email,
            });

            this.createChatForm.patchValue({
                contactId: selectedStudent.id,
                contact: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
            });
        }
    }

    displayStudentName(student: IUser | null): string {
        return student ? `${student.firstName} ${student.lastName || ''}` : '';
    }

    saveUserProfile(): void {
        // const userProfile = this.registerForm.value;

        const chat = this.createChatForm.value;
        const newChat: NewChat = {
            ...chat,
            id: null,
            owner: environment.user.id,
            ownerName: `${environment.user.firstName} ${environment.user.lastName}`,
        };

        this._chatService.create(newChat).subscribe((res) => {
            if (res) {
                console.log('Chat Createddddddddddd');
                this._dialogRef.close(true);
            }
            this._changeDetectorRef.detectChanges();
        });

    }

    updateUserProfile(userProfile: any): void {
        this._chatUserService.update(userProfile).subscribe(
            () => {
                console.log('User Profile Updated:', userProfile);
                this._dialogRef.close(true);
            },
            (error) => console.error('Error updating user:', error)
        );
    }

    closeDialog(): void {
        this._dialogRef.close(false);
    }
}
