import { CommonModule, NgClass } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
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
import { IMessage, NewMessage } from 'app/services/message/message.model';
import { MessageService } from 'app/services/message/service/message.service';
import { environment } from 'environments/environment';
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
    allChat: IChat[] = [];
    allMessages: IMessage[] = [];
    loggedInUserId = environment.user.id;
    newMessage = '';
    selectedChat: IChat | null;

    constructor(
        private _chatUserService: ChatUserService,
        private _cd: ChangeDetectorRef,
        private _dialog: MatDialog,
        private _chatService: ChatService,
        private _messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.getAllChatsMerged();
    }

    // ✅ Load Chat Users
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

    mergeChats(ownerChats: IChat[], contactChats: IChat[]): void {
        const mergedChatMap = new Map<string, IChat>();

        // Add owner chats
        ownerChats.forEach((chat) => {
            mergedChatMap.set(chat.id, chat);
        });

        // Add contact chats (prevent duplicates)
        contactChats.forEach((chat) => {
            if (!mergedChatMap.has(chat.id)) {
                mergedChatMap.set(chat.id, chat);
            }
        });

        // Convert map back to an array
        this.allChat = Array.from(mergedChatMap.values());

        this._cd.detectChanges();
    }

    loadMessages(chat: IChat): void {
        this.selectedChat = chat; // Set selected chat

        this._messageService
            .search({
                query: `chatId:${chat.id}`,
                size: 100,
                sort: ['asc'], // Ensure messages are in chronological order
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
                this.getAllChatsMerged();
            }
        });
    }

    openChat(chat: IChat): void {
        this.loadMessages(chat);
    }

    // loadMessages(chatId: string): void {}

    sendMessage(): void {
        if (!this.newMessage || !this.newMessage.trim() || !this.selectedChat) {
            console.warn('Message is empty or chat not selected!');
            return;
        }

        // Create a new message object
        const message: NewMessage = {
            id: null, // Temporary ID for UI update
            content: this.newMessage.trim(),
            senderId: this.loggedInUserId, // Sender is the logged-in user
            contactId: this.selectedChat.contactId, // Recipient
            chatId: this.selectedChat.id,
            createdAt: new Date().toISOString(),
        };

        // Optimistically add the message to the chat window (appears immediately)
        this.allMessages.push(message);
        this.newMessage = ''; // Clear input field
        this._cd.detectChanges();
        setTimeout(() => this.scrollToBottom(), 100); // Scroll to bottom

        // Send message to backend
        this._messageService.create(message).subscribe(
            (response) => {
                if (response.body) {
                    // Replace temp message with real message from API
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
                // Remove the optimistically added message on failure
                this.allMessages = this.allMessages.filter(
                    (m) => m.id !== message.id
                );
                this._cd.detectChanges();
            }
        );
    }

    ngOnDestroy(): void {}
}
