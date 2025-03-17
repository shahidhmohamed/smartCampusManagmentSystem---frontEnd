import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MessageCommunicationService } from 'app/layout/common/messages/message.communication.service';
import { CourseRegistrationService } from 'app/services/course-registration/service/course-registration.service';
import { IFile } from 'app/services/file/file.model';
import { FileService } from 'app/services/file/service/file.service';
import { IFolder } from 'app/services/folder/folder.model';
import { FolderService } from 'app/services/folder/service/folder.service';
import { environment } from 'environments/environment';
import { CreateFileWizardComponent } from '../create-file-wizard/create-file-wizard.component';
import { FileUploadDialogComponent } from '../file-upload-dialog/file-upload-dialog.component';

@Component({
    selector: 'app-file-manager',
    standalone: true,
    imports: [
        CommonModule,
        MatIcon,
        MatFormFieldModule,
        MatButtonModule,
        MatSidenavModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
    ],
    templateUrl: './file-manager.component.html',
    styleUrl: './file-manager.component.scss',
})
export class FileManagerComponent implements OnInit {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';
    folders: IFolder[] = [];
    files: IFile[] = [];
    selectedFile: IFile;
    path: IFolder[] = [];
    currentPath: IFolder[] = [];
    currentFolderId: string | null = null;
    currentFolder: IFolder | null = null;
    currentFolders: IFolder[] = [];
    currentFiles: IFile[] = [];

    constructor(
        private fileService: FileService,
        private folderService: FolderService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
        private _cdr: ChangeDetectorRef,
        private _MessageCommunicationService: MessageCommunicationService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _courseRegisterService: CourseRegistrationService
    ) {}

    ngOnInit(): void {
        this._MessageCommunicationService.notificationAnnounced$.subscribe(
            (w) => {
                if (w.topic === 'FOLDER_CREATE_SUCCESS') {
                    // alert(w.data);
                    setTimeout(() => {
                        if (w.data) {
                            this.loadFoldersAndFiles(w.data);
                        } else {
                            this.loadAllFolders();
                        }
                    }, 1000);
                }
            }
        );
        this.loadAllFolders();
    }

    /**
     * Load root-level folders
     */
    loadAllFolders(): void {
        this._courseRegisterService
            .search({
                query: `studentId:${environment.user.id}`,
                size: 100,
                sort: ['asc'], // API-side sorting
            })
            .subscribe((res) => {
                const Ids = res.body.map((id) => id.courseId).filter((id) => id);

                console.log(Ids);

                if (Ids.length === 0) {
                    console.warn('No id found for this user.');
                    return;
                }

                this.folderService
                    .search({
                        query: `course:(${Ids.join(' OR ')})`,
                        size: 100,
                        sort: ['asc'],
                    })
                    .subscribe((response) => {
                        console.log(response.headers);
                        this.folders = response.body || [];
                        this.currentFolders = this.folders.filter(
                            (folder) => !folder.parentId
                        );
                        this.files = [];
                        this.currentFiles = [];
                        this.currentPath = [];
                        this.currentFolder = null;
                        this._cdr.detectChanges();
                    });
            });
    }

    /**
     * Load folders and files for a specific folder
     */
    loadFoldersAndFiles(folderId?: string): void {
        this.currentFolderId = folderId || null;
        this.folderService
            .search({
                query: `parentId:${folderId || ''}`,
                size: 100,
                sort: ['desc'],
            })
            .subscribe((response) => {
                this.currentFolders = response.body || [];
                this._cdr.detectChanges();
            });

        if (folderId) {
            this.fileService
                .search({
                    query: `folderId:${folderId}`,
                    size: 100,
                    sort: ['desc'],
                })
                .subscribe((response) => {
                    this.currentFiles = response.body || [];
                    this._cdr.detectChanges();
                });
        } else {
            this.currentFiles = [];
        }
    }

    /**
     * Open drawer with file details
     */
    toggleDetails(fileId: string): void {
        this.fileService.find(fileId).subscribe((response) => {
            this.selectedFile = response.body;
            this.matDrawer.open();
            this._cdr.markForCheck();
        });
    }

    /**
     * Close drawer
     */

    close(): void {
        this.matDrawer.close();
    }

    /*
     * Foldere Delete
     */
    deleteFolder(folderId: string): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete Folder',
            message:
                'Are you sure you want to delete this Folder? This action is irreversible and will also delete all associated Folders & Files.',
            actions: {
                confirm: {
                    label: 'Delete',
                },
            },
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this.folderService.find(folderId).subscribe((response) => {
                    // Check if the folder has a parentId
                    const hasParent = response.body?.parentId;

                    // Proceed with deletion
                    this.folderService.delete(folderId).subscribe(() => {
                        this.snackBar.open(
                            'Folder deleted successfully!',
                            'Close',
                            { duration: 3000 }
                        );

                        // If there is a parent folder, load its folders and files;
                        // Otherwise, load all files instead of loading all folders
                        if (hasParent) {
                            // alert('loading without parent');
                            this.loadFoldersAndFiles(response.body.parentId);
                            this.currentFolderId = null;
                        } else {
                            this.loadAllFolders();
                        }

                        this._cdr.detectChanges();
                    });
                });
            }
        });
    }

    deleteFile(fileId: string): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete Folder',
            message:
                'Are you sure you want to delete this File? This action is irreversible.',
            actions: {
                confirm: {
                    label: 'Delete',
                },
            },
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this.fileService.find(fileId).subscribe((response) => {
                    // Check if the folder has a parentId
                    const hasParent = response.body?.folderId;

                    // Proceed with deletion
                    this.fileService.delete(fileId).subscribe(() => {
                        this.snackBar.open(
                            'File deleted successfully!',
                            'Close',
                            { duration: 3000 }
                        );
                        this.matDrawer.close();
                        setTimeout(() => {
                            this.loadFoldersAndFiles(response.body.folderId);
                        }, 300);
                        this._cdr.detectChanges();
                    });
                });
            }
        });
    }

    //**
    // Download file
    //  */
    downloadFile(fileId: string, fileName: string): void {
        this.fileService.find(fileId).subscribe(
            (response) => {
                if (response.body) {
                    // Extract file data (Base64)
                    const base64Data = response.body.binaryData;
                    const contentType = response.body.binaryDataContentType;

                    if (base64Data && contentType) {
                        // Convert Base64 to Blob
                        const byteCharacters = atob(base64Data);
                        const byteNumbers = new Array(byteCharacters.length);
                        for (let i = 0; i < byteCharacters.length; i++) {
                            byteNumbers[i] = byteCharacters.charCodeAt(i);
                        }
                        const byteArray = new Uint8Array(byteNumbers);
                        const blob = new Blob([byteArray], {
                            type: contentType,
                        });

                        // Create a download link
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(blob);
                        link.download = fileName;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    } else {
                        alert('File not found.');
                    }
                }
            },
            (error) => {
                console.error('Download failed', error);
                alert('Error downloading file.');
            }
        );
    }

    /**
     * Open a folder and load its contents
     */
    openFolder(folder: IFolder): void {
        this.currentPath.push(folder);
        this.currentFolderId = folder.id;
        this.currentFolder = folder;
        this.loadFoldersAndFiles(folder.id);
    }

    /**
     * Navigate back to a specific folder via breadcrumb
     */
    navigateTo(index: number): void {
        if (index === -1) {
            this.loadAllFolders();
        } else {
            this.currentPath = this.currentPath.slice(0, index + 1);
            const lastFolder =
                this.currentPath.length > 0
                    ? this.currentPath[this.currentPath.length - 1]
                    : null;
            this.currentFolder = lastFolder;
            this.loadFoldersAndFiles(lastFolder ? lastFolder.id : null);
        }
        // alert(JSON.stringify(this.currentPath));
        this._cdr.detectChanges();
    }

    /**
     * Open folder creation dialog
     */
    openFolederCreate(): void {
        const dialogRef = this.dialog.open(CreateFileWizardComponent, {
            width: '80vh',
            maxHeight: '90vh',
            data: {
                parentId: this.currentFolderId || null,
                currentFolder: this.currentFolder || [],
            },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result && result.id) {
                this.snackBar.open('Folder created successfully!', 'Close', {
                    duration: 3000,
                });
                // this.openFolder(result);
                // setTimeout(() => {
                //     this.loadFoldersAndFiles(this.currentFolderId);
                // }, 300);
            }
            this._cdr.detectChanges();
        });
    }

    /**
     * Open file upload dialog
     */
    openFileUploadDialog(): void {
        const dialogRef = this.dialog.open(FileUploadDialogComponent, {
            width: '450px',
            data: {
                parentId: this.currentFolderId || null,
                currentFolder: this.currentFolder || [],
            },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.loadFoldersAndFiles(this.currentFolderId);
                this.snackBar.open('File uploaded successfully!', 'Close', {
                    duration: 3000,
                });
            }
            this._cdr.detectChanges();
        });
    }
}
