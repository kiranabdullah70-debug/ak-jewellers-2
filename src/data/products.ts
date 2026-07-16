import nameNecklaceImg from "../assets/images/regenerated_image_1780214748245.jpg";
import customRingImg from "../assets/images/regenerated_image_1780132312748.webp";
import cufflinksImg from "../assets/images/cufflinks_1779903069638.png";
import customBraceletImg from "../assets/images/custom_bracelet_1779903093589.png";
import chainBraceletImg from "../assets/images/chain_bracelet_1779905558705.png";
import pearlBangleImg from "../assets/images/regenerated_image_1780214749387.jpg";
import dualNameBangleImg from "../assets/images/dual_name_bangle_1779905606755.png";
import braceletRingSetImg from "../assets/images/bracelet_ring_set_1779905632331.png";
import coupleNameRingsImg from "../assets/images/regenerated_image_1780215832368.webp";
import floralNameNecklaceImg from "../assets/images/floral_name_necklace_1779936017000.png";
import butterflyJewelrySetImg from "../assets/images/butterfly_jewelry_set_1779936039259.png";
import premiumGiftSetImg from "../assets/images/premium_gift_set_1779936066068.png";
import { Product } from "../types";

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "ring-1",
    name: "Personalized Royal Custom Ring",
    originalPrice: 1199,
    salePrice: 899,
    description:
      '"Wear Your Identity in Pure Gold" Minimalist geometric ring engraved with your chosen alphabet initial. Adjustable size fits everyone.',
    customFieldLabel: "Enter 1 Initial Letter (A-Z)",
    customFieldPlaceholder: "e.g., A",
    image: customRingImg,
    category: "rings",
  },
  {
    id: "cufflinks-1",
    name: "Customize Cufflinks",
    originalPrice: 1199,
    salePrice: 899,
    description:
      '"Carry your name everywhere." Sleek, unisex metallic Cufflink engraved with a special date, anniversary, or lucky number.',
    customFieldLabel: "Enter Date or Numbers",
    customFieldPlaceholder: "e.g., 12-10-2022",
    image: cufflinksImg,
    category: "accessories",
  },
  {
    id: "bracelet-1",
    name: "Royal Customize Bracelet",
    originalPrice: 1199,
    salePrice: 899,
    description:
      "Delicate chain bracelet featuring an infinity loop connected to a small heart engraved with two initials. Gold Finish | Add Your Name.",
    customFieldLabel: "Enter Two Initials",
    customFieldPlaceholder: "e.g., A & Z",
    image: customBraceletImg,
    category: "bracelets",
  },
  {
    id: "bracelet-chain",
    name: "Custom Name Chain Bracelet",
    originalPrice: 1199,
    salePrice: 899,
    description:
      "Delicate chain bracelet featuring a custom cursive name. Gold Finish.",
    customFieldLabel: "Enter Name",
    customFieldPlaceholder: "e.g., Hayal",
    image: chainBraceletImg,
    category: "bracelets",
  },
  {
    id: "bracelet-pearl",
    name: "Pearl Bangle Name Bracelet",
    originalPrice: 1199,
    salePrice: 899,
    description:
      "Elegant adjustable bangle featuring your name and a beautiful pearl accent. Gold Finish.",
    customFieldLabel: "Enter Name",
    customFieldPlaceholder: "e.g., Sarah",
    image: pearlBangleImg,
    category: "bracelets",
  },
  {
    id: "bracelet-dual",
    name: "Couple's Dual Name Bangle",
    originalPrice: 1199,
    salePrice: 899,
    description:
      "Stunning open bangle featuring two custom cursive names. Perfect for couples or best friends. Gold Finish.",
    customFieldLabel: "Enter Two Names",
    customFieldPlaceholder: "e.g., Tania & Dimash",
    image: dualNameBangleImg,
    category: "bracelets",
  },
  {
    id: "bracelet-ring-set",
    name: "Matching Name Bracelet & Ring Set",
    originalPrice: 1199,
    salePrice: 899,
    description:
      "Complete your look with our matching custom name bracelet and ring set. Both feature dual names elegantly connected.",
    customFieldLabel: "Enter Two Names",
    customFieldPlaceholder: "e.g., Daisy & James",
    image: braceletRingSetImg,
    category: "sets",
  },
  {
    id: "couple-rings",
    name: "Custom Couple Name Rings",
    originalPrice: 1499,
    salePrice: 999,
    description:
      "Beautiful matching gold rings for couples. Each ring features a custom name in an elegant cursive font.",
    customFieldLabel: "Enter Two Names",
    customFieldPlaceholder: "e.g., Fathima & Salman",
    image: coupleNameRingsImg,
    category: "rings",
  },
  {
    id: "floral-necklace",
    name: "Floral Accent Name Necklace",
    originalPrice: 1299,
    salePrice: 949,
    description:
      "A gorgeous custom name necklace adorned with a delicate rose motif at the end. Perfect for nature lovers.",
    customFieldLabel: "Enter Name",
    customFieldPlaceholder: "e.g., Azaleah",
    image: floralNameNecklaceImg,
    category: "necklaces",
  },
  {
    id: "butterfly-set",
    name: "Butterfly Name Necklace & Earrings Set",
    originalPrice: 1999,
    salePrice: 1499,
    description:
      "A stunning set featuring a custom name necklace and hoop earrings, both finished with a cute butterfly detail.",
    customFieldLabel: "Enter Name",
    customFieldPlaceholder: "e.g., Alida",
    image: butterflyJewelrySetImg,
    category: "sets",
  },
  {
    id: "premium-gift-set",
    name: "Premium Jewelry Gift Box Set",
    originalPrice: 2499,
    salePrice: 1899,
    description:
      "The ultimate gift. Includes a custom name necklace, stud earrings, and an engraved minimal cuff bracelet, packaged in a premium box.",
    customFieldLabel: "Enter Name",
    customFieldPlaceholder: "e.g., Zahnylee",
    image: premiumGiftSetImg,
    category: "sets",
  },
];
