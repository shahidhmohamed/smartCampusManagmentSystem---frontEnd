import { CommonModule, NgClass } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ChatUserService } from 'app/services/chat-user/service/chat-user.service';
import { IChat } from 'app/services/chat/chat.model';
import { ChatService } from 'app/services/chat/service/chat.service';
import { GroupChatMembersService } from 'app/services/group-chat-members/service/group-chat-members.service';
import { IGroupChat } from 'app/services/group-chat/group-chat.model';
import { GroupChatService } from 'app/services/group-chat/service/group-chat.service';
import { IMessage, NewMessage } from 'app/services/message/message.model';
import { MessageService } from 'app/services/message/service/message.service';
import { environment } from 'environments/environment';
import { ChatGroupCreateComponent } from '../chat-group-create/chat-group-create.component';
import { ChatProfileCreateComponent } from '../chat-profile-create/chat-profile-create.component';

@Component({
    selector: 'chat-chats',
    templateUrl: './chats.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatSidenavModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatFormFieldModule,
        MatInputModule,
        NgClass,
        CommonModule,
        MatInputModule,
        FormsModule,
    ],
})
export class ChatsComponent implements OnInit, OnDestroy {
    @ViewChild('fileInput') fileInput!: ElementRef;
    allChat: IChat[] = [];
    allGroups: IGroupChat[] = [];
    allMessages: IMessage[] = [];
    allGroupMessages: IMessage[] = [];
    loggedInUserId = environment.user.id;
    newMessage = '';
    selectedChat: IChat | null;
    selectedGroupChat: IGroupChat | null;
    selectedFile: File | null = null;
    filePreviewUrl: string | null = null;
    binaryDataBase64: string | null = null;

    constructor(
        private _chatUserService: ChatUserService,
        private _cd: ChangeDetectorRef,
        private _dialog: MatDialog,
        private _chatService: ChatService,
        private _messageService: MessageService,
        private _messageServiceGroupMember: GroupChatMembersService,
        private _messageGroupServise: GroupChatService
    ) {}

    ngOnInit(): void {
        this.getAllChatsMerged();
        this.getAllGroupMembers();
    }

    getAllChatsMerged(): void {
        let ownerChats: IChat[] = [];
        let contactChats: IChat[] = [];

        // Fetch chats where the user is the owner
        this._chatService
            .search({
                query: `owner:${this.loggedInUserId}`,
                size: 100,
                sort: ['desc'],
            })
            .subscribe((response) => {
                if (response && response.body) {
                    ownerChats = response.body;
                    this.mergeChats(ownerChats, contactChats);
                }
            });

        // Fetch chats where the user is the contact
        this._chatService
            .search({
                query: `contactId:${this.loggedInUserId}`,
                size: 100,
                sort: ['desc'],
            })
            .subscribe((response) => {
                if (response && response.body) {
                    contactChats = response.body;
                    this.mergeChats(ownerChats, contactChats);
                }
            });
    }

    getAllGroupMembers(): void {
        this._messageServiceGroupMember
            .search({
                query: `memberUserId:${environment.user.id}`,
                size: 100,
                sort: ['asc'],
            })
            .subscribe((res) => {
                if (res.body && res.body.length > 0) {
                    const groupIds = res.body
                        .map((g) => g.groupChatId)
                        .filter((id) => id);

                    if (groupIds.length === 0) {
                        console.warn('No groups found for this user.');
                        return;
                    }
                    this._messageGroupServise
                        .search({
                            query: `id:(${groupIds.join(' OR ')})`,
                            size: 100,
                            sort: ['asc'],
                        })
                        .subscribe((groupRes) => {
                            console.log('Fetched Groups:', groupRes.body);
                            this.allGroups = groupRes.body;
                            this._cd.detectChanges();
                        });
                } else {
                    console.warn('User is not a member of any group.');
                }
            });
    }

    mergeChats(ownerChats: IChat[], contactChats: IChat[]): void {
        const mergedChatMap = new Map<string, IChat>();

        ownerChats.forEach((chat) => {
            mergedChatMap.set(chat.id, chat);
        });
        contactChats.forEach((chat) => {
            if (!mergedChatMap.has(chat.id)) {
                mergedChatMap.set(chat.id, chat);
            }
        });
        this.allChat = Array.from(mergedChatMap.values());

        this._cd.detectChanges();
    }

    loadMessages(chat: IChat): void {
        this.selectedGroupChat = null;
        this.selectedChat = chat;

        this._messageService
            .search({
                query: `chatId:${chat.id}`,
                size: 100,
                sort: ['asc'],
            })
            .subscribe((messages) => {
                if (messages) {
                    this.allMessages = messages.body;
                    console.log('Loaded messages:', this.allMessages);
                    this._cd.detectChanges();
                    setTimeout(() => this.scrollToBottom(), 100);
                }
            });
    }

    loadGroupMessages(groupChat: IMessage): void {
        console.log('GroupChat', groupChat);
        this.selectedChat = null;
        this.selectedGroupChat = groupChat;
        console.log(this.selectedGroupChat);

        this._messageService
            .search({
                query: `groupChatId:${groupChat.id}`,
                size: 100,
                sort: ['asc'],
            })
            .subscribe((messages) => {
                if (messages) {
                    this.allMessages = messages.body;
                    console.log('Loaded messages:', this.allMessages);
                    this._cd.detectChanges();
                    setTimeout(() => this.scrollToBottom(), 100);
                }
            });
    }

    scrollToBottom(): void {
        setTimeout(() => {
            const chatContainer = document.querySelector('.chat-container');
            if (chatContainer) {
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }
        }, 100);
    }

    openUserDialog(): void {
        const dialogRef = this._dialog.open(ChatProfileCreateComponent, {
            width: '600px',
            disableClose: false,
        });

        dialogRef.afterClosed().subscribe((result) => {
            console.log('Dialog closed:', result);
            if (result) {
                setTimeout(() => {
                    this.getAllChatsMerged();
                    this._cd.detectChanges();
                }, 1000);
            }
        });
    }

    openUserDialogGroup(): void {
        const dialogRef = this._dialog.open(ChatGroupCreateComponent, {
            width: '600px',
            disableClose: false,
        });

        dialogRef.afterClosed().subscribe((result) => {
            console.log('Dialog closed:', result);
            if (result) {
                setTimeout(() => {
                    this.getAllGroupMembers();
                    this._cd.detectChanges();
                }, 1000);
            }
        });
    }

    openChat(chat: IChat): void {
        this.loadMessages(chat);
    }

    openGroupChat(groupChat: IGroupChat): void {
        console.log(groupChat.id);
        this.loadGroupMessages(groupChat);
    }

    // loadMessages(chatId: string): void {}

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
                this._cd.detectChanges();
            };

            this._cd.detectChanges();
        }
    }

    sendMessage(): void {
        if (!this.newMessage || !this.newMessage.trim() || !this.selectedChat) {
            console.warn('Message is empty or chat not selected!');
            return;
        }

        // Create a new message object
        const message: NewMessage = {
            binaryData: this.filePreviewUrl,
            id: null,
            content: this.newMessage.trim(),
            senderId: this.loggedInUserId,
            senderName: `${environment.user.firstName} ${environment.user.lastName}`,
            contactId: this.selectedChat.contactId,
            chatId: this.selectedChat.id,
            createdAt: new Date().toISOString(),
        };

        this.allMessages.push(message);
        console.log('MEssageeeeeeeeee', message);
        this.newMessage = '';
        this.filePreviewUrl = '';
        this._cd.detectChanges();
        setTimeout(() => this.scrollToBottom(), 100);

        this._messageService.create(message).subscribe(
            (response) => {
                if (response.body) {
                    const index = this.allMessages.findIndex(
                        (m) => m.id === message.id
                    );
                    if (index !== -1) {
                        this.allMessages[index] = response.body;
                    }
                    this._cd.detectChanges();
                    setTimeout(() => this.scrollToBottom(), 100);
                } else {
                    console.error('Failed to send message:', response);
                }
            },
            (error) => {
                console.error('Error sending message:', error);

                this.allMessages = this.allMessages.filter(
                    (m) => m.id !== message.id
                );
                this._cd.detectChanges();
            }
        );
    }

    sendMessageGroup(): void {
        if (
            !this.newMessage ||
            !this.newMessage.trim() ||
            !this.selectedGroupChat
        ) {
            console.warn('Message is empty or chat not selected!');
            return;
        }

        // Create a new message object
        const message: NewMessage = {
            groupChatId: this.selectedGroupChat.id,
            binaryData: this.filePreviewUrl,
            id: null,
            content: this.newMessage.trim(),
            senderId: this.loggedInUserId,
            senderName: `${environment.user.firstName} ${environment.user.lastName}`,
            createdAt: new Date().toISOString(),
        };

        this.allMessages.push(message);
        console.log('MEssageeeeeeeeee', message);
        this.newMessage = '';
        this.filePreviewUrl = '';
        this._cd.detectChanges();
        setTimeout(() => this.scrollToBottom(), 100);

        this._messageService.create(message).subscribe(
            (response) => {
                if (response.body) {
                    const index = this.allMessages.findIndex(
                        (m) => m.id === message.id
                    );
                    if (index !== -1) {
                        this.allMessages[index] = response.body;
                    }
                    this._cd.detectChanges();
                    setTimeout(() => this.scrollToBottom(), 100);
                } else {
                    console.error('Failed to send message:', response);
                }
            },
            (error) => {
                console.error('Error sending message:', error);

                this.allMessages = this.allMessages.filter(
                    (m) => m.id !== message.id
                );
                this._cd.detectChanges();
            }
        );
    }

    ngOnDestroy(): void {}
}
