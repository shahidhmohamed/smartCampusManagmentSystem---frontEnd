/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    // {
    //     id: 'example',
    //     title: 'Example',
    //     type: 'basic',
    //     icon: 'heroicons_outline:chart-pie',
    //     link: '/example',
    // },
    // {
    //     id: 'admin',
    //     title: 'Admin',
    //     type: 'collapsable',
    //     icon: 'heroicons_outline:cog',
    //     children: [
    //         {
    //             id: 'admin-dashboard',
    //             title: 'Dashboard',
    //             type: 'basic',
    //             link: '/admin/dashboard',
    //         },
    //         {
    //             id: 'admin-users',
    //             title: 'Manage Users',
    //             type: 'basic',
    //             link: '/admin/users',
    //         },
    //         {
    //             id: 'admin-settings',
    //             title: 'Settings',
    //             type: 'basic',
    //             link: '/admin/settings',
    //         },
    //     ],
    // },
    // {
    //     id: 'lecture',
    //     title: 'Lecture',
    //     type: 'collapsable',
    //     icon: 'heroicons_outline:book-open',
    //     children: [
    //         {
    //             id: 'lecture-dashboard',
    //             title: 'Dashboard',
    //             type: 'basic',
    //             link: '/lecture/dashboard',
    //         },
    //         {
    //             id: 'lecture-courses',
    //             title: 'Manage Courses',
    //             type: 'basic',
    //             link: '/lecture/courses',
    //         },
    //     ],
    // },
    // {
    //     id: 'student',
    //     title: 'Student',
    //     type: 'collapsable',
    //     icon: 'heroicons_outline:user-group',
    //     children: [
    //         {
    //             id: 'student-dashboard',
    //             title: 'Dashboard',
    //             type: 'basic',
    //             link: '/student/dashboard',
    //         },
    //         {
    //             id: 'student-assignments',
    //             title: 'Assignments',
    //             type: 'basic',
    //             link: '/student/assignments',
    //         },
    //     ],
    // },
    {
        id: 'admin',
        title: 'Admin Dashboard',
        type: 'basic',
        icon: 'heroicons_outline:cog',
        link: '/admin/dashboard',
    },
    {
        id: 'lecture',
        title: 'Lecture Dashboard',
        type: 'basic',
        icon: 'heroicons_outline:book-open',
        link: '/lecture/dashboard',
    },
    {
        id: 'student',
        title: 'Student Dashboard',
        type: 'basic',
        icon: 'heroicons_outline:user-group',
        link: '/student/dashboard',
    },
    {
        id: 'admin_events',
        title: 'Events',
        type: 'basic',
        icon: 'heroicons_outline:check-circle',
        link: '/admin/events',
    },
    // {
    //     id: 'admin_resource_booking',
    //     title: 'Resource Booking',
    //     type: 'basic',
    //     icon: 'heroicons_outline:calendar',
    //     link: '/admin/resource-management-bookings',
    // },
    {
        id: 'admin_resource_booking',
        title: 'Resource Booking',
        type: 'basic',
        icon: 'heroicons_outline:calendar',
        link: '/admin/resource-management-bookings-approval',
    },
    {
        id: 'admin_user_management',
        title: 'User Managment',
        type: 'basic',
        icon: 'heroicons_outline:user-group',
        link: '/admin/user-management',
    },
    {
        id: 'admin_file_manager',
        title: 'File Manager',
        type: 'basic',
        icon: 'heroicons_outline:cloud',
        link: '/admin/file-manager-2',
    },

    {
        id: 'course_management',
        title: 'Course Management',
        type: 'collapsable',
        icon: 'heroicons_outline:book-open',
        children: [
            {
                id: 'all_courses',
                title: 'Courses',
                type: 'basic',
                icon: 'heroicons_outline:academic-cap',
                link: '/admin/all-course',
            },
            {
                id: 'course_registration',
                title: 'Course Registration',
                type: 'basic',
                icon: 'heroicons_outline:document-text',
                link: '/admin/course-register',
            },
        ],
    },
    {
        id: 'admin_class_schedule',
        title: 'Class Schedule',
        type: 'basic',
        icon: 'heroicons_outline:calendar',
        link: '/admin/class-schedule',
    },

    {
        id: 'admin_chat',
        title: 'Chat',
        type: 'basic',
        icon: 'heroicons_outline:chat-bubble-left-right',
        link: '/admin/chat',
    },

    //Students
    {
        id: 'student_assignments',
        title: 'Assessment',
        type: 'basic',
        icon: 'heroicons_outline:academic-cap',
        link: '/student/assessment',
    },

    //lecture

    {
        id: 'staff_assignments',
        title: 'Assessment',
        type: 'basic',
        icon: 'heroicons_outline:academic-cap',
        link: '/lecture/assessment',
    },
];
export const compactNavigation: FuseNavigationItem[] = [
    {
        id: 'example',
        title: 'Example',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/example',
    },
];
export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id: 'example',
        title: 'Example',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/example',
    },
];
export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id: 'example',
        title: 'Example',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/example',
    },
];
