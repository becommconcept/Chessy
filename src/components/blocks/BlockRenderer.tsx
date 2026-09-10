import {
  AgendaListBlock,
  AssociationsListBlock,
  ContactCardBlock,
  ContactFormBlock,
  DemarchesListBlock,
  DocumentsBlock,
  EquipementsMapBlock,
  NewsListBlock,
  NewsletterBlock,
  PersonGridBlock,
  ServiceTeaserBlock,
} from "@/components/blocks/DynamicBlocks";
import {
  AccordionBlock,
  AlertBoxBlock,
  CardGridBlock,
  ColumnsBlock,
  CtaBlock,
  GalleryBlock,
  HeroBlock,
  ImageTextBlock,
  PricingTableBlock,
  QuickLinksBlock,
  RichTextBlock,
  SeparatorBlock,
  StatsBlock,
  StepsBlock,
  TabsBlock,
  TimelineBlock,
  VideoBlock,
  type BlockData,
} from "@/components/blocks/StaticBlocks";
import { safeJson } from "@/lib/utils";

export type RenderableBlock = {
  id: string;
  type: string;
  data: string;
  visible: boolean;
};

/**
 * Rend la suite de blocs d'une page.
 *
 * Un type de bloc inconnu — cas d'un contenu créé par une version plus récente
 * du back-office — est ignoré silencieusement côté public, plutôt que de faire
 * échouer toute la page.
 */
export function BlockRenderer({ blocks }: { blocks: RenderableBlock[] }) {
  const visible = blocks.filter((block) => block.visible);

  return (
    <>
      {visible.map((block, index) => {
        const data = safeJson<BlockData>(block.data, {});
        const key = block.id;

        switch (block.type) {
          case "hero":
            return <HeroBlock key={key} data={data} first={index === 0} />;
          case "richText":
            return <RichTextBlock key={key} data={data} />;
          case "imageText":
            return <ImageTextBlock key={key} data={data} />;
          case "columns":
            return <ColumnsBlock key={key} data={data} />;
          case "quickLinks":
            return <QuickLinksBlock key={key} data={data} />;
          case "cardGrid":
            return <CardGridBlock key={key} data={data} />;
          case "stats":
            return <StatsBlock key={key} data={data} />;
          case "timeline":
            return <TimelineBlock key={key} data={data} />;
          case "steps":
            return <StepsBlock key={key} data={data} />;
          case "gallery":
            return <GalleryBlock key={key} data={data} />;
          case "accordion":
            return <AccordionBlock key={key} data={data} />;
          case "tabs":
            return <TabsBlock key={key} data={data} />;
          case "pricingTable":
            return <PricingTableBlock key={key} data={data} />;
          case "cta":
            return <CtaBlock key={key} data={data} />;
          case "alertBox":
            return <AlertBoxBlock key={key} data={data} />;
          case "video":
            return <VideoBlock key={key} data={data} />;
          case "separator":
            return <SeparatorBlock key={key} data={data} />;
          case "newsList":
            return <NewsListBlock key={key} data={data} />;
          case "agendaList":
            return <AgendaListBlock key={key} data={data} />;
          case "documents":
            return <DocumentsBlock key={key} data={data} />;
          case "associationsList":
            return <AssociationsListBlock key={key} data={data} />;
          case "demarchesList":
            return <DemarchesListBlock key={key} data={data} />;
          case "personGrid":
            return <PersonGridBlock key={key} data={data} />;
          case "equipementsMap":
            return <EquipementsMapBlock key={key} data={data} />;
          case "contactCard":
            return <ContactCardBlock key={key} data={data} />;
          case "contactForm":
            return <ContactFormBlock key={key} data={data} />;
          case "serviceTeaser":
            return <ServiceTeaserBlock key={key} data={data} />;
          case "newsletter":
            return <NewsletterBlock key={key} data={data} />;
          default:
            return null;
        }
      })}
    </>
  );
}
