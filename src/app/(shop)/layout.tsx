import { PublicFooter } from "@/components/layout/public-footer";
import { StoreCartProvider } from "@/features/storefront/cart/store-cart-provider";
import { StoreCartSheet } from "@/features/storefront/components/store-cart-sheet";
import { StoreHeader } from "@/features/storefront/components/store-header";

export default function ShopLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <StoreCartProvider>
      <StoreHeader />
      <div className="relative z-10 bg-background">
        {children}
        <PublicFooter />
      </div>
      <StoreCartSheet />
    </StoreCartProvider>
  );
}
