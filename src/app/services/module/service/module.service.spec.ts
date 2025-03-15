import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IModule } from '../module.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../module.test-samples';

import { ModuleService } from './module.service';

const requireRestSample: IModule = {
  ...sampleWithRequiredData,
};

describe('Module Service', () => {
  let service: ModuleService;
  let httpMock: HttpTestingController;
  let expectedResult: IModule | IModule[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(ModuleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  describe('Service methods', () => {
    it('should find an element', () => {
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.find('ABC').subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should create a Module', () => {
      const module = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(module).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Module', () => {
      const module = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(module).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Module', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Module', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Module', () => {
      const expected = true;

      service.delete('ABC').subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    it('should handle exceptions for searching a Module', () => {
      const queryObject: any = {
        page: 0,
        size: 20,
        query: '',
        sort: [],
      };
      service.search(queryObject).subscribe(() => expectedResult);

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(null, { status: 500, statusText: 'Internal Server Error' });
      expect(expectedResult).toBe(null);
    });

    describe('addModuleToCollectionIfMissing', () => {
      it('should add a Module to an empty array', () => {
        const module: IModule = sampleWithRequiredData;
        expectedResult = service.addModuleToCollectionIfMissing([], module);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(module);
      });

      it('should not add a Module to an array that contains it', () => {
        const module: IModule = sampleWithRequiredData;
        const moduleCollection: IModule[] = [
          {
            ...module,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addModuleToCollectionIfMissing(moduleCollection, module);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Module to an array that doesn't contain it", () => {
        const module: IModule = sampleWithRequiredData;
        const moduleCollection: IModule[] = [sampleWithPartialData];
        expectedResult = service.addModuleToCollectionIfMissing(moduleCollection, module);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(module);
      });

      it('should add only unique Module to an array', () => {
        const moduleArray: IModule[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const moduleCollection: IModule[] = [sampleWithRequiredData];
        expectedResult = service.addModuleToCollectionIfMissing(moduleCollection, ...moduleArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const module: IModule = sampleWithRequiredData;
        const module2: IModule = sampleWithPartialData;
        expectedResult = service.addModuleToCollectionIfMissing([], module, module2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(module);
        expect(expectedResult).toContain(module2);
      });

      it('should accept null and undefined values', () => {
        const module: IModule = sampleWithRequiredData;
        expectedResult = service.addModuleToCollectionIfMissing([], null, module, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(module);
      });

      it('should return initial array if no Module is added', () => {
        const moduleCollection: IModule[] = [sampleWithRequiredData];
        expectedResult = service.addModuleToCollectionIfMissing(moduleCollection, undefined, null);
        expect(expectedResult).toEqual(moduleCollection);
      });
    });

    describe('compareModule', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareModule(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: '45d29272-e86d-4bcf-b095-4af54a23f61c' };
        const entity2 = null;

        const compareResult1 = service.compareModule(entity1, entity2);
        const compareResult2 = service.compareModule(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: '45d29272-e86d-4bcf-b095-4af54a23f61c' };
        const entity2 = { id: '0f2773b6-3afb-40d6-a011-518e1674f28a' };

        const compareResult1 = service.compareModule(entity1, entity2);
        const compareResult2 = service.compareModule(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: '45d29272-e86d-4bcf-b095-4af54a23f61c' };
        const entity2 = { id: '45d29272-e86d-4bcf-b095-4af54a23f61c' };

        const compareResult1 = service.compareModule(entity1, entity2);
        const compareResult2 = service.compareModule(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
