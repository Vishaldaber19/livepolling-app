import React, { useState, useEffect } from 'react';
import VoteCard from './VoteCard';
import { Question } from '../types';
import apiService from '../services/apiService';
import socketService from '../services/socketService';
import './QuestionsScreen.css';

interface QuestionsScreenProps {
  userSocketId: string;
}

const QuestionsScreen: React.FC<QuestionsScreenProps> = ({ userSocketId }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [votingStates, setVotingStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadQuestions();
    setupSocketListeners();
    
    return () => {
      socketService.removeAllListeners();
    };
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const questionsData = await apiService.getQuestions();
      setQuestions(questionsData);
    } catch (err) {
      setError('Failed to load questions');
      console.error('Error loading questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    socketService.onNewQuestion((data) => {
      setQuestions(prev => [data.question, ...prev]);
    });

    socketService.onVoteUpdate((data) => {
      setQuestions(prev => 
        prev.map(q => 
          q._id === data.questionId 
            ? { ...q, options: data.options, totalVotes: data.totalVotes }
            : q
        )
      );
      setVotingStates(prev => ({ ...prev, [data.questionId]: false }));
    });

    socketService.onVoteError((data) => {
      setError(data.message);
      setTimeout(() => setError(null), 5000);
      Object.keys(votingStates).forEach(questionId => {
        setVotingStates(prev => ({ ...prev, [questionId]: false }));
      });
    });
  };

  const handleVote = async (questionId: string, optionIndex: number) => {
    try {
      setVotingStates(prev => ({ ...prev, [questionId]: true }));
      setError(null);
      
      socketService.joinQuestionRoom(questionId);
      socketService.vote({ questionId, optionIndex });
    } catch (err) {
      setError('Failed to submit vote');
      setVotingStates(prev => ({ ...prev, [questionId]: false }));
      console.error('Error voting:', err);
    }
  };

  const hasUserVoted = (question: Question): boolean => {
    return question.options.some(option => 
      option.votedUsers.includes(userSocketId)
    );
  };

  const handleRefresh = () => {
    loadQuestions();
  };

  if (loading) {
    return (
      <div className="questions-screen">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="questions-screen">
      <div className="questions-header">
        <h2>Live Polling Questions</h2>
        <div className="header-actions">
          <button className="refresh-button" onClick={handleRefresh}>
            🔄 Refresh
          </button>
          <div className="questions-count">
            {questions.length} {questions.length === 1 ? 'question' : 'questions'} available
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {questions.length === 0 ? (
        <div className="no-questions">
          <div className="no-questions-content">
            <h3>No questions available yet</h3>
            <p>Be the first to create a question and start polling!</p>
          </div>
        </div>
      ) : (
        <div className="questions-list">
          {questions.map((question) => (
            <VoteCard
              key={question._id}
              question={question}
              onVote={handleVote}
              hasUserVoted={hasUserVoted(question)}
              isVoting={votingStates[question._id] || false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionsScreen;