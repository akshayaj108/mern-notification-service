export const BRAND = {
    name: process.env.BRAND_NAME ?? "Foodie",
    supportEmail: process.env.SUPPORT_EMAIL ?? "support@foodie.com",
    supportPhone: process.env.SUPPORT_PHONE ?? "+91 00000 00000",
    trackUrl: process.env.TRACK_ORDER_URL ?? "http://localhost:3000/order",
    color: "#e4572e",
};

export const statusColors: Record<string, { bg: string; fg: string }> = {
    pending: { bg: "#fff4d6", fg: "#8a6100" },
    paid: { bg: "#dcf5e4", fg: "#14683a" },
    failed: { bg: "#fde0e0", fg: "#a12525" },
};