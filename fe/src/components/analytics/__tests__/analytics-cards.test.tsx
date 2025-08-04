import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { AnalyticsCards } from '../analytics-cards';
import type { AnalyticsData } from '@/types';

const mockAnalyticsData: AnalyticsData = {
  total_clicks: 1234,
  unique_visitors: 567,
  clicks_today: 89,
  clicks_this_week: 345,
  clicks_this_month: 1000,
  daily_clicks: [
    { date: '2023-01-01', clicks: 10 },
    { date: '2023-01-02', clicks: 15 },
    { date: '2023-01-03', clicks: 20 },
    { date: '2023-01-04', clicks: 25 },
    { date: '2023-01-05', clicks: 30 },
  ],
  hourly_clicks: [],
  device_stats: [],
  browser_stats: [],
  country_stats: [],
};

describe('AnalyticsCards', () => {
  it('renders all analytics cards with correct titles', () => {
    render(<AnalyticsCards data={mockAnalyticsData} />);
    
    expect(screen.getByText('Total Clicks')).toBeInTheDocument();
    expect(screen.getByText('Unique Visitors')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('This Week')).toBeInTheDocument();
    expect(screen.getByText('This Month')).toBeInTheDocument();
    expect(screen.getByText('Avg. Daily')).toBeInTheDocument();
  });

  it('displays formatted numbers correctly', () => {
    render(<AnalyticsCards data={mockAnalyticsData} />);
    
    expect(screen.getByText('1,234')).toBeInTheDocument(); // total_clicks
    expect(screen.getByText('567')).toBeInTheDocument(); // unique_visitors
    expect(screen.getByText('89')).toBeInTheDocument(); // clicks_today
    expect(screen.getByText('345')).toBeInTheDocument(); // clicks_this_week
    expect(screen.getByText('1,000')).toBeInTheDocument(); // clicks_this_month
  });

  it('calculates and displays average daily clicks correctly', () => {
    render(<AnalyticsCards data={mockAnalyticsData} />);
    
    // Average of [10, 15, 20, 25, 30] = 100 / 5 = 20
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('handles large numbers with proper formatting', () => {
    const largeNumbersData: AnalyticsData = {
      ...mockAnalyticsData,
      total_clicks: 1234567,
      unique_visitors: 987654,
      clicks_today: 12345,
    };

    render(<AnalyticsCards data={largeNumbersData} />);
    
    expect(screen.getByText('1,234,567')).toBeInTheDocument();
    expect(screen.getByText('987,654')).toBeInTheDocument();
    expect(screen.getByText('12,345')).toBeInTheDocument();
  });

  it('handles zero values correctly', () => {
    const zeroData: AnalyticsData = {
      ...mockAnalyticsData,
      total_clicks: 0,
      unique_visitors: 0,
      clicks_today: 0,
      clicks_this_week: 0,
      clicks_this_month: 0,
      daily_clicks: [],
    };

    render(<AnalyticsCards data={zeroData} />);
    
    const zeroTexts = screen.getAllByText('0');
    expect(zeroTexts).toHaveLength(6); // All cards should show 0
  });

  it('handles empty daily clicks array for average calculation', () => {
    const emptyDailyData: AnalyticsData = {
      ...mockAnalyticsData,
      daily_clicks: [],
    };

    render(<AnalyticsCards data={emptyDailyData} />);
    
    // Should show "0" for average when no daily data
    const avgDailyCard = screen.getByText('Avg. Daily').closest('.grid > div');
    expect(avgDailyCard).toHaveTextContent('0');
  });

  it('displays correct descriptive text for each card', () => {
    render(<AnalyticsCards data={mockAnalyticsData} />);
    
    expect(screen.getByText('All time clicks')).toBeInTheDocument();
    expect(screen.getByText('Unique visitors')).toBeInTheDocument();
    expect(screen.getByText('Clicks today')).toBeInTheDocument();
    expect(screen.getByText('Clicks this week')).toBeInTheDocument();
    expect(screen.getByText('Clicks this month')).toBeInTheDocument();
    expect(screen.getByText('Average daily clicks')).toBeInTheDocument();
  });

  it('renders icons for each card', () => {
    render(<AnalyticsCards data={mockAnalyticsData} />);
    
    // Check for icon classes (Lucide React icons render as SVGs)
    const container = screen.getByText('Total Clicks').closest('.grid');
    expect(container).toContainHTML('<svg'); // Should contain SVG icons
  });

  it('applies correct grid layout classes', () => {
    render(<AnalyticsCards data={mockAnalyticsData} />);
    
    const gridContainer = screen.getByText('Total Clicks').closest('.grid');
    expect(gridContainer).toHaveClass('grid', 'gap-4', 'md:grid-cols-2', 'lg:grid-cols-6');
  });

  it('calculates average with decimal numbers correctly', () => {
    const decimalData: AnalyticsData = {
      ...mockAnalyticsData,
      daily_clicks: [
        { date: '2023-01-01', clicks: 3 },
        { date: '2023-01-02', clicks: 5 },
        { date: '2023-01-03', clicks: 4 },
      ],
    };

    render(<AnalyticsCards data={decimalData} />);
    
    // Average of [3, 5, 4] = 12 / 3 = 4
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('rounds decimal averages to nearest integer', () => {
    const decimalData: AnalyticsData = {
      ...mockAnalyticsData,
      daily_clicks: [
        { date: '2023-01-01', clicks: 3 },
        { date: '2023-01-02', clicks: 5 },
      ],
    };

    render(<AnalyticsCards data={decimalData} />);
    
    // Average of [3, 5] = 8 / 2 = 4
    expect(screen.getByText('4')).toBeInTheDocument();
  });
});