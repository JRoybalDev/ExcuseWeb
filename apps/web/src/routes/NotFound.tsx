import { useEffect } from "react";
import { FiArrowLeft, FiYoutube } from "react-icons/fi";
import { Link } from "react-router-dom";
import { setDocumentTitle } from "../shared/siteConfig";

const CHANNEL_NAME = "ExcuseMeImJack";
const YOUTUBE_URL = "https://youtube.com/@ExcuseMeImJack";

export function NotFound() {
  useEffect(() => {
    setDocumentTitle("Not Found");
  }, []);

  return (
    <div className="coming-soon-page not-found-page">
      <div className="coming-soon-content not-found-content">
        <span className="not-found-stripe" aria-hidden="true" />

        <div className="not-found-panel">
          <span className="coming-soon-eyebrow">Sector not found</span>
          <h1 className="not-found-code">404</h1>
          <p className="coming-soon-subcopy">You've wandered off the trail. This paddock doesn't exist — or the raptors got to it first.</p>
          <span className="not-found-pill">
            <span className="not-found-pill__dot" />
            Containment team dispatched
          </span>
          <div className="not-found-actions">
            <Link className="build-request-submit" to="/">
              <FiArrowLeft aria-hidden /> Back to the gates
            </Link>
            <a className="not-found-secondary" href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer">
              <FiYoutube aria-hidden /> Watch something instead
            </a>
          </div>
        </div>

        <span className="not-found-footer">© 2026 {CHANNEL_NAME} · excusemeimjack.com</span>
      </div>
    </div>
  );
}
