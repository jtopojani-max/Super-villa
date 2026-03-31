import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bank,
  Buildings,
  Check,
  CheckCircle,
  ClipboardText,
  CloudArrowUp,
  CurrencyBtc,
  Headset,
  Lightning,
  ShieldCheck,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import { buildPaymentReference, isPaymentConfigComplete, PAYMENT_CONFIG } from "../config/pricing.js";
import {
  PAYMENT_PROOF_INPUT_ACCEPT,
  PAYMENT_PROOF_MAX_BYTES,
  submitPaymentProof,
} from "../services/payments.js";
import { listMyPosts } from "../services/posts.js";

const COPY = {
  eyebrow: "Paketa",
  title: "Zgjidh paketen e duhur per pronen ose biznesin tuaj",
  subtitle:
    "Tre paketa te qarta per me shume dukshmeri, renditje me te forte dhe aktivizim pas verifikimit nga admini.",
  noticeTitle: "Aktivizim i shpejte dhe pagese e sigurt",
  activationNote:
    "Aktivizimi i paketes behet vetem pasi admini te verifikoje pagesen me transfer bankar ose crypto.",
  noticePoints: ["Transfer bankar", "Crypto", "Support profesional"],
  trust: [
    { icon: Lightning, title: "Aktivizim i shpejte", description: "Kerkesa kalon menjehere ne verifikim sapo te dergohet prova e pageses." },
    { icon: ShieldCheck, title: "Pagese e sigurt", description: "Pranojme vetem transfer bankar dhe crypto me reference te qarte." },
    { icon: Headset, title: "Support profesional", description: "Ekipi yne ju ndihmon gjate aktivizimit dhe prezantimit te prones." },
    { icon: Buildings, title: "Per individe dhe biznese", description: "Nga nje shpallje falas deri te profil biznesi me menaxhim profesional." },
  ],
  faqEyebrow: "FAQ",
  faqTitle: "Pyetje te shpeshta",
  faqItems: [
    { question: "Kur aktivizohet paketa me pagese?", answer: "Paketa aktivizohet vetem pasi pagesa te verifikohet dhe te aprovohet nga administratori." },
    { question: "Cilat metoda pagese pranohen?", answer: "Pranojme vetem transfer bankar dhe crypto. Nuk perdorim karte, PayPal, Stripe, Apple Pay apo Google Pay." },
    { question: "Si funksionon Premium per listimet?", answer: "Per Premium zgjidhni listimin ne forme. Kerkesa ruhet si pending dhe listimi behet premium vetem pas aprovimit." },
  ],
  plans: [
    {
      id: "basic",
      name: "Basic Falas",
      badge: "Per Fillim",
      price: "0EUR",
      cycle: "pa pagese",
      description: "Per publikim te shpejte dhe hyrje ne platforme pa kosto.",
      cta: "Posto Falas",
      features: ["1 shpallje standard", "Deri ne 10 foto", "Publikim normal", "Renditje standarde ne kerkim", "Editim i shpalljes", "Kontakt bazik me te interesuarit"],
    },
    {
      id: "premium",
      name: "Premium",
      badge: "Me e Preferuara",
      price: "15EUR",
      cycle: "/ 30 dite",
      description: "Per pronare qe duan me shume dukshmeri dhe renditje me te forte.",
      cta: "Zgjidh Premium",
      features: ["1 shpallje premium dhe 2 shpallje standard", "30 foto", "Prioritet i larte ne kerkim dhe kategori", 'Badge "Top" ose "Premium"', "Rifreskim automatik i shpalljes", "Kontakt i theksuar me buton WhatsApp", "Statistika bazike dhe aprovim me i shpejte"],
    },
    {
      id: "business-pro",
      name: "Business Pro",
      badge: "Per Biznese",
      price: "90EUR",
      cycle: "/ 3 muaj",
      description: "Per agjenci dhe kompani qe duan profil serioz dhe volum listimesh.",
      cta: "Aktivizo Business Pro",
      features: ["Deri ne 20 shpallje aktive", "Profil biznesi me emer, logo dhe badge profesional", "Prioritet i larte ne renditje dhe dukshmeri me e forte", "Statistika te detajuara dhe kontakt i theksuar per lead-et", "Support prioritar", "Menaxhim me profesional i listimeve", "1 set foto profesionale nga stafi yne", "Ndihme per pergatitjen vizuale dhe perzgjedhjen e fotove"],
    },
  ],
  modal: {
    title: "Aktivizo paketen",
    subtitle: "Zgjidh metoden e pageses, kopjo detajet dhe dergo proven per verifikim manual nga admini.",
    packageLabel: "Paketa",
    priceLabel: "Cmimi",
    bankMethod: "Transfer bankar",
    cryptoMethod: "Crypto",
    bankCardTitle: "Detajet per transfer bankar",
    cryptoCardTitle: "Detajet per pagese me crypto",
    beneficiary: "Emri i perfituesit",
    iban: "IBAN",
    bankName: "Emri i bankes",
    reference: "Referenca e pageses",
    wallet: "Wallet address",
    network: "Network",
    currency: "Currency / Coin",
    copy: "Kopjo",
    copyAll: "Kopjo te dhenat",
    copied: "U kopjua",
    configureWarning: "Vendos te dhenat reale te pageses ne konfigurim perpara publikimit ne production.",
    verificationNotice: "Aktivizimi nuk behet automatikisht. Perdorni referencen e sakte dhe prisni verifikimin nga administratori.",
    formTitle: "Dergo proven e pageses",
    formSubtitle: "Plotesoni te dhenat dhe ngarkoni deshmine e pageses. Kerkesa do te ruhet me status ne pritje.",
    customerName: "Emri i klientit / kompanise",
    customerNamePlaceholder: "P.sh. Ardi Shala ose emri i kompanise",
    email: "Email",
    emailPlaceholder: "email@kompania.com",
    phone: "Telefon",
    phonePlaceholder: "+383 49 000 000",
    listing: "Listimi per Premium",
    listingPlaceholder: "Zgjidh listimin",
    businessName: "Emri i biznesit",
    businessNamePlaceholder: "P.sh. emri i agjencise ose kompanise",
    transactionId: "Transaction ID / reference shtese",
    transactionIdPlaceholder: "Opsionale, nese e keni nga banka ose wallet-i",
    premiumListingHint: "Premium aktivizohet per nje listim konkret pasi admini ta aprovoje kerkesen.",
    businessHint: "Business Pro aktivizohet ne nivel profili pasi admini te verifikoje pagesen.",
    noListings: "Per Premium ju duhet te keni te pakten nje listim te krijuar. Krijoni fillimisht nje shpallje dhe me pas dergoni kerkesen.",
    proof: "Deshmia e pageses",
    proofHint: "Pranohet JPG, PNG, WEBP ose PDF deri ne 8 MB.",
    notes: "Shenime shtese",
    notesPlaceholder: "P.sh. emri i prones, numri i shpalljes ose ndonje shenim per ekipin tone.",
    submit: "Dergo proven e pageses",
    submitting: "Duke derguar...",
    close: "Mbyll",
    selectFile: "Ngarko deshmine",
    replaceFile: "Ndrysho skedarin",
    removeFile: "Hiq skedarin",
    qrCaption: "QR preview per wallet-in",
    qrMeta: "Verifikoni sakte adresen dhe network-un perpara dergeses.",
    successTitle: "Kerkesa u dergua me sukses",
    successMessage: "Kerkesa juaj per aktivizim u dergua me sukses. Aktivizimi do te behet pasi admini te verifikoje pagesen.",
    successReference: "Referenca juaj",
    validation: {
      customerName: "Shkruani emrin e klientit ose kompanise.",
      email: "Shkruani nje email valid.",
      phone: "Shkruani nje numer telefoni valid.",
      listingId: "Zgjidhni listimin qe duhet te kaloje ne Premium.",
      businessName: "Shkruani emrin e biznesit ose kompanise.",
      proof: "Ngarkoni deshmine e pageses.",
      proofType: "Formati i skedarit duhet te jete JPG, PNG, WEBP ose PDF.",
      proofSize: "Skedari eshte me i madh se 8 MB. Ju lutem ngarkoni nje version me te lehte.",
    },
    submitError: "Nuk u arrit te dergohet prova e pageses. Ju lutem provoni perseri pas pak.",
  },
};

const formatBytes = (value) => {
  if (!Number.isFinite(value) || value <= 0) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  const nextValue = value / 1024 ** exponent;
  return `${nextValue >= 10 ? Math.round(nextValue) : nextValue.toFixed(1)} ${units[exponent]}`;
};

const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value);
const isValidPhone = (value) => /^[0-9+\s()/-]{6,20}$/.test(String(value || "").trim());

const getFocusableElements = (node) =>
  node
    ? Array.from(
        node.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      )
    : [];

function PaymentDetailRow({ label, value, onCopy, isCopied }) {
  return (
    <div className="pricing-payment-card__row">
      <div className="pricing-payment-card__meta">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <button type="button" className="pricing-copy-btn" onClick={onCopy}>
        <ClipboardText aria-hidden="true" />
        {isCopied ? COPY.modal.copied : COPY.modal.copy}
      </button>
    </div>
  );
}

function QrPreview() {
  return (
    <div className="pricing-qr" aria-hidden="true">
      <div className="pricing-qr__frame">
        {Array.from({ length: 49 }).map((_, index) => (
          <span
            key={index}
            className={`pricing-qr__cell ${
              [0, 1, 2, 5, 7, 8, 10, 12, 14, 18, 19, 22, 24, 27, 28, 30, 33, 36, 38, 40, 41, 44, 46, 47, 48].includes(index)
                ? "is-filled"
                : ""
            }`}
          />
        ))}
      </div>
      <strong>{COPY.modal.qrCaption}</strong>
      <span>{COPY.modal.qrMeta}</span>
    </div>
  );
}

export default function PricingSection({ user, sectionId = "pricing" }) {
  const navigate = useNavigate();
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const paidPlans = useMemo(() => COPY.plans.filter((plan) => plan.id !== "basic"), []);
  const paymentConfigReady = isPaymentConfigComplete();
  const [isOpen, setIsOpen] = useState(false);
  const [copiedField, setCopiedField] = useState("");
  const [submitState, setSubmitState] = useState({ status: "idle", message: "", reference: "" });
  const [errors, setErrors] = useState({});
  const [loadingListings, setLoadingListings] = useState(false);
  const [myListings, setMyListings] = useState([]);
  const [paymentReference, setPaymentReference] = useState(() => buildPaymentReference("premium"));
  const [formData, setFormData] = useState({
    customerName: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    planId: "premium",
    paymentMethod: "bank",
    listingId: "",
    businessName: "",
    transactionId: "",
    notes: "",
    proofFile: null,
  });

  const selectableListings = useMemo(
    () => myListings.filter((listing) => listing && listing.status !== "rejected"),
    [myListings]
  );
  const selectedPlan = COPY.plans.find((plan) => plan.id === formData.planId) || paidPlans[0];

  useEffect(() => {
    setFormData((current) => ({
      ...current,
      customerName: current.customerName || user?.name || "",
      email: current.email || user?.email || "",
      phone: current.phone || user?.phone || "",
      businessName: current.businessName || user?.name || "",
    }));
  }, [user?.email, user?.name, user?.phone]);

  useEffect(() => {
    if (!isOpen || !user?.id) return undefined;
    let isMounted = true;
    setLoadingListings(true);

    listMyPosts(user.id)
      .then((items) => {
        if (isMounted) setMyListings(Array.isArray(items) ? items : []);
      })
      .catch((error) => {
        console.error("Failed to load user listings for pricing:", error);
        if (isMounted) setMyListings([]);
      })
      .finally(() => {
        if (isMounted) setLoadingListings(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, user?.id]);

  useEffect(() => {
    if (formData.planId !== "premium") return;
    if (formData.listingId || !selectableListings.length) return;
    setFormData((current) => ({ ...current, listingId: selectableListings[0].id }));
  }, [formData.listingId, formData.planId, selectableListings]);

  useEffect(() => {
    if (!copiedField) return undefined;
    const timer = window.setTimeout(() => setCopiedField(""), 1800);
    return () => window.clearTimeout(timer);
  }, [copiedField]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = getFocusableElements(dialogRef.current);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const updateField = (field, value) => {
    setFormData((current) => {
      const next = { ...current, [field]: value };
      if (field === "planId") {
        next.listingId = value === "premium" ? current.listingId : "";
        next.businessName = value === "business-pro" ? current.businessName || user?.name || "" : "";
      }
      return next;
    });
    if (field === "planId") setPaymentReference(buildPaymentReference(value));
    setErrors((current) => ({ ...current, [field]: "" }));
    if (submitState.status !== "idle") setSubmitState({ status: "idle", message: "", reference: "" });
  };

  const handleOpenPaidPlan = (planId) => {
    if (!user?.id) {
      navigate("/register");
      return;
    }
    setPaymentReference(buildPaymentReference(planId));
    setFormData((current) => ({
      ...current,
      planId,
      paymentMethod: "bank",
      listingId: planId === "premium" ? current.listingId : "",
      businessName: planId === "business-pro" ? current.businessName || user?.name || "" : "",
      transactionId: "",
      notes: "",
      proofFile: null,
    }));
    setErrors({});
    setSubmitState({ status: "idle", message: "", reference: "" });
    setIsOpen(true);
  };

  const handleCopy = async (fieldKey, value) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = value;
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopiedField(fieldKey);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!formData.customerName.trim()) nextErrors.customerName = COPY.modal.validation.customerName;
    if (!isValidEmail(formData.email)) nextErrors.email = COPY.modal.validation.email;
    if (!isValidPhone(formData.phone)) nextErrors.phone = COPY.modal.validation.phone;
    if (formData.planId === "premium" && !formData.listingId) nextErrors.listingId = COPY.modal.validation.listingId;
    if (formData.planId === "business-pro" && !formData.businessName.trim()) nextErrors.businessName = COPY.modal.validation.businessName;
    if (!(formData.proofFile instanceof File)) {
      nextErrors.proofFile = COPY.modal.validation.proof;
    } else if (!["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(formData.proofFile.type)) {
      nextErrors.proofFile = COPY.modal.validation.proofType;
    } else if (formData.proofFile.size > PAYMENT_PROOF_MAX_BYTES) {
      nextErrors.proofFile = COPY.modal.validation.proofSize;
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    setSubmitState({ status: "submitting", message: "", reference: "" });

    try {
      const result = await submitPaymentProof({
        customerName: formData.customerName,
        email: formData.email,
        phone: formData.phone,
        planId: formData.planId,
        paymentMethod: formData.paymentMethod,
        listingId: formData.planId === "premium" ? formData.listingId : "",
        businessName: formData.planId === "business-pro" ? formData.businessName : "",
        transactionId: formData.transactionId,
        notes: formData.notes,
        paymentReference,
        proofFile: formData.proofFile,
      });

      setSubmitState({ status: "success", message: "", reference: result.paymentReference });
    } catch (error) {
      console.error("Payment proof submission failed:", error);
      setSubmitState({
        status: "error",
        message:
          error?.message === "auth-required"
            ? "Duhet te jeni te kycur per te derguar kerkesen."
            : error?.message === "invalid-proof-type"
            ? COPY.modal.validation.proofType
            : error?.message === "proof-file-too-large"
            ? COPY.modal.validation.proofSize
            : error?.message === "missing-proof-file"
            ? COPY.modal.validation.proof
            : COPY.modal.submitError,
        reference: "",
      });
    }
  };

  const bankLines = [
    `${COPY.modal.beneficiary}: ${PAYMENT_CONFIG.bank.beneficiaryName}`,
    `${COPY.modal.iban}: ${PAYMENT_CONFIG.bank.iban}`,
    `${COPY.modal.bankName}: ${PAYMENT_CONFIG.bank.bankName}`,
    `${COPY.modal.reference}: ${paymentReference}`,
  ].join("\n");

  const cryptoLines = [
    `${COPY.modal.wallet}: ${PAYMENT_CONFIG.crypto.walletAddress}`,
    `${COPY.modal.network}: ${PAYMENT_CONFIG.crypto.network}`,
    `${COPY.modal.currency}: ${PAYMENT_CONFIG.crypto.currency}`,
  ].join("\n");

  return (
    <>
      <section className="pricing-section" id={sectionId} aria-labelledby="pricing-title">
        <div className="container">
          <div className="pricing-section__intro">
            <div className="pricing-section__head">
              <div className="pricing-section__copy">
                <p className="section-tag">{COPY.eyebrow}</p>
                <h2 id="pricing-title" className="section-title">{COPY.title}</h2>
                <p className="pricing-section__subtitle">{COPY.subtitle}</p>
              </div>
            </div>

            <div className="pricing-section__trust-grid">
              {COPY.trust.map((item) => {
                const TrustIcon = item.icon;
                return (
                  <div key={item.title} className="pricing-trust-card">
                    <span className="pricing-trust-card__icon">
                      <TrustIcon aria-hidden="true" />
                    </span>
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pricing-section__plans">
            <div className="pricing-section__shell">
              <div className="pricing-cards">
                {COPY.plans.map((plan) => {
                  const isFeatured = plan.id === "premium";
                  const isBusiness = plan.id === "business-pro";
                  const ctaVariant = isFeatured
                    ? "btn--primary"
                    : isBusiness
                    ? "pricing-card__cta--dark"
                    : "pricing-card__cta--secondary";

                  return (
                    <article
                      key={plan.id}
                      className={`pricing-card ${isFeatured ? "pricing-card--featured" : ""} ${
                        isBusiness ? "pricing-card--business" : ""
                      }`}
                    >
                      <div className="pricing-card__header">
                        <span className="pricing-card__badge">{plan.badge}</span>
                        <h3>{plan.name}</h3>
                        <div className="pricing-card__price">
                          <strong>{plan.price}</strong>
                          <span>{plan.cycle}</span>
                        </div>
                        <p>{plan.description}</p>
                      </div>

                      <ul className="pricing-card__features">
                        {plan.features.map((feature) => (
                          <li key={feature}>
                            <Check aria-hidden="true" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="pricing-card__footer">
                        <button
                          type="button"
                          className={`btn ${ctaVariant} pricing-card__cta`}
                          onClick={() =>
                            plan.id === "basic" ? navigate(user ? "/create" : "/register") : handleOpenPaidPlan(plan.id)
                          }
                        >
                          {plan.cta}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="pricing-section__bottom">
                <div className="pricing-section__notice">
                  <ShieldCheck aria-hidden="true" />
                  <div className="pricing-section__notice-copy">
                    <strong>{COPY.noticeTitle}</strong>
                    <p>{COPY.activationNote}</p>
                    <div className="pricing-section__notice-points">
                      {COPY.noticePoints.map((point) => (
                        <span key={point} className="pricing-section__notice-point">
                          {point}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pricing-faq">
                <div className="pricing-faq__intro">
                  <p className="section-tag">{COPY.faqEyebrow}</p>
                  <h3>{COPY.faqTitle}</h3>
                </div>
                <div className="pricing-faq__list">
                  {COPY.faqItems.map((item) => (
                    <details key={item.question} className="pricing-faq__item">
                      <summary>{item.question}</summary>
                      <p>{item.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {isOpen && (
        <div
          className="pricing-modal"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <div ref={dialogRef} className="pricing-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="pricing-modal-title">
            <div className="pricing-modal__header">
              <div>
                <span className="pricing-modal__eyebrow">{selectedPlan.badge}</span>
                <h3 id="pricing-modal-title">{COPY.modal.title}</h3>
                <p>{COPY.modal.subtitle}</p>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                className="pricing-modal__close"
                aria-label={COPY.modal.close}
                onClick={() => setIsOpen(false)}
              >
                <X aria-hidden="true" />
              </button>
            </div>

            <div className="pricing-modal__summary">
              <div>
                <span>{COPY.modal.packageLabel}</span>
                <strong>{selectedPlan.name}</strong>
              </div>
              <div>
                <span>{COPY.modal.priceLabel}</span>
                <strong>{selectedPlan.price} <em>{selectedPlan.cycle}</em></strong>
              </div>
              <div>
                <span>{COPY.modal.reference}</span>
                <strong>{paymentReference}</strong>
              </div>
            </div>

            {!paymentConfigReady && (
              <div className="pricing-modal__alert pricing-modal__alert--warning" role="status">
                <WarningCircle aria-hidden="true" />
                <span>{COPY.modal.configureWarning}</span>
              </div>
            )}

            <div className="pricing-modal__body">
              <section className="pricing-modal__payments" aria-label="Payment methods">
                <div className="pricing-methods">
                  <button
                    type="button"
                    className={`pricing-methods__button ${formData.paymentMethod === "bank" ? "is-active" : ""}`}
                    onClick={() => updateField("paymentMethod", "bank")}
                  >
                    <Bank aria-hidden="true" />
                    {COPY.modal.bankMethod}
                  </button>
                  <button
                    type="button"
                    className={`pricing-methods__button ${formData.paymentMethod === "crypto" ? "is-active" : ""}`}
                    onClick={() => updateField("paymentMethod", "crypto")}
                  >
                    <CurrencyBtc aria-hidden="true" />
                    {COPY.modal.cryptoMethod}
                  </button>
                </div>

                <div className="pricing-payment-card">
                  {formData.paymentMethod === "bank" ? (
                    <>
                      <div className="pricing-payment-card__header">
                        <div>
                          <h4>{COPY.modal.bankCardTitle}</h4>
                          <p>{COPY.modal.verificationNotice}</p>
                        </div>
                        <button type="button" className="pricing-copy-btn pricing-copy-btn--soft" onClick={() => handleCopy("bank-details", bankLines)}>
                          <ClipboardText aria-hidden="true" />
                          {copiedField === "bank-details" ? COPY.modal.copied : COPY.modal.copyAll}
                        </button>
                      </div>

                      <PaymentDetailRow
                        label={COPY.modal.beneficiary}
                        value={PAYMENT_CONFIG.bank.beneficiaryName}
                        onCopy={() => handleCopy("bank-beneficiary", PAYMENT_CONFIG.bank.beneficiaryName)}
                        isCopied={copiedField === "bank-beneficiary"}
                      />
                      <PaymentDetailRow
                        label={COPY.modal.iban}
                        value={PAYMENT_CONFIG.bank.iban}
                        onCopy={() => handleCopy("bank-iban", PAYMENT_CONFIG.bank.iban)}
                        isCopied={copiedField === "bank-iban"}
                      />
                      <PaymentDetailRow
                        label={COPY.modal.bankName}
                        value={PAYMENT_CONFIG.bank.bankName}
                        onCopy={() => handleCopy("bank-name", PAYMENT_CONFIG.bank.bankName)}
                        isCopied={copiedField === "bank-name"}
                      />
                      <PaymentDetailRow
                        label={COPY.modal.reference}
                        value={paymentReference}
                        onCopy={() => handleCopy("bank-reference", paymentReference)}
                        isCopied={copiedField === "bank-reference"}
                      />
                    </>
                  ) : (
                    <>
                      <div className="pricing-payment-card__header">
                        <div>
                          <h4>{COPY.modal.cryptoCardTitle}</h4>
                          <p>{COPY.modal.verificationNotice}</p>
                        </div>
                        <button type="button" className="pricing-copy-btn pricing-copy-btn--soft" onClick={() => handleCopy("crypto-details", cryptoLines)}>
                          <ClipboardText aria-hidden="true" />
                          {copiedField === "crypto-details" ? COPY.modal.copied : COPY.modal.copyAll}
                        </button>
                      </div>

                      <div className="pricing-payment-card__split">
                        <div className="pricing-payment-card__stack">
                          <PaymentDetailRow
                            label={COPY.modal.wallet}
                            value={PAYMENT_CONFIG.crypto.walletAddress}
                            onCopy={() => handleCopy("crypto-wallet", PAYMENT_CONFIG.crypto.walletAddress)}
                            isCopied={copiedField === "crypto-wallet"}
                          />
                          <PaymentDetailRow
                            label={COPY.modal.network}
                            value={PAYMENT_CONFIG.crypto.network}
                            onCopy={() => handleCopy("crypto-network", PAYMENT_CONFIG.crypto.network)}
                            isCopied={copiedField === "crypto-network"}
                          />
                          <PaymentDetailRow
                            label={COPY.modal.currency}
                            value={PAYMENT_CONFIG.crypto.currency}
                            onCopy={() => handleCopy("crypto-currency", PAYMENT_CONFIG.crypto.currency)}
                            isCopied={copiedField === "crypto-currency"}
                          />
                        </div>

                        <QrPreview />
                      </div>
                    </>
                  )}
                </div>
              </section>

              <section className="pricing-modal__form-shell" aria-label={COPY.modal.formTitle}>
                <div className="pricing-modal__form-intro">
                  <h4>{COPY.modal.formTitle}</h4>
                  <p>{COPY.modal.formSubtitle}</p>
                </div>

                {submitState.status === "success" ? (
                  <div className="pricing-modal__success" role="status" aria-live="polite">
                    <CheckCircle aria-hidden="true" />
                    <div>
                      <h5>{COPY.modal.successTitle}</h5>
                      <p>{COPY.modal.successMessage}</p>
                      <strong>{COPY.modal.successReference}: {submitState.reference}</strong>
                    </div>
                  </div>
                ) : (
                  <form className="pricing-form" onSubmit={handleSubmit}>
                    <label className="form-group pricing-form__field">
                      <span>{COPY.modal.customerName}</span>
                      <input
                        type="text"
                        value={formData.customerName}
                        onChange={(event) => updateField("customerName", event.target.value)}
                        placeholder={COPY.modal.customerNamePlaceholder}
                        aria-invalid={Boolean(errors.customerName)}
                      />
                      {errors.customerName && <small className="pricing-form__error">{errors.customerName}</small>}
                    </label>

                    <div className="pricing-form__grid">
                      <label className="form-group pricing-form__field">
                        <span>{COPY.modal.email}</span>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(event) => updateField("email", event.target.value)}
                          placeholder={COPY.modal.emailPlaceholder}
                          aria-invalid={Boolean(errors.email)}
                        />
                        {errors.email && <small className="pricing-form__error">{errors.email}</small>}
                      </label>

                      <label className="form-group pricing-form__field">
                        <span>{COPY.modal.phone}</span>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(event) => updateField("phone", event.target.value)}
                          placeholder={COPY.modal.phonePlaceholder}
                          aria-invalid={Boolean(errors.phone)}
                        />
                        {errors.phone && <small className="pricing-form__error">{errors.phone}</small>}
                      </label>
                    </div>

                    <label className="form-group pricing-form__field">
                      <span>{COPY.modal.packageLabel}</span>
                      <select value={formData.planId} onChange={(event) => updateField("planId", event.target.value)}>
                        {paidPlans.map((plan) => (
                          <option key={plan.id} value={plan.id}>{plan.name}</option>
                        ))}
                      </select>
                    </label>

                    {formData.planId === "premium" ? (
                      <>
                        <label className="form-group pricing-form__field">
                          <span>{COPY.modal.listing}</span>
                          <select
                            value={formData.listingId}
                            onChange={(event) => updateField("listingId", event.target.value)}
                            disabled={loadingListings || selectableListings.length === 0}
                            aria-invalid={Boolean(errors.listingId)}
                          >
                            <option value="">{loadingListings ? "Duke ngarkuar..." : COPY.modal.listingPlaceholder}</option>
                            {selectableListings.map((listing) => (
                              <option key={listing.id} value={listing.id}>
                                {`#${listing.idNumber || listing.id.slice(0, 6)} - ${listing.title}`}
                              </option>
                            ))}
                          </select>
                          <small className="pricing-form__hint">{COPY.modal.premiumListingHint}</small>
                          {errors.listingId && <small className="pricing-form__error">{errors.listingId}</small>}
                        </label>

                        {!loadingListings && selectableListings.length === 0 && (
                          <div className="pricing-modal__alert pricing-modal__alert--warning" role="status">
                            <WarningCircle aria-hidden="true" />
                            <span>{COPY.modal.noListings}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <label className="form-group pricing-form__field">
                        <span>{COPY.modal.businessName}</span>
                        <input
                          type="text"
                          value={formData.businessName}
                          onChange={(event) => updateField("businessName", event.target.value)}
                          placeholder={COPY.modal.businessNamePlaceholder}
                          aria-invalid={Boolean(errors.businessName)}
                        />
                        <small className="pricing-form__hint">{COPY.modal.businessHint}</small>
                        {errors.businessName && <small className="pricing-form__error">{errors.businessName}</small>}
                      </label>
                    )}

                    <label className="form-group pricing-form__field">
                      <span>{COPY.modal.transactionId}</span>
                      <input
                        type="text"
                        value={formData.transactionId}
                        onChange={(event) => updateField("transactionId", event.target.value)}
                        placeholder={COPY.modal.transactionIdPlaceholder}
                      />
                    </label>

                    <div className="pricing-form__field pricing-form__field--upload">
                      <span>{COPY.modal.proof}</span>
                      <label className={`pricing-upload ${errors.proofFile ? "has-error" : ""}`}>
                        <input
                          type="file"
                          accept={PAYMENT_PROOF_INPUT_ACCEPT}
                          onChange={(event) => updateField("proofFile", event.target.files?.[0] || null)}
                        />
                        <div className="pricing-upload__content">
                          <CloudArrowUp aria-hidden="true" />
                          <strong>{formData.proofFile ? COPY.modal.replaceFile : COPY.modal.selectFile}</strong>
                          <span>{COPY.modal.proofHint}</span>
                        </div>
                      </label>
                      {formData.proofFile && (
                        <div className="pricing-upload__file">
                          <div>
                            <strong>{formData.proofFile.name}</strong>
                            <span>{formatBytes(formData.proofFile.size)}</span>
                          </div>
                          <button type="button" className="pricing-copy-btn pricing-copy-btn--soft" onClick={() => updateField("proofFile", null)}>
                            {COPY.modal.removeFile}
                          </button>
                        </div>
                      )}
                      {errors.proofFile && <small className="pricing-form__error">{errors.proofFile}</small>}
                    </div>

                    <label className="form-group pricing-form__field">
                      <span>{COPY.modal.notes}</span>
                      <textarea
                        rows={4}
                        value={formData.notes}
                        onChange={(event) => updateField("notes", event.target.value)}
                        placeholder={COPY.modal.notesPlaceholder}
                      />
                    </label>

                    {submitState.status === "error" && (
                      <div className="pricing-modal__alert pricing-modal__alert--error" role="alert">
                        <WarningCircle aria-hidden="true" />
                        <span>{submitState.message}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="submit-btn pricing-form__submit"
                      disabled={
                        submitState.status === "submitting"
                        || (formData.planId === "premium" && !loadingListings && selectableListings.length === 0)
                      }
                    >
                      {submitState.status === "submitting" ? COPY.modal.submitting : COPY.modal.submit}
                    </button>
                  </form>
                )}
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
