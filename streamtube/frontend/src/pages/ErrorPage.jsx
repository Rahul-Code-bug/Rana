import { Link } from 'react-router-dom';

export default function ErrorPage({ code = 404, title, message }) {
  const defaults = {
    404: { title: 'Page not found', message: "The page you're looking for doesn't exist or may have been moved." },
    403: { title: 'Access denied', message: "You don't have permission to view this page." },
    500: { title: 'Something went wrong', message: 'An unexpected error occurred on our end. Please try again shortly.' },
  };
  const d = defaults[code] || defaults[404];
  return (
    <div className="error-page">
      <div className="error-code">{code}</div>
      <h2>{title || d.title}</h2>
      <p className="muted">{message || d.message}</p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: 20, display: 'inline-flex' }}>Back to home</Link>
    </div>
  );
}
