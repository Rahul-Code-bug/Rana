import { initials } from '../utils/format';

export default function Avatar({ src, name, size = 'md', className = '', style }) {
  const sizeClass = size === 'lg' ? 'avatar-lg' : size === 'sm' ? 'avatar-sm' : '';
  if (src) {
    return <img src={src} alt={name} className={`avatar ${sizeClass} ${className}`} style={style} />;
  }
  return <div className={`avatar ${sizeClass} ${className}`} style={style}>{initials(name)}</div>;
}
