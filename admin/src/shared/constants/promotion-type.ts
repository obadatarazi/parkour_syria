export const PROMOTION_TYPE_VALUES = ["MOBILE", "DESKTOP"] as const;

export type PromotionTypeValue = (typeof PROMOTION_TYPE_VALUES)[number];

export type PromotionTypeOption = {
  label: string;
  value: PromotionTypeValue;
};

export const PROMOTION_POSITION_FILTER_VALUES = ["0", "1", "2", "3", "4", "5"] as const;
