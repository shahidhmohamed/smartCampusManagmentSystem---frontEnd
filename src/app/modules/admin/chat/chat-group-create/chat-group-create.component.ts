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
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
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
import { GroupChatMembersService } from 'app/services/group-chat-members/service/group-chat-members.service';
import { GroupChatService } from 'app/services/group-chat/service/group-chat.service';
import { IUser } from 'app/services/user/service/user-management.model';
import { UserManagementService } from 'app/services/user/service/user.service';
import { environment } from 'environments/environment';
import { Observable, map, startWith } from 'rxjs';
import { ChatProfileCreateComponent } from '../chat-profile-create/chat-profile-create.component';
import { NewGroupChatMembers } from 'app/services/group-chat-members/group-chat-members.model';

@Component({
    selector: 'app-chat-group-create',
    standalone: true,
    imports: [
        MatDialogModule,
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
    templateUrl: './chat-group-create.component.html',
    styleUrl: './chat-group-create.component.scss',
})
export class ChatGroupCreateComponent implements OnInit {
    pagination = {
        length: 0,
        size: 10,
        page: 0,
    };

    registerForm: UntypedFormGroup;
    groupChatForm: UntypedFormGroup;

    studentControl = new FormControl();
    filteredStudents$: Observable<IUser[]>;
    allStudents: IUser[] = [];
    selectedMembers: IUser[] = [];
    isEditMode = false;

    constructor(
        private _dialogRef: MatDialogRef<ChatProfileCreateComponent>,
        private _userService: UserManagementService,
        private _chatUserService: ChatUserService,
        private _formBuilder: FormBuilder,
        private _changeDetectorRef: ChangeDetectorRef,
        private _groupChatService: GroupChatService,
        private _groupChatMemberService: GroupChatMembersService
    ) {}

    ngOnInit(): void {
        this.groupChatForm = this._formBuilder.group({
            id: [''],
            title: ['', Validators.required],
            members: [[]],
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
                this._changeDetectorRef.detectChanges();
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
        if (
            selectedStudent &&
            !this.selectedMembers.some((m) => m.id === selectedStudent.id)
        ) {
            this.selectedMembers.push(selectedStudent); // ✅ Add user to the selected list
            this.groupChatForm.patchValue({ members: this.selectedMembers });
        }
        this.studentControl.setValue(''); // ✅ Clear input after selection
    }

    removeMember(member: IUser) {
        this.selectedMembers = this.selectedMembers.filter(
            (m) => m.id !== member.id
        );
        this.groupChatForm.patchValue({ members: this.selectedMembers });
    }

    displayStudentName(student: IUser | null): string {
        return student ? `${student.firstName} ${student.lastName || ''}` : '';
    }

    // removeMember(member: IUser) {
    //     this.selectedMembers = this.selectedMembers.filter(
    //         (m) => m.id !== member.id
    //     );
    //     this.groupChatForm.patchValue({ members: this.selectedMembers });
    // }

    saveGroupChat(): void {
        const chat = this.groupChatForm.value;
        const newChat: NewChat = {
            ...chat,
            id: null,
            owner: environment.user.id,
            ownerName: `${environment.user.firstName} ${environment.user.lastName}`,
        };

        console.log('GRouppppppppppppppppppppp', newChat);

        this._groupChatService.create(newChat).subscribe((res) => {
            if (res && res.body.id) {
                console.log('Group Chat Created');

                this.selectedMembers.forEach((member) => {
                    const newGroupMember: NewGroupChatMembers = {
                        id: null,
                        groupChatId: res.body.id,
                        memberUserId: member.id,
                        memberName: `${member.firstName} ${member.lastName}`,
                    };

                    this._groupChatMemberService
                        .create(newGroupMember)
                        .subscribe(() => {
                            console.log(
                                `Member ${member.firstName} added to group`
                            );
                            this._changeDetectorRef.detectChanges();
                        });
                });

                this._dialogRef.close(true);
            }
        });
    }

    closeDialog(): void {
        this._dialogRef.close(false);
    }
}
