import { Component, inject, OnInit } from '@angular/core';
import { ChatComponent } from './chat-component/chat-component.component';
import { Conversation } from './conversation.model';
import { ChatService } from './services/chat.service';
import { SidenaveComponent } from './sidenave/sidenave.component';
import { animate, state, style, transition, trigger } from '@angular/animations';


@Component({
  selector: 'app-root',
  imports: [ChatComponent, SidenaveComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'chatgptApi';

  conversations: Conversation[] = []

  chatService: ChatService = inject(ChatService);

  isSideNaveCollapsed: { value: boolean } = { value: false };

  ngOnInit() {
    // this.chatService.newThread().subscribe({
    //   next: (res) => {
    //     console.log(`thread id : ${res}`)
    //   },
    //   error: (err) => {
    //     console.log(`err = ${ JSON.stringify(err)}`);
    //   }
    // })
    // this.chatService.getThreads().subscribe({
    //   next: (resp) => {
    //     console.log(`threads : ${JSON.stringify(resp)}`)
    //   },
    //   error: (err) => {
    //     console.log(err);
    //   }
    // })
  }

  openSideNave() {
    this.isSideNaveCollapsed.value = false;
  }

}
