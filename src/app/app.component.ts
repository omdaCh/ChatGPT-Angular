import { Component, inject, OnInit } from '@angular/core';
import { ChatComponent } from './chat-component/chat-component.component';
import { Conversation } from './conversation.model';
import { ChatService } from './services/chat.service';
import { SidenaveComponent } from './sidenave/sidenave.component';
import { initializeApp } from "firebase/app";


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


  firebaseConfig = {
    apiKey: "AIzaSyCiWYhF_RMtDulOo3pSeHzOb8iyNxMhqqE",
    authDomain: "chatgpt-angular-9765d.firebaseapp.com",
    projectId: "chatgpt-angular-9765d",
    storageBucket: "chatgpt-angular-9765d.firebasestorage.app",
    messagingSenderId: "174920482697",
    appId: "1:174920482697:web:37a729bf927bbdb6cbeb58"
  };

  // Initialize Firebase
  app = initializeApp(this.firebaseConfig);

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

  createNewThread(){
    this.chatService.createNewThread();
  }

}
