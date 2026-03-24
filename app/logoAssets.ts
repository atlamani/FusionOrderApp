export const logoAssets = {
  social: {
    facebook: require("../assets/images/brands/facebook.png"),
    google: require("../assets/images/brands/google.png"),
    apple: require("../assets/images/brands/apple.png"),
  },
  payment: {
    visa: require("../assets/images/brands/visa.png"),
    mastercard: require("../assets/images/brands/mastercard.png"),
    amex: require("../assets/images/brands/amex.png"),
    discover: require("../assets/images/brands/discover.png"),
  },
} as const;

export type SocialBrand = keyof typeof logoAssets.social;
export type PaymentBrand = keyof typeof logoAssets.payment;
