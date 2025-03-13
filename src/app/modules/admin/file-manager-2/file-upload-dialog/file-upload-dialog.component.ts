import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
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
import { ActivatedRoute } from '@angular/router';
import { MessageCommunicationService } from 'app/layout/common/messages/message.communication.service';
import { IFile, NewFile } from 'app/services/file/file.model';
import { FileService } from 'app/services/file/service/file.service';
import { IFolder } from 'app/services/folder/folder.model';
import { IUser } from 'app/services/user/service/user-management.model';
import { environment } from 'environments/environment';
import moment from 'moment';
import { Observable, finalize } from 'rxjs';

@Component({
    selector: 'app-file-upload-dialog',
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
    templateUrl: './file-upload-dialog.component.html',
    styleUrl: './file-upload-dialog.component.scss',
})
export class FileUploadDialogComponent {
    fileForm!: FormGroup;
    isSaving = false;
    selectedFile: File | null = null;
    filePreviewUrl: string | null = null;
    binaryDataBase64: string | null = null;
    user: IUser = environment.user;

    isUploading = false;
    uploadProgress = 0;
    fileTypeDisplay: string = '';

    @ViewChild('fileInput') fileInput!: ElementRef;

    constructor(
        public dialogRef: MatDialogRef<FileUploadDialogComponent>,
        private fb: FormBuilder,
        @Inject(MAT_DIALOG_DATA)
        public data: {
            parentId: string;
            currentFolder: IFolder;
        },
        private fileService: FileService,
        private activatedRoute: ActivatedRoute,
        private _MessageCommunicationService: MessageCommunicationService
    ) {}

    ngOnInit(): void {
        this.initForm();

        this.activatedRoute.data.subscribe(({ file }) => {
            if (file) {
                this.updateForm(file);
            }
        });
    }

    private initForm(): void {
        this.fileForm = this.fb.group({
            id: [null],
            folderId: ['', Validators.required],
            name: ['', Validators.required],
            type: [null],
            fileSize: [null],
            createdBy: [null],
            createdAt: [null],
            modifiedAt: [null],
            mimeType: [null],
            extension: [null],
            binaryData: [null, Validators.required],
            binaryDataContentType: [null],
        });
    }

    private updateForm(file: IFile): void {
        this.fileForm.patchValue({
            id: file.id,
            folderId: file.folderId,
            name: file.name,
            type: file.type,
            fileSize: file.fileSize,
            createdBy: file.createdBy,
            createdAt: file.createdAt,
            modifiedAt: file.modifiedAt,
            mimeType: file.mimeType,
            extension: file.extension,
            binaryDataContentType: file.binaryDataContentType,
        });

        this.fileTypeDisplay = this.getFileTypeDisplay(
            file.type || file.mimeType
        );
    }

    onFileChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.selectedFile = input.files[0];

            // Read file and convert to Base64
            const reader = new FileReader();
            reader.readAsDataURL(this.selectedFile);
            reader.onload = () => {
                const base64String = (reader.result as string).split(',')[1];
                this.binaryDataBase64 = base64String;
                this.filePreviewUrl = reader.result as string;

                const fileMimeType = this.selectedFile.type;
                const fileExtension =
                    this.selectedFile.name.split('.').pop()?.toUpperCase() ||
                    '';

                this.fileForm.patchValue({
                    name: this.selectedFile?.name,
                    binaryData: this.binaryDataBase64,
                    binaryDataContentType: fileMimeType,
                });

                this.fileTypeDisplay =
                    this.getFileTypeDisplay(fileMimeType) || fileExtension;
            };
        }
    }

    private getFileTypeDisplay(fileType: string | null): string {
        const fileTypeMap: { [key: string]: string } = {
            'application/vnd.ms-excel': 'XLS',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                'XLS',
            'text/plain': 'TXT',
            'application/pdf': 'PDF',
            'image/jpeg': 'JPG',
            'image/jpg': 'JPG',
            'application/msword': 'DOC',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                'DOC',
        };

        return fileTypeMap[fileType || ''] || '';
    }

    save(): void {
        // if (this.fileForm.invalid || !this.binaryDataBase64) {
        //     return;
        // }

        this.isSaving = true;
        this.isUploading = true;
        this.uploadProgress = 0;

        const currentUser = `${this.user.firstName} ${this.user.lastName};`;
        const filePayload: NewFile = {
            id: null,
            folderId: this.data.parentId,
            name: this.fileForm.value.name,
            type: this.fileTypeDisplay,
            fileSize: this.selectedFile?.size,
            createdBy: currentUser,
            createdAt: moment().format('YYYY-MM-DD HH:mm'),
            modifiedAt: moment().format('YYYY-MM-DD HH:mm'),
            mimeType: this.fileForm.value.binaryDataContentType,
            extension: this.fileTypeDisplay,
            binaryData: this.binaryDataBase64,
            binaryDataContentType: this.fileForm.value.binaryDataContentType,
        };

        let request: Observable<HttpResponse<IFile>>;
        request = this.fileService.create(filePayload);

        request.pipe(finalize(() => (this.isSaving = false))).subscribe({
            next: () => this.onSaveSuccess(),
            error: () => this.onSaveError(),
        });
    }

    private onSaveSuccess(): void {
        this.uploadProgress = 100;
        setTimeout(() => {
            this.isUploading = false;
            this._MessageCommunicationService.pushNotification(
                'FOLDER_CREATE_SUCCESS',
                'OK',
                this.data.parentId
            );
            this.dialogRef.close(true);
        }, 500);
        // window.history.back();
    }

    private onSaveError(): void {
        alert('File upload failed. Please try again.');
    }

    closeDialog(): void {
        this.dialogRef.close(false);
    }
}
