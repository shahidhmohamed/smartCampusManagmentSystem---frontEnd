import { CommonModule, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@ngneat/transloco';
import { IUser } from 'app/services/user/service/user-management.model';
import { UserManagementService } from 'app/services/user/service/user.service';
import { UserDialogComponentComponent } from './user-dialog.component/user-dialog.component.component';

@Component({
    selector: 'app-user-managment',
    standalone: true,
    imports: [
        MatSidenavModule,
        MatButtonModule,
        MatTooltipModule,
        MatIconModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatDividerModule,
        MatFormFieldModule,
        MatInputModule,
        MatOptionModule,
        MatDatepickerModule,
        MatTabsModule,
        MatTableModule,
        TranslocoModule,
        MatRippleModule,
        MatMenuModule,
        NgClass,
    ],
    templateUrl: './user-managment.component.html',
    styleUrl: './user-managment.component.scss',
})
export class UserManagmentComponent {
    displayedColumns: string[] = [
        'login',
        'email',
        'firstName',
        'lastName',
        'authorities',
        'actions',
    ];
    dataSource = new MatTableDataSource<IUser>([]);
    searchInput = '';

    constructor(
        private userService: UserManagementService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) {}

    ngOnInit(): void {
        this.loadUsers();
    }

    // Fetch users from the service
    loadUsers(): void {
        this.userService.query().subscribe((response) => {
            if (response.body) {
                this.dataSource.data = response.body;
            }
        });

        this.userService.queryAuthority().subscribe((response) => {
            if (response.body) {
            }
        });
    }

    // Filter users
    applyFilter(): void {
        this.dataSource.filter = this.searchInput.trim().toLowerCase();
    }

    // Open dialog for creating or editing user
    openUserDialog(user?: IUser): void {
        const dialogRef = this.dialog.open(UserDialogComponentComponent, {
            width: '600px',
            data: user ? { ...user } : null,
        });

        dialogRef.afterClosed().subscribe((result) => {
            alert(result);

            if (result) {
                if (result.id) {
                    this.userService.update(result.id).subscribe(() => {
                        this.snackBar.open(
                            'User updated successfully!',
                            'Close',
                            { duration: 3000 }
                        );
                        this.loadUsers();
                    });
                } else {
                    this.userService.create(result).subscribe(() => {
                        this.snackBar.open(
                            'User created successfully!',
                            'Close',
                            { duration: 3000 }
                        );
                        this.loadUsers();
                    });
                }
            }
        });
    }

    // Delete user
    deleteUser(user: IUser): void {
        if (!user.login) return;

        this.userService.delete(user.login).subscribe(() => {
            this.snackBar.open('User deleted successfully!', 'Close', {
                duration: 3000,
            });
            this.loadUsers();
        });
    }
}
