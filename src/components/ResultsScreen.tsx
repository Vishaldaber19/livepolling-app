import React, { useState, useEffect } from 'react';
import ResultsChart from './ResultsChart';
import Leaderboard from './Leaderboard';
import { Question, QuestionResults } from '../types';
import apiService from '../services/apiService';
import socketService from '../services/socketService';
import './ResultsScreen.css';

const ResultsScreen: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [questionResults, setQuestionResults] = useState<QuestionResults | null>(null);
  const [chartType, setChartType] = useState<'bar' | 'doughnut'>('bar');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQuestions();
    setupSocketListeners();
    
    return () => {
      socketService.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    if (selectedQuestion) {
      loadQuestionResults(selectedQuestion._id);
    }
  }, [selectedQuestion]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const questionsData = await apiService.getQuestions();
      setQuestions(questionsData);
      
      if (questionsData.length > 0 && !selectedQuestion) {
        const questionWithVotes = questionsData.find(q => q.totalVotes > 0) || questionsData[0];
        setSelectedQuestion(questionWithVotes);
      }
    } catch (err) {
      setError('Failed to load questions');
      console.error('Error loading questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestionResults = async (questionId: string) => {
    try {
      const results = await apiService.getQuestionResults(questionId);
      setQuestionResults(results);
    } catch (err) {
      setError('Failed to load question results');
      console.error('Error loading results:', err);
    }
  };

  const setupSocketListeners = () => {
    socketService.onVoteUpdate((data) => {
      setQuestions(prev => 
        prev.map(q => 
          q._id === data.questionId 
            ? { ...q, options: data.options, totalVotes: data.totalVotes }
            : q
        )
      );
      
      if (selectedQuestion && selectedQuestion._id === data.questionId) {
        const updatedQuestion = questions.find(q => q._id === data.questionId);
        if (updatedQuestion) {
          setSelectedQuestion({ ...updatedQuestion, options: data.options, totalVotes: data.totalVotes });
          loadQuestionResults(data.questionId);
        }
      }
    });

    socketService.onNewQuestion((data) => {
      setQuestions(prev => [data.question, ...prev]);
    });

    socketService.onQuestionResults((data) => {
      setQuestionResults(data);
    });
  };

  const handleQuestionSelect = (question: Question) => {
    setSelectedQuestion(question);
    setError(null);
  };

  const handleRefresh = () => {
    loadQuestions();
    if (selectedQuestion) {
      loadQuestionResults(selectedQuestion._id);
    }
  };

  const getTotalVotesAcrossAllQuestions = () => {
    return questions.reduce((total, question) => total + question.totalVotes, 0);
  };

  if (loading) {
    return (
      <div className="results-screen">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="results-screen">
      <div className="results-header">
        <h2>📊 Live Polling Results</h2>
        <div className="header-actions">
          <button className="refresh-button" onClick={handleRefresh}>
            🔄 Refresh
          </button>
          <div className="total-votes">
            Total Votes: {getTotalVotesAcrossAllQuestions()}
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="results-content">
        <div className="results-sidebar">
          <div className="question-selector">
            <h3>Select Question</h3>
            <div className="question-list">
              {questions.map((question) => (
                <div
                  key={question._id}
                  className={`question-item ${selectedQuestion?._id === question._id ? 'selected' : ''}`}
                  onClick={() => handleQuestionSelect(question)}
                >
                  <div className="question-preview">
                    <h4>{question.title}</h4>
                    <div className="question-stats">
                      <span>{question.totalVotes} votes</span>
                      <span>{question.options.length} options</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <Leaderboard questions={questions} />
        </div>

        <div className="results-main">
          {selectedQuestion && questionResults ? (
            <div className="chart-section">
              <div className="chart-controls">
                <h3>Question Results</h3>
                <div className="chart-type-selector">
                  <button
                    className={chartType === 'bar' ? 'active' : ''}
                    onClick={() => setChartType('bar')}
                  >
                    📊 Bar Chart
                  </button>
                  <button
                    className={chartType === 'doughnut' ? 'active' : ''}
                    onClick={() => setChartType('doughnut')}
                  >
                    🍩 Doughnut Chart
                  </button>
                </div>
              </div>
              
              <ResultsChart 
                results={questionResults} 
                chartType={chartType}
              />
              
              <div className="detailed-results">
                <h4>Detailed Results</h4>
                <div className="results-table">
                  {questionResults.options.map((option, index) => (
                    <div key={index} className="result-row">
                      <span className="option-text">{option.text}</span>
                      <div className="result-stats">
                        <span className="vote-count">{option.votes} votes</span>
                        <span className="percentage">{option.percentage}%</span>
                      </div>
                      <div 
                        className="result-bar" 
                        style={{ width: `${option.percentage}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <h3>Select a question to view results</h3>
              <p>Choose a question from the sidebar to see detailed voting results and charts.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen;