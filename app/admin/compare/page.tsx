import { Suspense } from 'react';
import { getAllVolumesAnalytics, getHistoricalSummary } from '@/app/actions/analytics';
import Link from 'next/link';

export default function CompareVolumesPage() {
  return (
    <Suspense fallback={<CompareLoading />}>
      <CompareContent />
    </Suspense>
  );
}

function CompareLoading() {
  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '48px 20px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '16px', color: '#666' }}>
        Loading comparison data...
      </div>
    </div>
  );
}

async function CompareContent() {
  let allAnalytics = null;
  let summary = null;
  let error = null;

  try {
    const [analyticsData, summaryData] = await Promise.all([
      getAllVolumesAnalytics(),
      getHistoricalSummary(),
    ]);
    allAnalytics = analyticsData;
    summary = summaryData;
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load comparison data';
  }

  if (error) {
    return (
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '48px 20px',
      }}>
        <div style={{
          background: '#FF6B6B',
          color: 'white',
          padding: '16px 20px',
          borderRadius: '4px',
          marginBottom: '24px',
          fontSize: '14px',
        }}>
          Error: {error}
        </div>
        <Link href="/admin/volumes" style={{
          color: '#1B5A6B',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: '600',
        }}>
          ← Back to Volumes
        </Link>
      </div>
    );
  }

  if (!allAnalytics || !summary) {
    return <CompareLoading />;
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '48px clamp(20px, 3vw, 40px)',
      minHeight: '100vh',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '48px' }}>
        <Link href="/admin/volumes" style={{
          color: '#1B5A6B',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: '600',
          marginBottom: '16px',
          display: 'inline-block',
        }}>
          ← Back to Volumes
        </Link>

        <h1 style={{
          fontFamily: 'var(--serif)',
          fontSize: 'clamp(32px, 4vw, 48px)',
          fontWeight: '400',
          color: '#1A1A1A',
          margin: '16px 0 8px 0',
        }}>
          Event Comparison & Trends
        </h1>

        <p style={{
          fontSize: '14px',
          color: '#666',
          margin: '0',
        }}>
          Historical view of all {summary.eventsTotal} events
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '48px',
      }}>
        <MetricCard
          label="Total Events"
          value={summary.eventsTotal.toString()}
          subtext={`${summary.dateRange.earliest} to ${summary.dateRange.latest}`}
          color="#1B5A6B"
        />
        <MetricCard
          label="Avg Approval Rate"
          value={`${summary.averageApprovalRate}%`}
          subtext={`${summary.totalApplications} total apps`}
          color="#1B5A6B"
        />
        <MetricCard
          label="Avg Check-in Rate"
          value={`${summary.averageCheckInRate}%`}
          subtext={`Across all events`}
          color="#1B5A6B"
        />
        <MetricCard
          label="Total Revenue"
          value={`$${summary.totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
          subtext={`${summary.totalMatches} total matches`}
          color="#1B5A6B"
        />
      </div>

      {/* Overall Trend */}
      <div style={{
        background: 'white',
        border: '1px solid #E8E8E8',
        borderRadius: '4px',
        padding: '20px',
        marginBottom: '48px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
          OVERALL TREND
        </div>
        <div style={{
          fontSize: '28px',
          fontWeight: '700',
          color: summary.trendDirection === 'improving'
            ? '#1B5A6B'
            : summary.trendDirection === 'declining'
              ? '#FF6B6B'
              : '#999',
          fontFamily: 'Georgia, serif',
        }}>
          {summary.trendDirection === 'improving' && '↑ Improving'}
          {summary.trendDirection === 'declining' && '↓ Declining'}
          {summary.trendDirection === 'stable' && '→ Stable'}
        </div>
      </div>

      {/* Events Timeline */}
      <div style={{ borderTop: '1px solid #E8E8E8', paddingTop: '32px' }}>
        <h2 style={{
          fontFamily: 'var(--serif)',
          fontSize: '24px',
          fontWeight: '400',
          color: '#1A1A1A',
          margin: '0 0 24px 0',
        }}>
          All Events
        </h2>

        {allAnalytics.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            fontSize: '16px',
            color: '#666',
          }}>
            No events found.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {allAnalytics.map((analytics, idx) => (
              <EventComparisonCard key={analytics.volume.id} analytics={analytics} isFirst={idx === 0} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  subtext,
  color,
}: {
  label: string;
  value: string;
  subtext: string;
  color: string;
}) {
  return (
    <div style={{
      background: 'white',
      border: `2px solid ${color}`,
      borderRadius: '4px',
      padding: '20px',
      textAlign: 'center',
    }}>
      <div style={{
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: '#666',
        marginBottom: '8px',
      }}>
        {label}
      </div>
      <div style={{
        fontSize: '40px',
        fontWeight: '700',
        color: color,
        marginBottom: '8px',
        fontFamily: 'Georgia, serif',
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '13px',
        color: '#999',
      }}>
        {subtext}
      </div>
    </div>
  );
}

function EventComparisonCard({ analytics, isFirst }: { analytics: any; isFirst: boolean }) {
  const getTrendColor = (direction: string) => {
    if (direction === 'up') return '#1B5A6B';
    if (direction === 'down') return '#FF6B6B';
    return '#999';
  };

  const getTrendIcon = (direction: string) => {
    if (direction === 'up') return '↑';
    if (direction === 'down') return '↓';
    return '→';
  };

  const getTrendText = (direction: string, value: number) => {
    if (direction === 'neutral') return '→ —';
    return `${getTrendIcon(direction)} ${value > 0 ? '+' : ''}${value}%`;
  };

  return (
    <div style={{
      background: 'white',
      border: '1px solid #E8E8E8',
      borderRadius: '4px',
      padding: '20px',
    }}>
      {/* Event Header */}
      <div style={{
        marginBottom: '20px',
        paddingBottom: '20px',
        borderBottom: '1px solid #E8E8E8',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>
        <div>
          <h3 style={{
            fontFamily: 'var(--serif)',
            fontSize: '18px',
            fontWeight: '500',
            color: '#1A1A1A',
            margin: '0 0 8px 0',
          }}>
            Deuce #{analytics.volume.number}: {analytics.volume.name}
          </h3>
          <p style={{
            margin: '0',
            fontSize: '13px',
            color: '#666',
          }}>
            📅 {new Date(analytics.volume.doors_date).toLocaleDateString()} | Status:{' '}
            <span style={{
              display: 'inline-block',
              background: analytics.volume.status === 'active' ? '#D4F748' : '#E8E8E8',
              color: analytics.volume.status === 'active' ? '#1A1A1A' : '#666',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: '600',
              textTransform: 'uppercase',
            }}>
              {analytics.volume.status}
            </span>
          </p>
        </div>
        <Link href={`/admin/volumes/${analytics.volume.id}`} style={{
          color: '#1B5A6B',
          textDecoration: 'none',
          fontSize: '13px',
          fontWeight: '600',
          whiteSpace: 'nowrap',
          marginLeft: '20px',
        }}>
          View Details →
        </Link>
      </div>

      {/* Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '16px',
      }}>
        <MetricComparison
          label="Approval Rate"
          value={`${analytics.applications.approvalRate}%`}
          trend={getTrendText(analytics.approvalRateTrend.direction, analytics.approvalRateTrend.value)}
          trendColor={getTrendColor(analytics.approvalRateTrend.direction)}
          isFirst={isFirst}
        />
        <MetricComparison
          label="Check-in Rate"
          value={`${analytics.attendance.checkInRate}%`}
          trend={getTrendText(analytics.checkInRateTrend.direction, analytics.checkInRateTrend.value)}
          trendColor={getTrendColor(analytics.checkInRateTrend.direction)}
          isFirst={isFirst}
        />
        <MetricComparison
          label="Match Rate"
          value={`${analytics.mutualMatches.matchRate}%`}
          trend={getTrendText(analytics.matchRateTrend.direction, analytics.matchRateTrend.value)}
          trendColor={getTrendColor(analytics.matchRateTrend.direction)}
          isFirst={isFirst}
        />
        <MetricComparison
          label="Total Revenue"
          value={`$${analytics.financial.totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
          trend={getTrendText(analytics.revenueTrend.direction, analytics.revenueTrend.value)}
          trendColor={getTrendColor(analytics.revenueTrend.direction)}
          isFirst={isFirst}
        />
        <MetricComparison
          label="Applications"
          value={analytics.applications.total.toString()}
          trend="—"
          trendColor="#999"
          isFirst={isFirst}
        />
        <MetricComparison
          label="Matches"
          value={analytics.mutualMatches.total.toString()}
          trend="—"
          trendColor="#999"
          isFirst={isFirst}
        />
      </div>
    </div>
  );
}

function MetricComparison({
  label,
  value,
  trend,
  trendColor,
  isFirst,
}: {
  label: string;
  value: string;
  trend: string;
  trendColor: string;
  isFirst: boolean;
}) {
  return (
    <div style={{
      background: '#F9F9F9',
      border: '1px solid #E8E8E8',
      borderRadius: '4px',
      padding: '16px',
    }}>
      <div style={{
        fontSize: '12px',
        color: '#666',
        marginBottom: '8px',
        fontWeight: '500',
      }}>
        {label}
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        gap: '8px',
      }}>
        <div style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#1A1A1A',
          fontFamily: 'Georgia, serif',
        }}>
          {value}
        </div>
        {!isFirst && (
          <div style={{
            fontSize: '12px',
            fontWeight: '600',
            color: trendColor,
            whiteSpace: 'nowrap',
          }}>
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}
