import { Service, inject, signal, computed } from '@angular/core';
import { Session } from '@supabase/supabase-js';
import { SupabaseService } from './supabase';
import { Garage, GarageMember, UserRole } from '../models/garage';

@Service()
export class AuthService {
    private readonly supabase = inject(SupabaseService).client;

    private readonly _garage = signal<Garage | null>(null);
    private readonly _membership = signal<GarageMember | null>(null);
    private readonly _session = signal<Session | null>(null);
    private readonly _isLoading = signal(true);

    readonly garage = this._garage.asReadonly();
    readonly membership = this._membership.asReadonly();
    readonly session = this._session.asReadonly();
    readonly isLoading = this._isLoading.asReadonly();

    private requestVersion = 0;

    constructor(){
        this.supabase.auth.onAuthStateChange((_event, session) => {
            this.handleSessionChange(session);
        });
    }

    readonly isAuthorized = computed(() =>
        this.session() !== null &&
        this.membership() !== null &&
        this.garage() !== null
    );

    readonly role = computed<UserRole | null>(() =>
        this._membership()?.role ?? null
    );

    readonly garageId = computed(() =>
        this._garage()?.id ?? null
    );

    readonly canEdit = computed(() =>
        this.role() === 'admin'
    );

    readonly canEditParking = computed(() =>
        this.role() === 'admin' ||
        (this.role() === 'demo' && this.isDemo())
    );

    readonly isDemo = computed(() =>
        this._garage()?.is_demo === true
    );

    private handleSessionChange(session: Session | null): void {
        const previousUserId = this._session()?.user.id;
        const currentUserId = session?.user.id;

        console.log('--- SESSION CHANGE ---');
        console.log('Previous user:', this._session()?.user.email);
        console.log('Current user:', session?.user.email);

        this._session.set(session);

        if (
            session &&
            previousUserId === currentUserId &&
            (this._isLoading() || this._membership())
        ) {
            console.log('Skipping: same user');
            return;
        }

        const version = ++this.requestVersion;

        this._membership.set(null);
        this._garage.set(null);

        console.log('--- AUTHORIZATION RESET ---');
        console.log('Role:', this.role());
        console.log('Can edit:', this.canEdit());

        if (!session) {
            this._isLoading.set(false);
            return;
        }

        this._isLoading.set(true);

        setTimeout(() => {
            console.log('Starting loadAuthorization...');
            void this.loadAuthorization(session.user.id, version);
        }, 0);
    }

    private async loadMembership(userId: string): Promise<GarageMember>{
        const {data, error} = await this.supabase
            .from('garage_members')
            .select('*')
            .eq('user_id', userId)
            .single();
        if(error) throw error;

        return data;
    }

    private async loadAuthorization(userId: string, version: number): Promise<void>{
        try{
            if (version !== this.requestVersion) return;

            const membership = await this.loadMembership(userId);
            if (version !== this.requestVersion) return;

            const garage = await this.loadGarage(membership.garage_id);
            if (version !== this.requestVersion) return;

            this._membership.set(membership);
            this._garage.set(garage);

            console.log('Role:', this.role());
            console.log('Garage:', this.garage()?.name);
            console.log('Garage ID:', this.garageId());
            console.log('Can edit:', this.canEdit());
            console.log('Is demo:', this.isDemo());
        } catch (error){
            if(version === this.requestVersion){
                this._membership.set(null);
                this._garage.set(null);

                console.error(
                    'Failed to load authorization:',
                    error
                );
            }
        } finally {
            if (version === this.requestVersion) {
                this._isLoading.set(false);
            }
        }
    }

    private async loadGarage(garageId: string): Promise<Garage>{
        const { data, error } = await this.supabase
            .from('garages')
            .select('*')
            .eq('id', garageId)
            .single();

        if (error) throw error;

        return data;        
    }

    async signIn(email: string, password: string): Promise<void>{
        const {error} = await this.supabase.auth.signInWithPassword({
            email,
            password
        });

        if(error){
            throw error;
        }
    }

    async signOut(): Promise<void>{
        const {error} = await this.supabase.auth.signOut();

        if(error){
            throw error;
        }
    }
}