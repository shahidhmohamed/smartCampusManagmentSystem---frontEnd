import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, asapScheduler, scheduled } from 'rxjs';

import { catchError } from 'rxjs/operators';

import { ApplicationConfigService } from 'app/services/core/config/application-config.service';
import { createRequestOption } from 'app/services/core/request/request-util';
import { SearchWithPagination } from 'app/services/core/request/request.model';
import { isPresent } from 'app/services/core/util/operators';
import { IFolder, NewFolder } from '../folder.model';
export type PartialUpdateFolder = Partial<IFolder> & Pick<IFolder, 'id'>;

export type EntityResponseType = HttpResponse<IFolder>;
export type EntityArrayResponseType = HttpResponse<IFolder[]>;

@Injectable({ providedIn: 'root' })
export class FolderService {
    protected readonly http = inject(HttpClient);
    protected readonly applicationConfigService = inject(
        ApplicationConfigService
    );

    protected resourceUrl =
        this.applicationConfigService.getEndpointFor('api/folders');
    protected resourceSearchUrl = this.applicationConfigService.getEndpointFor(
        'api/folders/_search'
    );

    create(folder: NewFolder): Observable<EntityResponseType> {
        return this.http.post<IFolder>(this.resourceUrl, folder, {
            observe: 'response',
        });
    }

    update(folder: IFolder): Observable<EntityResponseType> {
        return this.http.put<IFolder>(
            `${this.resourceUrl}/${this.getFolderIdentifier(folder)}`,
            folder,
            { observe: 'response' }
        );
    }

    partialUpdate(folder: PartialUpdateFolder): Observable<EntityResponseType> {
        return this.http.patch<IFolder>(
            `${this.resourceUrl}/${this.getFolderIdentifier(folder)}`,
            folder,
            { observe: 'response' }
        );
    }

    find(id: string): Observable<EntityResponseType> {
        return this.http.get<IFolder>(`${this.resourceUrl}/${id}`, {
            observe: 'response',
        });
    }

    query(req?: any): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http.get<IFolder[]>(this.resourceUrl, {
            params: options,
            observe: 'response',
        });
    }

    delete(id: string): Observable<HttpResponse<{}>> {
        return this.http.delete(`${this.resourceUrl}/${id}`, {
            observe: 'response',
        });
    }

    search(req: SearchWithPagination): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http
            .get<
                IFolder[]
            >(this.resourceSearchUrl, { params: options, observe: 'response' })
            .pipe(
                catchError(() =>
                    scheduled([new HttpResponse<IFolder[]>()], asapScheduler)
                )
            );
    }

    getFolderIdentifier(folder: Pick<IFolder, 'id'>): string {
        return folder.id;
    }

    compareFolder(
        o1: Pick<IFolder, 'id'> | null,
        o2: Pick<IFolder, 'id'> | null
    ): boolean {
        return o1 && o2
            ? this.getFolderIdentifier(o1) === this.getFolderIdentifier(o2)
            : o1 === o2;
    }

    addFolderToCollectionIfMissing<Type extends Pick<IFolder, 'id'>>(
        folderCollection: Type[],
        ...foldersToCheck: (Type | null | undefined)[]
    ): Type[] {
        const folders: Type[] = foldersToCheck.filter(isPresent);
        if (folders.length > 0) {
            const folderCollectionIdentifiers = folderCollection.map(
                (folderItem) => this.getFolderIdentifier(folderItem)
            );
            const foldersToAdd = folders.filter((folderItem) => {
                const folderIdentifier = this.getFolderIdentifier(folderItem);
                if (folderCollectionIdentifiers.includes(folderIdentifier)) {
                    return false;
                }
                folderCollectionIdentifiers.push(folderIdentifier);
                return true;
            });
            return [...foldersToAdd, ...folderCollection];
        }
        return folderCollection;
    }
}
