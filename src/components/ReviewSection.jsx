import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "./Shared.jsx";
import { addReview, computeAverageRating, getReviewsForListing } from "../services/reviews.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { formatUiDateOnly } from "../i18n/ui.js";

const STAR_COUNT = 5;

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (name[0] || "?").toUpperCase();
};

const getRatingLabelValue = (rating) => {
  const value = Number(rating) || 0;
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
};

function Stars({ rating = 0, size = 18 }) {
  const { t } = useLanguage();

  return (
    <span className="rv-stars" aria-label={t("reviews.starsLabel", { n: getRatingLabelValue(rating) })}>
      {Array.from({ length: STAR_COUNT }, (_, i) => (
        <Icon
          key={i}
          icon={i < Math.round(rating) ? "mdi:star" : "mdi:star-outline"}
          width={size}
          height={size}
          className={i < Math.round(rating) ? "rv-star--filled" : "rv-star--empty"}
        />
      ))}
    </span>
  );
}

function StarPicker({ value, onChange }) {
  const { t } = useLanguage();
  const [hover, setHover] = useState(0);

  return (
    <span className="rv-star-picker" role="radiogroup" aria-label={t("reviews.ratingLabel")}>
      {Array.from({ length: STAR_COUNT }, (_, i) => {
        const starValue = i + 1;
        const isActive = starValue <= (hover || value);
        return (
          <button
            key={i}
            type="button"
            className={`rv-star-picker__btn ${isActive ? "is-active" : ""}`}
            onClick={() => onChange(starValue)}
            onMouseEnter={() => setHover(starValue)}
            onMouseLeave={() => setHover(0)}
            aria-label={t("reviews.starLabel", { n: starValue })}
          >
            <Icon n={isActive ? "star" : "star-outline"} size={28} />
          </button>
        );
      })}
    </span>
  );
}

function ReviewCard({ review }) {
  const { lang } = useLanguage();

  return (
    <div className="rv-card">
      <div className="rv-card__header">
        <div className="rv-card__avatar">
          {review.userPhoto ? (
            <img src={review.userPhoto} alt={review.userName} className="rv-card__avatar-img" />
          ) : (
            <span className="rv-card__avatar-initials">{getInitials(review.userName)}</span>
          )}
        </div>
        <div className="rv-card__meta">
          <span className="rv-card__name">{review.userName}</span>
          <span className="rv-card__date">
            {formatUiDateOnly(review.createdAt, lang, {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
        <Stars rating={review.rating} size={15} />
      </div>
      <p className="rv-card__comment">{review.comment}</p>
    </div>
  );
}

function ReviewForm({ listingId, user, onReviewAdded }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!user) {
    return (
      <div className="rv-form rv-form--guest">
        <p className="rv-form__guest-text">{t("reviews.guestText")}</p>
        <button className="btn btn--primary" onClick={() => navigate("/login")}>
          {t("reviews.loginBtn")}
        </button>
      </div>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!rating) {
      setError(t("reviews.selectRating"));
      return;
    }
    if (!comment.trim()) {
      setError(t("reviews.writeComment"));
      return;
    }

    setSubmitting(true);
    try {
      const newReview = await addReview(listingId, { rating, comment });
      setRating(0);
      setComment("");
      setSuccess(t("reviews.thanks"));
      onReviewAdded(newReview);
      setTimeout(() => setSuccess(""), 4000);
    } catch (submitError) {
      setError(submitError.message || t("reviews.submitError"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="rv-form" onSubmit={handleSubmit}>
      <h4 className="rv-form__title">{t("reviews.formTitle")}</h4>

      <div className="rv-form__field">
        <label className="rv-form__label">{t("reviews.ratingLabel")}</label>
        <StarPicker value={rating} onChange={setRating} />
      </div>

      <div className="rv-form__field">
        <label className="rv-form__label" htmlFor="rv-comment">
          {t("reviews.commentLabel")}
        </label>
        <textarea
          id="rv-comment"
          className="rv-form__textarea"
          placeholder={t("reviews.commentPlaceholder")}
          rows={4}
          maxLength={1000}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
        />
        <span className="rv-form__char-count">{comment.length}/1000</span>
      </div>

      {error && <p className="rv-form__error">{error}</p>}
      {success && <p className="rv-form__success">{success}</p>}

      <button type="submit" className="btn btn--primary rv-form__submit" disabled={submitting}>
        {submitting ? t("reviews.submitting") : t("reviews.submit")}
      </button>
    </form>
  );
}

function RatingSummary({ reviews }) {
  const { t } = useLanguage();
  const avg = computeAverageRating(reviews);
  const total = reviews.length;

  const distribution = Array.from({ length: STAR_COUNT }, (_, i) => {
    const starLevel = STAR_COUNT - i;
    const count = reviews.filter((review) => Math.round(review.rating) === starLevel).length;
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return { starLevel, count, pct };
  });

  return (
    <div className="rv-summary">
      <div className="rv-summary__score">
        <span className="rv-summary__number">{avg > 0 ? avg.toFixed(1) : "-"}</span>
        <Stars rating={avg} size={20} />
        <span className="rv-summary__total">
          {total} {total === 1 ? t("reviews.reviewCountSingular") : t("reviews.reviewCount")}
        </span>
      </div>
      <div className="rv-summary__bars">
        {distribution.map(({ starLevel, count, pct }) => (
          <div key={starLevel} className="rv-summary__row">
            <span className="rv-summary__row-label">{starLevel}</span>
            <Icon n="star" size={13} className="rv-star--filled" />
            <div className="rv-summary__bar-track">
              <div className="rv-summary__bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="rv-summary__row-count">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReviewSection({ listingId, user }) {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!listingId) return undefined;
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getReviewsForListing(listingId);
        if (mounted) setReviews(data);
      } catch (loadError) {
        console.error("Failed to load reviews:", loadError);
        if (loadError?.code === "permission-denied") {
          if (mounted) setReviews([]);
        } else if (mounted) {
          setError(t("reviews.loadError"));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [listingId, t]);

  const handleReviewAdded = (newReview) => {
    setReviews((prev) => [newReview, ...prev]);
  };

  return (
    <section className="rv-section">
      <h3 className="rv-section__title">{t("reviews.sectionTitle")}</h3>

      {loading ? (
        <div className="rv-loading">
          <p>{t("reviews.loading")}</p>
        </div>
      ) : error ? (
        <div className="rv-error">
          <p>{error}</p>
        </div>
      ) : (
        <>
          {reviews.length > 0 && <RatingSummary reviews={reviews} />}

          <ReviewForm listingId={listingId} user={user} onReviewAdded={handleReviewAdded} />

          {reviews.length === 0 ? (
            <div className="rv-empty">
              <Icon n="star-outline" size={40} />
              <p>{t("reviews.empty")}</p>
            </div>
          ) : (
            <div className="rv-list">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
