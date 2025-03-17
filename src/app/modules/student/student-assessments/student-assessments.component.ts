import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnInit,
    ViewChild,
} from '@angular/core';
import {
    FormBuilder,
    FormsModule,
    ReactiveFormsModule,
    UntypedFormGroup,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { FullCalendarModule } from '@fullcalendar/angular';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule } from '@ngneat/transloco';
import {
    IAssignmentFile,
    NewAssignmentFile,
} from 'app/services/assignment-file/assignment-file.model';
import { AssignmentFileService } from 'app/services/assignment-file/service/assignment-file.service';
import { IAssignment } from 'app/services/assignment/assignment.model';
import { AssignmentService } from 'app/services/assignment/service/assignment.service';
import { ClassScheduleService } from 'app/services/class-schedule/service/class-schedule.service';
import { ICourseRegistration } from 'app/services/course-registration/course-registration.model';
import { CourseRegistrationService } from 'app/services/course-registration/service/course-registration.service';
import { CourseService } from 'app/services/course/service/course.service';
import { IModule } from 'app/services/module/module.model';
import { ModuleService } from 'app/services/module/service/module.service';
import { ResourceService } from 'app/services/resource/service/resource.service';
import { IUser } from 'app/services/user/service/user-management.model';
import { UserManagementService } from 'app/services/user/service/user.service';
import { environment } from 'environments/environment';
import moment from 'moment';
import { Observable, finalize } from 'rxjs';

@Component({
    selector: 'app-student-assessments',
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        TranslocoModule,
        MatIconModule,
        MatButtonModule,
        MatRippleModule,
        MatMenuModule,
        MatTabsModule,
        MatButtonToggleModule,
        MatTableModule,
        FullCalendarModule,
        CommonModule,
    ],
    templateUrl: './student-assessments.component.html',
    styleUrl: './student-assessments.component.scss',
})
export class StudentAssessmentsComponent implements OnInit {
    myCourses: ICourseRegistration[] = [];
    modules: IModule[] = [];
    assesmentForm: UntypedFormGroup;
    assesments: IAssignment[] = [];
    sumitedAssesments: IAssignmentFile[] = [];
    selectedCourseId: string | null = null;
    selectedSemester: string | null = null;
    expandedAssignments: string[] = [];
    selectedFiles: { [key: string]: File } = {};
    fileErrors: { [key: string]: string } = {};
    selectedFile: File | null = null;
    filePreviewUrl: string | null = null;
    binaryDataBase64: string | null = null;
    user: IUser = environment.user;

    isUploading = false;
    isSubmited = false;
    uploadProgress = 0;
    fileTypeDisplay: string = '';
    isSaving = false;

    @ViewChild('fileInput') fileInput!: ElementRef;

    constructor(
        private _scheduleService: ClassScheduleService,
        private _courseRegisterService: CourseRegistrationService,
        private _courseService: CourseService,
        private _userService: UserManagementService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _moduleService: ModuleService,
        private _assessmentsService: AssignmentService,
        private _formBuilder: FormBuilder,
        private resourceService: ResourceService,
        private _assignmentFileService: AssignmentFileService
    ) {}

    ngOnInit(): void {
        this.loadAllRegisterCourses();
        this.assesmentForm = this._formBuilder.group({
            id: [null],
            studentId: [null],
            assignmentId: [null],
            name: [null],
            type: [null],
            fileSize: [null],
            createdBy: [environment.user.id],
            createdAt: [moment().format('YYYY-MM-DD MM:SS')],
            modifiedAt: [moment().format('YYYY-MM-DD MM:SS')],
            mimeType: [null],
            extension: [null],
            binaryData: [null],
            binaryDataContentType: [null],
            markingStatus: ['PENDING'],
            grade: [null],
            feedback: [null],
            gradedBy: [null],
            gradedAt: [null],
        });
    }

    /** Load all registered courses */
    loadAllRegisterCourses(): void {
        this._courseRegisterService
            .search({
                query: `studentId:${environment.user.id}`,
                size: 100,
                sort: ['asc'], // API-side sorting
            })
            .subscribe((res) => {
                this.myCourses = (res.body || []).map((course) => ({
                    ...course,
                    duration: course.duration ?? '0_SEMESTERS',
                }));
                // console.log('My Courses:', this.myCourses);
                if (this.myCourses.length > 0) {
                    this.onCourseTabChange(0);
                }
            });

        this._changeDetectorRef.detectChanges();
    }

    /** Extracts the number of semesters from duration and returns an array */
    getSemesters(duration: string | null): number[] {
        // console.log('Processing Duration:', duration);
        if (!duration) return [];
        const match = duration.match(/^(\d+)_SEMESTERS$/);
        // console.log('Match Found:', match);

        if (match) {
            const numSemesters = +match[1];
            const semesterLabels = this.generateSem(numSemesters);
            // console.log('Generated Semester Labels:', semesterLabels);
            return Array.from({ length: numSemesters }, (_, i) => i + 1);
        }

        return [];
    }

    /** Generates semester labels */
    generateSem(numSemesters: number): string[] {
        return Array.from(
            { length: numSemesters },
            (_, i) => `SEMESTER_${i + 1}`
        );
    }

    /** Handle Course Tab Change */
    onCourseTabChange(index: number): void {
        if (this.myCourses.length > 0) {
            this.selectedCourseId = this.myCourses[index].courseId;
            const semesters = this.generateSem(
                this.getSemesters(this.myCourses[index].duration).length
            );
            if (semesters.length > 0) {
                this.selectedSemester = semesters[0];
                // console.log(
                //     `Selected Course ID: ${this.selectedCourseId}, Default Semester: ${this.selectedSemester}`
                // );

                // Load modules for the first semester
                this.loadModules(this.selectedCourseId, this.selectedSemester);
            } else {
                this.selectedSemester = null;
                this.modules = []; // Clear previous course's modules
                // console.log(
                //     `Selected Course ID: ${this.selectedCourseId}, No semesters found. Modules cleared.`
                // );
            }

            this._changeDetectorRef.detectChanges();
        }
    }

    /** Handle Semester Change (Triggered by mat-button-toggle-group) */
    onSemesterTabChange(courseIndex: number, semester: string): void {
        this.selectedSemester = semester;

        // console.log(`Updated Semester Selected: ${this.selectedSemester}`);

        if (this.selectedCourseId && this.selectedSemester) {
            this.loadModules(this.selectedCourseId, this.selectedSemester);
        }

        this._changeDetectorRef.detectChanges();
    }

    /** Load modules based on the selected course and semester */
    loadModules(courseId: string, semester: string | null): void {
        if (!semester) {
            this.modules = [];
            return;
        }

        this._moduleService
            .search({
                query: `courseId:${courseId} AND semester:${semester}`,
                size: 100,
                sort: ['desc'],
            })
            .subscribe((res) => {
                if (res.body) {
                    this.modules = res.body;
                    const moduleIds = this.modules
                        .map((m) => m.id)
                        .join(' OR ');

                    if (moduleIds) {
                        this._assessmentsService
                            .search({
                                query: `courseId:${courseId} AND moduleId:(${moduleIds})`,
                                size: 100,
                                sort: ['asc'],
                            })
                            .subscribe((res) => {
                                this.assesments = res.body;

                                const assessmentIds = this.assesments
                                    .map((a) => a.id)
                                    .join(' OR ');

                                if (assessmentIds) {
                                    this._assignmentFileService
                                        .search({
                                            query: `studentId:${this.user.id} AND assignmentId:(${assessmentIds})`,
                                            size: 100,
                                            sort: ['asc'],
                                        })
                                        .subscribe((assignmentRes) => {
                                            this.sumitedAssesments =
                                                assignmentRes.body || [];

                                            // Create a map for easy lookup
                                            const submittedAssignmentsMap =
                                                new Map(
                                                    this.sumitedAssesments.map(
                                                        (file) => [
                                                            file.assignmentId,
                                                            file,
                                                        ]
                                                    )
                                                );

                                            // Track submission status and store file reference
                                            this.assesments.forEach((a) => {
                                                a.isSubmitted =
                                                    submittedAssignmentsMap.has(
                                                        a.id
                                                    );
                                                a.submittedFile =
                                                    submittedAssignmentsMap.get(
                                                        a.id
                                                    ) || null;
                                            });

                                            this._changeDetectorRef.detectChanges();
                                        });
                                }
                            });
                    }
                } else {
                    this.modules = [];
                }
            });

        this._changeDetectorRef.detectChanges();
    }

    getGradeLetter(grade: number | null): string {
        if (grade === null || grade === undefined) {
            return 'N/A'; // If no grade is given
        }

        if (grade >= 85) return 'A+';
        if (grade >= 75) return 'A';
        if (grade >= 65) return 'B+';
        if (grade >= 55) return 'B';
        if (grade >= 45) return 'C+';
        if (grade >= 35) return 'C';
        if (grade >= 25) return 'D';
        return 'F'; // Fail
    }

    downloadFile(file: IAssignmentFile): void {
        if (!file || !file.binaryData) {
            console.warn('No file data found.');
            return;
        }

        // If file is a URL, open in a new tab
        if (file.binaryData.startsWith('http')) {
            window.open(file.binaryData, '_blank');
            return;
        }

        // Convert Base64 to Blob and create a download link
        const byteCharacters = atob(file.binaryData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: file.mimeType });

        // Create a download link
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = file.name || 'downloaded_file';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /** Toggle Assignment Details */
    toggleAssignmentDetails(assignmentId: string): void {
        const index = this.expandedAssignments.indexOf(assignmentId);
        if (index > -1) {
            this.expandedAssignments.splice(index, 1); // Collapse
        } else {
            this.expandedAssignments.push(assignmentId); // Expand
        }

        this._changeDetectorRef.detectChanges();
    }

    /** Filter Assignments for a Specific Module */
    filteredAssignments(moduleId: string) {
        return this.assesments.filter((a) => a.moduleId === moduleId);
    }

    /** Check if Deadline is Near */
    isDeadlineNear(deadline: string): boolean {
        const today = new Date();
        const dueDate = new Date(deadline);
        return dueDate.getTime() - today.getTime() <= 48 * 60 * 60 * 1000;
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

                this.assesmentForm.patchValue({
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

    submitAssignment(assignmentId: string): void {
        this.isSaving = true;
        this.isUploading = true;
        this.uploadProgress = 0;

        const currentUser = `${this.user.firstName} ${this.user.lastName}`;
        const filePayload: NewAssignmentFile = {
            id: null,
            studentId: this.user.id,
            assignmentId: assignmentId,
            name: this.assesmentForm.value.name,
            type: this.fileTypeDisplay,
            fileSize: this.selectedFile?.size,
            createdBy: currentUser,
            createdAt: moment().format('YYYY-MM-DD HH:mm'),
            modifiedAt: moment().format('YYYY-MM-DD HH:mm'),
            mimeType: this.assesmentForm.value.binaryDataContentType,
            extension: this.fileTypeDisplay,
            binaryData: this.binaryDataBase64,
            binaryDataContentType:
                this.assesmentForm.value.binaryDataContentType,
            markingStatus: 'PENDING',
        };

        let request: Observable<HttpResponse<IAssignmentFile>>;
        request = this._assignmentFileService.create(filePayload);

        request.pipe(finalize(() => (this.isSaving = false))).subscribe({
            next: (res) => this.onSaveSuccess(res.body, assignmentId),
            error: () => this.onSaveError(),
        });
    }

    private onSaveSuccess(
        submittedFile: IAssignmentFile | null,
        assignmentId: string
    ): void {
        this.uploadProgress = 100;
        this.isUploading = false;
        this.selectedFile = null;

        if (submittedFile) {
            // Add the submitted file to the submitted assignments list
            this.sumitedAssesments.push(submittedFile);

            // Find the corresponding assignment and update its status
            const assignment = this.assesments.find(
                (a) => a.id === assignmentId
            );
            if (assignment) {
                assignment.isSubmitted = true;
                assignment.submittedFile = submittedFile;
            }

            this._changeDetectorRef.detectChanges();
        }
    }

    private onSaveError(): void {
        alert('File upload failed. Please try again.');
    }
}
