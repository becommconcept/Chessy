import { writeFileSync } from "node:fs";
import * as lucide from "lucide-react";

const names = `
Accessibility Activity AlignLeft AppWindow Archive ArrowDown ArrowLeft ArrowRight ArrowUp ArrowUpDown
Ban BarChart3 Baby Bell BellRing Bike Blocks Bold BookOpen Boxes Building Building2 Bus
Calendar CalendarCheck CalendarClock CalendarDays CalendarPlus CalendarX Camera CarTaxiFront Castle Check CheckCheck
ChevronDown ChevronLeft ChevronRight ChevronUp ChevronsLeft ChevronsRight ChevronsUpDown Church CircleAlert
CircleCheck CircleDollarSign CircleHelp CircleMinus ClipboardList Clock CloudRain Code Coins Columns2 Columns3 Compass Contact Cookie Copy CopyPlus
Dog DoorOpen Download Droplet Droplets
Eraser Euro ExternalLink Eye EyeOff
Facebook FileCheck FileDown FileSearch FileSignature FileStack FileText Files Filter Flag Flower2 FolderOpen FolderPlus
Gauge Gavel Gift Globe Grape GraduationCap Grid3x3 GripHorizontal GripVertical Hash
Hammer Handshake Heading2 Heading3 Heart HeartHandshake History Home Hourglass House
IdCard Image ImagePlus Images Inbox Info Instagram Italic
KeyRound
Landmark Laptop Layers LayoutDashboard LayoutGrid LayoutList LayoutTemplate Leaf Lightbulb Link2 Linkedin List ListFilter ListOrdered Loader2 Locate Lock LogOut
Mail Map MapPin Megaphone Menu MessageSquare Minus Moon Mountain MousePointerClick MoveDown MoveUp
Network Newspaper
Package PackageCheck PackageX Palette PanelLeft PanelTop Paperclip PartyPopper Pencil Phone Pickaxe PiggyBank Pill Plus Printer
Quote
Recycle Redo2 Reply Rows3 Rss Ruler
Save Scale Scissors ScrollText Search Send Settings Sliders Share2 Shirt ShieldAlert ShieldCheck ShoppingBasket Smartphone Sparkles Sprout SquarePen Star Stethoscope Store Sun
Table Table2 Tag Tent Ticket Timer TrainFront TrendingUp Trash Trash2 Trees Trophy Truck TriangleAlert Type
Undo2 Unlink Upload UserCheck UserSquare2 Users Users2 UtensilsCrossed
Video Vote
Wand2 Warehouse Wine Wrench
X
Youtube
Zap
`.trim().split(/\s+/);

const unique = [...new Set(names)].sort();
const missing = unique.filter((n) => !(n in lucide));
if (missing.length) {
  console.error("Icônes inexistantes dans lucide-react :", missing.join(", "));
  process.exit(1);
}

const aliases = {
  BabyIcon: "Baby",
  Users2Icon: "Users2",
  Warning: "TriangleAlert",
  AlertTriangle: "TriangleAlert",
  AlertCircle: "CircleAlert",
  CheckCircle: "CircleCheck",
  HelpCircle: "CircleHelp",
  Loader: "Loader2",
  Trash: "Trash2",
  Photo: "Image",
  Pdf: "FileText",
  File: "FileText",
  Euro: "Euro",
  Calendar2: "CalendarDays",
};

const file = `/**
 * Table des icônes disponibles.
 *
 * Les blocs, les menus et les fiches démarches stockent un *nom* d'icône
 * (chaîne de caractères) saisi dans le back-office. Cette table fait le lien
 * avec les composants \`lucide-react\` correspondants. Les imports sont
 * explicites afin que seules les icônes réellement utilisées soient
 * embarquées dans le bundle.
 *
 * Fichier généré — pour ajouter une icône, complétez la liste puis relancez
 * le script \`scripts/generer-icones.mjs\`.
 */
import {
${unique.map((n) => `  ${n},`).join("\n")}
  type LucideIcon,
} from "lucide-react";

export const ICONS: Record<string, LucideIcon> = {
${unique.map((n) => `  ${n},`).join("\n")}
};

/** Anciens noms et variantes tolérés lors de la saisie. */
const ALIASES: Record<string, string> = {
${Object.entries(aliases).map(([k, v]) => `  ${k}: "${v}",`).join("\n")}
};

/** Liste triée des noms d'icônes, proposée dans le back-office. */
export const ICON_NAMES = Object.keys(ICONS).sort();

/** Résout un nom d'icône en composant, avec repli sur une icône neutre. */
export function resolveIcon(name?: string | null): LucideIcon | null {
  if (!name) return null;
  const trimmed = name.trim();
  if (ICONS[trimmed]) return ICONS[trimmed];
  const alias = ALIASES[trimmed];
  if (alias && ICONS[alias]) return ICONS[alias];
  // Tolérance à la casse et aux séparateurs (\`file-text\` → \`FileText\`).
  const normalized = trimmed
    .replace(/[-_\\s]+(.)/g, (_, char: string) => char.toUpperCase())
    .replace(/^(.)/, (_, char: string) => char.toUpperCase());
  return ICONS[normalized] ?? null;
}
`;

writeFileSync("src/components/ui/icons.ts", file);
console.log("✓ src/components/ui/icons.ts —", unique.length, "icônes");
