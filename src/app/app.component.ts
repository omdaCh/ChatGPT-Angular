import { Component, inject } from '@angular/core';
import { ChatComponent } from './chat-component/chat-component.component';
import { Conversation } from './conversation.model';
import { SidenaveComponent } from './sidenave/sidenave.component';
import { ThreadService } from './services/thread.service';


@Component({
  selector: 'app-root',
  imports: [ChatComponent, SidenaveComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent  {
  title = 'chatgptApi';

  conversations: Conversation[] = []

  threadService: ThreadService = inject(ThreadService);

  isSideNaveCollapsed: { value: boolean } = { value: false };


  

  openSideNave() {
    this.isSideNaveCollapsed.value = false;
  }

  createNewThread(){
    this.threadService.setOpenedThread(undefined);
  }

}
