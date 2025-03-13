import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MessageCommunicationService } from 'app/layout/common/messages/message.communication.service';
import { IFolder } from 'app/services/folder/folder.model';
import { FolderService } from 'app/services/folder/service/folder.service';
import { IUser } from 'app/services/user/service/user-management.model';
import { environment } from 'environments/environment';
import moment from 'moment';

@Component({
    selector: 'app-create-file-wizard',
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
        MatOptionModule,
        MatSlideToggleModule,
    ],
    templateUrl: './create-file-wizard.component.html',
    styleUrl: './create-file-wizard.component.scss',
})
export class CreateFileWizardComponent implements OnInit {
    user: IUser = environment.user;
    fileForm: FormGroup;
    authoritiesList: string[] = [];

    constructor(
        public dialogRef: MatDialogRef<CreateFileWizardComponent>,
        @Inject(MAT_DIALOG_DATA)
        public data: {
            parentId: string;
            currentFolder: IFolder;
        },
        private fb: FormBuilder,
        private _folderService: FolderService,
        private _cdr: ChangeDetectorRef,
        private _MessageCommunicationService: MessageCommunicationService
    ) {}

    ngOnInit(): void {
        // alert(this.data.parentId);

        const currentUser = `${this.user.firstName} ${this.user.lastName};`;
        this.fileForm = this.fb.group({
            name: ['', Validators.required],
            courseId: [
                this.data.currentFolder.courseId || '',
                [Validators.required],
            ],
            course: [this.data.currentFolder.course || ''],
            // semester: [this.data.currentFolder.semester || ''],
            createdBy: [currentUser],
            createdAt: [moment().format('YYYY-MM-DD HH:MM')],
            modifiedAt: [moment().format('YYYY-MM-DD HH:MM')],
            parentId: [this.data.parentId || null],
        });
        console.log(this.fileForm.value);
        this._cdr.detectChanges();
    }

    ngOnDestroy(): void {
        // Clear form when dialog is closed
        this.fileForm.reset();
    }

    /**
     * Create a new folder and navigate into it
     */
    createFolder(): void {
        const newFolder = this.fileForm.value;
        console.log('New File Data', newFolder);
        this._folderService.create(newFolder).subscribe((response) => {
            const createdFolder = response.body;
            if (createdFolder && createdFolder.id) {
                this._MessageCommunicationService.pushNotification(
                    'FOLDER_CREATE_SUCCESS',
                    'OK',
                    createdFolder.parentId
                );
                this.dialogRef.close(createdFolder);
                this._cdr.detectChanges();
            }
        });
    }

    cancel(): void {
        this.dialogRef.close();
    }
}
