// src/pages/Catalog/MobileCatalogPage.tsx
import "react";
import { useNavigate } from "react-router-dom";
// import c from "./MobileCatalogPage.module.scss";

import Page from "../../components/UI/Page/Page";
import { useVisualViewport } from "../../hooks/useViewportUnits";
import { CatalogScreens } from "../../components/Catalog/CatalogScreens";
import { useCatalogFlow } from "../../utils/catalog/useCatalogFlow";
import { useTranslation } from "react-i18next";

export default function MobileCatalogPage() {
  useVisualViewport();
  const nav = useNavigate();
  const { t } = useTranslation("catalog");

  const flow = useCatalogFlow({
    backAtL1: "smartBack",
    closeOnNavigate: false,
    onNavigate: (url) => nav(url),
  });

  return (
    <Page padding={false}>
      <CatalogScreens
        title={t("title")}
        stage={flow.stage}
        isLoading={flow.isLoading}
        error={!flow.isLoading && !!flow.error}
        roots={flow.roots}
        l2List={flow.l2List}
        l3List={flow.l3List}
        rootCat={flow.rootCat}
        l2Cat={flow.l2Cat}
        back={flow.back}
        screenClass={flow.screenClass}
        refs={{ l1: flow.l1ScrollRef, l2: flow.l2ScrollRef, l3: flow.l3ScrollRef }}
        touch={{ onTouchStart: flow.onTouchStart, onTouchEnd: flow.onTouchEnd }}
        onOpenL2={flow.openL2}
        onOpenL3={flow.openL3}
        onOpenSlug={(slug) => nav(`/category${slug}`)}
      />
    </Page>
  );
}
