import { useEffect, useRef, useState } from 'react';
import { Settings } from 'lucide-react';

export default function VideoPlayer({ renditions, poster, onProgress }) {
  const videoRef = useRef(null);
  const [quality, setQuality] = useState(() => renditions[renditions.length - 1]?.resolution);
  const [speed, setSpeed] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastReported = useRef(0);

  const current = renditions.find((r) => r.resolution === quality) || renditions[0];

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => {
      if (v.currentTime - lastReported.current > 10) {
        lastReported.current = v.currentTime;
        onProgress?.(Math.floor(v.currentTime));
      }
    };
    v.addEventListener('timeupdate', onTime);
    return () => v.removeEventListener('timeupdate', onTime);
  }, [onProgress]);

  const changeQuality = (res) => {
    const v = videoRef.current;
    const time = v.currentTime;
    const wasPlaying = !v.paused;
    setQuality(res);
    setMenuOpen(false);
    requestAnimationFrame(() => {
      v.currentTime = time;
      if (wasPlaying) v.play();
    });
  };

  const changeSpeed = (rate) => {
    videoRef.current.playbackRate = rate;
    setSpeed(rate);
  };

  if (!current) {
    return (
      <div className="player-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
        Video is still processing...
      </div>
    );
  }

  return (
    <div className="player-wrap">
      <video ref={videoRef} src={current.url} poster={poster} controls playsInline pictureInPicture>
        Your browser does not support the video tag.
      </video>
      <div style={{ position: 'absolute', top: 10, right: 10 }}>
        <button
          className="icon-btn" style={{ background: 'rgba(0,0,0,0.5)', color: 'white' }}
          onClick={() => setMenuOpen((v) => !v)} aria-label="Playback settings"
        >
          <Settings size={18} />
        </button>
        {menuOpen && (
          <div className="dropdown-menu" style={{ minWidth: 160 }}>
            <div style={{ padding: '6px 12px', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Quality</div>
            {renditions.map((r) => (
              <button key={r.resolution} className="dropdown-item" onClick={() => changeQuality(r.resolution)}>
                {r.resolution === quality && '✓ '}{r.resolution}p
              </button>
            ))}
            <div className="dropdown-divider" />
            <div style={{ padding: '6px 12px', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Speed</div>
            {[0.5, 1, 1.25, 1.5, 2].map((r) => (
              <button key={r} className="dropdown-item" onClick={() => changeSpeed(r)}>
                {r === speed && '✓ '}{r}x
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
