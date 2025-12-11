function HelpPage() {
  return (
    <div className="page help-page">
      <section className="section-card">
        <div className="section-title">Help Center</div>
        <p>If your deposit has not been received or you face any payment issue, please contact support.</p>

        <div className="help-grid">
          <a href="#" className="ghost-button">Telegram Channel</a>
          <a href="#" className="ghost-button">Online Support</a>
        </div>
      </section>

      <section className="section-card">
        <div className="section-title">Common Questions</div>
        <div className="faq-item">
          <div className="faq-q">Payment issues?</div>
          <div className="faq-a">If you experience any payment issues, please contact customer support directly.</div>
        </div>
        <div className="faq-item">
          <div className="faq-q">Order payment problems?</div>
          <div className="faq-a">For any order payment problems, please contact our customer service team immediately.</div>
        </div>
      </section>
    </div>
  );
}

export default HelpPage;
