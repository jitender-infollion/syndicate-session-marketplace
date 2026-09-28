import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/button/Button";
import SearchBar from "../../components/searchbar/SearchBar";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import FeatureCard from "./components/feature-card/FeatureCard";
import ForExperts from "./components/for-experts/ForExperts";
import FaqSection from "./components/faq/FaqSection";
import RequestTopicDialog from "../transcripts/components/request-topic-dialog";
import WarningDialog from "../../components/form-close-warning/WarningDialog";
import { useFormCloseWarning } from "../../utils/hooks/useFormCloseWarning";
import { APP_ROUTES } from "../../constants/appRoutes";
import { FEATURE_CARDS } from "./constants/homeConstants";
import { heroButtonStyle } from "./Home.styles";
import styles from "./styles.home.module.css";

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const requestTopicDialog = useFormCloseWarning();

  const handleSearch = (text: string) => {
    if (!text.trim()) return;
    navigate(`${APP_ROUTES.transcripts}?q=${encodeURIComponent(text)}`);
  };

  return (
    <div className="bg-main-background min-h-screen flex flex-col">
      <Header />

      {/* Hero main section - full viewport height */}
      <section className={`${styles.heroBackground} min-h-screen flex flex-col justify-center pt-16 pb-12 md:pt-20 md:pb-16 relative overflow-hidden`}>
        <div className="mx-auto flex w-full max-w-[1440px] flex-col md:flex-row items-center justify-between gap-10 px-6 sm:px-12 lg:px-20 relative z-10">
          {/* Hero copy */}
          <div className="flex-1 flex flex-col gap-6 text-left">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                <span className="text-text-primary">Real Expertise. </span>
                <br />
                <span className="text-accent-2">Verified and Ready.</span>
              </h1>
              <p className="mt-6 text-lg text-text-secondary leading-relaxed max-w-xl font-medium">
               Every transcript comes from a real expert sharing their expertise on a topic the market is actively asking about. Search, filter, and get straight to the insight you need.
              </p>
            </div>

            {/* Search bar */}
            <div className="w-full max-w-xl">
              <SearchBar
                placeholder="Search transcripts..."
                searchValue={search}
                onChangeFunction={setSearch}
                getOnChange
                onSearch={handleSearch}
                clearTriggersSearch={false}
                maxWidth="100%"
                height="56px"
                submitButtonVariant="orange-circle"
                borderRadius="9999px"
                backgroundColor="var(--color-main-background)"
                boxShadow="0 4px 20px -2px rgba(0, 0, 0, 0.05)"
                inputFontSize="16px"
                m={{ xs: "0", sm: "0" }}
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-2">
              <Link to={APP_ROUTES.transcripts} className="flex justify-center">
                <Button
                  variant="contained"
                  label="Browse transcripts"
                  styles={heroButtonStyle}
                />
              </Link>
              <Button
                variant="outlined"
                label=" Request a Topic"
                onClick={requestTopicDialog.open}
                styles={heroButtonStyle}
              />
            </div>
          </div>

          {/* Hero visual - right side image */}
          <div className="hidden md:block flex-[1.15] w-full">
            <img
              src="/assets/bg5.png"
              alt="Expert sharing insights on a video call"
              draggable={false}
              className={`${styles.heroImage} w-full h-auto max-h-[500px] object-contain`}
            />
          </div>
        </div>
      </section>

      {/* Features section (three separate cards) */}
      <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-12 lg:px-20 pt-16 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURE_CARDS.slice(0, 3).map((card) => (
            <FeatureCard key={card.title} {...card} />
          ))}
        </div>
      </div>

      {/* For Experts section */}
      <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-12 lg:px-20 pb-32 pt-16 md:pb-40">
        <ForExperts />
      </div>

      <FaqSection />

      <Footer style={{ backgroundColor: "transparent", borderTop: "none" }} />

      <RequestTopicDialog
        isOpen={requestTopicDialog.isOpen}
        handleClose={requestTopicDialog.requestClose}
        onDirtyChange={requestTopicDialog.setDirty}
        handleSubmitClose={requestTopicDialog.notifySubmitted}
      />
      <WarningDialog
        open={requestTopicDialog.isWarningOpen}
        handleClose={requestTopicDialog.closeWarning}
        handleYesClick={requestTopicDialog.confirmDiscard}
      />
    </div>
  );
}
