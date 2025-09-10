import { Question, QuestionResults, CreateQuestionData } from '../types';

const API_BASE_URL = 'https://live-polling-thbb.onrender.com/api';

class ApiService {
  private async fetchApi(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'An error occurred');
    }

    return response.json();
  }

  async getQuestions(): Promise<Question[]> {
    return this.fetchApi('/questions');
  }

  async getQuestion(id: string): Promise<Question> {
    return this.fetchApi(`/questions/${id}`);
  }

  async createQuestion(questionData: CreateQuestionData): Promise<Question> {
    return this.fetchApi('/questions', {
      method: 'POST',
      body: JSON.stringify(questionData),
    });
  }

  async vote(questionId: string, optionIndex: number, userId: string): Promise<Question> {
    return this.fetchApi(`/questions/${questionId}/vote`, {
      method: 'PUT',
      body: JSON.stringify({ optionIndex, userId }),
    });
  }

  async getQuestionResults(questionId: string): Promise<QuestionResults> {
    return this.fetchApi(`/questions/${questionId}/results`);
  }

  async createUser(username: string, socketId: string) {
    return this.fetchApi('/users', {
      method: 'POST',
      body: JSON.stringify({ username, socketId }),
    });
  }

  async getActiveUsers() {
    return this.fetchApi('/users/active');
  }

  async healthCheck() {
    return this.fetchApi('/health');
  }
}

const apiService = new ApiService();
export default apiService;