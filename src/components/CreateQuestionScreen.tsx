import React, { useState, useEffect } from 'react';
import { CreateQuestionData } from '../types';
import apiService from '../services/apiService';
import socketService from '../services/socketService';
import './CreateQuestionScreen.css';

const CreateQuestionScreen: React.FC = () => {
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setupSocketListeners();
    
    return () => {
      socketService.removeAllListeners();
    };
  }, []);

  const setupSocketListeners = () => {
    socketService.onQuestionCreated((data) => {
      setSuccess(`Question "${data.question.title}" created successfully!`);
      resetForm();
      setIsSubmitting(false);
      setTimeout(() => setSuccess(null), 5000);
    });

    socketService.onQuestionError((data) => {
      setError(data.message);
      setIsSubmitting(false);
      setTimeout(() => setError(null), 5000);
    });
  };

  const resetForm = () => {
    setTitle('');
    setOptions(['', '']);
  };

  const addOption = () => {
    if (options.length < 8) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      setError('Question title is required');
      return false;
    }

    if (title.trim().length < 5) {
      setError('Question title must be at least 5 characters long');
      return false;
    }

    if (title.trim().length > 200) {
      setError('Question title must be less than 200 characters');
      return false;
    }

    const validOptions = options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      setError('At least 2 options are required');
      return false;
    }

    for (let i = 0; i < validOptions.length; i++) {
      if (validOptions[i].length > 100) {
        setError(`Option ${i + 1} must be less than 100 characters`);
        return false;
      }
    }

    const uniqueOptions = new Set(validOptions.map(opt => opt.toLowerCase().trim()));
    if (uniqueOptions.size !== validOptions.length) {
      setError('All options must be unique');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const validOptions = options.filter(opt => opt.trim() !== '');
      const questionData: CreateQuestionData = {
        title: title.trim(),
        options: validOptions
      };

      socketService.createQuestion(questionData);
      
    } catch (err) {
      setError('Failed to create question. Please try again.');
      setIsSubmitting(false);
      console.error('Error creating question:', err);
    }
  };

  const handleTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const handleOptionKeyPress = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (index === options.length - 1) {
        addOption();
      }
    }
  };

  return (
    <div className="create-question-screen">
      <div className="create-question-container">
        <div className="form-header">
          <h2>🎯 Create New Question</h2>
          <p>Create engaging questions for your audience to vote on</p>
        </div>

        {error && (
          <div className="error-message">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {success && (
          <div className="success-message">
            <span>✅ {success}</span>
            <button onClick={() => setSuccess(null)}>✕</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="question-form">
          <div className="form-group">
            <label htmlFor="title">
              Question Title *
              <span className="char-count">{title.length}/200</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyPress={handleTitleKeyPress}
              placeholder="Enter your question here..."
              maxLength={200}
              disabled={isSubmitting}
              autoFocus
            />
            <div className="form-hint">
              Ask a clear, engaging question that people can vote on
            </div>
          </div>

          <div className="form-group">
            <label>
              Answer Options *
              <span className="options-count">{options.filter(opt => opt.trim()).length}/8</span>
            </label>
            
            <div className="options-container">
              {options.map((option, index) => (
                <div key={index} className="option-input-group">
                  <div className="option-number">{index + 1}</div>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    onKeyPress={(e) => handleOptionKeyPress(e, index)}
                    placeholder={`Option ${index + 1}...`}
                    maxLength={100}
                    disabled={isSubmitting}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      className="remove-option-btn"
                      onClick={() => removeOption(index)}
                      disabled={isSubmitting}
                      title="Remove option"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="options-actions">
              <button
                type="button"
                className="add-option-btn"
                onClick={addOption}
                disabled={isSubmitting || options.length >= 8}
              >
                ➕ Add Option
              </button>
              <div className="form-hint">
                Add 2-8 options for people to choose from
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="reset-btn"
              onClick={resetForm}
              disabled={isSubmitting}
            >
              🔄 Reset Form
            </button>
            
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting || !title.trim() || options.filter(opt => opt.trim()).length < 2}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Creating...
                </>
              ) : (
                <>
                  🚀 Create Question
                </>
              )}
            </button>
          </div>
        </form>

        <div className="form-footer">
          <div className="tips">
            <h4>💡 Tips for great questions:</h4>
            <ul>
              <li>Keep your question clear and concise</li>
              <li>Provide distinct and meaningful options</li>
              <li>Avoid leading or biased language</li>
              <li>Make sure all options are mutually exclusive</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateQuestionScreen;