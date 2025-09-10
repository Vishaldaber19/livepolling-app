import React, { useState } from 'react';
import { Question } from '../types';
import './VoteCard.css';

interface VoteCardProps {
  question: Question;
  onVote: (questionId: string, optionIndex: number) => void;
  hasUserVoted: boolean;
  isVoting?: boolean;
}

const VoteCard: React.FC<VoteCardProps> = ({ 
  question, 
  onVote, 
  hasUserVoted, 
  isVoting = false 
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const handleVote = () => {
    if (selectedOption !== null && !hasUserVoted && !isVoting) {
      onVote(question._id, selectedOption);
    }
  };

  const getPercentage = (votes: number) => {
    if (question.totalVotes === 0) return 0;
    return Math.round((votes / question.totalVotes) * 100);
  };

  return (
    <div className="vote-card">
      <h3 className="question-title">{question.title}</h3>
      <div className="question-meta">
        <span className="total-votes">Total Votes: {question.totalVotes}</span>
        <span className="created-date">
          Created: {new Date(question.createdAt).toLocaleDateString()}
        </span>
      </div>
      
      <div className="options-container">
        {question.options.map((option, index) => {
          const percentage = getPercentage(option.votes);
          const isSelected = selectedOption === index;
          
          return (
            <div key={index} className="option-wrapper">
              <div 
                className={`option ${isSelected ? 'selected' : ''} ${hasUserVoted ? 'voted' : ''}`}
                onClick={() => !hasUserVoted && !isVoting && setSelectedOption(index)}
              >
                <div className="option-content">
                  <span className="option-text">{option.text}</span>
                  <div className="option-stats">
                    <span className="vote-count">{option.votes} votes</span>
                    <span className="percentage">{percentage}%</span>
                  </div>
                </div>
                {hasUserVoted && (
                  <div 
                    className="vote-bar" 
                    style={{ width: `${percentage}%` }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!hasUserVoted && (
        <div className="vote-actions">
          <button 
            className="vote-button"
            onClick={handleVote}
            disabled={selectedOption === null || isVoting}
          >
            {isVoting ? 'Voting...' : 'Submit Vote'}
          </button>
          {selectedOption !== null && (
            <button 
              className="clear-button"
              onClick={() => setSelectedOption(null)}
              disabled={isVoting}
            >
              Clear Selection
            </button>
          )}
        </div>
      )}

      {hasUserVoted && (
        <div className="voted-message">
          ✅ You have already voted on this question
        </div>
      )}
    </div>
  );
};

export default VoteCard;