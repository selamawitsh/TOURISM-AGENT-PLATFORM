import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { analyticsAPI } from '../../services/api';

const UserGrowthChart = ({ period = 'month' }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await analyticsAPI.getUserGrowth(period);
      const growth = response.data;
      
      const chartData = {
        labels: growth.data.map(item => item.date),
        datasets: [
          {
            label: 'New Users',
            data: growth.data.map(item => item.new_users),
            borderColor: 'rgb(139, 92, 246)',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            fill: true,
            tension: 0.4,
          },
          {
            label: 'Total Users (Cumulative)',
            data: growth.data.map(item => item.total_users),
            borderColor: 'rgb(236, 72, 153)',
            backgroundColor: 'rgba(236, 72, 153, 0.1)',
            fill: true,
            tension: 0.4,
          },
        ],
      };
      
      setData(chartData);
    } catch (err) {
      setError('Failed to load user growth data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'User Growth',
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Number of Users',
        },
        beginAtZero: true,
      },
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="h-80">
      {data && <Line options={options} data={data} />}
    </div>
  );
};

export default UserGrowthChart;