import { inject } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    Router,
    RouterStateSnapshot,
    Routes,
} from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { TasksListComponent } from './admin-events/list/list.component';
import { ChatComponent } from './chat/chat.component';
import { ChatService } from './chat/chat.service';
import { ChatsComponent } from './chat/chats/chats.component';
import { ConversationComponent } from './chat/conversation/conversation.component';
import { EmptyConversationComponent } from './chat/empty-conversation/empty-conversation.component';
import { CourseDetailsComponent } from './course/course-details/course-details.component';
import { CourseManagementComponent } from './course/course-management/course-management.component';
import { ScheduleClassesComponent } from './course/schedule-classes/schedule-classes.component';
import { FileManagerComponent } from './file-manager-2/file-manager/file-manager.component';
import { ResourceManagment } from './resource-managment/list/list.component';
import { ResourceApprovalListComponent } from './resource-managment/resource-approval-list/resource-approval-list.component';
import { UserManagmentComponent } from './user-managment/user-managment.component';

/**
 * Conversation resolver
 */
const conversationResolver = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const chatService = inject(ChatService);
    const router = inject(Router);

    return chatService.getChatById(route.paramMap.get('id')).pipe(
        catchError((error) => {
            console.error(error);
            const parentUrl = state.url.split('/').slice(0, -1).join('/');
            router.navigateByUrl(parentUrl);
            return throwError(error);
        })
    );
};

export default [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: AdminDashboardComponent },
    { path: 'events', component: TasksListComponent },
    { path: 'resource-management', component: ResourceManagment },
    {
        path: 'resource-management-bookings-approval',
        component: ResourceApprovalListComponent,
    },
    { path: 'user-management', component: UserManagmentComponent },
    { path: 'file-manager-2', component: FileManagerComponent },
    { path: 'all-course', component: CourseDetailsComponent },
    { path: 'course-register', component: CourseManagementComponent },
    { path: 'class-schedule', component: ScheduleClassesComponent },
    { path: 'chat', component: ChatsComponent },

    // ✅ Nested Chat Module under "admin-chat"
    {
        path: 'admin-chat',
        component: ChatComponent,
        resolve: {
            chats: () => inject(ChatService).getChats(),
            contacts: () => inject(ChatService).getContacts(),
            profile: () => inject(ChatService).getProfile(),
        },
        children: [
            {
                path: '',
                component: ChatsComponent,
                children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        component: EmptyConversationComponent,
                    },
                    {
                        path: ':id',
                        component: ConversationComponent,
                        resolve: { conversation: conversationResolver },
                    },
                ],
            },
        ],
    },
] as Routes;
