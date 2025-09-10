import { io, Socket } from 'socket.io-client';
import { VoteData, CreateQuestionData } from '../types';

class SocketService {
  private socket: Socket | null = null;
  private serverUrl = 'https://live-polling-thbb.onrender.com';

  connect(): Promise<Socket> {
    return new Promise((resolve, reject) => {
      this.socket = io(this.serverUrl, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });
      
      this.socket.on('connect', () => {
        console.log('Connected to server:', this.socket?.id);
        resolve(this.socket!);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket.io connection error:', error);
        console.error('Trying to connect to:', this.serverUrl);
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log('Socket reconnected after', attemptNumber, 'attempts');
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinUser(username: string) {
    if (this.socket) {
      this.socket.emit('join_user', { username });
    }
  }

  joinQuestionRoom(questionId: string) {
    if (this.socket) {
      this.socket.emit('join_question_room', { questionId });
    }
  }

  vote(voteData: VoteData) {
    if (this.socket) {
      this.socket.emit('vote', voteData);
    }
  }

  createQuestion(questionData: CreateQuestionData) {
    if (this.socket) {
      this.socket.emit('create_question', questionData);
    }
  }

  getQuestionResults(questionId: string) {
    if (this.socket) {
      this.socket.emit('get_question_results', { questionId });
    }
  }

  onUserJoined(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('user_joined', callback);
    }
  }

  onVoteUpdate(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('vote_update', callback);
    }
  }

  onNewQuestion(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('new_question', callback);
    }
  }

  onQuestionCreated(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('question_created', callback);
    }
  }

  onQuestionResults(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('question_results', callback);
    }
  }

  onVoteError(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('vote_error', callback);
    }
  }

  onQuestionError(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('question_error', callback);
    }
  }

  onUserConnected(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('user_connected', callback);
    }
  }

  onUserDisconnected(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('user_disconnected', callback);
    }
  }

  getSocketId(): string | null {
    return this.socket?.id || null;
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

const socketService = new SocketService();
export default socketService;