import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, asapScheduler, scheduled } from 'rxjs';

import { ApplicationConfigService } from 'app/services/core/config/application-config.service';
import { createRequestOption } from 'app/services/core/request/request-util';
import { SearchWithPagination } from 'app/services/core/request/request.model';
import { isPresent } from 'app/services/core/util/operators';
import { catchError } from 'rxjs/operators';
import { IFile, NewFile } from '../file.model';
export type PartialUpdateFile = Partial<IFile> & Pick<IFile, 'id'>;

export type EntityResponseType = HttpResponse<IFile>;
export type EntityArrayResponseType = HttpResponse<IFile[]>;

@Injectable({ providedIn: 'root' })
export class FileService {
    protected readonly http = inject(HttpClient);
    protected readonly applicationConfigService = inject(
        ApplicationConfigService
    );

    protected resourceUrl =
        this.applicationConfigService.getEndpointFor('api/files');
    protected resourceSearchUrl =
        this.applicationConfigService.getEndpointFor('api/files/_search');

    create(file: NewFile): Observable<EntityResponseType> {
        return this.http.post<IFile>(this.resourceUrl, file, {
            observe: 'response',
        });
    }

    update(file: IFile): Observable<EntityResponseType> {
        return this.http.put<IFile>(
            `${this.resourceUrl}/${this.getFileIdentifier(file)}`,
            file,
            { observe: 'response' }
        );
    }

    partialUpdate(file: PartialUpdateFile): Observable<EntityResponseType> {
        return this.http.patch<IFile>(
            `${this.resourceUrl}/${this.getFileIdentifier(file)}`,
            file,
            { observe: 'response' }
        );
    }

    find(id: string): Observable<EntityResponseType> {
        return this.http.get<IFile>(`${this.resourceUrl}/${id}`, {
            observe: 'response',
        });
    }

    query(req?: any): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http.get<IFile[]>(this.resourceUrl, {
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
                IFile[]
            >(this.resourceSearchUrl, { params: options, observe: 'response' })
            .pipe(
                catchError(() =>
                    scheduled([new HttpResponse<IFile[]>()], asapScheduler)
                )
            );
    }

    getFileIdentifier(file: Pick<IFile, 'id'>): string {
        return file.id;
    }

    compareFile(
        o1: Pick<IFile, 'id'> | null,
        o2: Pick<IFile, 'id'> | null
    ): boolean {
        return o1 && o2
            ? this.getFileIdentifier(o1) === this.getFileIdentifier(o2)
            : o1 === o2;
    }

    addFileToCollectionIfMissing<Type extends Pick<IFile, 'id'>>(
        fileCollection: Type[],
        ...filesToCheck: (Type | null | undefined)[]
    ): Type[] {
        const files: Type[] = filesToCheck.filter(isPresent);
        if (files.length > 0) {
            const fileCollectionIdentifiers = fileCollection.map((fileItem) =>
                this.getFileIdentifier(fileItem)
            );
            const filesToAdd = files.filter((fileItem) => {
                const fileIdentifier = this.getFileIdentifier(fileItem);
                if (fileCollectionIdentifiers.includes(fileIdentifier)) {
                    return false;
                }
                fileCollectionIdentifiers.push(fileIdentifier);
                return true;
            });
            return [...filesToAdd, ...fileCollection];
        }
        return fileCollection;
    }
}
