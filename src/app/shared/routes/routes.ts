import { Routes } from "@angular/router";
import { AuthGuard } from "./../../core/guard/auth.guard";
import { Error404Component } from './../../components/page/error404/error404.component';

export const content: Routes = [
  {
    path: "",
    loadChildren: () => import("../../components/themes/themes.module").then((m) => m.ThemesModule),
    title: 'spark shop wear Premium Mens and Womens Fashion Online'
  },
  {
    path: 'privacy-policy',
    loadChildren: () =>
      import('../../privacy-policy/privacy-policy.module').then((m) => m.PrivacyPolicyModule),
    title: 'Privacy Policy – How We Use Your Data | spark shop wear'
  },
  {
    path: 'return-policy',
    loadChildren: () =>
      import('../../return-exchange/return-exchange.module').then((m) => m.ReturnExchangeModule),
    title: 'Easy 7-Day Return Policy – Shop Risk-Free | spark shop wear'
  },
  {
    path: 'refund-and-cancellation',
    loadChildren: () =>
      import('../../refund-and-cancellation/refund-and-cancellation.module').then((m) => m.RefundAndCancellationModule),
    title: 'Refund & Cancellation Policy – Smooth Shopping | spark shop wear'
  },
  {
    path: "Contact-Us",
    loadChildren: () => import("../../contact-us/contact-us.module").then((m) => m.ContactUsModule),
    title: 'Contact spark shop wear – We’re Here to Help You 24/7'
  },
  {
    path: 'term-condition',
    loadChildren: () =>
      import('../../term-condition/term-condition.module').then((m) => m.TermConditionModule),
    title: 'Terms & Conditions – Rules of Using spark shop wear'
  },
  {
    path: "shipping-policy",
    loadChildren: () => import("../../shipping-delevary/shipping-delevary.module").then((m) => m.ShippingDelevaryModule),
    title: 'Shipping & Delivery Information – Fast & Safe | spark shop wear'
  },
  {
    path: "auth",
    loadChildren: () => import("../../components/auth/auth.module").then((m) => m.AuthModule),
    canActivateChild: [AuthGuard],
    title: 'Login or Register Your spark shop wear Account Securely'
  },
  {
    path: "account",
    loadChildren: () => import("../../components/account/account.module").then((m) => m.AccountModule),
    canActivate: [AuthGuard],
    title: 'Manage Your Orders & Profile | spark shop wear Account'
  },
  {
    path: "",
    loadChildren: () => import("../../components/shop/shop.module").then((m) => m.ShopModule),
    title: 'Browse Fashion Clothing Categories – Shop Online | spark shop wear'
  },
  {
    path: "",
    loadChildren: () => import("../../components/blog/blog.module").then((m) => m.BlogModule),
    title: 'spark shop wear Blog – Latest Fashion News, Tips & Trends'
  },
  {
    path: "",
    loadChildren: () => import("../../components/page/page.module").then((m) => m.PagesModule),
    title: 'Explore spark shop wear Info Pages – Learn More About Us'
  },
  {
    path: '**',
    pathMatch: 'full',
    component: Error404Component,
    title: '404 Error – Page Not Found | spark shop wear Fashion Store'
  }
];
