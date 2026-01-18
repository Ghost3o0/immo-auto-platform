'use client';

import { Line, Bar, Doughnut } from 'react-chartjs-2';
import './chart-config';

interface ChartData {
  labels: string[];
  data: number[];
}

// Chart Colors
const colors = {
  primary: 'rgb(99, 102, 241)',
  primaryLight: 'rgba(99, 102, 241, 0.1)',
  secondary: 'rgb(168, 85, 247)',
  secondaryLight: 'rgba(168, 85, 247, 0.1)',
  success: 'rgb(34, 197, 94)',
  warning: 'rgb(234, 179, 8)',
  danger: 'rgb(239, 68, 68)',
  info: 'rgb(6, 182, 212)',
};

// Line Chart - Views over time
export function ViewsChart({ data }: { data: ChartData }) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Vues',
        data: data.data,
        fill: true,
        backgroundColor: colors.primaryLight,
        borderColor: colors.primary,
        tension: 0.4,
        pointBackgroundColor: colors.primary,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: colors.primary,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#9ca3af',
        },
      },
      y: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          color: '#9ca3af',
        },
        beginAtZero: true,
      },
    },
  };

  return <Line data={chartData} options={options} />;
}

// Bar Chart - Listings by category
export function ListingsBarChart({ data }: { data: { properties: number; vehicles: number } }) {
  const chartData = {
    labels: ['Immobilier', 'Véhicules'],
    datasets: [
      {
        label: 'Annonces',
        data: [data.properties, data.vehicles],
        backgroundColor: [colors.primary, colors.secondary],
        borderRadius: 8,
        barThickness: 60,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#9ca3af',
        },
      },
      y: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          color: '#9ca3af',
          stepSize: 1,
        },
        beginAtZero: true,
      },
    },
  };

  return <Bar data={chartData} options={options} />;
}

// Doughnut Chart - Listing status
export function StatusDoughnutChart({ data }: { data: { active: number; sold: number; rented: number } }) {
  const chartData = {
    labels: ['Actives', 'Vendues', 'Louées'],
    datasets: [
      {
        data: [data.active, data.sold, data.rented],
        backgroundColor: [colors.success, colors.primary, colors.warning],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          color: '#9ca3af',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
      },
    },
    cutout: '65%',
  };

  return <Doughnut data={chartData} options={options} />;
}

// Activity Line Chart
export function ActivityChart({ data }: { data: ChartData }) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Messages',
        data: data.data,
        fill: false,
        borderColor: colors.info,
        tension: 0.4,
        pointBackgroundColor: colors.info,
        pointBorderColor: '#fff',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#9ca3af',
        },
      },
      y: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          color: '#9ca3af',
          stepSize: 1,
        },
        beginAtZero: true,
      },
    },
  };

  return <Line data={chartData} options={options} />;
}
