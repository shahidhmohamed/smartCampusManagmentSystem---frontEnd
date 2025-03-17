import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IAssignmentFile } from '../assignment-file.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../assignment-file.test-samples';

import { AssignmentFileService } from './assignment-file.service';

const requireRestSample: IAssignmentFile = {
  ...sampleWithRequiredData,
};

describe('AssignmentFile Service', () => {
  let service: AssignmentFileService;
  let httpMock: HttpTestingController;
  let expectedResult: IAssignmentFile | IAssignmentFile[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(AssignmentFileService);
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

    it('should create a AssignmentFile', () => {
      const assignmentFile = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(assignmentFile).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a AssignmentFile', () => {
      const assignmentFile = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(assignmentFile).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a AssignmentFile', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of AssignmentFile', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a AssignmentFile', () => {
      const expected = true;

      service.delete('ABC').subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    it('should handle exceptions for searching a AssignmentFile', () => {
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

    describe('addAssignmentFileToCollectionIfMissing', () => {
      it('should add a AssignmentFile to an empty array', () => {
        const assignmentFile: IAssignmentFile = sampleWithRequiredData;
        expectedResult = service.addAssignmentFileToCollectionIfMissing([], assignmentFile);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(assignmentFile);
      });

      it('should not add a AssignmentFile to an array that contains it', () => {
        const assignmentFile: IAssignmentFile = sampleWithRequiredData;
        const assignmentFileCollection: IAssignmentFile[] = [
          {
            ...assignmentFile,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addAssignmentFileToCollectionIfMissing(assignmentFileCollection, assignmentFile);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a AssignmentFile to an array that doesn't contain it", () => {
        const assignmentFile: IAssignmentFile = sampleWithRequiredData;
        const assignmentFileCollection: IAssignmentFile[] = [sampleWithPartialData];
        expectedResult = service.addAssignmentFileToCollectionIfMissing(assignmentFileCollection, assignmentFile);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(assignmentFile);
      });

      it('should add only unique AssignmentFile to an array', () => {
        const assignmentFileArray: IAssignmentFile[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const assignmentFileCollection: IAssignmentFile[] = [sampleWithRequiredData];
        expectedResult = service.addAssignmentFileToCollectionIfMissing(assignmentFileCollection, ...assignmentFileArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const assignmentFile: IAssignmentFile = sampleWithRequiredData;
        const assignmentFile2: IAssignmentFile = sampleWithPartialData;
        expectedResult = service.addAssignmentFileToCollectionIfMissing([], assignmentFile, assignmentFile2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(assignmentFile);
        expect(expectedResult).toContain(assignmentFile2);
      });

      it('should accept null and undefined values', () => {
        const assignmentFile: IAssignmentFile = sampleWithRequiredData;
        expectedResult = service.addAssignmentFileToCollectionIfMissing([], null, assignmentFile, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(assignmentFile);
      });

      it('should return initial array if no AssignmentFile is added', () => {
        const assignmentFileCollection: IAssignmentFile[] = [sampleWithRequiredData];
        expectedResult = service.addAssignmentFileToCollectionIfMissing(assignmentFileCollection, undefined, null);
        expect(expectedResult).toEqual(assignmentFileCollection);
      });
    });

    describe('compareAssignmentFile', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareAssignmentFile(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: '173e7450-d90d-437f-b33a-fb40c3baeb13' };
        const entity2 = null;

        const compareResult1 = service.compareAssignmentFile(entity1, entity2);
        const compareResult2 = service.compareAssignmentFile(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: '173e7450-d90d-437f-b33a-fb40c3baeb13' };
        const entity2 = { id: 'e8a8b31e-7fb4-45d7-8203-0d891d8ace77' };

        const compareResult1 = service.compareAssignmentFile(entity1, entity2);
        const compareResult2 = service.compareAssignmentFile(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: '173e7450-d90d-437f-b33a-fb40c3baeb13' };
        const entity2 = { id: '173e7450-d90d-437f-b33a-fb40c3baeb13' };

        const compareResult1 = service.compareAssignmentFile(entity1, entity2);
        const compareResult2 = service.compareAssignmentFile(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
