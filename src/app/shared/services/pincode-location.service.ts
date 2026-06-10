import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { asyncScheduler, BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, observeOn, shareReplay, switchMap, take, tap } from 'rxjs/operators';
import { Select2Data } from 'ng-select2-component';
import { AuthService } from './auth.service';
import { AuthState } from '../state/auth.state';

export interface PincodeRecord {
  StateName: string;
  District: string;
  RegionName: string;
  CircleName: string;
  DivisionName: string;
  OfficeName: string;
  Pincode: string | number;
}

interface PincodeIndexes {
  stateOptions: Select2Data;
  districtsByState: Map<string, Select2Data>;
  officesByDistrict: Map<string, Select2Data>;
  recordsByPincode: Map<string, PincodeRecord[]>;
}

@Injectable({
  providedIn: 'root',
})
export class PincodeLocationService {
  private indexes: PincodeIndexes | null = null;
  private loadRequest$: Observable<PincodeIndexes> | null = null;
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);

  readonly loading$ = this.loadingSubject.asObservable();

  constructor(
    private authService: AuthService,
    private store: Store
  ) {}

  preload(): void {
    this.load().subscribe({ error: () => undefined });
  }

  reload(): void {
    this.indexes = null;
    this.loadRequest$ = null;
    this.preload();
  }

  isReady(): boolean {
    return !!this.indexes;
  }

  load(): Observable<PincodeIndexes> {
    if (this.indexes) {
      return of(this.indexes);
    }

    if (!this.loadRequest$) {
      this.loadingSubject.next(true);
      this.loadRequest$ = this.fetchRecords().pipe(
        map(records => this.buildIndexes(records)),
        observeOn(asyncScheduler),
        tap(indexes => {
          this.indexes = indexes;
          this.loadingSubject.next(false);
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
        catchError(error => {
          this.loadingSubject.next(false);
          this.loadRequest$ = null;
          return throwError(() => error);
        })
      );
    }

    return this.loadRequest$;
  }

  getStateOptions(): Select2Data {
    return this.indexes?.stateOptions ?? [];
  }

  getDistrictsByState(stateName: string): Select2Data {
    return this.indexes?.districtsByState.get(stateName) ?? [];
  }

  getOfficesByDistrict(district: string): Select2Data {
    return this.indexes?.officesByDistrict.get(district.toLowerCase()) ?? [];
  }

  getRecordsByPincode(pincode: string | number): PincodeRecord[] {
    return this.indexes?.recordsByPincode.get(String(pincode)) ?? [];
  }

  private fetchRecords(): Observable<PincodeRecord[]> {
    return this.store.select(AuthState.accessToken).pipe(
      take(1),
      switchMap(token =>
        token
          ? this.authService.fetchAreaPINCodeJSON()
          : this.authService.fetchAreaPINCodeJSONWithoutLogin()
      ),
      map(response => response?.data ?? [])
    );
  }

  private buildIndexes(data: PincodeRecord[]): PincodeIndexes {
    const stateOptions: Select2Data = [];
    const stateSeen = new Set<string>();
    const districtsByState = new Map<string, Select2Data>();
    const districtSeenByState = new Map<string, Set<string>>();
    const officesByDistrict = new Map<string, Select2Data>();
    const recordsByPincode = new Map<string, PincodeRecord[]>();

    for (const item of data) {
      if (!stateSeen.has(item.StateName)) {
        stateSeen.add(item.StateName);
        stateOptions.push({
          label: item.StateName,
          value: item.StateName,
        });
      }

      if (!districtSeenByState.has(item.StateName)) {
        districtSeenByState.set(item.StateName, new Set());
        districtsByState.set(item.StateName, []);
      }

      const districtSet = districtSeenByState.get(item.StateName)!;
      if (!districtSet.has(item.District)) {
        districtSet.add(item.District);
        districtsByState.get(item.StateName)!.push({
          label: item.District,
          value: item.District,
        });
      }

      const districtKey = item.District.toLowerCase();
      if (!officesByDistrict.has(districtKey)) {
        officesByDistrict.set(districtKey, []);
      }
      officesByDistrict.get(districtKey)!.push({
        label: item.OfficeName,
        value: item.OfficeName,
        data: item,
      } as Select2Data[number]);

      const pincodeKey = String(item.Pincode);
      if (!recordsByPincode.has(pincodeKey)) {
        recordsByPincode.set(pincodeKey, []);
      }
      recordsByPincode.get(pincodeKey)!.push(item);
    }

    stateOptions.sort((a, b) => String(a.label).localeCompare(String(b.label)));

    for (const districts of districtsByState.values()) {
      districts.sort((a, b) => String(a.label).localeCompare(String(b.label)));
    }

    return {
      stateOptions,
      districtsByState,
      officesByDistrict,
      recordsByPincode,
    };
  }
}
