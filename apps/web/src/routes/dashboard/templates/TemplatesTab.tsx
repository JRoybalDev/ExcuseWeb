import { useState } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";
import { promptBlocks, templateBlocks, type TemplateBlock } from "./templateContent";

async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to the legacy fallback below
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(textarea);
  return ok;
}

export function TemplatesTab() {
  return (
    <>
      <div className="admin-intro">
        <span className="admin-eyebrow">Reference library</span>
        <h1>Templates &amp; prompts</h1>
        <p>Copy-paste blocks for every video, and pre-filled prompts to paste into Claude with your real numbers.</p>
      </div>

      <div className="template-section">
        <h2 className="template-section__title">Templates</h2>
        <div className="template-grid">
          {templateBlocks.map((block) => (
            <TemplateCard key={block.id} block={block} />
          ))}
        </div>
      </div>

      <div className="template-section">
        <h2 className="template-section__title">Claude prompt library</h2>
        <div className="template-grid">
          {promptBlocks.map((block) => (
            <TemplateCard key={block.id} block={block} />
          ))}
        </div>
      </div>
    </>
  );
}

function TemplateCard({ block }: { block: TemplateBlock }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const ok = await copyToClipboard(block.content);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  return (
    <div className="template-card">
      <div className="template-card__header">
        <h3>{block.heading}</h3>
        <button className="admin-button admin-button--secondary template-card__copy" type="button" onClick={() => void handleCopy()}>
          {copied ? (
            <>
              <FiCheck aria-hidden /> Copied
            </>
          ) : (
            <>
              <FiCopy aria-hidden /> Copy
            </>
          )}
        </button>
      </div>
      <pre className="template-card__body">{block.content}</pre>
    </div>
  );
}
