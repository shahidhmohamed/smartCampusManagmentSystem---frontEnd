import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IFolder } from '../folder.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../folder.test-samples';

import { FolderService } from './folder.service';

const requireRestSample: IFolder = {
  ...sampleWithRequiredData,
};

describe('Folder Service', () => {
  let service: FolderService;
  let httpMock: HttpTestingController;
  let expectedResult: IFolder | IFolder[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(FolderService);
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

    it('should create a Folder', () => {
      const folder = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(folder).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Folder', () => {
      const folder = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(folder).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Folder', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Folder', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Folder', () => {
      const expected = true;

      service.delete('ABC').subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    it('should handle exceptions for searching a Folder', () => {
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

    describe('addFolderToCollectionIfMissing', () => {
      it('should add a Folder to an empty array', () => {
        const folder: IFolder = sampleWithRequiredData;
        expectedResult = service.addFolderToCollectionIfMissing([], folder);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(folder);
      });

      it('should not add a Folder to an array that contains it', () => {
        const folder: IFolder = sampleWithRequiredData;
        const folderCollection: IFolder[] = [
          {
            ...folder,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addFolderToCollectionIfMissing(folderCollection, folder);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Folder to an array that doesn't contain it", () => {
        const folder: IFolder = sampleWithRequiredData;
        const folderCollection: IFolder[] = [sampleWithPartialData];
        expectedResult = service.addFolderToCollectionIfMissing(folderCollection, folder);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(folder);
      });

      it('should add only unique Folder to an array', () => {
        const folderArray: IFolder[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const folderCollection: IFolder[] = [sampleWithRequiredData];
        expectedResult = service.addFolderToCollectionIfMissing(folderCollection, ...folderArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const folder: IFolder = sampleWithRequiredData;
        const folder2: IFolder = sampleWithPartialData;
        expectedResult = service.addFolderToCollectionIfMissing([], folder, folder2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(folder);
        expect(expectedResult).toContain(folder2);
      });

      it('should accept null and undefined values', () => {
        const folder: IFolder = sampleWithRequiredData;
        expectedResult = service.addFolderToCollectionIfMissing([], null, folder, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(folder);
      });

      it('should return initial array if no Folder is added', () => {
        const folderCollection: IFolder[] = [sampleWithRequiredData];
        expectedResult = service.addFolderToCollectionIfMissing(folderCollection, undefined, null);
        expect(expectedResult).toEqual(folderCollection);
      });
    });

    describe('compareFolder', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareFolder(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: '281cbc29-4129-49fe-84b4-1bae60856bac' };
        const entity2 = null;

        const compareResult1 = service.compareFolder(entity1, entity2);
        const compareResult2 = service.compareFolder(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: '281cbc29-4129-49fe-84b4-1bae60856bac' };
        const entity2 = { id: '67cd9b51-d32f-408e-b9ce-3cc5892c3846' };

        const compareResult1 = service.compareFolder(entity1, entity2);
        const compareResult2 = service.compareFolder(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: '281cbc29-4129-49fe-84b4-1bae60856bac' };
        const entity2 = { id: '281cbc29-4129-49fe-84b4-1bae60856bac' };

        const compareResult1 = service.compareFolder(entity1, entity2);
        const compareResult2 = service.compareFolder(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
