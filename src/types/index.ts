export interface Option {
  text: string;
  votes: number;
  votedUsers: string[];
  percentage?: number;
}

export interface Question {
  _id: string;
  title: string;
  options: Option[];
  createdAt: string;
  isActive: boolean;
  totalVotes: number;
}

export interface User {
  _id: string;
  username: string;
  socketId: string;
  votedQuestions: string[];
  joinedAt: string;
}

export interface VoteData {
  questionId: string;
  optionIndex: number;
}

export interface CreateQuestionData {
  title: string;
  options: string[];
}

export interface VoteUpdateData {
  questionId: string;
  options: Option[];
  totalVotes: number;
  votedBy: string;
}

export interface QuestionResults {
  questionId: string;
  title: string;
  totalVotes: number;
  options: Array<{
    text: string;
    votes: number;
    percentage: number;
  }>;
}