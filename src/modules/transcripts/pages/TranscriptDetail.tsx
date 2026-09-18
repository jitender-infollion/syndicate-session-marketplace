import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchTranscriptById } from "../transcriptsService";
import type { Transcript } from "../types";
import { useCart } from "../../cart/hooks/useCart";
import { usePurchasedTranscriptIds } from "../../orders/hooks/usePurchasedTranscriptIds";
import { useBuyNow } from "../../checkout/hooks/useBuyNow";
import { useTranscriptPdf } from "../hooks/useTranscriptPdf";
import { APP_ROUTES } from "../../../constants/appRoutes";
import Header from "../../../components/header/Header";
import Footer from "../../../components/footer/Footer";
import Button from "../../../components/button/Button";
import DetailHeader from "../components/detail/DetailHeader";
import PreviewSection from "../components/detail/PreviewSection";
import PurchaseCard from "../components/detail/PurchaseCard";
import ExpertCard from "../components/detail/ExpertCard";
import RelatedTranscripts from "../components/detail/RelatedTranscripts";
import TranscriptDetailSkeleton from "../components/detail/TranscriptDetailSkeleton";
import { TRANSCRIPT_ID_PATTERN } from "../constants";

export default function TranscriptDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { items: cartItems, addToCart, removeFromCart } = useCart();
  const buyNow = useBuyNow();
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [notFound, setNotFound] = useState(false);
  const { purchasedIds } = usePurchasedTranscriptIds();
  const isPurchased = !!id && purchasedIds.includes(id);
  const { url: pdfUrl, status: pdfStatus } = useTranscriptPdf(id, isPurchased);

  useEffect(() => {
    setTranscript(null);
    setNotFound(false);

    if (!id) return;

    // A made-up route like /transcripts/checkout isn't a real id; treat it as not-found.
    if (!TRANSCRIPT_ID_PATTERN.test(id)) {
      navigate(APP_ROUTES.home, { replace: true });
      return;
    }

    fetchTranscriptById(id)
      .then(setTranscript)
      .catch(() => setNotFound(true));
  }, [id, navigate]);

  if (notFound) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex-1">
          <div className="mx-auto flex max-w-[1400px] flex-col items-center px-6 py-24 text-center">
            <p className="text-6xl font-extrabold text-accent-2">404</p>
            <h1 className="mt-4 text-2xl font-bold text-text-primary">
              Transcript Not Found
            </h1>
            <p className="mt-2 max-w-md text-text-secondary">
              The transcript you're looking for isn't available or may have
              been removed.
            </p>
            <div className="mt-6 flex gap-3">
              <Button
                variant="outlined"
                label="Go to Homepage"
                onClick={() => navigate(APP_ROUTES.home)}
              />
              <Button
                variant="contained"
                label="Search Transcripts"
                onClick={() => navigate(APP_ROUTES.transcripts)}
              />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!transcript) {
    return <TranscriptDetailSkeleton />;
  }

  const handleBuyNow = () => buyNow(transcript);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex flex-col pt-[var(--header-height)]">
        <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-12 lg:px-20 py-8 flex-1 min-h-[calc(100vh-var(--header-height))]">
          <DetailHeader transcript={transcript} />

          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <PreviewSection
                preview={transcript.preview}
                date={transcript.date}
                geography={transcript.geography}
                keyInsights={transcript.keyInsights}
                onBuyClick={handleBuyNow}
                isPurchased={isPurchased}
                pdfUrl={pdfUrl}
                pdfStatus={pdfStatus}
                transcript={transcript}
              />
              <div className="mt-6 lg:hidden">
                <ExpertCard expert={transcript.expert} />
              </div>
              <RelatedTranscripts
                excludeId={transcript.id}
                purchasedIds={purchasedIds}
              />
            </div>

            <div className="flex flex-col gap-6 self-start lg:sticky lg:top-6 lg:col-span-4">
              {!isPurchased && (
                <PurchaseCard
                  price={transcript.price}
                  isInCart={cartItems.some((item) => item.id === transcript.id)}
                  onAddToCart={() => addToCart(transcript)}
                  onRemoveFromCart={() => removeFromCart(transcript.id)}
                  onBuyNow={handleBuyNow}
                />
              )}
              <div className="hidden lg:block">
                <ExpertCard expert={transcript.expert} />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  );
}
