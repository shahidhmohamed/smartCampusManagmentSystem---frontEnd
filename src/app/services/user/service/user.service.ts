import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ApplicationConfigService } from 'app/services/core/config/application-config.service';
import { createRequestOption } from 'app/services/core/request/request-util';
import { Pagination } from 'app/services/core/request/request.model';
import { Observable, map } from 'rxjs';
import { IAuthority } from './authority.model';
import { IUser } from './user-management.model';

export type EntityArrayResponseType = HttpResponse<IAuthority[]>;

@Injectable({ providedIn: 'root' })
export class UserManagementService {
    private readonly http = inject(HttpClient);
    private readonly applicationConfigService = inject(
        ApplicationConfigService
    );

    protected resourceUrlAuthority =
        this.applicationConfigService.getEndpointFor('api/authorities');

    private readonly resourceUrl =
        this.applicationConfigService.getEndpointFor('api/admin/users');

    create(user: IUser): Observable<IUser> {
        return this.http.post<IUser>(this.resourceUrl, user);
    }

    update(user: IUser): Observable<IUser> {
        return this.http.put<IUser>(this.resourceUrl, user);
    }

    find(login: string): Observable<IUser> {
        return this.http.get<IUser>(`${this.resourceUrl}/${login}`);
    }

    query(req?: Pagination): Observable<HttpResponse<IUser[]>> {
        const options = createRequestOption(req);
        return this.http.get<IUser[]>(this.resourceUrl, {
            params: options,
            observe: 'response',
        });
    }

    queryAuthority(req?: any): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http.get<IAuthority[]>(this.resourceUrlAuthority, {
            params: options,
            observe: 'response',
        });
    }

    delete(login: string): Observable<{}> {
        return this.http.delete(`${this.resourceUrl}/${login}`);
    }

    authorities(): Observable<string[]> {
        return this.http
            .get<
                { name: string }[]
            >(this.applicationConfigService.getEndpointFor('api/authorities'))
            .pipe(map((authorities) => authorities.map((a) => a.name)));
    }
}
