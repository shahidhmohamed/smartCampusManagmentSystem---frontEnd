import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormsModule,
    ReactiveFormsModule,
    UntypedFormGroup,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelect } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { IAssignmentFile } from 'app/services/assignment-file/assignment-file.model';
import { AssignmentFileService } from 'app/services/assignment-file/service/assignment-file.service';
import { AssignmentService } from 'app/services/assignment/service/assignment.service';
import { User } from 'app/services/user/service/user-management.model';
import { environment } from 'environments/environment';
import { switchMap } from 'rxjs';

@Component({
    selector: 'app-lecture-assignment-submitions',
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
    templateUrl: './lecture-assignment-submitions.component.html',
    styleUrl: './lecture-assignment-submitions.component.scss',
})
export class LectureAssignmentSubmitionsComponent implements OnInit {
    user: User = environment.user;
    sumitedAssesments: IAssignmentFile[] = [];
    courseId: string | null = null;
    submissions: IAssignmentFile[] = [];
    displayedColumns: string[] = [
        'student',
        'name',
        'size',
        'markingStatus',
        'grade',
        'feedback',
        'actions',
    ];
    gradeForm: UntypedFormGroup;
    constructor(
        private _assigmnetFilseServise: AssignmentFileService,
        private route: ActivatedRoute,
        private _assigmnetServise: AssignmentService,
        private fb: FormBuilder
    ) {
        this.courseId = this.route.snapshot.paramMap.get('id');
        console.log('Course ID:', this.courseId); // Debugging
    }
    ngOnInit(): void {
        this.gradeForm = this.fb.group({});
        this.getAllSubmissions();
    }

    getAllSubmissions(): void {
        this._assigmnetServise
            .search({
                query: `instructorId:${this.user.id} AND id:(${this.courseId})`,
                size: 100,
                sort: ['asc'],
            })
            .pipe(
                switchMap((e) => {
                    if (!e || !e.body || e.body.length === 0) {
                        console.warn('No assignments found.');
                        return [];
                    }

                    // Extract all assignment IDs
                    const assignmentIds = e.body
                        .map((assignment: any) => assignment.id)
                        .join(' OR ');

                    return this._assigmnetFilseServise.search({
                        query: `assignmentId:(${assignmentIds})`,
                        size: 100,
                        sort: ['asc'],
                    });
                })
            )
            .subscribe({
                next: (response) => {
                    this.sumitedAssesments = response.body || [];

                    // ✅ Ensure Form Controls Exist for Each Submission
                    this.sumitedAssesments.forEach(
                        (submission: IAssignmentFile) => {
                            if (!this.gradeForm.contains(submission.id)) {
                                this.gradeForm.addControl(
                                    submission.id,
                                    this.fb.group({
                                        grade: [
                                            submission.grade !== undefined
                                                ? submission.grade
                                                : '',
                                        ],
                                        feedback: [
                                            submission.feedback !== undefined
                                                ? submission.feedback
                                                : '',
                                        ],
                                    })
                                );
                            }
                        }
                    );

                    console.log('All Submissions:', this.sumitedAssesments);
                },
                error: (err) => {
                    console.error('Error fetching submissions:', err);
                },
            });
    }

    downloadSubmission(submission: IAssignmentFile): void {
        const blob = this.base64ToBlob(
            submission.binaryData,
            submission.mimeType
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = submission.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    base64ToBlob(base64: string, mimeType: string): Blob {
        const byteCharacters = atob(base64);
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        return new Blob(byteArrays, { type: mimeType });
    }

    submitGrade(submission: IAssignmentFile): void {
        const formGroup = this.gradeForm.get(submission.id);

        if (!formGroup) {
            console.warn(
                `Form controls for submission ${submission.id} not found.`
            );
            return;
        }

        // ✅ Retrieve values properly (ensure they're not undefined)
        const updatedSubmission = {
            ...submission,
            grade:
                formGroup.value.grade !== undefined
                    ? formGroup.value.grade
                    : null,
            feedback:
                formGroup.value.feedback !== undefined
                    ? formGroup.value.feedback
                    : null,
            markingStatus: 'GRADED' as 'GRADED',
            gradedAt: new Date().toISOString(),
            gradedBy: 'Instructor',
        };

        console.log('Updated Submission:', updatedSubmission);

        this._assigmnetFilseServise.update(updatedSubmission).subscribe(() => {
            this.getAllSubmissions();
        });
    }
}
