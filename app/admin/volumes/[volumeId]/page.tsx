import { Suspense } from 'react';
import { getVolumeAnalytics } from '@/app/actions/analytics';
import Link from 'next/link';

export default function VolumeAnalyticsPage({
  params,
}: {
  params: { volumeId: string };
}) {
  return (
    <Suspense fallback={<AnalyticsLoading />}>
      <AnalyticsContent volumeId={params.volumeId} />
    </Suspense>
  );
}

function AnalyticsLoading() {
  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '48px 20px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '16px', color: '#666' }}>
        Loading analytics...
      </div>
    </div>
  );
}

async function AnalyticsContent({ volumeId }: { volumeId: string }) {
  let data = null;
  let error = null;

  try {
    data = await getVolumeAnalytics(volumeId);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load analytics';
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

  if (!data) {
    return <AnalyticsLoading />;
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '48px clamp(20px, 3vw, 40px)',
      minHeight: '100vh',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
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
          {data.volume.name}
        </h1>

        <div style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          fontSize: '14px',
          color: '#666',
        }}>
          <span>📅 {new Date(data.volume.doors_date).toLocaleDateString()}</span>
          <span style={{
            display: 'inline-block',
            background: data.volume.status === 'active' ? '#D4F748' : '#E8E8E8',
            color: data.volume.status === 'active' ? '#1A1A1A' : '#666',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            textTransform: 'uppercase',
          }}>
            {data.volume.status}
          </span>
        </div>
      </div>

      {/* Key Metrics Grid (4 Cards) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '48px',
      }}>
        <MetricCard
          label="Approval Rate"
          value={`${data.applications.approvalRate}%`}
          subtext={`${data.applications.approved}/${data.applications.total} approved`}
          color="#1B5A6B"
        />
        <MetricCard
          label="Check-in Rate"
          value={`${data.attendance.checkInRate}%`}
          subtext={`${data.attendance.checkedIn}/${data.attendance.confirmed} checked in`}
          color="#1B5A6B"
        />
        <MetricCard
          label="Match Rate"
          value={`${data.mutualMatches.matchRate}%`}
          subtext={`${data.mutualMatches.total}/${data.attendance.confirmed} matches`}
          color="#1B5A6B"
        />
        <MetricCard
          label="Total Revenue"
          value={`$${data.financial.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtext={`${data.applications.approved} attendees`}
          color="#1B5A6B"
        />
      </div>

      {/* Applications Section */}
      <Section title="Applications">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <StatBox label="Total" value={data.applications.total} />
          <StatBox label="Approved" value={data.applications.approved} />
          <StatBox label="Rejected" value={data.applications.rejected} />
          <StatBox label="Pending" value={data.applications.pending} />
        </div>

        {data.applications.rejected > 0 && Object.keys(data.applications.rejectionReasons).length > 0 && (
          <div>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#1A1A1A' }}>
              Rejection Reasons
            </h4>
            <div style={{ fontSize: '14px', color: '#666' }}>
              {Object.entries(data.applications.rejectionReasons).map(([reason, count]) => (
                <div key={reason} style={{ padding: '8px 0', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{reason}</span>
                  <span style={{ fontWeight: '600' }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* Attendance Section */}
      <Section title="Attendance">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px' }}>
          <StatBox label="Confirmed" value={data.attendance.confirmed} />
          <StatBox label="Checked In" value={data.attendance.checkedIn} />
          <StatBox label="No-Shows" value={data.attendance.confirmed - data.attendance.checkedIn} />
          <StatBox label="No-show Rate" value={`${data.attendance.noShowRate}%`} />
        </div>
      </Section>

      {/* Spark Picks Section */}
      <Section title="Spark Picks">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <StatBox label="Total Picks" value={data.sparkPicks.totalPicks} />
          <StatBox label="Avg per Attendee" value={data.sparkPicks.averagePicksPerAttendee} />
        </div>

        <div style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
          <div style={{ padding: '8px 0', display: 'flex', justifyContent: 'space-between' }}>
            <span>Date</span>
            <span style={{ fontWeight: '600' }}>{data.sparkPicks.byKind.date}</span>
          </div>
          <div style={{ padding: '8px 0', display: 'flex', justifyContent: 'space-between' }}>
            <span>Connect</span>
            <span style={{ fontWeight: '600' }}>{data.sparkPicks.byKind.connect}</span>
          </div>
          <div style={{ padding: '8px 0', display: 'flex', justifyContent: 'space-between' }}>
            <span>Both</span>
            <span style={{ fontWeight: '600' }}>{data.sparkPicks.byKind.both}</span>
          </div>
        </div>

        {data.sparkPicks.mostPickedAttendees.length > 0 && (
          <div>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#1A1A1A' }}>
              Most Picked Attendees
            </h4>
            <div style={{ fontSize: '14px', color: '#666' }}>
              {data.sparkPicks.mostPickedAttendees.map((attendee, idx) => (
                <div key={idx} style={{ padding: '8px 0', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{attendee.name}</span>
                  <span style={{ fontWeight: '600' }}>{attendee.count} picks</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* Mutual Matches Section */}
      <Section title="Mutual Matches">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <StatBox label="Total Matches" value={data.mutualMatches.total} />
          <StatBox label="Match Rate" value={`${data.mutualMatches.matchRate}%`} />
          <StatBox label="Without Matches" value={data.mutualMatches.attendeesWithoutMatches} />
        </div>

        <div style={{ fontSize: '14px', color: '#666' }}>
          <div style={{ padding: '8px 0', display: 'flex', justifyContent: 'space-between' }}>
            <span>Date Matches</span>
            <span style={{ fontWeight: '600' }}>{data.mutualMatches.byKind.date}</span>
          </div>
          <div style={{ padding: '8px 0', display: 'flex', justifyContent: 'space-between' }}>
            <span>Connect Matches</span>
            <span style={{ fontWeight: '600' }}>{data.mutualMatches.byKind.connect}</span>
          </div>
          <div style={{ padding: '8px 0', display: 'flex', justifyContent: 'space-between' }}>
            <span>Both Matches</span>
            <span style={{ fontWeight: '600' }}>{data.mutualMatches.byKind.both}</span>
          </div>
        </div>
      </Section>

      {/* Engagement Section */}
      <Section title="Engagement">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px' }}>
          <StatBox label="Intros Viewed" value={data.engagement.introsViewed} />
          <StatBox label="View Rate" value={`${data.engagement.introViewRate}%`} />
        </div>
      </Section>

      {/* Financial Section */}
      <Section title="Financial">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px' }}>
          <StatBox label="Total Revenue" value={`$${data.financial.totalRevenue.toLocaleString()}`} />
          <StatBox label="Pending Payments" value={data.financial.pendingPayments} />
          <StatBox label="Failed Payments" value={data.financial.failedPayments} />
        </div>
      </Section>
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

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{
      background: '#F9F9F9',
      border: '1px solid #E8E8E8',
      borderRadius: '4px',
      padding: '16px',
      textAlign: 'center',
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
        fontSize: '24px',
        fontWeight: '700',
        color: '#1A1A1A',
        fontFamily: 'Georgia, serif',
      }}>
        {value}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      marginBottom: '40px',
      borderTop: '1px solid #E8E8E8',
      paddingTop: '32px',
    }}>
      <h2 style={{
        fontFamily: 'var(--serif)',
        fontSize: '24px',
        fontWeight: '400',
        color: '#1A1A1A',
        margin: '0 0 24px 0',
      }}>
        {title}
      </h2>
      {children}
    </div>
  );
}
