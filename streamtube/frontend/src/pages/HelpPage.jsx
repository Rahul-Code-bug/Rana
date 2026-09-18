export default function HelpPage() {
  const faqs = [
    { q: 'How do I upload a video?', a: 'Click the Upload button in the top navigation or sidebar, select a video file, fill in the details, and publish or save as a draft.' },
    { q: 'How do I change my video\'s visibility?', a: 'Go to Creator Studio → Videos, and use the visibility dropdown next to any video.' },
    { q: 'How do subscriptions work?', a: 'Subscribe to a channel from its page or from a video\'s watch page to see their uploads in your Subscriptions feed.' },
    { q: 'How do I report a video or comment?', a: 'Use the flag icon on the watch page, or the menu next to a comment.' },
    { q: 'How do I become a channel owner?', a: 'Every account automatically gets its own channel as soon as you sign up.' },
  ];
  return (
    <div>
      <h1 className="page-title">Help Center</h1>
      <div className="panel" style={{ maxWidth: 700 }}>
        {faqs.map((f, i) => (
          <div key={i} style={{ marginBottom: 18 }}>
            <p style={{ fontWeight: 600, marginBottom: 4 }}>{f.q}</p>
            <p className="muted" style={{ fontSize: 14 }}>{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
