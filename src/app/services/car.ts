import { Service, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase';
import { AuthService } from './auth';
import { Car } from '../models/car';

@Service()
export class CarService {
    private readonly supabase = inject(SupabaseService).client;
    private readonly authService = inject(AuthService);

    private readonly _cars = signal<Car[]>([]);
    private readonly _isLoading = signal(false);
    private readonly _isSaving = signal(false);
    private readonly _error = signal<string | null>(null);

    readonly cars = this._cars.asReadonly();
    readonly isLoading = this._isLoading.asReadonly();
    readonly isSaving = this._isSaving.asReadonly();
    readonly error = this._error.asReadonly();

    private loadedUserId: string | null = null;
    private loadedGarageId: string | null = null;
    private requestVersion = 0;

    async loadCars(forceRefresh = false): Promise<void> {
        const userId = this.authService.session()?.user.id;
        const garageId = this.authService.garageId();

        if(!userId || !garageId){
            this.reset();
            return;
        }

        if(this.loadedUserId !== userId || this.loadedGarageId !== garageId){
            this.reset();
            this.loadedUserId = userId;
            this.loadedGarageId = garageId;
            forceRefresh = true;
        }

        if(this._isLoading() ||this._isSaving()) return;
        if(!forceRefresh) return;

        const version = ++this.requestVersion;

        this._isLoading.set(true);
        this._error.set(null);
        
        try {
            const {data, error} = await this.supabase
            .from('cars')
            .select('*')
            .eq('garage_id', garageId);

            if (error) throw error;

            if(!this.isCurrentRequest(version, userId, garageId)) return;

            this._cars.set(data);

        } catch (error) {
            if (this.isCurrentRequest(version, userId, garageId)) {
                this._error.set('Unable to load vehicles.');
                this.loadedUserId = null;
                this.loadedGarageId = null;
            }
        } finally {
            if (version === this.requestVersion) {
                this._isLoading.set(false);
            }
        }
    }

    async updateParkingSlot(
        carId: string,
        parkingSlot: string | null
    ): Promise<void> {
        const userId = this.authService.session()?.user.id;
        const garageId = this.authService.garageId();

        if(!userId || !garageId || userId !== this.loadedUserId || garageId !== this.loadedGarageId){
            throw new Error('Invalid user session.');
        }

        if(!this.authService.canEditParking()){
            throw new Error('You do not have permission to edit vehicles.');
        }

        if(this.isSaving() || this.isLoading()) return;

        const version = this.requestVersion;

        this._isSaving.set(true);

        try {
            const { error } = await this.supabase.rpc(
                'update_parking_slot',
                {
                    p_car_id: carId,
                    p_parking_slot: parkingSlot
                }
            );

            if(error) throw error

            if (!this.isCurrentRequest(version, userId, garageId)) return;

            this._cars.update(cars =>
                cars.map(car =>
                    car.id === carId ?
                    {...car, parking_slot: parkingSlot} : car
                )
            );

        } finally {
            if (version === this.requestVersion){
                this._isSaving.set(false);
            }
        }        
    }

    private isCurrentRequest(
        version: number,
        userId: string,
        garageId: string
    ): boolean{
        return version === this.requestVersion &&
        this.authService.session()?.user.id === userId &&
        this.authService.garageId() === garageId;
    }

    reset(): void{
        this.requestVersion++;

        this._cars.set([]);
        this._isLoading.set(false);
        this._isSaving.set(false);
        this._error.set(null);

        this.loadedUserId = null;
        this.loadedGarageId = null;
    }
}
