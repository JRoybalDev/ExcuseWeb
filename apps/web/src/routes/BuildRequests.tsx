import { buildRequestEraTypeLabels, buildRequestEraTypeValues, type BuildRequestEraType } from "@fullstack-template/schema";
import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { FiArrowLeft, FiArrowRight, FiImage, FiX } from "react-icons/fi";
import { Link } from "react-router-dom";
import { apiClient } from "../shared/apiClient";
import { SelectDropdown } from "../shared/SelectDropdown";
import { setDocumentTitle } from "../shared/siteConfig";

const CHANNEL_NAME = "ExcuseMeImJack";
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const eraTypeOptions: { value: BuildRequestEraType | ""; label: string }[] = [
  { value: "", label: "Choose one…" },
  ...buildRequestEraTypeValues.map((value) => ({ value, label: buildRequestEraTypeLabels[value] }))
];
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const emptyForm = {
  shoutoutName: "",
  buildIdea: "",
  eraType: "" as BuildRequestEraType | "",
  specificMap: "",
  specificAdditions: ""
};

export function BuildRequests() {
  useEffect(() => {
    setDocumentTitle("Pitch a Build");
  }, []);

  const [form, setForm] = useState(emptyForm);
  const [company, setCompany] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  function updateField<K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function clearImage() {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImageFile(null);
    setImagePreviewUrl("");
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setFieldError("Screenshots must be a JPEG, PNG, WEBP, or GIF.");
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setFieldError("Screenshot must be 8MB or smaller.");
      return;
    }

    setFieldError("");
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  }

  function reset() {
    setForm(emptyForm);
    setCompany("");
    clearImage();
    setFieldError("");
    setSubmitError("");
    setSubmitted(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const shoutoutName = form.shoutoutName.trim();
    const buildIdea = form.buildIdea.trim();

    if (!shoutoutName) {
      setFieldError("Add a shoutout name.");
      return;
    }

    if (buildIdea.length < 10) {
      setFieldError("Tell us a bit more about the build (at least 10 characters).");
      return;
    }

    if (!form.eraType) {
      setFieldError("Choose an era.");
      return;
    }

    setFieldError("");
    setSubmitError("");
    setIsSubmitting(true);

    try {
      let uploadId: string | null = null;

      if (imageFile) {
        const upload = await apiClient.buildRequests.uploadImage(imageFile);
        uploadId = upload.id;
      }

      await apiClient.buildRequests.submit({
        shoutoutName,
        buildIdea,
        eraType: form.eraType,
        specificMap: form.specificMap.trim(),
        specificAdditions: form.specificAdditions.trim(),
        uploadId,
        company
      });

      setSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="coming-soon-page build-request-page">
      <div className="coming-soon-content build-request-content">
        <Link className="build-request-back" to="/">
          <FiArrowLeft aria-hidden /> Back to {CHANNEL_NAME}
        </Link>

        <section className="coming-soon-hero">
          <span className="coming-soon-eyebrow">Construction Zone</span>
          <h1 className="coming-soon-heading build-request-heading">Pitch me a build</h1>
          <p className="coming-soon-subcopy">
            Got an enclosure, a challenge run, or a park layout you want to see? Send it in — the best ones get built on camera.
          </p>
        </section>

        <section className="build-request-card">
          {submitted ? (
            <div className="build-request-confirmation">
              <span className="build-request-confirmation__pill">Request received</span>
              <h2>Filed at the Construction Zone</h2>
              <p>Thanks — your build request is in the queue. Follow the schedule and socials to see if it makes the cut.</p>
              <button type="button" className="build-request-confirmation__reset" onClick={reset}>
                Submit another request
              </button>
            </div>
          ) : (
            <form className="build-request-form" onSubmit={(event) => void submit(event)}>
              <span className="coming-soon-eyebrow">Ranger request form</span>
              <h2 className="build-request-form__title">Submit a build request</h2>

              <div className="build-request-honeypot" aria-hidden="true">
                <label htmlFor="company">Company</label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                />
              </div>

              <label className="build-request-field">
                <span>Shoutout name</span>
                <input
                  placeholder="Jane Ranger"
                  maxLength={80}
                  value={form.shoutoutName}
                  onChange={(event) => updateField("shoutoutName", event.target.value)}
                  required
                />
              </label>

              <label className="build-request-field">
                <span>Build idea</span>
                <textarea
                  placeholder="A raptor paddock with a glass tunnel through the middle…"
                  rows={4}
                  maxLength={2000}
                  value={form.buildIdea}
                  onChange={(event) => updateField("buildIdea", event.target.value)}
                  required
                />
              </label>

              <div className="build-request-field">
                <span>Era type</span>
                <SelectDropdown className="cs-select" value={form.eraType} options={eraTypeOptions} onChange={(value) => updateField("eraType", value)} />
              </div>

              <label className="build-request-field">
                <span>Specific map?</span>
                <input
                  placeholder="e.g. Isla Nublar, Patagonia… (optional)"
                  maxLength={160}
                  value={form.specificMap}
                  onChange={(event) => updateField("specificMap", event.target.value)}
                />
              </label>

              <label className="build-request-field">
                <span>Specific additions?</span>
                <textarea
                  placeholder="Any must-have dinosaurs, attractions, or features (optional)"
                  rows={3}
                  maxLength={1000}
                  value={form.specificAdditions}
                  onChange={(event) => updateField("specificAdditions", event.target.value)}
                />
              </label>

              <div className="build-request-field">
                <span>Screenshots?</span>
                <div className="build-request-dropzone">
                  {imagePreviewUrl ? (
                    <div className="build-request-dropzone__preview">
                      <img src={imagePreviewUrl} alt="Selected reference screenshot" />
                      <button type="button" aria-label="Remove image" onClick={clearImage}>
                        <FiX aria-hidden />
                      </button>
                    </div>
                  ) : (
                    <label className="build-request-dropzone__empty" htmlFor="build-request-image">
                      <FiImage aria-hidden />
                      <span>Drop a reference screenshot (optional)</span>
                    </label>
                  )}
                  <input id="build-request-image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageChange} />
                </div>
              </div>

              {fieldError ? <p className="build-request-message build-request-message--error">{fieldError}</p> : null}
              {submitError ? <p className="build-request-message build-request-message--error">{submitError}</p> : null}

              <button className="build-request-submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending…" : "Send the request"} <FiArrowRight aria-hidden />
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
