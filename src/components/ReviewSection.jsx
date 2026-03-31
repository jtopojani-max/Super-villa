import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star } from "@phosphor-icons/react";
import { addReview, computeAverageRating, getReviewsForListing } from "../services/reviews.js";

/* ─── Small helpers ────────────────────────────────────────────────── */

const STAR_COUNT = 5;

const formatDate = (date) => {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString("sq-AL", { day: "numeric", month: "long", year: "numeric" });
};

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (name[0] || "?").toUpperCase();
};

/* ─── Star rating (read-only) ──────────────────────────────────────── */

function Stars({ rating = 0, size = 18 }) {
  return (
    <span className="rv-stars" aria-label={`${rating} nga 5 yje`}>
      {Array.from({ length: STAR_COUNT }, (_, i) => (
        <Star
          key={i}
          size={size}
          weight={i < Math.round(rating) ? "fill" : "regular"}
          className={i < Math.round(rating) ? "rv-star--filled" : "rv-star--empty"}
        />
      ))}
    </span>
  );
}

/* ─── Interactive star picker ──────────────────────────────────────── */

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);

  return (
    <span className="rv-star-picker" role="radiogroup" aria-label="Vlerësimi">
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
            aria-label={`${starValue} yje`}
          >
            <Star size={28} weight={isActive ? "fill" : "regular"} />
          </button>
        );
      })}
    </span>
  );
}

/* ─── Single review card ───────────────────────────────────────────── */

function ReviewCard({ review }) {
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
          <span className="rv-card__date">{formatDate(review.createdAt)}</span>
        </div>
        <Stars rating={review.rating} size={15} />
      </div>
      <p className="rv-card__comment">{review.comment}</p>
    </div>
  );
}

/* ─── Review form ──────────────────────────────────────────────────── */

function ReviewForm({ listingId, user, onReviewAdded }) {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!user) {
    return (
      <div className="rv-form rv-form--guest">
        <p className="rv-form__guest-text">Kyçu për të lënë një vlerësim për këtë pronë.</p>
        <button className="btn btn--primary" onClick={() => navigate("/login")}>
          Kyçu tani
        </button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!rating) {
      setError("Zgjidh një vlerësim me yje.");
      return;
    }
    if (!comment.trim()) {
      setError("Shkruaj një koment.");
      return;
    }

    setSubmitting(true);
    try {
      const newReview = await addReview(listingId, { rating, comment });
      setRating(0);
      setComment("");
      setSuccess("Faleminderit për vlerësimin tuaj!");
      onReviewAdded(newReview);
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.message || "Gabim gjatë dërgimit. Provo përsëri.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="rv-form" onSubmit={handleSubmit}>
      <h4 className="rv-form__title">Lër një Vlerësim</h4>

      <div className="rv-form__field">
        <label className="rv-form__label">Vlerësimi</label>
        <StarPicker value={rating} onChange={setRating} />
      </div>

      <div className="rv-form__field">
        <label className="rv-form__label" htmlFor="rv-comment">Komenti</label>
        <textarea
          id="rv-comment"
          className="rv-form__textarea"
          placeholder="Shkruaj përshtypjen tënde për këtë pronë..."
          rows={4}
          maxLength={1000}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <span className="rv-form__char-count">{comment.length}/1000</span>
      </div>

      {error && <p className="rv-form__error">{error}</p>}
      {success && <p className="rv-form__success">{success}</p>}

      <button
        type="submit"
        className="btn btn--primary rv-form__submit"
        disabled={submitting}
      >
        {submitting ? "Duke dërguar..." : "Dërgo Vlerësimin"}
      </button>
    </form>
  );
}

/* ─── Rating summary bar ───────────────────────────────────────────── */

function RatingSummary({ reviews }) {
  const avg = computeAverageRating(reviews);
  const total = reviews.length;

  const distribution = Array.from({ length: STAR_COUNT }, (_, i) => {
    const starLevel = STAR_COUNT - i;
    const count = reviews.filter((r) => Math.round(r.rating) === starLevel).length;
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return { starLevel, count, pct };
  });

  return (
    <div className="rv-summary">
      <div className="rv-summary__score">
        <span className="rv-summary__number">{avg > 0 ? avg.toFixed(1) : "—"}</span>
        <Stars rating={avg} size={20} />
        <span className="rv-summary__total">
          {total} {total === 1 ? "vlerësim" : "vlerësime"}
        </span>
      </div>
      <div className="rv-summary__bars">
        {distribution.map(({ starLevel, count, pct }) => (
          <div key={starLevel} className="rv-summary__row">
            <span className="rv-summary__row-label">{starLevel}</span>
            <Star size={13} weight="fill" className="rv-star--filled" />
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

/* ─── Main exported section ────────────────────────────────────────── */

export default function ReviewSection({ listingId, user }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!listingId) return;
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getReviewsForListing(listingId);
        if (mounted) setReviews(data);
      } catch (err) {
        console.error("Failed to load reviews:", err);
        // If permission-denied (rules not deployed yet), show empty state gracefully
        if (err?.code === "permission-denied") {
          if (mounted) setReviews([]);
        } else {
          if (mounted) setError("Nuk u arrit të ngarkohen vlerësimet.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [listingId]);

  const handleReviewAdded = (newReview) => {
    setReviews((prev) => [newReview, ...prev]);
  };

  return (
    <section className="rv-section">
      <h3 className="rv-section__title">Vlerësimet e Mysafirëve</h3>

      {loading ? (
        <div className="rv-loading">
          <p>Duke ngarkuar vlerësimet...</p>
        </div>
      ) : error ? (
        <div className="rv-error">
          <p>{error}</p>
        </div>
      ) : (
        <>
          {reviews.length > 0 && <RatingSummary reviews={reviews} />}

          <ReviewForm
            listingId={listingId}
            user={user}
            onReviewAdded={handleReviewAdded}
          />

          {reviews.length === 0 ? (
            <div className="rv-empty">
              <Star size={40} weight="thin" />
              <p>Ende nuk ka vlerësime. Bëhu i pari që lë një vlerësim!</p>
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
