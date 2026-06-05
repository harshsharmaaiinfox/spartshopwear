import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AccountComponent } from './account.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { WalletComponent } from './wallet/wallet.component';
import { NotificationComponent } from './notification/notification.component';
import { PointComponent } from './point/point.component';
import { OrdersComponent } from './orders/orders.component';
import { OrderDetailsComponent } from './orders/details/details.component';
import { RefundComponent } from './refund/refund.component';
import { AddressesComponent } from './addresses/addresses.component';
import { DownloadsComponent } from './downloads/downloads.component';

const routes: Routes = [
  {
    path: '',
    component: AccountComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'profile',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'wallet',
        component: WalletComponent
      },
      {
        path: 'notifications',
        component: NotificationComponent
      },
      {
        path: 'point',
        component: PointComponent
      },
      {
        path: 'order',
        component: OrdersComponent
      },
      {
        path: 'orders',
        redirectTo: 'order',
        pathMatch: 'full'
      },
      {
        path: 'order/details/:id',
        component: OrderDetailsComponent
      },
      {
        path: 'orders/details/:id',
        redirectTo: 'order/details/:id',
        pathMatch: 'full'
      },
      {
        path: 'refund',
        component: RefundComponent
      },
      {
        path: 'addresses',
        component: AddressesComponent
      },
      {
        path: 'downloads',
        component: DownloadsComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountRoutingModule { }
