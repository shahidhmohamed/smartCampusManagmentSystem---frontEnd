import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, asapScheduler, scheduled } from 'rxjs';

import { catchError } from 'rxjs/operators';
import { IModule, NewModule } from '../module.model';
import { ApplicationConfigService } from 'app/services/core/config/application-config.service';
import { createRequestOption } from 'app/services/core/request/request-util';
import { SearchWithPagination } from 'app/services/core/request/request.model';
import { isPresent } from 'app/services/core/util/operators';

export type PartialUpdateModule = Partial<IModule> & Pick<IModule, 'id'>;

export type EntityResponseType = HttpResponse<IModule>;
export type EntityArrayResponseType = HttpResponse<IModule[]>;

@Injectable({ providedIn: 'root' })
export class ModuleService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/modules');
  protected resourceSearchUrl = this.applicationConfigService.getEndpointFor('api/modules/_search');

  create(module: NewModule): Observable<EntityResponseType> {
    return this.http.post<IModule>(this.resourceUrl, module, { observe: 'response' });
  }

  update(module: IModule): Observable<EntityResponseType> {
    return this.http.put<IModule>(`${this.resourceUrl}/${this.getModuleIdentifier(module)}`, module, { observe: 'response' });
  }

  partialUpdate(module: PartialUpdateModule): Observable<EntityResponseType> {
    return this.http.patch<IModule>(`${this.resourceUrl}/${this.getModuleIdentifier(module)}`, module, { observe: 'response' });
  }

  find(id: string): Observable<EntityResponseType> {
    return this.http.get<IModule>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IModule[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: string): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  search(req: SearchWithPagination): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<IModule[]>(this.resourceSearchUrl, { params: options, observe: 'response' })
      .pipe(catchError(() => scheduled([new HttpResponse<IModule[]>()], asapScheduler)));
  }

  getModuleIdentifier(module: Pick<IModule, 'id'>): string {
    return module.id;
  }

  compareModule(o1: Pick<IModule, 'id'> | null, o2: Pick<IModule, 'id'> | null): boolean {
    return o1 && o2 ? this.getModuleIdentifier(o1) === this.getModuleIdentifier(o2) : o1 === o2;
  }

  addModuleToCollectionIfMissing<Type extends Pick<IModule, 'id'>>(
    moduleCollection: Type[],
    ...modulesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const modules: Type[] = modulesToCheck.filter(isPresent);
    if (modules.length > 0) {
      const moduleCollectionIdentifiers = moduleCollection.map(moduleItem => this.getModuleIdentifier(moduleItem));
      const modulesToAdd = modules.filter(moduleItem => {
        const moduleIdentifier = this.getModuleIdentifier(moduleItem);
        if (moduleCollectionIdentifiers.includes(moduleIdentifier)) {
          return false;
        }
        moduleCollectionIdentifiers.push(moduleIdentifier);
        return true;
      });
      return [...modulesToAdd, ...moduleCollection];
    }
    return moduleCollection;
  }
}
