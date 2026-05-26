import { Suspense } from 'react';
import { listAllVolumes } from '@/app/actions/analytics';
import Link from 'next/link';

export default function AdminVolumesPage() {
  return (
    <Suspense fallback={<VolumesLoading />}>
      <VolumesContent />
    </Suspense>
  );
}

function VolumesLoading() {
  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '48px 20px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '16px', color: '#666' }}>
        Loading volumes...
      </div>
    </div>
  );
}

async function VolumesContent() {
  let volumes = null;
  let error = null;

  try {
    volumes = await listAllVolumes();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load volumes';
  }

  if (error) {
    return (
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '48px 20px',
      }}>
        <h1 style={{
          fontFamily: 'var(--serif)',
          fontSize: 'clamp(32px, 4vw, 48px)',
          fontWeight: '400',
          color: '#1A1A1A',
          marginBottom: '24px',
        }}>
          Volumes
        </h1>
        <div style={{
          background: '#FF6B6B',
          color: 'white',
          padding: '16px 20px',
          borderRadius: '4px',
          fontSize: '14px',
        }}>
          Error: {error}
        </div>
      </div>
    );
  }

  if (!volumes) {
    return <VolumesLoading />;
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '48px clamp(20px, 3vw, 40px)',
      minHeight: '100vh',
    }}>
      <h1 style={{
        fontFamily: 'var(--serif)',
        fontSize: 'clamp(32px, 4vw, 48px)',
        fontWeight: '400',
        color: '#1A1A1A',
        marginBottom: '32px',
      }}>
        Volumes
      </h1>

      {volumes.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          fontSize: '16px',
          color: '#666',
        }}>
          No volumes found.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gap: '16px',
        }}>
          {volumes.map(volume => (
            <div
              key={volume.id}
              style={{
                background: 'white',
                border: '1px solid #E8E8E8',
                borderRadius: '4px',
                padding: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h3 style={{
                  fontFamily: 'var(--serif)',
                  fontSize: '18px',
                  fontWeight: '500',
                  color: '#1A1A1A',
                  margin: '0 0 8px 0',
                }}>
                  Deuce #{volume.number}
                </h3>
                <p style={{
                  margin: '0',
                  fontSize: '14px',
                  color: '#666',
                }}>
                  {volume.name}
                </p>
                <p style={{
                  margin: '4px 0 0 0',
                  fontSize: '13px',
                  color: '#999',
                }}>
                  📅 {new Date(volume.doors_date).toLocaleDateString()} • Status: <span style={{
                    display: 'inline-block',
                    background: volume.status === 'active' ? '#D4F748' : '#E8E8E8',
                    color: volume.status === 'active' ? '#1A1A1A' : '#666',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                  }}>
                    {volume.status}
                  </span>
                </p>
              </div>
              <Link
                href={`/admin/volumes/${volume.id}`}
                style={{
                  background: '#1B5A6B',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = '#154655';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = '#1B5A6B';
                }}
              >
                View Analytics
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
