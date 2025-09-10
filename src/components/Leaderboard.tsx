import React from 'react';
import { Question } from '../types';
import './Leaderboard.css';

interface LeaderboardProps {
  questions: Question[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ questions }) => {
  const sortedQuestions = [...questions]
    .filter(q => q.totalVotes > 0)
    .sort((a, b) => b.totalVotes - a.totalVotes)
    .slice(0, 10);

  const getTopOption = (question: Question) => {
    if (question.options.length === 0) return null;
    return question.options.reduce((prev, current) => 
      prev.votes > current.votes ? prev : current
    );
  };

  const getMedal = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `#${index + 1}`;
    }
  };

  if (sortedQuestions.length === 0) {
    return (
      <div className="leaderboard">
        <h3>📊 Question Leaderboard</h3>
        <div className="no-data">
          <p>No questions with votes yet</p>
          <span>Start voting to see the leaderboard!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard">
      <h3>📊 Most Popular Questions</h3>
      <div className="leaderboard-list">
        {sortedQuestions.map((question, index) => {
          const topOption = getTopOption(question);
          const createdDate = new Date(question.createdAt).toLocaleDateString();
          
          return (
            <div key={question._id} className={`leaderboard-item rank-${index + 1}`}>
              <div className="rank-badge">
                {getMedal(index)}
              </div>
              
              <div className="question-info">
                <h4 className="question-title">{question.title}</h4>
                <div className="question-details">
                  <span className="vote-count">
                    🗳️ {question.totalVotes} total votes
                  </span>
                  <span className="created-date">
                    📅 {createdDate}
                  </span>
                </div>
                
                {topOption && (
                  <div className="winning-option">
                    <span className="winner-label">Leading option:</span>
                    <span className="winner-text">"{topOption.text}"</span>
                    <span className="winner-votes">
                      ({topOption.votes} votes - {Math.round((topOption.votes / question.totalVotes) * 100)}%)
                    </span>
                  </div>
                )}
              </div>
              
              <div className="vote-progress">
                <div className="progress-circle">
                  <span>{question.totalVotes}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {questions.length > sortedQuestions.length && (
        <div className="leaderboard-footer">
          <p>Showing top {sortedQuestions.length} questions with votes</p>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;