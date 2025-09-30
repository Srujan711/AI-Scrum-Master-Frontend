import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useBurndownData } from '../../hooks/useSprints';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  sprintId: number;
}

interface BurndownData {
  daily_data: Array<{
    date: string;
    remaining_points: number;
    ideal_remaining: number;
  }>;
  current_velocity: number;
  completion_forecast: any;
}

export const BurndownChart: React.FC<Props> = ({ sprintId }) => {
  const { data, isLoading: loading, isError } = useBurndownData(sprintId);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        Failed to load burndown data
      </div>
    );
  }

  const chartData = {
    labels: data.daily_data.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Ideal Burndown',
        data: data.daily_data.map(d => d.ideal_remaining),
        borderColor: 'rgb(156, 163, 175)',
        backgroundColor: 'rgba(156, 163, 175, 0.1)',
        borderDash: [5, 5],
      },
      {
        label: 'Actual Burndown',
        data: data.daily_data.map(d => d.remaining_points),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Story Points',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
    },
  };

  return (
    <div className="h-64">
      <Line data={chartData} options={options} />
    </div>
  );
};