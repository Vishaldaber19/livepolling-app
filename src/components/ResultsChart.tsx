import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { QuestionResults } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ResultsChartProps {
  results: QuestionResults;
  chartType: 'bar' | 'doughnut';
}

const ResultsChart: React.FC<ResultsChartProps> = ({ results, chartType }) => {
  const colors = [
    '#007bff',
    '#28a745',
    '#ffc107',
    '#dc3545',
    '#6610f2',
    '#fd7e14',
    '#20c997',
    '#e83e8c'
  ];

  const backgroundColors = colors.slice(0, results.options.length);
  const borderColors = backgroundColors.map(color => color);

  const data = {
    labels: results.options.map(option => option.text),
    datasets: [
      {
        label: 'Votes',
        data: results.options.map(option => option.votes),
        backgroundColor: chartType === 'doughnut' 
          ? backgroundColors.map(color => color + '80') 
          : backgroundColors.map(color => color + '20'),
        borderColor: borderColors,
        borderWidth: 2,
        hoverBackgroundColor: backgroundColors.map(color => color + '40'),
        hoverBorderColor: borderColors,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: `${results.title} - Vote Distribution`,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        padding: 20,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const option = results.options[context.dataIndex];
            return `${context.label}: ${context.raw} votes (${option.percentage}%)`;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          maxRotation: 45,
          minRotation: 0,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart' as const,
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: `${results.title} - Vote Distribution`,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        padding: 20,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const option = results.options[context.dataIndex];
            return `${context.label}: ${context.raw} votes (${option.percentage}%)`;
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
    },
    cutout: '50%',
  };

  if (results.totalVotes === 0) {
    return (
      <div className="no-votes-chart">
        <h3>{results.title}</h3>
        <p>No votes yet for this question</p>
      </div>
    );
  }

  return (
    <div className="results-chart">
      <div className="chart-container">
        {chartType === 'bar' ? (
          <Bar data={data} options={barOptions} />
        ) : (
          <Doughnut data={data} options={doughnutOptions} />
        )}
      </div>
    </div>
  );
};

export default ResultsChart;