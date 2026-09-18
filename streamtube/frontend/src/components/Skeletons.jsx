export function VideoGridSkeleton({ count = 12 }) {
  return (
    <div className="video-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <div className="skel skel-thumb" />
          <div className="skel skel-line" style={{ width: '90%' }} />
          <div className="skel skel-line" style={{ width: '60%' }} />
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 6 }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="list-row">
          <div className="skel skel-thumb" style={{ width: 220 }} />
          <div style={{ flex: 1 }}>
            <div className="skel skel-line" style={{ width: '70%' }} />
            <div className="skel skel-line" style={{ width: '40%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
